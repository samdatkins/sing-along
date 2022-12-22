export type Song = {
  artist: string;
  content: string;
  url: string;
  title: string;
};

export type SongEntry = {
  id: number;
  created_at: string;
  updated_at: string;
  play_time: string;
  song: Song;
};

export type Songbook = {
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
  [ApplicationState.ShowSong]: 10,
  [ApplicationState.ActionPrompt]: 7,
  [ApplicationState.PrepForNextSong]: 8,
};
