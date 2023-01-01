import json

from django.db.utils import IntegrityError

from api.models import Song, Songbook, SongEntry


def load_songs(tries=10):
    file = open("songs.tsv", "r")
    lines = file.readlines()

    for line in lines[0:tries]:
        split_line = line.replace("\\r", "\r").replace("\\n", "\n").split("\t")
        Song.objects.create(
            artist=split_line[1][0:40],
            title=split_line[2][0:40],
            url=split_line[3],
            content=split_line[4],
        )
    file.close()


def load_songbooks_and_entries(filename, tries=10):
    file = open(filename, "r")
    data = json.load(file)

    for song_entry in data[0:tries]:
        songbook, was_created = Songbook.objects.get_or_create(
            session_key=song_entry["session_key"],
            defaults={
                "created_at": song_entry["songbook_created_at"],
                "current_song_timestamp": song_entry["current_song_timestamp"],
                "max_active_songs": song_entry["max_active_songs"],
                "title": song_entry["songbook_title"][0:40],
                "last_nav_action_taken_at": song_entry["last_nav_action_taken_at"],
                "is_noodle_mode": song_entry["is_noodle_mode"] == True,
            },
        )

        if was_created:
            songbook.created_at = song_entry["songbook_created_at"]
            songbook.save()

        song = None
        try:
            song = Song.objects.get(url=song_entry["url"])
        except:
            print(f"Song {song_entry['url']} does not exist")
            continue

        try:
            SongEntry.objects.create(
                songbook=songbook,
                song=song,
                play_time=song_entry["play_time"],
                created_at=song_entry["song_entry_created_at"],
            )
        except IntegrityError:
            print(
                f"Couldn't add duplicate entry for {song_entry['url']}, {song_entry['songbook_title']}"
            )

    file.close()


# load_songbooks_and_entries("olddb.json")
