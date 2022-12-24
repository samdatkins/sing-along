export type Song = {
  artist: string;
  content: string;
  url: string;
  title: string;
  id: number;
};

export type SongEntry = {
  id: number;
  created_at: string;
  updated_at: string;
  play_time: string;
  song: Song;
};

export type Songbook = {
  id: number; // we should remove this from the API and only use session_key eventually
  session_key: string;
  max_active_songs: number;
  title: string;
  is_noodle_mode: boolean;
  total_songs: number;
  current_song_position: number;
  current_song_entry: SongEntry;
};

export enum ApplicationState {
  ShowSong,
  ActionPrompt,
  PrepForNextSong,
}

export const AppStateToTimerMap = {
  [ApplicationState.ShowSong]: 60,
  [ApplicationState.ActionPrompt]: 7,
  [ApplicationState.PrepForNextSong]: 8,
};

export type DjangoPaginatedResponse<T> = {
  count: number;
  next: string;
  previous: string;
  results: T[];
};

export type ChakraAlertStatus =
  | "info"
  | "warning"
  | "error"
  | "success"
  | "loading"
  | undefined;
