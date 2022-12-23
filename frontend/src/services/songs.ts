import axios, { AxiosError } from "axios";
import { Song, Songbook, SongEntry } from "../models";

export async function getCurrentSong(sessionKey: string | undefined) {
  return await axios.get<Songbook>(`/api/songbooks/${sessionKey}/`);
}

export async function nextSongbookSong(sessionKey: string | undefined) {
  if (!sessionKey) return;

  try {
    await axios.patch<Songbook>(`/api/songbooks/${sessionKey}/next-song/`);
    return true;
  } catch (error) {
    console.error(`Couldn't get next song: ${error}`);
    return false;
  }
}

export async function prevSongbookSong(sessionKey: string | undefined) {
  if (!sessionKey) return;
  try {
    await axios.patch<Songbook>(`/api/songbooks/${sessionKey}/previous-song/`);
    return true;
  } catch (error) {
    console.error(`Couldn't get previous song: ${error}`);
    return false;
  }
}

export async function deleteSongbookSong(songEntryId: number | undefined) {
  if (!songEntryId) return;

  try {
    await axios.delete(`/api/song_entries/${songEntryId}/`);
    return true;
  } catch (error) {
    console.error(`Couldn't delete song: ${error}`);
    return false;
  }
}

export async function searchForSong(q: string) {
  if (q.length < 1) return;

  try {
    const result = await axios.get<Song>(`/api/songs/search/`, {
      params: { q },
    });
    return result;
  } catch (error: any | AxiosError) {
    if (axios.isAxiosError(error)) {
      if (error?.response?.status === 404) {
        return "Could not find song, please try a different search.";
      }
    }
  }
  return "Could not add song, please try again later.";
}

export async function addSongToSongbook(
  song?: Song | undefined,
  songbookId?: number
) {
  try {
    return await axios.post<SongEntry>(`/api/song_entries/`, {
      song_id: song?.id,
      songbook_id: songbookId,
    });
  } catch (error: any | AxiosError) {
    if (axios.isAxiosError(error)) {
      if (error?.response?.status === 409) {
        return `"${song?.title}" by ${song?.artist} has already been requested.`;
      }
    }
  }

  return "Could not add song, please try again later.";
}
