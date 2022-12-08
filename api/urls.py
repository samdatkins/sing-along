from django.urls import path, re_path
from rest_framework import routers

from api.views.song import SongViewSet
from api.views.song_entry import SongEntryViewSet
from api.views.songbook import SongbookViewSet

router = routers.DefaultRouter()

router.register(r"songs", SongViewSet)
router.register(r"song_entries", SongEntryViewSet)
router.register(r"songbooks", SongbookViewSet)

urlpatterns = router.urls
