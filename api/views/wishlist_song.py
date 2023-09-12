from rest_framework import mixins, viewsets

from api.models import WishlistSong
from api.serializers.wishlist_song import WishlistSongSerializer


class WishlistSongViewSet(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """
    API endpoint that allows all standard interactions with SongEntries.
    """

    serializer_class = WishlistSongSerializer
    queryset = WishlistSong.objects.all()

    def get_queryset(self):
        return WishlistSong.objects.filter(user=self.request.user).order_by(
            "-created_at"
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
