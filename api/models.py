from django.db import models
from safedelete.models import SOFT_DELETE_CASCADE, SafeDeleteModel


class Songbook(SafeDeleteModel):
    _safedelete_policy = SOFT_DELETE_CASCADE
    created_at = models.DateTimeField(null=False, blank=False)
    session_key = models.CharField(max_length=20, unique=True, null=False, blank=False)
    current_song_timestamp = models.DateTimeField(null=False, blank=False)


class Song(SafeDeleteModel):
    class Meta:
        indexes = [
            models.Index(
                fields=[
                    "artist",
                ]
            ),
            models.Index(
                fields=[
                    "album",
                ]
            ),
            models.Index(fields=["title"]),
        ]

    songbook = models.ForeignKey(Songbook, on_delete=models.DO_NOTHING)
    artist = models.CharField(max_length=40, null=False, blank=False, db_index=True)
    album = models.CharField(max_length=40, null=False, blank=False, db_index=True)
    title = models.CharField(max_length=40, null=False, blank=False)
    url = models.CharField(max_length=400, null=False, blank=False)
    content = models.TextField(null=False, blank=False)


class SongEntry(models.Model):
    songbook = models.ForeignKey(Songbook, on_delete=models.CASCADE)
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    artist = models.CharField(max_length=40, null=False, blank=False)
    album = models.CharField(max_length=40, null=False, blank=False)
    play_time = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
