import factory.random
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIRequestFactory, force_authenticate

from api.tests.factories.song_entry import SongEntryFactory
from api.tests.factories.songbook import SongbookFactory
from api.tests.factories.user import UserFactory
from api.tests.helpers import get_datetime_x_seconds_ago
from api.views.songbook import SongbookViewSet


class TestSongbookView(TestCase):
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
        view = SongbookViewSet.as_view({"get": "list"})
        request = api_factory.get(reverse("songbook-list"))
        force_authenticate(request, user=self.user)

        # Act
        # Should run one query for pagniation purposes, then one more query
        # to actually pull the songbooks
        with self.assertNumQueries(2):
            response = view(request)

        # Assert
        self.assertEqual(response.status_code, 200)

    # Until we re-enabled auth, this should pass
    def test_unauthed_requests_fail(self):
        # Arrange
        api_factory = APIRequestFactory()
        view = SongbookViewSet.as_view({"get": "list"})
        request = api_factory.get(reverse("songbook-list"))

        # Act
        response = view(request)

        # Assert
        self.assertEqual(response.status_code, 200)

    def test_detail_has_correct_number_of_songs(self):
        # Arrange
        session_key = self.empty_songbook.session_key
        api_factory = APIRequestFactory()
        view = SongbookViewSet.as_view({"get": "retrieve"})
        request = api_factory.get(
            reverse(
                "songbook-detail",
                kwargs={"session_key": session_key},
            ),
        )
        force_authenticate(request, user=self.user)

        # Act
        with self.assertNumQueries(2):
            response = view(request, session_key=session_key)

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["current_song_entry"], None)
        self.assertEqual(response.data["total_songs"], 0)

    def test_detail_with_nonempty_songbook(self):
        # Arrange
        session_key = self.nonempty_songbook.session_key
        api_factory = APIRequestFactory()
        view = SongbookViewSet.as_view({"get": "retrieve"})
        request = api_factory.get(
            reverse(
                "songbook-detail",
                kwargs={"session_key": session_key},
            ),
        )
        force_authenticate(request, user=self.user)

        # Act
        with self.assertNumQueries(3):
            response = view(request, session_key=session_key)

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["current_song_entry"]["song"]["title"],
            self.nonempty_songbook.get_current_song_entry().song.title,
        )
        self.assertEqual(
            response.data["total_songs"], self.nonempty_songbook.get_total_song_count()
        )
        self.assertEqual(
            response.data["current_song_position"],
            self.nonempty_songbook.get_current_song_position(),
        )

    def test_next_song_success_with_nonempty_songbook(self):
        # Arrange
        session_key = self.nonempty_songbook.session_key
        api_factory = APIRequestFactory()
        view = SongbookViewSet.as_view({"patch": "next_song"})
        request = api_factory.patch(
            reverse(
                "songbook-next-song",
                kwargs={"session_key": session_key},
            ),
        )
        force_authenticate(request, user=self.user)

        # Act
        response = view(request, session_key=session_key)
        self.nonempty_songbook.refresh_from_db()

        # Assert
        self.assertEqual(
            self.nonempty_songbook.get_current_song_entry(), self.second_song_entry
        )
        self.assertEqual(response.status_code, 200)

    def test_previous_song_success_with_nonempty_songbook(self):
        # Arrange
        self.nonempty_songbook.current_song_timestamp = self.third_song_entry.created_at
        self.nonempty_songbook.save()
        self.assertEqual(
            self.nonempty_songbook.get_current_song_entry(), self.third_song_entry
        )

        session_key = self.nonempty_songbook.session_key
        api_factory = APIRequestFactory()
        view = SongbookViewSet.as_view({"patch": "previous_song"})
        request = api_factory.patch(
            reverse(
                "songbook-previous-song",
                kwargs={"session_key": session_key},
            ),
        )
        force_authenticate(request, user=self.user)

        # Act
        response = view(request, session_key=session_key)
        self.nonempty_songbook.refresh_from_db()

        # Assert
        self.assertEqual(
            self.nonempty_songbook.get_current_song_entry(), self.second_song_entry
        )
        self.assertEqual(response.status_code, 200)

    def test_next_song_failure_with_nonempty_songbook(self):
        # Arrange
        session_key = self.nonempty_songbook.session_key
        api_factory = APIRequestFactory()
        view = SongbookViewSet.as_view({"patch": "next_song"})
        request = api_factory.patch(
            reverse(
                "songbook-next-song",
                kwargs={"session_key": session_key},
            ),
        )
        force_authenticate(request, user=self.user)

        # Act
        view(request, session_key=session_key)
        view(request, session_key=session_key)
        response = view(request, session_key=session_key)
        self.nonempty_songbook.refresh_from_db()

        # Assert
        self.assertEqual(
            self.nonempty_songbook.get_current_song_entry(), self.third_song_entry
        )
        self.assertEqual(response.status_code, 409)

    def test_previous_song_failure_with_nonempty_songbook(self):
        # Arrange
        session_key = self.nonempty_songbook.session_key
        api_factory = APIRequestFactory()
        view = SongbookViewSet.as_view({"patch": "previous_song"})
        request = api_factory.patch(
            reverse(
                "songbook-previous-song",
                kwargs={"session_key": session_key},
            ),
        )
        force_authenticate(request, user=self.user)

        # Act
        response = view(request, session_key=session_key)
        self.nonempty_songbook.refresh_from_db()

        # Assert
        self.assertEqual(
            self.nonempty_songbook.get_current_song_entry(), self.first_song_entry
        )
        self.assertEqual(response.status_code, 409)

    def test_songbook_details(self):
        # Arrange
        session_key = self.nonempty_songbook.session_key
        api_factory = APIRequestFactory()
        view = SongbookViewSet.as_view({"get": "songbook_details"})
        request = api_factory.get(
            reverse(
                "songbook-details",
                kwargs={"session_key": session_key},
            ),
        )
        force_authenticate(request, user=self.user)

        # Act
        with self.assertNumQueries(3):
            response = view(request, session_key=session_key)

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["song_entries"]), 3)
