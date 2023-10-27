from rest_framework import serializers

from api.models import WishlistSong


class RecommendationSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = WishlistSong
        fields = [
            "id",
            "artist",
            "title",
        ]