from rest_framework import serializers

from api.models import Songbook


class SongbookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Songbook
        fields = "__all__"
