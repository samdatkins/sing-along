from rest_framework import serializers

from api.models import Membership
from api.serializers.user import PublicUserSerializer


class MembershipSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer()

    class Meta:
        model = Membership
        fields = ["user"]
