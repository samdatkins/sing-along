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
      await setSongbookSong(sessionKey, entry.created_at);
      await asyncSongbook.execute();
      setPreviewPosition(null);
      setIsCommitting(false);
      setFirstColDispIndex(0);
    },
    [catalog, sessionKey, asyncSongbook]
  );

  const navigatePreview = useCallback(
    (delta: number) => {
      const totalSongs = songbook?.total_songs ?? 0;
      if (totalSongs === 0) return;

      setPreviewPosition((prev) => {
        const current = prev ?? songbook?.current_song_position ?? 1;
        return Math.max(1, Math.min(totalSongs, current + delta));
      });
    },
    [songbook?.total_songs, songbook?.current_song_position]
  );

  // Debounce: commit preview after PREVIEW_DEBOUNCE_MS of inactivity
  useEffect(() => {
    if (previewPosition === null) return;

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
  }, [previewPosition, commitPreview]);

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
