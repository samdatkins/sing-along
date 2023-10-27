import random

from django.db import models
from django.db.models import Count, Q
from rest_framework import mixins, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response

from api.models import Song, SongEntry, WishlistSong
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
    authentication_classes = [
        SessionAuthentication,
        TokenBasedAuthentication,
    ]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        session_key = self.kwargs["pk"]

        wishes_list = list(
            WishlistSong.objects.filter(user=request.user).order_by("?")[0:6]
        )
        if len(wishes_list) < 6:
            self._get_six_recommendations(request, wishes_list, session_key)

        results = [item for item in wishes_list][0:6]

        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

    def _get_six_recommendations(self, request, wishes_list, session_key):
        likes_list = list(
            Song.objects.filter(likes=request.user)
            .exclude(song_entry__songbook__session_key=session_key)
            .order_by("?")
            .values("artist", "title")[0:6]
        )

        used_songs_entry = list(
            SongEntry.objects.filter(songbook__session_key=session_key)
        )

        first_hundred = (
            Song.objects.annotate(entry_count=models.Count("song_entry"))
            .exclude(pk__in=[song_entry.song.id for song_entry in used_songs_entry])
            .filter(
                entry_count__gt=0,
                song_entry__songbook__is_noodle_mode=False,
            )
            .order_by("-entry_count")
            .values("artist", "title")[:100]
        )

        recommendations_list = random.sample(
            list(first_hundred), min(18, len(first_hundred))
        )

        [
            self._remove_duplicates(
                {"artist": wish_song.artist, "title": wish_song.title},
                likes_list,
                recommendations_list,
            )
            for wish_song in wishes_list
        ]

        while len(wishes_list) < 6:
            item = self._get_song_recommendation(likes_list, recommendations_list)
            if item is None:
                break
            self._remove_duplicates(item, likes_list, recommendations_list)
            wishes_list.append(item)

        return wishes_list

    def _get_song_recommendation(self, likes_list, recommendations_list):
        if len(likes_list) > 0:
            item = random.choice(likes_list)
            LIKE_THRESHOLD = 0.9
            if random.random() > LIKE_THRESHOLD or len(recommendations_list) > 0:
                return item

        if len(recommendations_list) > 0:
            return random.choice(recommendations_list)

        return None

    def _remove_duplicates(self, item, likes_list, recommendations_list):
        item = {"artist": item["artist"], "title": item["title"]}
        try:
            likes_list.remove(item)
        except ValueError:
            pass
        try:
            recommendations_list.remove(item)
        except ValueError:
            pass
