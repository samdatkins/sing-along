import logging

from django.contrib.auth import get_user_model
from rest_framework import generics
from social_django.models import UserSocialAuth

from api.models import UserProfile
from api.serializers.user import UserSerializer

logger = logging.getLogger(__name__)


class UserView(generics.RetrieveUpdateAPIView):
    """
    API endpoint that allows all standard interactions with Songs.
    """

    queryset = get_user_model().objects.select_related("userprofile").all()
    serializer_class = UserSerializer

    def get_object(self):
        user = self.request.user
        user.social = UserSocialAuth.objects.get(user_id=user.pk)

        try:
            profile = user.userprofile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=user)

        return user

