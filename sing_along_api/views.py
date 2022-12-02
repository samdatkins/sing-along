import urllib.request

from django.conf import settings
from django.http import HttpResponse, JsonResponse, StreamingHttpResponse
from django.template import engines
from django.views.generic import TemplateView


def test_view(request):
    return JsonResponse({"msg": "hi", "debug": settings.DEBUG})
