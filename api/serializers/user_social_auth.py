from django.contrib.auth import get_user_model
from rest_framework import serializers
from social_django.models import UserSocialAuth

from api.serializers.user import UserSerializer


class UserSocialAuthSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    picture = serializers.SerializerMethodField()

    class Meta:
        model = UserSocialAuth
        fields = ["id", "user", "picture", "created", "modified"]

    def get_picture(self, obj):
        return obj.extra_data["picture"]
