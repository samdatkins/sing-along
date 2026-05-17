import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

logger = logging.getLogger(__name__)


def broadcast_songbook_update(session_key):
    """Send a lightweight signal to all WebSocket clients in a songbook room.

    Each consumer independently re-queries the DB on receipt, so the broadcast
    carries no payload — this keeps per-user fields (noodle-mode position,
    ownership, likes) correct without leaking state across users.
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"songbook_{session_key}",
        {"type": "songbook.update"},
    )
