from rest_framework import serializers

from api.models import SongEntry
from api.serializers.song import SongSerializer


class SongEntrySerializer(serializers.ModelSerializer):
    song = SongSerializer()

    class Meta:
        model = SongEntry
        fields = ["id", "created_at", "updated_at", "play_time", "song"]
