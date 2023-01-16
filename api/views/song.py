import logging

from django.conf import settings
from django.contrib.postgres.search import TrigramSimilarity
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from api.models import Song
from api.serializers.song import SongSerializer
from sing_along.utils.tabs import ServerNotAvailable, TabFetcher, TabType

logger = logging.getLogger(__name__)


class SongViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows all standard interactions with Songs.
    """

    queryset = Song.objects.all()
    serializer_class = SongSerializer

    @action(methods=["get"], detail=False, url_path="search", url_name="search")
    def search(self, request):
        q = self.request.query_params.get("q")
        if q is None or len(q) == 0:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        song_matches = (
            Song.objects.annotate(
                similarity=TrigramSimilarity("artist", q)
                + TrigramSimilarity("title", q)
            )
            .filter(similarity__gt=0.55)
            .order_by("-similarity")
        )

        song = None
        if len(song_matches) > 0:
            song = song_matches.first()
        else:
            tab_fetcher = TabFetcher(settings.TAB_SEARCH_URL, [TabType.CHORDS])

            tab = None
            try:
                tab = tab_fetcher.search_for_best_tab(q)
            except ServerNotAvailable as e:
                logger.exception("Failed to fetch tab from external server")

            if tab is not None:
                existing_song = None
                try:
                    existing_song = Song.objects.get(url=tab["url"])
                except (Song.DoesNotExist) as e:
                    song = Song()
                    for key, value in tab.items():
                        setattr(song, key, value)
                    song.save()
                else:
                    song = existing_song

        if song is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        return Response(status=status.HTTP_200_OK, data=SongSerializer(song).data)
