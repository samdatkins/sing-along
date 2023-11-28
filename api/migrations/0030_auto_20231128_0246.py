# Generated by Django 3.2.20 on 2023-11-28 02:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0029_song_spotify_id'),
    ]

    operations = [
        migrations.RenameField(
            model_name='song',
            old_name='capo',
            new_name='transpose',
        ),
        migrations.AlterField(
            model_name='song',
            name='transpose',
            field=models.IntegerField(blank=True, db_column='capo', null=True),
        ),
    ]
