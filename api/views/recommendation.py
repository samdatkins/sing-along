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

    # add session_key as third parameter:
    def retrieve(self, request, *args, **kwargs):
        session_key = self.kwargs["pk"]

        wishes_list = list(
            WishlistSong.objects.filter(user=request.user).order_by("?")[0:6]
        )
        joined_list = self._get_six_recommendations(request, session_key)

        wishes_list.extend(joined_list)

        results = [item for item in wishes_list][0:6]

        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

    def _get_six_recommendations(self, request, session_key):
        likes_list = list(
            Song.objects.filter(likes=request.user)
            .exclude(song_entry__songbook__session_key=session_key)
            .order_by("?")[0:6]
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
            .order_by("-entry_count")[:100]
        )

        recommendations_list = random.sample(list(first_hundred), len(first_hundred))[
            0:12
        ]

        joined_list = []

        # for _ in range(6):
        while len(joined_list) < 6:
            item = self._get_liked_song(likes_list, joined_list)

            if item is None and len(recommendations_list) > 0:
                item = random.choice(recommendations_list)
                recommendations_list.remove(item)
                joined_list.append(item)

        return [{"artist": rec.artist, "title": rec.title} for rec in joined_list]

    def _get_liked_song(self, likes_list, joined_list):
        if len(likes_list) < 1:
            return None
        item = random.choice(likes_list)
        random_number = random.random()
        LIKE_THRESHOLD = 0.9
        if random_number > LIKE_THRESHOLD and self._check_if_unique(item, joined_list):
            likes_list.remove(item)
            return item
        return None

    def _check_if_unique(self, song, joined_list):
        for rec in joined_list:
            if rec.artist == song.artist and rec.title == song.title:
                return False
        return True
