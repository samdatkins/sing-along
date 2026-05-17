import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sing_along.settings")

django_asgi_app = get_asgi_application()

import api.routing  # noqa: E402 — must import after Django setup

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(
            URLRouter(api.routing.websocket_urlpatterns)
        ),
    }
)
