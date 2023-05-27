from django.contrib.auth import get_user_model
from rest_framework import serializers
from social_django.models import UserSocialAuth


class UserSocialAuthSerializer(serializers.ModelSerializer):
    picture = serializers.SerializerMethodField()

    class Meta:
        model = UserSocialAuth
        fields = ["picture"]

    def get_picture(self, obj):
        return obj.extra_data["picture"]
