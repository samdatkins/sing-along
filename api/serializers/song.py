import spotipy
from rest_framework import serializers
from spotipy.oauth2 import SpotifyClientCredentials

from api.models import Song, SongMemo


class SongMemoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SongMemo
        fields = [
            "id",
            "created_at",
            "updated_at",
            "text",
            "song",
            "user",
        ]
        extra_kwargs = {
            "user": {"read_only": True},
        }


class SongSerializer(serializers.ModelSerializer):
    spotify_ID = serializers.SerializerMethodField()
    song_entry_count = serializers.SerializerMethodField()
    song_memo = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = [
            "id",
            "spotify_ID",
            "deleted",
            "deleted_by_cascade",
            "created_at",
            "updated_at",
            "artist",
            "title",
            "url",
            "content",
            "rating",
            "votes",
            "transpose",
            "song_entry_count",
            "song_memo",
        ]

    def get_song_memo(self, obj):
        request = self.context.get("request")
        if request is None:
            return None

        memos = obj.song_memos.filter(user=request.user).first()
        return SongMemoSerializer(memos).data

    def get_song_entry_count(self, obj):
        try:
            return obj.song_entry_count
        except AttributeError:
            return None

    def get_spotify_ID(self, obj):
        if obj.spotify_ID:
            return obj.spotify_ID
        try:
            auth_manager = SpotifyClientCredentials()
            spotify = spotipy.Spotify(auth_manager=auth_manager)
            track_search = obj.title
            if "misc " not in obj.artist.lower() and "misc. " not in obj.artist.lower():
                track_search += f" artist:{obj.artist}"
            results = spotify.search(
                q=track_search,
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
