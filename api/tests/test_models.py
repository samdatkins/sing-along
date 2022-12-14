import factory.random
from django.test import TestCase

from api.models import Songbook
from api.tests.factories.song_entry import SongEntryFactory
from api.tests.factories.songbook import SongbookFactory
from api.tests.factories.user import UserFactory
from api.tests.helpers import get_datetime_x_seconds_ago


class TestSongbook(TestCase):
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

    # Test on empty songbooks (should be empty)
    def test_get_next_song_entry_on_empty_songbook(self):
        next_song = self.empty_songbook.get_next_song_entry()
        self.assertEqual(next_song, None)

    def test_get_previous_song_entry_on_empty_songbook(self):
        previous_song = self.empty_songbook.get_previous_song_entry()
        self.assertEqual(previous_song, None)

    def test_get_current_song_entry_on_empty_songbook(self):
        current_song = self.empty_songbook.get_current_song_entry()
        self.assertEqual(current_song, None)

    def test_get_current_song_position_on_empty_songbook(self):
        current_song_position = self.empty_songbook.get_current_song_position()
        self.assertEqual(current_song_position, 0)

    def test_get_total_song_count_on_empty_songbook(self):
        soung_count = self.empty_songbook.get_total_song_count()
        self.assertEqual(soung_count, 0)

    # Test happy path on non-empty songbooks
    def test_get_next_song_entry_on_nonempty_songbook(self):
        next_song = self.nonempty_songbook.get_next_song_entry()
        self.assertEqual(next_song, self.second_song_entry)

    def test_get_previous_song_entry_on_nonempty_songbook(self):
        self.nonempty_songbook.current_song_timestamp = self.third_song_entry.created_at
        previous_song = self.nonempty_songbook.get_previous_song_entry()
        self.assertEqual(previous_song, self.second_song_entry)

    def test_get_current_song_entry_on_nonempty_songbook(self):
        current_song = self.nonempty_songbook.get_current_song_entry()
        self.assertEqual(current_song, self.first_song_entry)

    def test_get_current_song_position_on_nonempty_songbook(self):
        current_song_position = self.nonempty_songbook.get_current_song_position()
        self.assertEqual(current_song_position, 1)
        self.nonempty_songbook.current_song_timestamp = (
            self.second_song_entry.created_at
        )
        current_song_position = self.nonempty_songbook.get_current_song_position()
        self.assertEqual(current_song_position, 2)

    def test_get_total_song_count_on_nonempty_songbook(self):
        soung_count = self.nonempty_songbook.get_total_song_count()
        self.assertEqual(soung_count, 3)

    # Test non-happy path nav
    def test_get_next_song_entry_at_end_on_nonempty_songbook(self):
        self.nonempty_songbook.current_song_timestamp = self.third_song_entry.created_at
        next_song = self.nonempty_songbook.get_next_song_entry()
        self.assertEqual(next_song, None)

    def test_get_previous_song_at_beginning_entry_on_nonempty_songbook(self):
        previous_song = self.nonempty_songbook.get_previous_song_entry()
        self.assertEqual(previous_song, None)

    # Test what happens when our index is past the end of the requested songs
    # (could happen if a bunch of songs get deleted)

    def test_get_next_song_entry_on_nonempty_songbook_past_end(self):
        self.nonempty_songbook.current_song_timestamp = get_datetime_x_seconds_ago(
            -6000000
        )
        next_song = self.nonempty_songbook.get_next_song_entry()
        self.assertEqual(next_song, None)

    def test_get_previous_song_entry_on_nonempty_songbook_when_past_end(self):
        self.nonempty_songbook.current_song_timestamp = get_datetime_x_seconds_ago(
            -6000000
        )
        previous_song = self.nonempty_songbook.get_previous_song_entry()
        self.assertEqual(previous_song, self.second_song_entry)

    def test_get_current_song_entry_when_past_end(self):
        self.nonempty_songbook.current_song_timestamp = get_datetime_x_seconds_ago(
            -6000000
        )
        current_song = self.nonempty_songbook.get_current_song_entry()
        self.assertEqual(current_song, self.third_song_entry)

    def test_get_current_song_position_when_past_end(self):
        self.nonempty_songbook.current_song_timestamp = get_datetime_x_seconds_ago(
            -6000000
        )
        current_song_position = self.nonempty_songbook.get_current_song_position()
        self.assertEqual(current_song_position, 3)

    def test_get_total_song_count_on_nonempty_songbook_when_past_end(self):
        self.nonempty_songbook.current_song_timestamp = get_datetime_x_seconds_ago(
            -6000000
        )
        soung_count = self.nonempty_songbook.get_total_song_count()
        self.assertEqual(soung_count, 3)
