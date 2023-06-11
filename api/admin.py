from django.contrib import admin

from .models import Membership, Song, Songbook, SongEntry


class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 1


class SongAdmin(admin.ModelAdmin):
    list_display = ("artist", "title", "url", "rating", "votes", "capo", "num_likes")
    search_fields = ("artist", "title", "url", "capo")

    def num_likes(self, obj):
        return obj.likes.count()

    num_likes.admin_order_field = "likes"
    num_likes.short_description = "Number of Likes"


class SongbookAdmin(admin.ModelAdmin):
    list_filter = ["members"]
    list_display = ("session_key", "title", "is_noodle_mode")
    search_fields = ("session_key", "title")
    inlines = (MembershipInline,)


class SongEntryAdmin(admin.ModelAdmin):
    list_filter = ["is_flagged"]
    list_select_related = ("song", "songbook")
    list_display = (
        "get_songbook_title",
        "get_song_title",
        "get_song_artist",
        "play_time",
    )
    search_fields = (
        "songbook__title",
        "song__title",
        "song__artist",
    )

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


admin.site.register(Songbook, SongbookAdmin)
admin.site.register(Song, SongAdmin)
admin.site.register(SongEntry, SongEntryAdmin)
