from rest_framework import authentication

from api.models import UserProfile


class TokenBasedAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        secret = request.headers.get("X-LPH-Secret")
        user_profile = None
        try:
            user_profile = UserProfile.objects.get(token=secret)
        except UserProfile.DoesNotExist:
            raise ValueError("Invalid token")

        return (user_profile.user, None)
