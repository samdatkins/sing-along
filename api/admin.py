from django import forms
from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html

from sing_along.utils.tabs import TabScraper

from .models import Like, Membership, Song, Songbook, SongEntry, SongMemo


class SongForm(forms.ModelForm):
    # Adding a custom field for user input
    tab_url = forms.CharField(
        required=False,
        widget=forms.TextInput,
        help_text="Enter a URL to load to overwrite the current tab with an updated version (optional and DANGEROUS)",
    )

    class Meta:
        model = Song
        fields = "__all__"


class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 1


class LikeInline(admin.TabularInline):
    model = Like
    extra = 1


class SongMemoInline(admin.TabularInline):
    model = SongMemo
    extra = 1  # Number of empty forms to display by default
    fields = ["user", "text"]


class SongAdmin(admin.ModelAdmin):
    form = SongForm
    list_display = ("artist", "title", "url", "rating", "votes", "transpose")
    search_fields = ("artist", "title", "url", "transpose")
    inlines = [SongMemoInline]  # Add the SongMemoInline here

    def save_model(self, request, obj, form, change):
        tab_url = form.cleaned_data.get("tab_url")

        if tab_url:
            scraper = TabScraper()
            tab = scraper.load_tab_from_url(tab_url)

            # Write the result to a specific field
            obj.content = tab["content"]
            obj.url = tab_url

        super().save_model(request, obj, form, change)


class SongbookAdmin(admin.ModelAdmin):
    list_filter = ["members"]
    list_display = ("session_key", "title", "is_noodle_mode")
    search_fields = ("session_key", "title")
    inlines = (MembershipInline,)


class SongbookFilter(admin.SimpleListFilter):
    title = "Songbook"
    parameter_name = "songbook"

    def lookups(self, request, model_admin):
        songbooks = Songbook.objects.all()
        return [(sb.pk, sb.title) for sb in songbooks]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(songbook_id=self.value())
        return queryset


class SongEntryAdmin(admin.ModelAdmin):
    list_filter = [
        "is_flagged",
        ("songbook__theme", admin.EmptyFieldListFilter),
        SongbookFilter,
    ]
    list_select_related = ("song", "songbook")
    list_display = (
        "get_songbook_title",
        "get_song_title",
        "get_song_artist",
        "play_time",
        "num_likes",
    )
    search_fields = (
        "songbook__title",
        "song__title",
        "song__artist",
    )
    inlines = (LikeInline,)

    raw_id_fields = ("song", "songbook")

    @admin.display(
        ordering="songbook__title",
        description="Songbook Title",
    )
    def get_songbook_title(self, obj):
        return obj.songbook.title

    @admin.display(
        ordering="song__title",
        description="Song Title",
    )
    def get_song_title(self, obj):
        # Generate a link to the Song admin page
        song_admin_url = reverse("admin:api_song_change", args=[obj.song.id])
        return format_html('<a href="{}">{}</a>', song_admin_url, obj.song.title)

    @admin.display(
        ordering="song__artist",
        description="Song Artist",
    )
    def get_song_artist(self, obj):
        return obj.song.artist

    def num_likes(self, obj):
        return obj.likes.count()

    num_likes.admin_order_field = "likes"
    num_likes.short_description = "Number of Likes"


class PendingTextFilter(admin.SimpleListFilter):
    title = "Pending Memos"  # Display name for the filter
    parameter_name = "text"  # URL parameter for the filter

    def lookups(self, request, model_admin):
        """
        Returns a list of tuples defining the filter options.
        """
        return (
            (
                "pending",
                "Pending",
            ),  # The key will be used in the URL, and the value is displayed
        )

    def queryset(self, request, queryset):
        """
        Filters the queryset based on the selected option.
        """
        if self.value() == "pending":
            return queryset.filter(text="pending")
        return queryset


class SongMemoAdmin(admin.ModelAdmin):
    list_filter = (PendingTextFilter, "user")
    list_display = ["user", "song", "text"]


admin.site.register(Songbook, SongbookAdmin)
admin.site.register(Song, SongAdmin)
admin.site.register(SongEntry, SongEntryAdmin)
admin.site.register(SongMemo, SongMemoAdmin)
