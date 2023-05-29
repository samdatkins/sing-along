import json
from unittest.mock import patch

import factory.random
from django.urls import reverse
from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate

from api.models import Song
from api.serializers.song import SongSerializer
from api.tests.factories.song import SongFactory
from api.tests.factories.song_entry import SongEntryFactory
from api.tests.factories.songbook import SongbookFactory
from api.tests.factories.user import UserFactory
from api.tests.helpers import get_datetime_x_seconds_ago
from api.views.song import SongViewSet


class TestSong(APITestCase):
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

    def test_authed_requests_succeed(self):
        # Arrange
        self.client.force_authenticate(user=self.user)
        query_params = {"q": self.first_song_entry.song.title}

        # Act
        response = self.client.get(reverse("song-search"), data=query_params)

        # Assert
        self.assertEqual(response.status_code, 200)

    def test_unauthed_requests_fail(self):
        # Arrange
        query_params = {"q": self.first_song_entry.song.title}

        # Act
        response = self.client.get(reverse("song-search"), data=query_params)

        # Assert
        self.assertEqual(response.status_code, 403)

    def test_searching_for_existing_song_works(self):
        # Arrange
        self.client.force_authenticate(user=self.user)
        query_params = {"q": self.first_song_entry.song.title}

        # Act
        response = self.client.get(reverse("song-search"), data=query_params)

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["id"], self.first_song_entry.song.pk)

    def test_searching_for_non_existing_song_fails(self):
        # Arrange
        self.client.force_authenticate(user=self.user)
        query_params = {
            "q": "some really really long string that definitely won't match a song in the database"
        }

        # Act
        response = self.client.get(reverse("song-search"), data=query_params)

        # Assert
        self.assertEqual(response.status_code, 404)
