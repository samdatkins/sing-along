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

    def test_add_song_to_empty_songbook(self):
        # Arrange
        api_factory = APIRequestFactory()
        view = SongEntryViewSet.as_view({"post": "create"})
        request = api_factory.post(
            reverse("songentry-list"),
            data={
                "songbook_id": self.empty_songbook.pk,
                "song_id": self.first_song_entry.song.pk,
            },
            format="json",
        )
        force_authenticate(request, user=self.user)

        # Act
        response = view(request)

        # Assert
        self.assertEqual(response.status_code, 201)

    def test_add_same_song_again(self):
        # Arrange
        api_factory = APIRequestFactory()
        view = SongEntryViewSet.as_view({"post": "create"})
        request = api_factory.post(
            reverse("songentry-list"),
            data={
                "songbook_id": self.nonempty_songbook.pk,
                "song_id": self.first_song_entry.song.pk,
            },
            format="json",
        )
        force_authenticate(request, user=self.user)

        # Act
        response = view(request)

        # Assert
        self.assertEqual(response.status_code, 409)

    def test_add_nonexistant_song(self):
        # Arrange
        api_factory = APIRequestFactory()
        view = SongEntryViewSet.as_view({"post": "create"})
        request = api_factory.post(
            reverse("songentry-list"),
            data={
                "songbook_id": self.nonempty_songbook.pk,
                "song_id": 9999999,
            },
            format="json",
        )
        force_authenticate(request, user=self.user)

        # Act
        response = view(request)

        # Assert
        self.assertEqual(response.status_code, 404)

    def test_add_to_nonexistant_songbook(self):
        # Arrange
        api_factory = APIRequestFactory()
        view = SongEntryViewSet.as_view({"post": "create"})
        request = api_factory.post(
            reverse("songentry-list"),
            data={
                "songbook_id": 999999,
                "song_id": self.first_song_entry.song.pk,
            },
            format="json",
        )
        force_authenticate(request, user=self.user)

        # Act
        response = view(request)

        # Assert
        self.assertEqual(response.status_code, 404)

    def test_add_past_max_songs(self):
        # Arrange
        self.empty_songbook.max_active_songs = 1
        self.empty_songbook.save()

        api_factory = APIRequestFactory()
        view = SongEntryViewSet.as_view({"post": "create"})
        request1 = api_factory.post(
            reverse("songentry-list"),
            data={
                "songbook_id": self.empty_songbook.pk,
                "song_id": self.first_song_entry.song.pk,
            },
            format="json",
        )
        force_authenticate(request1, user=self.user)
        request2 = api_factory.post(
            reverse("songentry-list"),
            data={
                "songbook_id": self.empty_songbook.pk,
                "song_id": self.second_song_entry.song.pk,
            },
            format="json",
        )
        force_authenticate(request2, user=self.user)

        # Act
        response1 = view(request1)
        response2 = view(request2)

        # Assert
        self.assertEqual(response1.status_code, 201)
        self.assertEqual(response2.status_code, 400)
