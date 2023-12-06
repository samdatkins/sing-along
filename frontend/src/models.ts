export type Song = {
  artist: string;
  content: string;
  url: string;
  title: string;
  id: number;
  transpose: number;
  spotify_ID: string;
  song_entry_count?: number;
};

export type SongEntry = {
  id: number;
  created_at: string;
  updated_at: string;
  play_time: string;
  song: Song;
  is_flagged: boolean;
  likes_count: number;
};

export type WishlistSong = {
  id: number;
  artist: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type Recommendation = {
  id: number | null;
  artist: string;
  title: string;
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
  current_song_timestamp: string;
  is_songbook_owner: boolean;
  is_current_song_liked: boolean;
  membership_set: Member[];
  theme: string;
  action_verb: string;
};

export type Member = {
  user: PublicUser;
};

export type SongbookDetails = {
  id: number; // we should remove this from the API and only use session_key eventually
  session_key: string;
  max_active_songs: number;
  title: string;
  is_noodle_mode: boolean;
  song_entries: SongEntry[];
};

export type SongbookListItem = {
  session_key: string;
  max_active_songs?: number;
  title: string;
  is_noodle_mode: boolean;
  current_song_timestamp: string;
  created_at: string;
  updated_at: string;
  total_songs: number;
  is_songbook_owner: boolean;
  membership_set: Member[];
};

export enum ApplicationState {
  ShowSong,
  ActionPrompt,
  PrepForSong,
}

export const AppStateToTimerMap = {
  [ApplicationState.ShowSong]: 60,
  [ApplicationState.ActionPrompt]: 7,
  [ApplicationState.PrepForSong]: 8,
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
  social_auth: {
    picture: string;
  }[];
  last_login: string;
  date_joined: string;
  userprofile: UserProfile;
};

export type SongbookStats = {
  user: PublicUser;
  songs_requested: number;
}[];

export type PublicUser = {
  id: number;
  first_name: string;
  last_initial: string;
  social_auth: {
    picture: string;
  }[];
};

export type ChakraAlertStatus =
  | "info"
  | "warning"
  | "error"
  | "success"
  | "loading"
  | undefined;

export const LINES_PER_COLUMN = 34;

export const MIN_FONT_SCALE = 12;
export const MAX_FONT_SCALE = 20;
export const FONT_SCALE_INCREMENT = 2;
export const MAX_FONT_ONE_COLUMN = 16;
export const DEFAULT_FONT_SCALE = 16;
