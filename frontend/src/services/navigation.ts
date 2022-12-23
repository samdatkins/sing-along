import axios, { AxiosResponse } from "axios";
import { UseAsyncReturn } from "react-async-hook";
import { Songbook } from "../models";

export async function nextSongbookSong(
  asyncSongbook: UseAsyncReturn<AxiosResponse<Songbook, any>, never[]>
) {
  const sessionKey = asyncSongbook?.result?.data?.session_key;
  if (!sessionKey) return;
  const result = await axios.patch<Songbook>(
    `/api/songbooks/${sessionKey}/next-song/`
  );
  if (result.status !== 200) {
    console.error("Couldn't get next song");
  } else {
    asyncSongbook.execute();
  }
}

export async function prevSongbookSong(
  asyncSongbook: UseAsyncReturn<AxiosResponse<Songbook, any>, never[]>
) {
  const sessionKey = asyncSongbook?.result?.data?.session_key;
  if (!sessionKey) return;
  const result = await axios.patch<Songbook>(
    `/api/songbooks/${sessionKey}/previous-song/`
  );
  if (result.status !== 200) {
    console.error("Couldn't get previous song");
  } else {
    asyncSongbook.execute();
  }
}

export async function deleteSongbookSong(
  asyncSongbook: UseAsyncReturn<AxiosResponse<Songbook, any>, never[]>
) {
  const songEntryId = asyncSongbook?.result?.data?.current_song_entry?.id;
  if (!songEntryId) return;
  const result = await axios.delete(`/api/song_entries/${songEntryId}/`);
  if (result.status !== 204) {
    console.error(`Couldn't delete song ${songEntryId}`);
  } else {
    asyncSongbook.execute();
  }
}
