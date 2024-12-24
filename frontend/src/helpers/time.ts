import { SongbookDetails, SongbookListItem } from "../models";

export function isSongbookActive(
  songbook: SongbookListItem | SongbookDetails | undefined
): boolean {
  if (!songbook) return false;

  const currentTime = new Date(Date.now()).getTime();
  const songbookCreatedTime = new Date(songbook.created_at).getTime();

  return (currentTime - songbookCreatedTime) / (1000 * 60 * 60) < 8;
}
