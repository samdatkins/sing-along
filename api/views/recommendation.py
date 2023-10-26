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

        first_hundred = (
            Song.objects.annotate(entry_count=models.Count("song_entry"))
            .exclude(
                Q(song_entry__songbook__session_key=session_key)
                & Q(song_entry__deleted__isnull=True)
            )
            .filter(
                entry_count__gt=0,
                song_entry__songbook__is_noodle_mode=False,
                # song_entry__is_active=True,
                # deleted_at
                # is_cascade_deleted
            )
            .order_by("-entry_count")[:100]
        )
        recommendations_list = random.sample(list(first_hundred), len(first_hundred))[
            0:6
        ]

        LIKE_THRESHOLD = 0.9

        joined_list = []
        for _ in range(6):
            item = None
            random_number = random.random()
            if likes_list and random_number > LIKE_THRESHOLD and len(likes_list) > 0:
                # don't add it if it's already in joined_list
                item = random.choice(likes_list)

                # use a set or dictionary with "artist title" as property and object as value
                # while loop until the set/dictionary has 6 properties
                # build a new list of 6 from the dictionary, discluding id prop

                likes_list.remove(item)
            else:
                if recommendations_list and len(recommendations_list) > 0:
                    item = random.choice(recommendations_list)
                    recommendations_list.remove(item)
            if item is not None:
                if hasattr(item, "id"):
                    delattr(item, "id")
                joined_list.append(item)

        return joined_list
