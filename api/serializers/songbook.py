from rest_framework import serializers

from api.models import Songbook
from api.serializers.song import SongSerializer


class SongbookSerializer(serializers.ModelSerializer):
    total_songs = serializers.SerializerMethodField()
    current_song_index = serializers.SerializerMethodField()
    current_song_entry = serializers.SerializerMethodField()

    class Meta:
        model = Songbook
        fields = [
            "session_key",
            "max_active_songs",
            "title",
            "is_noodle_mode",
            "total_songs",
            "current_song_index",
            "current_song_entry",
        ]

    def get_total_songs(self, obj):
        return obj.get_total_song_count()

    def get_current_song_index(self, obj):
        return obj.get_current_song_index()

    def get_current_song_entry(self, obj):
        return SongSerializer(obj.get_current_song_entry().song).data
