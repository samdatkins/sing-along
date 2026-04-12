import factory
from social_django.models import UserSocialAuth

from api.tests.factories.user import UserFactory


class UserSocialAuthFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UserSocialAuth

    provider = "auth0"
    uid = factory.Sequence(lambda n: f"auth0|test-uid-{n}")
    extra_data = {"picture": "http://fakeval.com"}
    user = factory.SubFactory(UserFactory)
