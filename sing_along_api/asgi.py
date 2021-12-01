"""
ASGI config for sing_along_api project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
import sing_along_api.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sing_along_api.settings")

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(
            URLRouter(sing_along_api.routing.websocket_urlpatterns)
        ),
    }
)
