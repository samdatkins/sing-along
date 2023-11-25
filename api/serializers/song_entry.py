from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from api.models import Songbook, SongEntry
from api.serializers.song import SongSerializer


class SongEntrySerializer(serializers.ModelSerializer):
    song = SongSerializer(read_only=True)
    # This should really be session_key
    songbook_id = serializers.IntegerField()
    song_id = serializers.IntegerField()
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = SongEntry
        fields = [
            "id",
            "created_at",
            "updated_at",
            "play_time",
            "song",
            "songbook_id",
            "song_id",
            "is_flagged",
            "likes_count",
        ]

    def get_likes_count(self, obj):
        return obj.likes.count()
