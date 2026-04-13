import { Flex } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { UseAsyncReturn, useAsync } from "react-async-hook";
import {
  ApplicationState,
  DEFAULT_FONT_SCALE,
  MAX_FONT_ONE_COLUMN,
  SongCatalogEntry,
  User,
} from "../models";
import NavBar from "./NavBar";
import TabContainer from "./TabContainer";

import { AxiosResponse } from "axios";
import { useParams } from "react-router-dom";
import { useInterval } from "usehooks-ts";
import SongbookContext from "../contexts/SongbookContext";
import { getCurrentSong, setSongbookSong } from "../services/songs";
import Snowfall from "react-snowfall";

const SONGBOOK_POLL_INTERVAL = 2 * 1000;
const PREVIEW_DEBOUNCE_MS = 200;

interface CurrentSongViewProps {
  asyncUser: UseAsyncReturn<false | AxiosResponse<User, any>, never[]>;
}

function CurrentSongView({ asyncUser }: CurrentSongViewProps) {
  const user = asyncUser.result && asyncUser.result.data;
  const [applicationState, setApplicationState] = useState(
    ApplicationState.ShowSong
  );
  const [fontScale, setFontScale] = useState(DEFAULT_FONT_SCALE);
  const [firstColDispIndex, setFirstColDispIndex] = useState(0);
  const columnsOnScreenUserSetting = user
    ? user.userprofile.columns_to_display
    : 1;
  const columnsOnScreen =
    fontScale > MAX_FONT_ONE_COLUMN ? 1 : columnsOnScreenUserSetting;

  // null = showing server's current song; number = 1-based preview position
  const [previewPosition, setPreviewPosition] = useState<number | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Latest known 1-based song index from the server or a completed commit — used when preview is null so rapid navigatePreview calls do not use stale songbook.current_song_position. */
  const liveSongPositionRef = useRef(1);
  /** After PATCH + execute, we wait until songbook.current_song_position matches before clearing preview (avoids flash of stale song data). */
  const committedPositionRef = useRef<number | null>(null);

  const advanceToNextAppState = () => {
    switch (applicationState) {
      case ApplicationState.ShowSong:
        setApplicationState(ApplicationState.ActionPrompt);
        break;
      case ApplicationState.ActionPrompt:
        setFirstColDispIndex(0);
        setApplicationState(ApplicationState.PrepForSong);
        break;
      case ApplicationState.PrepForSong:
        setApplicationState(ApplicationState.ShowSong);
        break;
    }
  };

  const { sessionKey } = useParams();

  const asyncSongbook = useAsync(async () => getCurrentSong(sessionKey), [], {
    setLoading: (state) => ({ ...state, loading: true }),
  });

  const resetAppState = () => {
    setFirstColDispIndex(0);
    if (asyncSongbook?.result?.data?.is_noodle_mode) {
      setApplicationState(ApplicationState.ShowSong);
    } else {
      setApplicationState(ApplicationState.PrepForSong);
    }
  };

  const songbook = asyncSongbook?.result?.data;
  const catalog = songbook?.song_catalog ?? [];

  const effectivePosition = previewPosition ?? songbook?.current_song_position ?? 0;
  const isPreviewing = previewPosition !== null;

  const previewCatalogEntry: SongCatalogEntry | undefined =
    isPreviewing && catalog.length > 0
      ? catalog[previewPosition - 1]
      : undefined;

  const commitPreview = useCallback(
    async (position: number) => {
      const entry = catalog[position - 1];
      if (!entry || !sessionKey) return;
      setIsCommitting(true);
      try {
        await setSongbookSong(sessionKey, entry.created_at);
        await asyncSongbook.execute();
        liveSongPositionRef.current = position;
        committedPositionRef.current = position;
      } catch {
        committedPositionRef.current = null;
        setIsCommitting(false);
      }
    },
    [catalog, sessionKey, asyncSongbook]
  );

  const navigatePreview = useCallback(
    (delta: number) => {
      const totalSongs = songbook?.total_songs ?? 0;
      if (totalSongs === 0) return;

      setPreviewPosition((prev) => {
        const current = prev ?? liveSongPositionRef.current;
        return Math.max(1, Math.min(totalSongs, current + delta));
      });
    },
    [songbook?.total_songs]
  );

  // Clear preview/committing only once server songbook reflects the committed position (avoids stale asyncSongbook.result flash).
  useEffect(() => {
    const committed = committedPositionRef.current;
    if (committed === null) return;
    const serverPos = songbook?.current_song_position;
    if (serverPos === committed) {
      committedPositionRef.current = null;
      setPreviewPosition(null);
      setIsCommitting(false);
      setFirstColDispIndex(0);
    }
  }, [songbook?.current_song_position, asyncSongbook.result]);

  // Debounce: commit preview after PREVIEW_DEBOUNCE_MS of inactivity
  useEffect(() => {
    if (previewPosition === null || isCommitting) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      commitPreview(previewPosition);
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [previewPosition, isCommitting, commitPreview]);

  const currentSongEntryId = songbook?.current_song_entry?.id;
  useEffect(() => {
    setFirstColDispIndex(0);
  }, [currentSongEntryId]);

  useEffect(() => {
    if (previewPosition !== null) return;
    const pos = songbook?.current_song_position;
    if (pos != null && pos >= 1) {
      liveSongPositionRef.current = pos;
    }
  }, [songbook?.current_song_position, previewPosition]);

  useInterval(() => {
    if (!asyncSongbook.loading && !isPreviewing && !isCommitting) {
      asyncSongbook.execute();
    }
  }, SONGBOOK_POLL_INTERVAL);

  return (
    <>
      {asyncSongbook?.result?.data?.theme?.toLowerCase() === "christmas" && (
        <Snowfall
          style={{
            position: "fixed",
            width: "100vw",
            height: "100vh",
            opacity: ".3",
          }}
          radius={[0.5, 1.5]}
          speed={[0.5, 1.5]}
        />
      )}
      <SongbookContext.Provider value={asyncSongbook?.result?.data}>
        <Flex padding="1rem" paddingTop=".5rem" flexDir="column" height="100%">
          <NavBar
            asyncSongbook={asyncSongbook}
            advanceToNextAppState={advanceToNextAppState}
            resetAppState={resetAppState}
            applicationState={applicationState}
            firstColDispIndex={firstColDispIndex}
            setFirstColDispIndex={setFirstColDispIndex}
            columnsToDisplay={columnsOnScreen}
            asyncUser={asyncUser}
            setFontScale={setFontScale}
            fontScale={fontScale}
            navigatePreview={navigatePreview}
            isPreviewing={isPreviewing}
            previewCatalogEntry={previewCatalogEntry}
            effectivePosition={effectivePosition}
          />
          {asyncSongbook?.result?.data.total_songs !== 0 && (
            <TabContainer
              asyncSongbook={asyncSongbook}
              asyncUser={asyncUser}
              applicationState={applicationState}
              firstColDispIndex={firstColDispIndex}
              columnsOnScreen={columnsOnScreen}
              fontScale={fontScale}
              isPreviewing={isPreviewing || isCommitting}
            />
          )}
        </Flex>
      </SongbookContext.Provider>
    </>
  );
}

export default CurrentSongView;
