import json
from unittest.mock import patch

import factory.random
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import Song
from api.serializers.song import SongSerializer
from api.tests.factories.song import SongFactory
from api.tests.factories.song_entry import SongEntryFactory
from api.tests.factories.songbook import SongbookFactory
from api.tests.factories.user import UserFactory
from api.tests.helpers import get_datetime_x_seconds_ago
from api.views.song import SongViewSet


class TestSong(TestCase):
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
        api_factory = APIRequestFactory()
        view = SongViewSet.as_view({"get": "list"})
        request = api_factory.get(reverse("song-list"))
        force_authenticate(request, user=self.user)

        # Act
        response = view(request)

        # Assert
        self.assertEqual(response.status_code, 200)

    def test_unauthed_requests_fail(self):
        # Arrange
        api_factory = APIRequestFactory()
        view = SongViewSet.as_view({"get": "list"})
        request = api_factory.get(reverse("song-list"))

        # Act
        response = view(request)

        # Assert
        self.assertEqual(response.status_code, 403)

    def test_searching_for_existing_song_works(self):
        # Arrange
        api_factory = APIRequestFactory()
        view = SongViewSet.as_view({"get": "search"})
        query_params = {"q": self.first_song_entry.song.title}
        request = api_factory.get(reverse("song-search"), data=query_params)
        force_authenticate(request, user=self.user)

        # Act
        response = view(request)

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.first_song_entry.song.pk)

    @patch("api.views.song.TabFetcher.search_for_best_tab")
    def test_searching_for_new_unfindable_song_throws_404(self, mock_search):
        # Arrange
        mock_search.return_value = None
        api_factory = APIRequestFactory()
        view = SongViewSet.as_view({"get": "search"})
        query_params = {
            "q": "some really really long string that definitely won't match a song in the database"
        }
        request = api_factory.get(reverse("song-search"), data=query_params)
        force_authenticate(request, user=self.user)

        # Act
        response = view(request)

        # Assert
        mock_search.assert_called_once()
        self.assertEqual(response.status_code, 404)

    @patch("api.views.song.TabFetcher.search_for_best_tab")
    def test_searching_for_new_findable_song_adds_song_to_db(self, mock_search):
        # Arrange
        new_song = SongFactory.build()
        mock_search.return_value = SongSerializer(new_song).data
        api_factory = APIRequestFactory()
        view = SongViewSet.as_view({"get": "search"})
        query_params = {
            "q": "some really really long string that definitely won't match a song in the database"
        }
        request = api_factory.get(reverse("song-search"), data=query_params)
        force_authenticate(request, user=self.user)

        # Act
        # Double check we didn't accidentally add the song while testing
        with self.assertRaises(Song.DoesNotExist):
            Song.objects.get(content=new_song.content)
        response = view(request)

        # Assert
        mock_search.assert_called_once()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["content"], new_song.content)
        Song.objects.get(content=new_song.content)
