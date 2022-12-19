from rest_framework import serializers

from api.models import SongEntry
from api.serializers.song import SongSerializer


class SongEntrySerializer(serializers.ModelSerializer):
    song = SongSerializer(read_only=True)
    songbook_id = serializers.IntegerField(write_only=True)
    song_id = serializers.IntegerField(write_only=True)

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
        ]
