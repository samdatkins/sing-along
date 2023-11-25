from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response

from api.models import Membership, Song, Songbook, SongEntry
from api.serializers.song_entry import SongEntrySerializer
from api.views.custom_exceptions import ConflictingStates, DuplicateValue
from sing_along.utils.tabs import TabScraper


class OnlyAllowSongbookParticipantsToModify(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        try:
            obj.songbook.membership_set.get(user=request.user)
        except:
            return False

        return True


class SongEntryViewSet(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    API endpoint that allows all standard interactions with SongEntries.
    """

    queryset = SongEntry.objects.all()
    serializer_class = SongEntrySerializer
    permission_classes = [OnlyAllowSongbookParticipantsToModify]

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

        try:
            songbook.membership_set.get(user=request.user)
        except:
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

        if song.content is None or song.content == "":
            tab_scraper = TabScraper()
            tab = tab_scraper.load_tab_from_url(song.url)
            if tab is None:
                return Response(status=status.HTTP_404_NOT_FOUND)
            song.content = tab["content"]
            song.save()

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

    @action(methods=["put", "delete"], detail=True, url_path="like", url_name="like")
    def like(self, request, pk):
        user = request.user
        instance = self.get_object()

        if request.method == "PUT":
            instance.likes.add(user)
            return Response(status=status.HTTP_201_CREATED)
        elif request.method == "DELETE":
            instance.likes.remove(user)
            return Response(status=status.HTTP_202_ACCEPTED)

        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
