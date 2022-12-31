from operator import attrgetter

from django.contrib.postgres.indexes import GinIndex
from django.db import models
from django.db.models import Q
from safedelete.config import SOFT_DELETE_CASCADE
from safedelete.models import SafeDeleteModel


class CreatedUpdated(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Songbook(SafeDeleteModel, CreatedUpdated):
    _safedelete_policy = SOFT_DELETE_CASCADE
    session_key = models.CharField(max_length=20, null=False, blank=False)
    current_song_timestamp = models.DateTimeField(
        null=False, blank=True, auto_now_add=True
    )
    max_active_songs = models.IntegerField(null=True, blank=True)
    title = models.CharField(max_length=40, null=False, blank=False)
    last_nav_action_taken_at = models.DateTimeField(null=True, blank=True)
    is_noodle_mode = models.BooleanField(null=False, blank=True, default=False)
    songs = models.ManyToManyField(
        "Song", related_name="songboooks", through="SongEntry"
    )

    constraints = [
        models.UniqueConstraint(
            fields=["session_key"],
            name="unique songbook session key",
            condition=Q(deleted__isnull=True),
        )
    ]

    def get_next_song_entry(self):
        current_song_entry = self.get_current_song_entry()
        if current_song_entry is None:
            return None
        next_songs = [
            entry
            for entry in self.song_entries.all()
            if entry.created_at > current_song_entry.created_at
        ]
        return min(next_songs, key=attrgetter("created_at"), default=None)

    def get_current_song_entry(self):
        current_and_next_songs = [
            entry
            for entry in self.song_entries.all()
            if entry.created_at >= self.current_song_timestamp
        ]
        current_song_entry = min(
            current_and_next_songs, key=attrgetter("created_at"), default=None
        )
        if current_song_entry is None:
            return max(
                self.song_entries.all(), key=attrgetter("created_at"), default=None
            )
        return current_song_entry

    def get_previous_song_entry(self):
        current_song_entry = self.get_current_song_entry()
        if current_song_entry is None:
            return None

        previous_songs = [
            entry
            for entry in self.song_entries.all()
            if entry.created_at < current_song_entry.created_at
        ]
        return max(previous_songs, key=attrgetter("created_at"), default=None)

    def get_total_song_count(self):
        return len(self.song_entries.all())

    def get_current_song_position(self):
        current_song_entry = self.get_current_song_entry()
        if current_song_entry is None:
            return 0
        return len(
            [
                entry
                for entry in self.song_entries.all()
                if entry.created_at <= current_song_entry.created_at
            ]
        )


class Song(SafeDeleteModel, CreatedUpdated):
    class Meta:
        indexes = [
            GinIndex(fields=["artist"]),
            GinIndex(fields=["title"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["url"],
                name="unique song entry",
                condition=Q(deleted__isnull=True),
            )
        ]

    artist = models.CharField(max_length=40, null=False, blank=False)
    title = models.CharField(max_length=40, null=False, blank=False)
    url = models.TextField(null=False, blank=False)
    content = models.TextField(null=False, blank=False)


class SongEntry(SafeDeleteModel, CreatedUpdated):
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["songbook", "song"],
                name="unique songbook entry",
                condition=Q(deleted__isnull=True),
            )
        ]

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
