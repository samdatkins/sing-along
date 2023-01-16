import json
import random
import time

from django.core.management.base import BaseCommand

from api.models import Song
from sing_along.utils.tabs import TabIndexer, TabType


def char_range(c1, c2):
    """Generates the characters from `c1` to `c2`, inclusive."""
    for c in range(ord(c1), ord(c2) + 1):
        yield chr(c)


class Command(BaseCommand):
    help = "Index all tabs"

    def add_arguments(self, parser):
        parser.add_argument(
            "--resume-at-artist",
            "-r",
            type=str,
            help="Resume beginning with the specified artist",
        )

    def does_band_page_match_resume_artist(self, resume_at_artist, band_page):
        first_char = resume_at_artist[0].lower()
        if first_char in char_range("a", "z"):
            return first_char == band_page
        else:
            # If the first character is not in A-Z, it must be a special char
            # which matches to the 0-9 page
            return "0-9" == band_page

    def _calculate_weighted_rating(self, result, max_votes):
        return (result["votes"] / max(max_votes, 1)) * result["rating"]

    def _choose_song(self, same_song_entries):
        max_votes = max(tab["votes"] for tab in same_song_entries)
        return max(
            same_song_entries,
            key=lambda tab: self._calculate_weighted_rating(tab, max_votes),
        )

    def _create_chosen_song(self, song):
        try:
            Song.objects.get(
                artist__iexact=song["artist"][0:40],
                title__iexact=song["title"][0:40],
            )
        except Song.DoesNotExist:
            # Only add if the song isn't already in the DB
            Song.objects.create(
                artist=song["artist"][0:40],
                title=song["title"][0:40],
                url=song["url"],
            )

    def _select_and_create_songs_for_artist(self, songs_for_artist):
        same_song_entries = []
        for song in songs_for_artist:
            if len(same_song_entries) == 0 or (
                same_song_entries[0]["artist"] == song["artist"]
                and same_song_entries[0]["title"] == song["title"]
            ):
                same_song_entries.append(song)
            else:
                if len(same_song_entries) > 1:
                    breakpoint()
                chosen_song = self._choose_song(same_song_entries)
                self._create_chosen_song(chosen_song)
                same_song_entries = [song]
        if len(same_song_entries) > 0:
            chosen_song = self._choose_song(same_song_entries)
            self._create_chosen_song(chosen_song)

    def handle(self, *args, **options):
        stop_skipping = False
        band_index_pages = [c for c in char_range("a", "z")]
        band_index_pages.insert(0, "0-9")
        tab_indexer = TabIndexer([TabType.CHORDS])

        for band_page in band_index_pages:
            if (
                not stop_skipping
                and options["resume_at_artist"] != None
                and not self.does_band_page_match_resume_artist(
                    options["resume_at_artist"], band_page
                )
            ):
                continue

            page_count = tab_indexer.get_count_for_band_series(band_page)
            for band_index in range(1, page_count + 1):
                band_results = tab_indexer.get_one_page_of_band_results(
                    band_page, band_index
                )
                if band_results == None:
                    self.stderr.write(
                        f"Couldn't find bands for {band_page}{band_index}"
                    )
                    continue
                for band in band_results:
                    if (
                        not stop_skipping
                        and options["resume_at_artist"] != None
                        and options["resume_at_artist"].lower() != band["name"].lower()
                    ):
                        continue
                    else:
                        stop_skipping = True

                    songs_for_artist = []
                    for song_index in range(1, 5000):
                        time.sleep(random.uniform(0, 2))
                        (
                            can_continue,
                            tab_results,
                        ) = tab_indexer.get_one_page_of_song_results(
                            band["artist_url"], song_index
                        )

                        if tab_results is not None:
                            songs_for_artist.extend(tab_results)
                            self.stdout.write(
                                json.dumps(tab_results, indent=4)
                                .replace("[", "")
                                .replace("]", "")
                                .rstrip()
                                + ","
                            )
                        else:
                            self.stderr.write(
                                f"No tabs available for {band['name']} - {song_index}"
                            )
                        self.stderr.write(
                            f"finished reading page {band['name']} - {song_index}"
                        )
                        if not can_continue:
                            break
                    self._select_and_create_songs_for_artist(songs_for_artist)
