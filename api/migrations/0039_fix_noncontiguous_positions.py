"""Renumber song entry positions to be contiguous (1..N) for every songbook.

Migration 0037 assigned positions using `apps.get_model()` which bypasses
SafeDeleteModel's manager and included soft-deleted entries in the numbering.
At runtime the soft-deleted entries are hidden, leaving gaps (e.g. [1, 3, 5])
that break frontend navigation which assumes contiguous positions.
"""

from django.db import migrations


def fix_positions(apps, schema_editor):
    Songbook = apps.get_model("api", "Songbook")
    SongEntry = apps.get_model("api", "SongEntry")

    for songbook in Songbook.objects.filter(deleted__isnull=True):
        entries = list(
            SongEntry.objects.filter(
                songbook=songbook, deleted__isnull=True
            ).order_by("position")
        )

        to_update = []
        for idx, entry in enumerate(entries, start=1):
            if entry.position != idx:
                entry.position = idx
                to_update.append(entry)

        if to_update:
            SongEntry.objects.bulk_update(to_update, ["position"])


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0038_drop_timestamp_fields_finalize_positions"),
    ]

    operations = [
        migrations.RunPython(fix_positions, migrations.RunPython.noop),
    ]
