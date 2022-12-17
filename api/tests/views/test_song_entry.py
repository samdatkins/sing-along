import factory.random
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIRequestFactory, force_authenticate

from api.tests.factories.song_entry import SongEntryFactory
from api.tests.factories.songbook import SongbookFactory
from api.tests.factories.user import UserFactory
from api.tests.helpers import get_datetime_x_seconds_ago
from api.views.song_entry import SongEntryViewSet


class TestSongEntry(TestCase):
    def setUp(self):
        factory.random.reseed_random("lol so random")
        self.user = UserFactory.create()
        self.empty_songbook = SongbookFactory.create()

        self.first_song_entry = SongEntryFactory.create()
        self.first_song_entry.created_at = get_datetime_x_seconds_ago(5)
        self.first_song_entry.save()

        self.nonempty_songbook = self.first_song_entry.songbook
        self.nonempty_songbook.current_song_timestamp = get_datetime_x_seconds_ago(60)
        self.nonempty_songbook.save()

        self.second_song_entry = SongEntryFactory.create(
            songbook=self.nonempty_songbook
        )
        self.second_song_entry.created_at = get_datetime_x_seconds_ago(3)
        self.second_song_entry.save()

        self.third_song_entry = SongEntryFactory.create(songbook=self.nonempty_songbook)
        self.third_song_entry.created_at = get_datetime_x_seconds_ago(1)
        self.third_song_entry.save()

    def test_authed_requests_succeed(self):
        # Arrange
        api_factory = APIRequestFactory()
        view = SongEntryViewSet.as_view({"get": "list"})
        request = api_factory.get(reverse("songentry-list"))
        force_authenticate(request, user=self.user)

        # Act
        response = view(request)

        # Assert
        self.assertEqual(response.status_code, 200)

    def test_unauthed_requests_fail(self):
        # Arrange
        api_factory = APIRequestFactory()
        view = SongEntryViewSet.as_view({"get": "list"})
        request = api_factory.get(reverse("songentry-list"))

        # Act
        response = view(request)

        # Assert
        self.assertEqual(response.status_code, 403)
