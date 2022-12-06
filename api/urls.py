from django.urls import path, re_path
from rest_framework import routers

from api.views.song import SongViewSet

router = routers.DefaultRouter()

router.register(r"songs", SongViewSet)

urlpatterns = router.urls
