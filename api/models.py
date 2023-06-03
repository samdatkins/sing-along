from operator import attrgetter

from django.contrib.auth import get_user_model
from django.contrib.postgres.indexes import GinIndex
from django.db import models
from django.db.models import Q
from safedelete.config import SOFT_DELETE_CASCADE
from safedelete.models import SafeDeleteModel
from django.utils.crypto import get_random_string

class CreatedUpdated(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Songbook(SafeDeleteModel, CreatedUpdated):
    def _generate_session_key(self):
        return get_random_string(length=32).upper()
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["session_key"],
                name="unique songbook session key",
                condition=Q(deleted__isnull=True),
            )
        ]

    _safedelete_policy = SOFT_DELETE_CASCADE
    session_key = models.CharField(max_length=6, null=False, blank=True, default=_generate_session_key)
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
    members = models.ManyToManyField(get_user_model(), through="Membership")

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
            GinIndex(
                name="song_artist_gin_index",
                fields=["artist"],
                opclasses=["gin_trgm_ops"],
            ),
            GinIndex(
                name="song_title_gin_index",
                fields=["title"],
                opclasses=["gin_trgm_ops"],
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["url"],
                name="unique song url",
                condition=Q(deleted__isnull=True),
            ),
            models.UniqueConstraint(
                fields=["artist", "title"],
                name="unique song title and artist",
                condition=Q(deleted__isnull=True),
            ),
        ]

    artist = models.CharField(max_length=120, null=False, blank=False)
    title = models.CharField(max_length=120, null=False, blank=False)
    url = models.TextField(null=False, blank=False)
    content = models.TextField(null=True, blank=True)
    rating = models.DecimalField(max_digits=8, decimal_places=6, null=True, blank=True)
    votes = models.IntegerField(null=True, blank=True)
    capo = models.IntegerField(null=True, blank=True)


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
    is_flagged = models.BooleanField(null=True, blank=True)


class Membership(SafeDeleteModel, CreatedUpdated):
    class MemberType(models.TextChoices):
        OWNER = "OW"
        PARTICIPANT = "PT"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["songbook", "user"],
                name="unique membership entry",
                condition=Q(deleted__isnull=True),
            )
        ]

    songbook = models.ForeignKey(Songbook, on_delete=models.CASCADE)
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    type = models.CharField(
        max_length=2, choices=MemberType.choices, default=MemberType.PARTICIPANT
    )


class UserProfile(SafeDeleteModel, CreatedUpdated):
    user = models.OneToOneField(get_user_model(), on_delete=models.CASCADE)
    is_showing_chords = models.BooleanField(blank=True, null=False, default=True)
    columns_to_display = models.IntegerField(blank=True, null=False, default=1)
    is_day_mode = models.BooleanField(blank=True, null=False, default=True)
