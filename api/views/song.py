import logging

from django.conf import settings
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import F, Q
from django.db.models.functions import Greatest, Ln
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from api.models import Song
from api.serializers.song import SongSerializer

logger = logging.getLogger(__name__)


class SongViewSet(viewsets.GenericViewSet):
    """
    API endpoint that only allows searching Songs.
    """

    queryset = Song.objects.all()
    serializer_class = SongSerializer

    @action(methods=["get"], detail=False, url_path="search", url_name="search")
    def search(self, request):
        q = self.request.query_params.get("q")
        if q is None or len(q) == 0:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        song_matches = (
            Song.objects.filter(
                Q(artist__trigram_similar=q) | Q(title__trigram_similar=q)
            )
            .annotate(artist_similarity=TrigramSimilarity("artist", q))
            .annotate(title_similarity=TrigramSimilarity("title", q))
            .annotate(
                rank=(F("artist_similarity") + F("title_similarity"))
                * Ln(Greatest(F("votes"), 20))
            )
            .order_by("-rank")
            .all()[0:5]
        )

        if len(song_matches) == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)

        return Response(
            status=status.HTTP_200_OK,
            data=SongSerializer(song_matches, many=True).data,
        )
