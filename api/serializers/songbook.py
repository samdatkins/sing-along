from rest_framework import serializers

from api.models import Membership, Songbook, SongbookUserPosition
from api.serializers.membership import MembershipSerializer
from api.serializers.song_entry import SongEntrySerializer


class SongbookSerializer(serializers.ModelSerializer):
    total_songs = serializers.SerializerMethodField()
    current_song_position = serializers.SerializerMethodField()
    current_song_entry = serializers.SerializerMethodField()
    is_songbook_owner = serializers.SerializerMethodField()
    is_current_song_liked = serializers.SerializerMethodField()
    membership_set = serializers.SerializerMethodField()
    song_catalog = serializers.SerializerMethodField()

    class Meta:
        model = Songbook
        fields = [
            "session_key",
            "max_active_songs",
            "title",
            "is_noodle_mode",
            "total_songs",
            "current_song_position",
            "current_song_entry",
            "id",
            "is_songbook_owner",
            "is_current_song_liked",
            "membership_set",
            "theme",
            "action_verb",
            "song_catalog",
        ]

        extra_kwargs = {
            "session_key": {"read_only": True},
            "is_liked": {"read_only": True},
            "membership_set": {"read_only": True},
        }

    def get_membership_set(self, obj):
        request = self.context.get("request")
        if request is None:
            return None

        members = list(obj.membership_set.all())
        if not self._get_is_user_songbook_owner(members, request):
            members = [
                member for member in members if member.user.id == request.user.id
            ]
        return MembershipSerializer(members, many=True).data

    def _get_is_user_songbook_owner(self, members, req):
        membership = [member for member in members if member.user.id == req.user.id]
        if len(membership) == 0:
            return False

        return membership[0].type == Membership.MemberType.OWNER.value

    def _get_user_position(self, obj):
        """For noodle mode, get-or-create the user's position and return their
        song position. For non-noodle mode, return None so model methods use the
        songbook's default."""
        if not obj.is_noodle_mode:
            return None
        request = self.context.get("request")
        if not request or not hasattr(request, "user"):
            return None
        pos, _ = SongbookUserPosition.objects.get_or_create(
            songbook=obj,
            user=request.user,
            defaults={"current_song_position": obj.current_song_position},
        )
        return pos.current_song_position

    def get_total_songs(self, obj):
        return obj.get_total_song_count()

    def get_current_song_position(self, obj):
        user_pos = self._get_user_position(obj)
        return obj.get_current_song_position(position_override=user_pos)

    def get_current_song_entry(self, obj):
        user_pos = self._get_user_position(obj)
        song_entry = obj.get_current_song_entry(position_override=user_pos)
        if song_entry is None:
            return None
        return SongEntrySerializer(song_entry).data

    def get_is_songbook_owner(self, obj):
        user = None
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            user = request.user
        membership = obj.membership_set.get(user=user)
        return membership.type == Membership.MemberType.OWNER.value

    def get_is_current_song_liked(self, obj):
        user = None
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            user = request.user

        user_pos = self._get_user_position(obj)
        song_entry = obj.get_current_song_entry(position_override=user_pos)
        if song_entry is None or user is None:
            return False

        return song_entry.likes.filter(pk=user.pk).exists()

    def get_song_catalog(self, obj):
        return [
            {
                "id": entry.id,
                "position": entry.position,
                "artist": entry.song.artist,
                "title": entry.song.title,
            }
            for entry in obj.song_entries.all()
        ]


class SongbookListSerializer(serializers.ModelSerializer):
    current_song_position = serializers.IntegerField(read_only=False, required=False)
    total_songs = serializers.SerializerMethodField()
    is_songbook_owner = serializers.SerializerMethodField()
    membership_set = serializers.SerializerMethodField()

    class Meta:
        model = Songbook
        fields = [
            "session_key",
            "max_active_songs",
            "title",
            "theme",
            "action_verb",
            "is_noodle_mode",
            "current_song_position",
            "created_at",
            "updated_at",
            "total_songs",
            "is_songbook_owner",
            "membership_set",
        ]

        extra_kwargs = {"session_key": {"read_only": True}}

    def get_total_songs(self, obj):
        return obj.get_total_song_count()

    def _get_is_user_songbook_owner(self, members, req):
        membership = [member for member in members if member.user.id == req.user.id]
        if len(membership) == 0:
            return False

        return membership[0].type == Membership.MemberType.OWNER.value

    def get_membership_set(self, obj):
        request = self.context.get("request")
        if request is None:
            return None

        members = list(obj.membership_set.all())
        if not self._get_is_user_songbook_owner(members, request):
            members = [
                member for member in members if member.user.id == request.user.id
            ]
        return MembershipSerializer(members, many=True).data

    def get_is_songbook_owner(self, obj):
        user = None
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            user = request.user
        membership_list = [
            membership
            for membership in obj.membership_set.all()
            if membership.user == user
        ]

        if len(membership_list) != 1:
            return False
        return membership_list[0].type == Membership.MemberType.OWNER.value


class SongbookDetailSerializer(serializers.ModelSerializer):
    song_entries = SongEntrySerializer(many=True)
    current_song_position = serializers.SerializerMethodField()

    class Meta:
        model = Songbook
        fields = [
            "session_key",
            "max_active_songs",
            "title",
            "theme",
            "action_verb",
            "is_noodle_mode",
            "song_entries",
            "current_song_position",
            "created_at",
        ]

        extra_kwargs = {"session_key": {"read_only": True}}

    def get_current_song_position(self, obj):
        if not obj.is_noodle_mode:
            return obj.get_current_song_position()
        request = self.context.get("request")
        if not request or not hasattr(request, "user"):
            return obj.get_current_song_position()
        pos, _ = SongbookUserPosition.objects.get_or_create(
            songbook=obj,
            user=request.user,
            defaults={"current_song_position": obj.current_song_position},
        )
        return obj.get_current_song_position(
            position_override=pos.current_song_position
        )
