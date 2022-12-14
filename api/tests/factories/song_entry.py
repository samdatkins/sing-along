import factory
from django.utils import timezone

from api.models import SongEntry
from api.tests.factories.song import SongFactory
from api.tests.factories.songbook import SongbookFactory


class SongEntryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SongEntry

    play_time = factory.Faker("pyfloat", left_digits=4, right_digits=2, positive=True)
    song = factory.SubFactory(SongFactory)
    songbook = factory.SubFactory(SongbookFactory)
