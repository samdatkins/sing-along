from django.contrib.auth import get_user_model
from rest_framework import serializers

from api.serializers.user_social_auth import UserSocialAuthSerializer


class UserSerializer(serializers.ModelSerializer):
    social = serializers.SerializerMethodField()

    class Meta:
        model = get_user_model()
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "social",
            "last_login",
            "date_joined",
        ]

    def get_social(self, obj):
        return UserSocialAuthSerializer(obj.social).data
