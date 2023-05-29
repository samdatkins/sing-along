import factory.random
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate

from api.tests.factories.user import UserFactory
from api.tests.factories.user_social_auth import UserSocialAuthFactory
from api.views.user import UserView


class TestUser(APITestCase):
    def setUp(self):
        factory.random.reseed_random("lol so random")
        self.user_social_auth = UserSocialAuthFactory()
        self.user = self.user_social_auth.user

    def test_authed_requests_succeed(self):
        # Arrange
        self.client.force_authenticate(user=self.user)

        # Act
        response = self.client.get(
            reverse("user-detail"),
        )

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.user.id)

    def test_unauthed_requests_fail(self):
        # Arrange

        # Act
        response = self.client.get(
            reverse("user-detail"),
        )

        # Assert
        self.assertEqual(response.status_code, 403)

    def test_edit_succeeds(self):
        # Arrange
        self.client.force_authenticate(user=self.user)
        new_first_name = "my brand new first name"

        # Act
        response = self.client.patch(
            reverse("user-detail"), data={"first_name": new_first_name}
        )

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["first_name"], new_first_name)

        edited_user = get_user_model().objects.get(pk=self.user.pk)
        self.assertEqual(edited_user.first_name, new_first_name)

    def test_edit_id_is_ignored(self):
        # Arrange
        new_id = 9999999
        old_id = self.user.pk
        self.client.force_authenticate(user=self.user)

        # Act
        response = self.client.patch(reverse("user-detail"), data={"id": new_id})

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], old_id)
