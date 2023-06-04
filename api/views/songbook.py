import datetime

from django.db.models import Prefetch
from django.utils import timezone
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from api.models import Membership, Song, Songbook, SongEntry
from api.serializers.songbook import (
    SongbookDetailSerializer,
    SongbookListSerializer,
    SongbookSerializer,
)


class OnlyAllowSongbookOwnersToModify(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if view.action == "retrieve":
            return True

        try:
            membership = obj.membership_set.get(user=request.user)
        except:
            return False

        if request.method in permissions.SAFE_METHODS:
            return True

        if membership.type != Membership.MemberType.OWNER.value:
            return False

        return True


class SongbookViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """
    API endpoint that allows all standard interactions with Songbooks except deletes.
    """

    queryset = Songbook.objects.all().order_by("-created_at")
    lookup_field = "session_key"
    permission_classes = [OnlyAllowSongbookOwnersToModify]

    def get_queryset(self):
        if self.action == "retrieve":
            # Don't filter for retrieve, users get access to all songbooks
            # when retrieving (since session key is the password)
            return self.queryset.prefetch_related("song_entries").all()

        queryset = self.queryset.filter(members__id=self.request.user.id)

        if self.action == "songbook_details":
            return queryset.prefetch_related(
                Prefetch(
                    "song_entries",
                    queryset=SongEntry.objects.order_by("created_at").prefetch_related(
                        "song"
                    ),
                )
            ).all()
        return queryset

    def get_serializer_class(self):
        if self.action == "retrieve":
            return SongbookSerializer
        return SongbookListSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        self._check_and_add_membership(instance, request.user)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(methods=["patch"], detail=True, url_path="next-song", url_name="next-song")
    def next_song(self, request, session_key=None):
        instance = self.get_object()

        next_song_entry = instance.get_next_song_entry()
        if next_song_entry is None:
            return Response(status=status.HTTP_409_CONFLICT)

        instance.current_song_timestamp = next_song_entry.created_at
        instance.last_nav_action_taken_at = datetime.datetime.now(
            tz=timezone.get_current_timezone()
        )
        instance.save()
        return Response(status=status.HTTP_200_OK)

    @action(
        methods=["patch"],
        detail=True,
        url_path="previous-song",
        url_name="previous-song",
    )
    def previous_song(self, request, session_key=None):
        instance = self.get_object()

        previous_song_entry = instance.get_previous_song_entry()
        if previous_song_entry is None:
            return Response(status=status.HTTP_409_CONFLICT)

        instance.current_song_timestamp = previous_song_entry.created_at
        instance.last_nav_action_taken_at = datetime.datetime.now(
            tz=timezone.get_current_timezone()
        )
        instance.save()
        return Response(status=status.HTTP_200_OK)

    @action(
        methods=["get"],
        detail=True,
        url_path="details",
        url_name="details",
    )
    def songbook_details(self, request, session_key=None):
        instance = self.get_object()

        return Response(
            status=status.HTTP_200_OK,
            data=SongbookDetailSerializer(instance, context={"request": request}).data,
        )

    def perform_create(self, serializer):
        songbook = serializer.save()
        Membership.objects.create(
            songbook=songbook,
            user=self.request.user,
            type=Membership.MemberType.OWNER.value,
        )

    def _check_and_add_membership(self, instance, user):
        try:
            instance.membership_set.get(user=user)
        except:
            Membership.objects.create(
                songbook=instance,
                user=self.request.user,
                type=Membership.MemberType.PARTICIPANT.value,
            )
