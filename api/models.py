import random
import secrets
import string

from django.contrib.auth import get_user_model
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


def _generate_session_key():
    return "".join(random.choice(string.ascii_uppercase) for _ in range(4))


class Songbook(SafeDeleteModel, CreatedUpdated):
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["session_key"],
                name="unique songbook session key",
                condition=Q(deleted__isnull=True),
            )
        ]

    _safedelete_policy = SOFT_DELETE_CASCADE
    session_key = models.CharField(
        max_length=4, null=False, blank=True, default=_generate_session_key
    )
    current_song_position = models.PositiveIntegerField(
        null=False, blank=True, default=1
    )
    max_active_songs = models.IntegerField(null=True, blank=True)
    title = models.CharField(max_length=40, null=False, blank=False)
    last_nav_action_taken_at = models.DateTimeField(null=True, blank=True)
    is_noodle_mode = models.BooleanField(null=False, blank=True, default=False)
    songs = models.ManyToManyField(
        "Song", related_name="songboooks", through="SongEntry"
    )
    members = models.ManyToManyField(get_user_model(), through="Membership")
    theme = models.CharField(max_length=40, null=False, blank=True, default="")
    action_verb = models.CharField(
        max_length=8, null=False, blank=False, default="DANCE"
    )

    def _resolve_entry_at_position(self, position):
        """Return the song entry at *position*, clamping to the nearest valid
        entry when the stored position is stale (e.g. songs were deleted).

        Returns ``None`` only when the songbook has no entries at all.
        """
        entries = list(self.song_entries.all())
        if not entries:
            return None

        exact = [e for e in entries if e.position == position]
        if exact:
            return exact[0]

        # Clamp: largest position <= requested, else smallest overall
        at_or_before = [e for e in entries if e.position <= position]
        if at_or_before:
            return max(at_or_before, key=lambda e: e.position)
        return min(entries, key=lambda e: e.position)

    def get_current_song_entry(self, position_override=None):
        effective = position_override if position_override is not None else self.current_song_position
        return self._resolve_entry_at_position(effective)

    def get_next_song_entry(self, position_override=None):
        current = self.get_current_song_entry(position_override=position_override)
        if current is None:
            return None
        candidates = [
            e for e in self.song_entries.all() if e.position > current.position
        ]
        return min(candidates, key=lambda e: e.position, default=None)

    def get_previous_song_entry(self, position_override=None):
        current = self.get_current_song_entry(position_override=position_override)
        if current is None:
            return None
        candidates = [
            e for e in self.song_entries.all() if e.position < current.position
        ]
        return max(candidates, key=lambda e: e.position, default=None)

    def get_total_song_count(self):
        return len(self.song_entries.all())

    def get_current_song_position(self, position_override=None):
        current = self.get_current_song_entry(position_override=position_override)
        if current is None:
            return 0
        return current.position


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
    transpose = models.IntegerField(null=True, blank=True, db_column="capo")
    spotify_ID = models.CharField(max_length=120, null=True, blank=True)

    def __str__(self):
        return f"{self.title} - {self.artist}"


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
    requested_by = models.ForeignKey(
        get_user_model(), null=True, blank=True, on_delete=models.DO_NOTHING
    )
    position = models.PositiveIntegerField(null=False, blank=True, default=1)
    likes = models.ManyToManyField(
        get_user_model(), blank=True, related_name="song_entries", through="Like"
    )


class Membership(CreatedUpdated):
    class MemberType(models.TextChoices):
        OWNER = "OW"
        PARTICIPANT = "PT"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["songbook", "user"],
                name="unique membership entry",
            )
        ]

    songbook = models.ForeignKey(Songbook, on_delete=models.CASCADE)
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    type = models.CharField(
        max_length=2, choices=MemberType.choices, default=MemberType.PARTICIPANT
    )


class SongbookUserPosition(CreatedUpdated):
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["songbook", "user"],
                name="unique songbook user position",
            )
        ]

    songbook = models.ForeignKey(
        Songbook, on_delete=models.CASCADE, related_name="user_positions"
    )
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    current_song_position = models.PositiveIntegerField(
        null=False, blank=True, default=1
    )


class UserProfile(SafeDeleteModel, CreatedUpdated):
    user = models.OneToOneField(get_user_model(), on_delete=models.CASCADE)
    is_showing_chords = models.BooleanField(blank=True, null=False, default=False)
    columns_to_display = models.IntegerField(blank=True, null=False, default=2)
    is_day_mode = models.BooleanField(blank=True, null=False, default=True)
    token = models.CharField(blank=True, null=True, max_length=24)

    def get_or_create_token(self):
        if self.token is None:
            self.token = secrets.token_urlsafe(
                16
            )  # This will create a token of 24 characters
            self.save()
        return self.token


class WishlistSong(SafeDeleteModel, CreatedUpdated):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    artist = models.CharField(max_length=120, null=False, blank=False)
    title = models.CharField(max_length=120, null=False, blank=False)


class Like(CreatedUpdated):
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "song_entry"],
                name="unique song_entry like",
            )
        ]

    song_entry = models.ForeignKey(
        SongEntry,
        on_delete=models.CASCADE,
        related_name="song_entry_likes",
        related_query_name="like",
    )
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name="song_entry_likes",
        related_query_name="like",
    )


class SongMemo(CreatedUpdated):
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "song"],
                name="unique song memo",
            )
        ]

    text = models.TextField(null=True, blank=True)

    song = models.ForeignKey(
        Song,
        on_delete=models.CASCADE,
        related_name="song_memos",
        related_query_name="memo",
    )
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name="song_memos",
        related_query_name="memo",
    )

    def __str__(self):
        return f"Memo by {self.user.username} for {self.song}"
