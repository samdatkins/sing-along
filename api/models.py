from django.db import models
from safedelete.models import SOFT_DELETE_CASCADE, SafeDeleteModel


class CreatedUpdatedMixin:
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Songbook(SafeDeleteModel, CreatedUpdatedMixin):
    _safedelete_policy = SOFT_DELETE_CASCADE
    session_key = models.CharField(max_length=20, unique=True, null=False, blank=False)
    current_song_timestamp = models.DateTimeField(null=False, blank=False)
    max_active_songs = models.IntegerField(null=True, blank=True)
    title = models.CharField(max_length=40, null=False, blank=False)
    last_nav_action_taken_at = models.DateTimeField(null=True, blank=True)
    is_noodle_mode = models.BooleanField(null=False, blank=True, default=False)


class Song(SafeDeleteModel, CreatedUpdatedMixin):
    class Meta:
        indexes = [
            models.Index(
                fields=[
                    "artist",
                ]
            ),
            models.Index(fields=["title"]),
        ]

    artist = models.CharField(max_length=40, null=False, blank=False)
    title = models.CharField(max_length=40, null=False, blank=False)
    url = models.TextField(null=False, blank=False)
    content = models.TextField(null=False, blank=False)


class SongEntry(models.Model, CreatedUpdatedMixin):
    songbook = models.ForeignKey(Songbook, on_delete=models.CASCADE)
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    play_time = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
