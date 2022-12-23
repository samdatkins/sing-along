from rest_framework import serializers

from api.models import Songbook
from api.serializers.song_entry import SongEntrySerializer


class SongbookDetailSerializer(serializers.ModelSerializer):
    total_songs = serializers.SerializerMethodField()
    current_song_position = serializers.SerializerMethodField()
    current_song_entry = serializers.SerializerMethodField()

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
        ]

    def get_total_songs(self, obj):
        return obj.get_total_song_count()

    def get_current_song_position(self, obj):
        return obj.get_current_song_position()

    def get_current_song_entry(self, obj):
        song_entry = obj.get_current_song_entry()
        if song_entry is None:
            return None
        return SongEntrySerializer(song_entry).data


class SongbookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Songbook
        fields = [
            "session_key",
            "max_active_songs",
            "title",
            "is_noodle_mode",
        ]
