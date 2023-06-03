from rest_framework import generics

from api.models import UserProfile
from api.serializers.user_profile import UserProfileSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint that allows all standard interactions with User Profiles.
    """

    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

    def get_object(self):
        user = self.request.user

        try:
            profile = user.userprofile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=user)

        return profile
