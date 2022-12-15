import factory

from api.models import Song


class SongFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Song

    artist = factory.Faker("name")
    title = factory.Faker("sentence", nb_words=2)
    url = factory.Faker("url")
    content = factory.Faker("sentence", nb_words=400)
