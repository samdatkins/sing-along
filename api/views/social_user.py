import logging

from django.contrib.auth import get_user_model
from rest_framework import viewsets
from social_django.models import UserSocialAuth

from api.serializers.user_social_auth import UserSocialAuthSerializer

logger = logging.getLogger(__name__)


class SocialUserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows all standard interactions with Songs.
    """

    queryset = UserSocialAuth.objects.all()
    serializer_class = UserSocialAuthSerializer
