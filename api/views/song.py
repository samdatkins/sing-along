from rest_framework import viewsets

from api.models import Song
from api.serializers.song import SongSerializer


class SongViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows all standard interactions with Songs.
    """

    queryset = Song.objects.all()
    serializer_class = SongSerializer
