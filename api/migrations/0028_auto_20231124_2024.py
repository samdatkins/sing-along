# Generated by Django 3.2.20 on 2023-11-24 20:24

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0027_remove_song_likes'),
    ]

    operations = [
        migrations.CreateModel(
            name='Like',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('song_entry', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='song_entry_likes', related_query_name='like', to='api.songentry')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='song_entry_likes', related_query_name='like', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='songentry',
            name='likes',
            field=models.ManyToManyField(blank=True, related_name='song_entries', through='api.Like', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddConstraint(
            model_name='like',
            constraint=models.UniqueConstraint(fields=('user', 'song_entry'), name='unique song_entry like'),
        ),
    ]
