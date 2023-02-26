from django.conf import settings
from django.contrib.auth import logout as django_logout
from django.http import HttpResponse
from django.shortcuts import redirect, render


def logout(request):
    django_logout(request)
    domain = settings.SOCIAL_AUTH_AUTH0_DOMAIN
    client_id = settings.SOCIAL_AUTH_AUTH0_KEY
    return_to = request.build_absolute_uri("/")
    return redirect(
        f"https://{domain}/v2/logout?client_id={client_id}&returnTo={return_to}"
    )


def test(request):
    user = request.user
    return HttpResponse(user.first_name)


def react(request):
    if settings.DEBUG:
        return redirect("http://localhost:3000/live")
    else:
        return render(request, "index.html")
