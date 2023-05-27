from django.urls import path, re_path
from rest_framework import routers

from api.views.song import SongViewSet
from api.views.song_entry import SongEntryViewSet
from api.views.songbook import SongbookViewSet
from api.views.social_user import SocialUserViewSet

router = routers.DefaultRouter()

router.register(r"songs", SongViewSet)
router.register(r"song_entries", SongEntryViewSet)
router.register(r"songbooks", SongbookViewSet)
router.register(r"social_users", SocialUserViewSet)

urlpatterns = router.urls
