import { Flex } from "@chakra-ui/react";
import { useState } from "react";
import { useAsync } from "react-async-hook";
import { ApplicationState } from "../models";
import NavBar from "./NavBar";
import Tabs from "./Tabs";

import { useParams } from "react-router-dom";
import { getCurrentSong } from "../services/songs";
import { useInterval } from "usehooks-ts";
import SongbookContext from "../contexts/SongbookContext";

const SONGBOOK_POLL_INTERVAL = 1 * 1000;

function CurrentSongView() {
  // state for showing ActionPrompt component instead of lyrics
  const [applicationState, setApplicationState] = useState(
    ApplicationState.ShowSong
  );

  const advanceToNextAppState = () => {
    switch (applicationState) {
      case ApplicationState.ShowSong:
        setApplicationState(ApplicationState.ActionPrompt);
        break;
      case ApplicationState.ActionPrompt:
        setApplicationState(ApplicationState.PrepForNextSong);
        break;
      case ApplicationState.PrepForNextSong:
        setApplicationState(ApplicationState.ShowSong);
        break;
    }
  };

  const resetAppState = () => {
    setApplicationState(ApplicationState.ShowSong);
  };

  const { sessionKey } = useParams();

  const asyncSongbook = useAsync(async () => getCurrentSong(sessionKey), [], {
    setLoading: (state) => ({ ...state, loading: true }),
  });

  useInterval(() => {
    if (!asyncSongbook.loading) {
      asyncSongbook.execute();
    }
  }, SONGBOOK_POLL_INTERVAL);

  return (
    <>
      <SongbookContext.Provider value={asyncSongbook?.result?.data}>
        <Flex padding="1rem" paddingTop=".5rem" flexDir="column">
          <NavBar
            asyncSongbook={asyncSongbook}
            advanceToNextAppState={advanceToNextAppState}
            resetAppState={resetAppState}
            applicationState={applicationState}
          />
          <Tabs
            asyncSongbook={asyncSongbook}
            applicationState={applicationState}
          />
        </Flex>
      </SongbookContext.Provider>
    </>
  );
}

export default CurrentSongView;
