import spotipy
from rest_framework import serializers
from spotipy.oauth2 import SpotifyClientCredentials

from api.models import Song


class SongSerializer(serializers.ModelSerializer):
    spotify_ID = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = "__all__"

    def get_spotify_ID(self, obj):
        if obj.spotify_ID:
            return obj.spotify_ID

        try:
            auth_manager = SpotifyClientCredentials()
            spotify = spotipy.Spotify(auth_manager=auth_manager)
            results = spotify.search(
                q=f"{obj.title} artist:{obj.artist}",
                type="track",
                market="US",
            )
            if (
                results["tracks"]["total"] > 0
                and results["tracks"]["items"][0]["is_playable"]
            ):
                obj.spotify_ID = results["tracks"]["items"][0]["id"]
                obj.save()
                return obj.spotify_ID

        except Exception:
            pass

        return None
