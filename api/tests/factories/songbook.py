import factory
from django.utils import timezone

from api.models import Songbook


class SongbookFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Songbook

    session_key = factory.Faker("first_name")
    current_song_timestamp = factory.Faker(
        "past_datetime", tzinfo=timezone.get_current_timezone()
    )
    max_active_songs = 60
    title = factory.Faker("name")
    last_nav_action_taken_at = factory.Faker(
        "past_datetime", tzinfo=timezone.get_current_timezone()
    )
    is_noodle_mode = factory.Faker("boolean")
