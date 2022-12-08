from rest_framework import viewsets

from api.models import SongEntry
from api.serializers.song_entry import SongEntrySerializer


class SongEntryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows all standard interactions with SongEntries.
    """

    queryset = SongEntry.objects.all()
    serializer_class = SongEntrySerializer
