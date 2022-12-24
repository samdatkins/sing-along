from rest_framework import status, viewsets
from rest_framework.exceptions import NotFound
from rest_framework.response import Response

from api.models import Song, Songbook, SongEntry
from api.serializers.song_entry import SongEntrySerializer
from api.views.custom_exceptions import ConflictingStates, DuplicateValue


class SongEntryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows all standard interactions with SongEntries.
    """

    queryset = SongEntry.objects.all()
    serializer_class = SongEntrySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        queryset = self.get_queryset()

        song = None
        songbook = None
        try:
            song = Song.objects.get(pk=serializer.validated_data["song_id"])
            songbook = Songbook.objects.prefetch_related("song_entries").get(
                pk=serializer.validated_data["songbook_id"]
            )
        except (Song.DoesNotExist, Songbook.DoesNotExist) as e:
            raise NotFound("No such song and/or songbook")

        if (
            songbook.max_active_songs is not None
            and songbook.get_total_song_count() >= songbook.max_active_songs
        ):
            raise ConflictingStates("Max songs reached")

        try:
            queryset.get(
                songbook_id=songbook.pk,
                song_id=song.pk,
            )
        except SongEntry.DoesNotExist:
            # This is the happy path, if the songbook already exists
            # we'll throw an error
            pass
        else:
            raise DuplicateValue("That song entry already exists")

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )
