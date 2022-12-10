from django.db import models
from safedelete.models import SOFT_DELETE_CASCADE, SafeDeleteModel


class CreatedUpdated(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Songbook(SafeDeleteModel, CreatedUpdated):
    _safedelete_policy = SOFT_DELETE_CASCADE
    session_key = models.CharField(max_length=20, unique=True, null=False, blank=False)
    current_song_timestamp = models.DateTimeField(null=False, blank=False)
    max_active_songs = models.IntegerField(null=True, blank=True)
    title = models.CharField(max_length=40, null=False, blank=False)
    last_nav_action_taken_at = models.DateTimeField(null=True, blank=True)
    is_noodle_mode = models.BooleanField(null=False, blank=True, default=False)

    # TEST ME
    def get_next_song_entry(self):
        return (
            self.song_entries.select_related("song")
            .filter(created_at__gt=self.current_song_timestamp)
            .order_by("created_at")
            .first()
        )

    # TEST ME
    def get_current_song_entry(self):
        return (
            self.song_entries.select_related("song")
            .filter(created_at__gte=self.current_song_timestamp)
            .order_by("created_at")
            .first()
        )

    # TEST ME
    def get_previous_song_entry(self):
        return (
            self.song_entries.select_related("song")
            .filter(created_at__lt=self.current_song_timestamp)
            .order_by("-created_at")
            .first()
        )

    # TEST ME
    def get_total_song_count(self):
        return self.song_entries.count()

    # TEST ME
    def get_current_song_index(self):
        return self.song_entries.filter(
            created_at__lte=self.current_song_timestamp
        ).count()


class Song(SafeDeleteModel, CreatedUpdated):
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


class SongEntry(SafeDeleteModel, CreatedUpdated):
    songbook = models.ForeignKey(
        Songbook,
        on_delete=models.CASCADE,
        related_name="song_entries",
        related_query_name="song_entry",
    )
    song = models.ForeignKey(
        Song,
        on_delete=models.CASCADE,
        related_name="song_entries",
        related_query_name="song_entry",
    )
    play_time = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
