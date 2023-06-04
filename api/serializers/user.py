from django.contrib.auth import get_user_model
from rest_framework import serializers

from api.serializers.user_profile import UserProfileSerializer
from api.serializers.user_social_auth import UserSocialAuthSerializer


class UserSerializer(serializers.ModelSerializer):
    social_auth = UserSocialAuthSerializer(many=True)
    userprofile = UserProfileSerializer()

    class Meta:
        model = get_user_model()
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "social_auth",
            "last_login",
            "date_joined",
            "userprofile",
        ]
