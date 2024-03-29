from django.urls import path, re_path
from rest_framework import routers

from api.views.recommendation import RecommendationViewSet
from api.views.song import SongViewSet
from api.views.song_entry import SongEntryViewSet
from api.views.songbook import SongbookViewSet
from api.views.user import UserView
from api.views.user_profile import UserProfileView
from api.views.wishlist_song import WishlistSongViewSet

urlpatterns = [
    path("users/", UserView.as_view(), name="user-detail"),
    path("user_profiles/", UserProfileView.as_view(), name="user-profile-detail"),
]

router = routers.DefaultRouter()

router.register(r"songs", SongViewSet)
router.register(r"song_entries", SongEntryViewSet)
router.register(r"songbooks", SongbookViewSet)
router.register(r"wishlist_songs", WishlistSongViewSet, basename="wishlist_songs")
router.register(r"recommendations", RecommendationViewSet, basename="recommendations")

urlpatterns += router.urls
