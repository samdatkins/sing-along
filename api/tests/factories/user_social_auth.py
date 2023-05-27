import factory
from social_django.models import UserSocialAuth

from api.tests.factories.user import UserFactory


class UserSocialAuthFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UserSocialAuth

    extra_data = {"picture": "http://fakeval.com"}
    user = factory.SubFactory(UserFactory)
