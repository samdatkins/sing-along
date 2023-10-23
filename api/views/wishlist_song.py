from rest_framework import mixins, viewsets
from rest_framework.authentication import SessionAuthentication

from api.models import WishlistSong
from api.serializers.wishlist_song import WishlistSongSerializer
from api.views.authentication.token import TokenBasedAuthentication


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
    authentication_classes = [
        SessionAuthentication,
        TokenBasedAuthentication,
    ]

    def get_queryset(self):
        return WishlistSong.objects.filter(user=self.request.user).order_by(
            "-created_at"
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
