from rest_framework import serializers

from api.models import WishlistSong


class WishlistSongSerializer(serializers.ModelSerializer):
    class Meta:
        model = WishlistSong
        fields = [
            "artist",
            "title",
            "created_at",
            "updated_at",
        ]
