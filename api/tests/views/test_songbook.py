import factory.random
from django.urls import reverse
from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate

from api.models import Membership, Songbook
from api.tests.factories.song_entry import SongEntryFactory
from api.tests.factories.songbook import SongbookFactory
from api.tests.factories.user import UserFactory
from api.tests.helpers import get_datetime_x_seconds_ago
from api.views.songbook import SongbookViewSet


class TestSongbookView(APITestCase):
    def setUp(self):
        factory.random.reseed_random("lol so random")
        self.user = UserFactory.create()
        self.empty_songbook = SongbookFactory.create()
        Membership.objects.create(
            user=self.user,
            songbook=self.empty_songbook,
            type=Membership.MemberType.OWNER.value,
        )

        self.first_song_entry = SongEntryFactory.create(requested_by=self.user)
        self.first_song_entry.created_at = get_datetime_x_seconds_ago(5)
        self.first_song_entry.save()

        self.nonempty_songbook = self.first_song_entry.songbook
        self.nonempty_songbook.current_song_timestamp = get_datetime_x_seconds_ago(60)
        self.nonempty_songbook.save()
        Membership.objects.create(
            user=self.user,
            songbook=self.nonempty_songbook,
            type=Membership.MemberType.OWNER.value,
        )

        self.not_my_songbook = SongbookFactory.create(session_key="nome")

        self.participant_songbook = SongbookFactory.create(session_key="part")
        Membership.objects.create(
            user=self.user,
            songbook=self.participant_songbook,
            type=Membership.MemberType.PARTICIPANT.value,
        )

        self.second_song_entry = SongEntryFactory.create(
            songbook=self.nonempty_songbook, requested_by=self.user
        )
        self.second_song_entry.created_at = get_datetime_x_seconds_ago(3)
        self.second_song_entry.save()

        self.third_song_entry = SongEntryFactory.create(
            songbook=self.nonempty_songbook, requested_by=self.user
        )
        self.third_song_entry.created_at = get_datetime_x_seconds_ago(1)
        self.third_song_entry.save()

        self.user2 = UserFactory.create()
        self.user3 = UserFactory.create()
        self.user4 = UserFactory.create()
        self.multi_user_songbook = SongbookFactory.create(session_key="mult")
        Membership.objects.create(
            user=self.user,
            songbook=self.multi_user_songbook,
            type=Membership.MemberType.OWNER.value,
        )
        Membership.objects.create(
            user=self.user2,
            songbook=self.multi_user_songbook,
            type=Membership.MemberType.PARTICIPANT.value,
        )
        Membership.objects.create(
            user=self.user3,
            songbook=self.multi_user_songbook,
            type=Membership.MemberType.PARTICIPANT.value,
        )
        Membership.objects.create(
            user=self.user4,
            songbook=self.multi_user_songbook,
            type=Membership.MemberType.PARTICIPANT.value,
        )
        SongEntryFactory.create(
            songbook=self.multi_user_songbook, requested_by=self.user
        )
        SongEntryFactory.create(
            songbook=self.multi_user_songbook, requested_by=self.user
        )
        SongEntryFactory.create(
            songbook=self.multi_user_songbook, requested_by=self.user
        )
        SongEntryFactory.create(
            songbook=self.multi_user_songbook, requested_by=self.user
        )
        SongEntryFactory.create(
            songbook=self.multi_user_songbook, requested_by=self.user2
        )
        SongEntryFactory.create(
            songbook=self.multi_user_songbook, requested_by=self.user3
        )
        SongEntryFactory.create(
            songbook=self.multi_user_songbook, requested_by=self.user4
        )

    def test_authed_requests_succeed(self):
        # Arrange
        self.client.force_authenticate(user=self.user)

        # Act
        with self.assertNumQueries(6):
            response = self.client.get(reverse("songbook-list"))

        # Assert
        self.assertEqual(response.status_code, 200)

    def test_list_has_correct_counts(self):
        # Arrange
        self.client.force_authenticate(user=self.user)

        # Act
        with self.assertNumQueries(6):
            response = self.client.get(reverse("songbook-list"))

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 4)
        self.assertEqual(response.data["results"][0]["total_songs"], 7)
        self.assertEqual(response.data["results"][1]["total_songs"], 0)
        self.assertEqual(response.data["results"][2]["total_songs"], 3)
        self.assertEqual(response.data["results"][3]["total_songs"], 0)

    def test_list_has_correct_ownership_bool(self):
        # Arrange
        self.client.force_authenticate(user=self.user)

        # Act
        response = self.client.get(reverse("songbook-list"))

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 4)
        self.assertEqual(response.data["results"][0]["is_songbook_owner"], True)
        self.assertEqual(response.data["results"][1]["is_songbook_owner"], False)
        self.assertEqual(response.data["results"][2]["is_songbook_owner"], True)
        self.assertEqual(response.data["results"][3]["is_songbook_owner"], True)

    def test_list_has_correct_member_list_as_owner(self):
        # Arrange
        self.client.force_authenticate(user=self.user)

        # Act
        response = self.client.get(reverse("songbook-list"))

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 4)

        self.assertEqual(
            len(response.data["results"][0]["membership_set"]),
            self.multi_user_songbook.membership_set.count(),
        )

    def test_list_has_correct_member_list_as_participant(self):
        # Arrange
        self.client.force_authenticate(user=self.user2)

        # Act
        response = self.client.get(reverse("songbook-list"))

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 1)

        self.assertEqual(
            len(response.data["results"][0]["membership_set"]),
            1,
        )
        self.assertEqual(
            response.data["results"][0]["membership_set"][0]["user"]["id"],
            self.user2.id,
        )

    def test_unauthed_requests_fail(self):
        # Arrange

        # Act
        response = self.client.get(reverse("songbook-list"))

        # Assert
        self.assertEqual(response.status_code, 403)

    def test_detail_has_correct_number_of_songs(self):
        # Arrange
        session_key = self.empty_songbook.session_key
        self.client.force_authenticate(user=self.user)

        # Act
        with self.assertNumQueries(7):
            response = self.client.get(
                reverse(
                    "songbook-detail",
                    kwargs={"session_key": session_key},
                )
            )

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["current_song_entry"], None)
        self.assertEqual(response.data["total_songs"], 0)

    def test_detail_with_nonempty_songbook(self):
        # Arrange
        session_key = self.nonempty_songbook.session_key
        self.client.force_authenticate(user=self.user)

        # Act
        with self.assertNumQueries(10):
            response = self.client.get(
                reverse(
                    "songbook-detail",
                    kwargs={"session_key": session_key},
                )
            )

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
        self.client.force_authenticate(user=self.user)

        # Act
        response = self.client.patch(
            reverse(
                "songbook-next-song",
                kwargs={"session_key": session_key},
            )
        )
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

        # Arrange
        session_key = self.nonempty_songbook.session_key
        self.client.force_authenticate(user=self.user)

        # Act
        response = self.client.patch(
            reverse(
                "songbook-previous-song",
                kwargs={"session_key": session_key},
            )
        )
        self.nonempty_songbook.refresh_from_db()

        # Assert
        self.assertEqual(
            self.nonempty_songbook.get_current_song_entry(), self.second_song_entry
        )
        self.assertEqual(response.status_code, 200)

    def test_next_song_failure_with_nonempty_songbook(self):
        # Arrange
        session_key = self.nonempty_songbook.session_key
        self.client.force_authenticate(user=self.user)

        # Act
        self.client.patch(
            reverse(
                "songbook-next-song",
                kwargs={"session_key": session_key},
            )
        )
        self.client.patch(
            reverse(
                "songbook-next-song",
                kwargs={"session_key": session_key},
            )
        )
        response = self.client.patch(
            reverse(
                "songbook-next-song",
                kwargs={"session_key": session_key},
            )
        )
        self.nonempty_songbook.refresh_from_db()

        # Assert
        self.assertEqual(
            self.nonempty_songbook.get_current_song_entry(), self.third_song_entry
        )
        self.assertEqual(response.status_code, 409)

    def test_previous_song_failure_with_nonempty_songbook(self):
        # Arrange
        session_key = self.nonempty_songbook.session_key
        self.client.force_authenticate(user=self.user)

        # Act
        response = self.client.patch(
            reverse(
                "songbook-previous-song",
                kwargs={"session_key": session_key},
            )
        )
        self.nonempty_songbook.refresh_from_db()

        # Assert
        self.assertEqual(
            self.nonempty_songbook.get_current_song_entry(), self.first_song_entry
        )
        self.assertEqual(response.status_code, 409)

    def test_next_song_failure_when_not_a_member_of_songbook(self):
        # Arrange
        session_key = self.not_my_songbook.session_key
        self.client.force_authenticate(user=self.user)

        # Act
        response = self.client.patch(
            reverse(
                "songbook-next-song",
                kwargs={"session_key": session_key},
            )
        )

        self.assertEqual(response.status_code, 404)

    def test_previous_song_failure_when_not_a_member_of_songbook(self):
        # Arrange
        session_key = self.not_my_songbook.session_key
        self.client.force_authenticate(user=self.user)

        # Act
        response = self.client.patch(
            reverse(
                "songbook-previous-song",
                kwargs={"session_key": session_key},
            )
        )

        self.assertEqual(response.status_code, 404)

    def test_next_song_failure_with_participant_songbook(self):
        # Arrange
        session_key = self.participant_songbook.session_key
        self.client.force_authenticate(user=self.user)

        # Act
        response = self.client.patch(
            reverse(
                "songbook-next-song",
                kwargs={"session_key": session_key},
            )
        )

        self.assertEqual(response.status_code, 403)

    def test_previous_song_failure_with_participant_songbook(self):
        # Arrange
        session_key = self.participant_songbook.session_key
        self.client.force_authenticate(user=self.user)

        # Act
        response = self.client.patch(
            reverse(
                "songbook-previous-song",
                kwargs={"session_key": session_key},
            )
        )

        self.assertEqual(response.status_code, 403)

    def test_songbook_details_as_owner(self):
        # Arrange
        session_key = self.nonempty_songbook.session_key
        self.client.force_authenticate(user=self.user)

        # Act
        with self.assertNumQueries(8):
            response = self.client.get(
                reverse(
                    "songbook-details",
                    kwargs={"session_key": session_key},
                ),
            )

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["song_entries"]), 3)

    def test_songbook_details_as_participant(self):
        # Arrange
        session_key = self.participant_songbook.session_key
        self.client.force_authenticate(user=self.user)

        # Act
        with self.assertNumQueries(3):
            response = self.client.get(
                reverse(
                    "songbook-details",
                    kwargs={"session_key": session_key},
                ),
            )

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["song_entries"]), 0)

    def test_songbook_retrieve_as_participant(self):
        # Arrange
        session_key = self.participant_songbook.session_key
        self.client.force_authenticate(user=self.user)

        # Act
        with self.assertNumQueries(7):
            response = self.client.get(
                reverse(
                    "songbook-detail",
                    kwargs={"session_key": session_key},
                ),
            )

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["is_songbook_owner"], False)

    def test_songbook_retrieve_as_owner(self):
        # Arrange
        session_key = self.nonempty_songbook.session_key
        self.client.force_authenticate(user=self.user)

        # Act
        with self.assertNumQueries(10):
            response = self.client.get(
                reverse(
                    "songbook-detail",
                    kwargs={"session_key": session_key},
                ),
            )

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["is_songbook_owner"], True)

    def test_songbook_create(self):
        # Arrange
        session_key = self.nonempty_songbook.session_key
        self.client.force_authenticate(user=self.user)

        # Act
        response = self.client.post(
            reverse(
                "songbook-list",
            ),
            data={"session_key": "NO", "title": "my title"},
        )

        # Assert
        self.assertEqual(response.status_code, 201)
        self.assertNotEqual(response.data["session_key"], "NO")
        membership = Songbook.objects.get(
            session_key=response.data["session_key"]
        ).membership_set.first()
        self.assertEqual(self.user.id, membership.user.id)
        self.assertEqual(Membership.MemberType.OWNER.value, membership.type)

    def test_retrieve_adds_membership(self):
        # Arrange
        session_key = self.not_my_songbook.session_key
        self.client.force_authenticate(user=self.user)

        # Act
        response = self.client.get(
            reverse(
                "songbook-detail",
                kwargs={"session_key": session_key},
            )
        )

        # Assert
        self.assertEqual(response.status_code, 200)
        membership = (
            Songbook.objects.get(session_key=response.data["session_key"])
            .membership_set.filter(user__id=self.user.id)
            .first()
        )
        self.assertEqual(Membership.MemberType.PARTICIPANT.value, membership.type)

    def test_stats_are_accurate(self):
        # Arrange
        session_key = self.multi_user_songbook.session_key
        self.client.force_authenticate(user=self.user)

        # Act
        with self.assertNumQueries(9):
            response = self.client.get(
                reverse(
                    "songbook-stats",
                    kwargs={"session_key": session_key},
                )
            )

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 4)
        self.assertEqual(
            [
                response["songs_requested"]
                for response in response.data
                if response["user"]["id"] == self.user.id
            ][0],
            4,
        )

    def test_user_list_for_owner(self):
        # Arrange
        session_key = self.multi_user_songbook.session_key
        self.client.force_authenticate(user=self.user)

        # Act
        response = self.client.get(
            reverse(
                "songbook-detail",
                kwargs={"session_key": session_key},
            )
        )

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["membership_set"]), 4)

    def test_user_list_for_nonowner(self):
        # Arrange
        session_key = self.multi_user_songbook.session_key
        self.client.force_authenticate(user=self.user2)

        # Act
        response = self.client.get(
            reverse(
                "songbook-detail",
                kwargs={"session_key": session_key},
            )
        )

        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["membership_set"]), 1)
