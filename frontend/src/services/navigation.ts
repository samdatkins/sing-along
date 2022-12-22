import axios, { AxiosResponse } from "axios";
import { UseAsyncReturn } from "react-async-hook";
import { Songbook } from "../models";

export async function nextSongbookSong(
  sessionKey: string | undefined,
  asyncSongbook: UseAsyncReturn<AxiosResponse<Songbook, any>, never[]>
) {
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
  sessionKey: string | undefined,
  asyncSongbook: UseAsyncReturn<AxiosResponse<Songbook, any>, never[]>
) {
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
