import random

from django.db import models
from django.db.models import Count, Q
from rest_framework import mixins, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response

from api.models import Song, Songbook, SongEntry, WishlistSong
from api.serializers.recommendation import RecommendationSerializer
from api.views.authentication.token import TokenBasedAuthentication


class RecommendationViewSet(
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    API endpoint that constructs and serves a list of 6 songs: Wishlist > Likes > random recommendations.
    """

    serializer_class = RecommendationSerializer
    queryset = WishlistSong.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        session_key = self.kwargs["pk"]
        songbook = Songbook.objects.get(session_key=session_key)

        wishes_list = []
        # Only use wishlist if this is a non-themed songbook
        if songbook.theme == "":
            wishes_list = list(
                WishlistSong.objects.filter(user=request.user).order_by("?")[:6]
            )
        if len(wishes_list) < 6:
            self._populate_recommendations_list(
                request, wishes_list, session_key, songbook
            )

        serializer = self.get_serializer(wishes_list[:6], many=True)
        return Response(serializer.data)

    def _populate_recommendations_list(self, request, wishes_list, songbook):
        likes_list = list(
            SongEntry.objects.filter(likes=request.user)
            .filter(
                songbook__theme=songbook.theme,
                songbook__is_noodle_mode=songbook.is_noodle_mode,
            )
            .exclude(songbook__session_key=session_key)
            .order_by("?")
            .select_related("song")[:50]
        )
        likes_list = [
            {"artist": like.song.artist, "title": like.song.title}
            for like in likes_list
        ]

        used_songs_entry = list(
            SongEntry.objects.filter(songbook__session_key=session_key)
        )

        top_hundred = (
            Song.objects.annotate(entry_count=models.Count("song_entry"))
            .exclude(pk__in=[song_entry.song.id for song_entry in used_songs_entry])
            .filter(
                song_entry__songbook__theme=theme,
                entry_count__gt=0,
                song_entry__songbook__is_noodle_mode=songbook.is_noodle_mode,
            )
            .order_by("-entry_count")
            .values("artist", "title")[:100]
        )

        recommendations_list = random.sample(
            list(top_hundred), min(18, len(top_hundred))
        )

        for wish_song in wishes_list:
            entry = {"artist": wish_song.artist, "title": wish_song.title}
            likes_list, recommendations_list = self._remove_duplicates(
                entry, likes_list, recommendations_list
            )

        while len(wishes_list) < 6:
            item = self._get_song_recommendation(likes_list, recommendations_list)
            if item is None:
                break
            likes_list, recommendations_list = self._remove_duplicates(
                item, likes_list, recommendations_list
            )
            wishes_list.append(item)

    def _get_song_recommendation(self, likes_list, recommendations_list):
        if len(likes_list) > 0:
            item = random.choice(likes_list)
            LIKE_THRESHOLD = 0.9
            if random.random() > LIKE_THRESHOLD or len(recommendations_list) < 1:
                return item

        if len(recommendations_list) > 0:
            return random.choice(recommendations_list)

        return None

    def _remove_duplicates(self, item, likes_list, recommendations_list):
        item = {"artist": item["artist"], "title": item["title"]}
        likes_list = [
            liked_song
            for liked_song in likes_list
            if (
                liked_song["artist"] != item["artist"]
                and liked_song["title"] != item["title"]
            )
        ]
        recommendations_list = [
            recommended_song
            for recommended_song in recommendations_list
            if (
                recommended_song["artist"] != item["artist"]
                and recommended_song["title"] != item["title"]
            )
        ]
        return likes_list, recommendations_list
