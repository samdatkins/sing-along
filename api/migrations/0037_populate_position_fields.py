from django.db import migrations


def populate_positions(apps, schema_editor):
    Songbook = apps.get_model("api", "Songbook")
    SongEntry = apps.get_model("api", "SongEntry")
    SongbookUserPosition = apps.get_model("api", "SongbookUserPosition")

    for songbook in Songbook.objects.all():
        entries = list(
            SongEntry.objects.filter(songbook=songbook).order_by("created_at")
        )

        for idx, entry in enumerate(entries, start=1):
            entry.position = idx
        SongEntry.objects.bulk_update(entries, ["position"])

        if not entries:
            songbook.current_song_position = 1
            songbook.save(update_fields=["current_song_position"])
            continue

        # Find the entry matching current_song_timestamp using the same
        # logic as the old get_current_song_entry: smallest created_at
        # that is >= the timestamp, falling back to the last entry.
        ts = songbook.current_song_timestamp
        candidates = [e for e in entries if e.created_at >= ts]
        if candidates:
            current_entry = min(candidates, key=lambda e: e.created_at)
        else:
            current_entry = max(entries, key=lambda e: e.created_at)

        songbook.current_song_position = current_entry.position
        songbook.save(update_fields=["current_song_position"])

        # Do the same for each user position in this songbook.
        for user_pos in SongbookUserPosition.objects.filter(songbook=songbook):
            user_ts = user_pos.current_song_timestamp
            user_candidates = [e for e in entries if e.created_at >= user_ts]
            if user_candidates:
                user_entry = min(user_candidates, key=lambda e: e.created_at)
            else:
                user_entry = max(entries, key=lambda e: e.created_at)

            user_pos.current_song_position = user_entry.position
            user_pos.save(update_fields=["current_song_position"])


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0036_add_position_fields"),
    ]

    operations = [
        migrations.RunPython(populate_positions, migrations.RunPython.noop),
    ]
