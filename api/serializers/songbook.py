from rest_framework import serializers

from api.models import Membership, Songbook
from api.serializers.song_entry import SongEntrySerializer


class SongbookSerializer(serializers.ModelSerializer):
    total_songs = serializers.SerializerMethodField()
    current_song_position = serializers.SerializerMethodField()
    current_song_entry = serializers.SerializerMethodField()
    is_songbook_owner = serializers.SerializerMethodField()

    class Meta:
        model = Songbook
        fields = [
            "session_key",
            "max_active_songs",
            "title",
            "is_noodle_mode",
            "total_songs",
            "current_song_position",
            "current_song_entry",
            "id",
            "current_song_timestamp",
            "is_songbook_owner",
        ]

        extra_kwargs = {"session_key": {"read_only": True}}

    def get_total_songs(self, obj):
        return obj.get_total_song_count()

    def get_current_song_position(self, obj):
        return obj.get_current_song_position()

    def get_current_song_entry(self, obj):
        song_entry = obj.get_current_song_entry()
        if song_entry is None:
            return None
        return SongEntrySerializer(song_entry).data

    def get_is_songbook_owner(self, obj):
        user = None
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            user = request.user
        membership = obj.membership_set.get(user=user)
        return membership.type == Membership.MemberType.OWNER.value


class SongbookListSerializer(serializers.ModelSerializer):
    current_song_timestamp = serializers.DateTimeField(read_only=False, required=False)

    class Meta:
        model = Songbook
        fields = [
            "session_key",
            "max_active_songs",
            "title",
            "is_noodle_mode",
            "current_song_timestamp",
        ]

        extra_kwargs = {"session_key": {"read_only": True}}


class SongbookDetailSerializer(serializers.ModelSerializer):
    song_entries = SongEntrySerializer(many=True)

    class Meta:
        model = Songbook
        fields = [
            "session_key",
            "max_active_songs",
            "title",
            "is_noodle_mode",
            "song_entries",
            "current_song_timestamp",
        ]

        extra_kwargs = {"session_key": {"read_only": True}}
