import { Flex } from "@chakra-ui/react";
import { useState } from "react";
import { UseAsyncReturn, useAsync } from "react-async-hook";
import {
  ApplicationState,
  DEFAULT_FONT_SCALE,
  MAX_FONT_ONE_COLUMN,
  User,
} from "../models";
import NavBar from "./NavBar";
import TabContainer from "./TabContainer";

import { AxiosResponse } from "axios";
import { useParams } from "react-router-dom";
import { useInterval } from "usehooks-ts";
import SongbookContext from "../contexts/SongbookContext";
import { getCurrentSong } from "../services/songs";
import Snowfall from "react-snowfall";

const SONGBOOK_POLL_INTERVAL = 2 * 1000;

interface CurrentSongViewProps {
  asyncUser: UseAsyncReturn<false | AxiosResponse<User, any>, never[]>;
}

function CurrentSongView({ asyncUser }: CurrentSongViewProps) {
  const user = asyncUser.result && asyncUser.result.data;
  // state for showing ActionPrompt component instead of lyrics
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

  useInterval(() => {
    if (!asyncSongbook.loading) {
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
          />
          {asyncSongbook?.result?.data.total_songs !== 0 && (
            <TabContainer
              asyncSongbook={asyncSongbook}
              asyncUser={asyncUser}
              applicationState={applicationState}
              firstColDispIndex={firstColDispIndex}
              columnsOnScreen={columnsOnScreen}
              fontScale={fontScale}
            />
          )}
        </Flex>
      </SongbookContext.Provider>
    </>
  );
}

export default CurrentSongView;
