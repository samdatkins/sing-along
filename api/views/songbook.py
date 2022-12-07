from rest_framework import viewsets

from api.models import Songbook
from api.serializers.songbook import SongbookSerializer


class SongbookViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows all standard interactions with Songbooks.
    """

    queryset = Songbook.objects.all()
    serializer_class = SongbookSerializer
