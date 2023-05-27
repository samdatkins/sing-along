import factory.random
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIRequestFactory, force_authenticate

from api.tests.factories.user import UserFactory
from api.tests.factories.user_social_auth import UserSocialAuthFactory
from api.views.user import UserView


class TestUser(TestCase):
    def setUp(self):
        factory.random.reseed_random("lol so random")
        self.user_social_auth = UserSocialAuthFactory()
        self.user = self.user_social_auth.user

    def test_authed_requests_succeed(self):
        # Arrange
        api_factory = APIRequestFactory()
        view = UserView.as_view()
        request = api_factory.get(reverse("user-detail"))
        force_authenticate(request, user=self.user)

        # Act
        response = view(request)

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.user.id)

    def test_unauthed_requests_fail(self):
        # Arrange
        api_factory = APIRequestFactory()
        view = UserView.as_view()
        request = api_factory.get(reverse("user-detail"))

        # Act
        response = view(request)

        # Assert
        self.assertEqual(response.status_code, 403)

    def test_edit_succeeds(self):
        # Arrange
        new_first_name = "my brand new first name"
        api_factory = APIRequestFactory()
        view = UserView.as_view()
        request = api_factory.patch(
            reverse("user-detail"), {"first_name": new_first_name}
        )
        force_authenticate(request, user=self.user)

        # Act
        response = view(request)

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["first_name"], new_first_name)

        edited_user = get_user_model().objects.get(pk=self.user.pk)
        self.assertEqual(edited_user.first_name, new_first_name)

    def test_edit_id_is_ignored(self):
        # Arrange
        new_id = 9999999
        old_id = self.user.pk
        api_factory = APIRequestFactory()
        view = UserView.as_view()
        request = api_factory.patch(reverse("user-detail"), {"id": new_id})
        force_authenticate(request, user=self.user)

        # Act
        response = view(request)

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], old_id)
