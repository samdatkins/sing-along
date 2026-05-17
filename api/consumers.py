import logging

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.db.models import Prefetch

from api.models import Songbook, SongEntry

logger = logging.getLogger(__name__)


class SongbookConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.session_key = self.scope["url_route"]["kwargs"]["session_key"]
        self.group_name = f"songbook_{self.session_key}"
        user = self.scope.get("user")

        if not user or user.is_anonymous:
            await self.close()
            return

        songbook = await self._get_songbook()
        if songbook is None:
            await self.close()
            return

        is_member = await self._is_member(songbook, user)
        if not is_member:
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        state = await self._get_songbook_state()
        if state is not None:
            await self.send_json(state)

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name, self.channel_name
            )

    async def receive_json(self, content, **kwargs):
        msg_type = content.get("type")
        if msg_type == "sync":
            state = await self._get_songbook_state()
            if state is not None:
                await self.send_json(state)

    async def songbook_update(self, event):
        """Handler for group broadcast messages."""
        state = await self._get_songbook_state()
        if state is not None:
            await self.send_json(state)

    @database_sync_to_async
    def _get_songbook(self):
        try:
            return Songbook.objects.get(session_key=self.session_key)
        except Songbook.DoesNotExist:
            return None

    @database_sync_to_async
    def _is_member(self, songbook, user):
        return songbook.membership_set.filter(user=user).exists()

    @database_sync_to_async
    def _get_songbook_state(self):
        from api.serializers.songbook import SongbookSerializer

        try:
            songbook = (
                Songbook.objects.prefetch_related(
                    Prefetch(
                        "song_entries",
                        queryset=SongEntry.objects.order_by(
                            "position"
                        ).select_related("song"),
                    )
                )
                .prefetch_related("membership_set__user")
                .get(session_key=self.session_key)
            )
        except Songbook.DoesNotExist:
            return None

        user = self.scope["user"]

        class FakeRequest:
            pass

        fake_request = FakeRequest()
        fake_request.user = user

        serializer = SongbookSerializer(
            songbook, context={"request": fake_request}
        )
        return serializer.data
