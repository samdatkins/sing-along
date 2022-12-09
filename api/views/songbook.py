import datetime

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from api.models import Songbook
from api.serializers.song import SongSerializer
from api.serializers.songbook import SongbookSerializer


class SongbookViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows all standard interactions with Songbooks.
    """

    queryset = Songbook.objects.prefetch_related("song_entries").all()
    serializer_class = SongbookSerializer
    lookup_field = "session_key"

    @action(methods=["patch"], detail=True, url_path="next-song", url_name="next-song")
    def next_song(self, request, session_key=None):
        instance = self.get_object()
        next_song_entry = instance.get_next_song_entry()
        if next_song_entry is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        instance.current_song_timestamp = next_song_entry.created_at
        instance.last_nav_action_taken_at = datetime.datetime.now()
        instance.save()
        return Response(status=status.HTTP_200_OK)

    @action(
        methods=["patch"],
        detail=True,
        url_path="previous-song",
        url_name="previous-song",
    )
    def prev_song(self, request, session_key=None):
        instance = self.get_object()
        previous_song_entry = instance.get_previous_song_entry()
        if previous_song_entry is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        instance.current_song_timestamp = previous_song_entry.created_at
        instance.last_nav_action_taken_at = datetime.datetime.now()
        instance.save()
        return Response(status=status.HTTP_200_OK)
