from rest_framework import serializers

from api.models import WishlistSong


class WishlistSongSerializer(serializers.ModelSerializer):
    class Meta:
        model = WishlistSong
        fields = [
            "id",
            "artist",
            "title",
            "created_at",
            "updated_at",
        ]
