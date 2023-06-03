from rest_framework import serializers

from api.models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "is_showing_chords",
            "columns_to_display",
            "is_day_mode"
        ]
