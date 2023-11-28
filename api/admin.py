from django import forms
from django.contrib import admin

from sing_along.utils.tabs import TabScraper

from .models import Like, Membership, Song, Songbook, SongEntry


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


class SongAdmin(admin.ModelAdmin):
    form = SongForm
    list_display = ("artist", "title", "url", "rating", "votes", "transpose")
    search_fields = ("artist", "title", "url", "transpose")

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


class SongEntryAdmin(admin.ModelAdmin):
    list_filter = ["is_flagged", "songbook__theme"]
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
        return obj.song.title

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


admin.site.register(Songbook, SongbookAdmin)
admin.site.register(Song, SongAdmin)
admin.site.register(SongEntry, SongEntryAdmin)
