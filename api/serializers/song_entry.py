from rest_framework import serializers

from api.models import SongEntry


class SongEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = SongEntry
        fields = "__all__"
