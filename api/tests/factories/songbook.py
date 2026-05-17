import factory
from django.utils import timezone

from api.models import Membership, Songbook


class SongbookFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Songbook

    current_song_position = 1
    max_active_songs = 60
    title = factory.Faker("name")
    last_nav_action_taken_at = factory.Faker(
        "past_datetime", tzinfo=timezone.get_current_timezone()
    )
    is_noodle_mode = factory.Faker("boolean")
