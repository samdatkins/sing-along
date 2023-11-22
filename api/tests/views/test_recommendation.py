import factory.random
from django.urls import reverse
from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate

from api.models import Membership, SongEntry, WishlistSong
from api.tests.factories.song_entry import SongEntryFactory
from api.tests.factories.songbook import SongbookFactory
from api.tests.factories.user import UserFactory
from api.tests.helpers import get_datetime_x_seconds_ago
from api.views.song_entry import SongEntryViewSet


class TestRecommendation(APITestCase):
    def setUp(self):
        factory.random.reseed_random("lol so random")
        self.user = UserFactory.create()
        self.first_song_entry = SongEntryFactory.create()
        self.first_song_entry.created_at = get_datetime_x_seconds_ago(5)
        self.first_song_entry.save()

        self.unthemed_songbook = self.first_song_entry.songbook

        self.unthemed_songbook.current_song_timestamp = get_datetime_x_seconds_ago(60)
        self.unthemed_songbook.save()

        self.unthemed_songbook_2 = SongbookFactory()

        self.unthemed_songbook_2.current_song_timestamp = get_datetime_x_seconds_ago(60)
        self.unthemed_songbook_2.save()

        self.client.force_authenticate(user=self.user)

        Membership.objects.create(
            user=self.user,
            songbook=self.unthemed_songbook,
            type=Membership.MemberType.PARTICIPANT.value,
        )
        Membership.objects.create(
            user=self.user,
            songbook=self.unthemed_songbook_2,
            type=Membership.MemberType.PARTICIPANT.value,
        )

    def test_authed_requests_succeed(self):
        # Arrange

        # Act
        response = self.client.get(
            reverse(
                "recommendations-detail",
                kwargs={"pk": self.unthemed_songbook_2.session_key},
            ),
        )

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], self.first_song_entry.song.title)
        self.assertEqual(response.data[0]["artist"], self.first_song_entry.song.artist)

    def test_unauthed_requests_fail(self):
        # Arrange
        self.client.force_authenticate(user=None)

        # Act
        response = self.client.get(
            reverse(
                "recommendations-detail",
                kwargs={"pk": self.unthemed_songbook_2.session_key},
            ),
        )

        # Assert
        self.assertEqual(response.status_code, 403)

    def test_dont_recommend_used_songs(self):
        # Arrange
        song = self.first_song_entry.song
        SongEntry.objects.create(song=song, songbook=self.unthemed_songbook_2)

        # Act
        response = self.client.get(
            reverse(
                "recommendations-detail",
                kwargs={"pk": self.unthemed_songbook_2.session_key},
            ),
        )

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_wishlist_songs_included(self):
        # Arrange
        WishlistSong.objects.create(user=self.user, title="Wish", artist="Boy")

        # Act
        response = self.client.get(
            reverse(
                "recommendations-detail",
                kwargs={"pk": self.unthemed_songbook_2.session_key},
            ),
        )

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]["title"], "Wish")
        self.assertEqual(response.data[0]["artist"], "Boy")


# liked songs (10% of time - mock the return of the get six recommendations method (or mock the random library by passing it a list of values to return in order))
# duplicates among wishes, likes, recs

# don't get a recommendation of a different songbook theme
