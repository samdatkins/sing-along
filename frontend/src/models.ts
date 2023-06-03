export type Song = {
  artist: string;
  content: string;
  url: string;
  title: string;
  id: number;
  capo: number;
};

export type SongEntry = {
  id: number;
  created_at: string;
  updated_at: string;
  play_time: string;
  song: Song;
  is_flagged: boolean;
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

export type SongbookDetails = {
  id: number; // we should remove this from the API and only use session_key eventually
  session_key: string;
  max_active_songs: number;
  title: string;
  is_noodle_mode: boolean;
  song_entries: SongEntry[];
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

export type UserProfile = {
  is_showing_chords: boolean;
  columns_to_display: number;
  is_day_mode: boolean;
};

export type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  social: {
    picture: string;
  };
  last_login: string;
  date_joined: string;
  userprofile: UserProfile;
};

export type ChakraAlertStatus =
  | "info"
  | "warning"
  | "error"
  | "success"
  | "loading"
  | undefined;

export const LINES_PER_COLUMN = 40;
