from django.urls import re_path

from api.consumers import SongbookConsumer

websocket_urlpatterns = [
    re_path(
        r"ws/songbook/(?P<session_key>\w+)/$", SongbookConsumer.as_asgi()
    ),
]
