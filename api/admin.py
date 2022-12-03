from django.contrib import admin

from .models import Song, Songbook, SongEntry

admin.site.register(Songbook)
admin.site.register(Song)
admin.site.register(SongEntry)
