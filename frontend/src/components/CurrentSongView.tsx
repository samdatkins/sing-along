import { Flex } from "@chakra-ui/react";
import { useState } from "react";
import { UseAsyncReturn, useAsync } from "react-async-hook";
import { ApplicationState, User } from "../models";
import NavBar from "./NavBar";
import TabContainer from "./TabContainer";

import { AxiosResponse } from "axios";
import { useParams } from "react-router-dom";
import { useInterval } from "usehooks-ts";
import SongbookContext from "../contexts/SongbookContext";
import { getCurrentSong } from "../services/songs";

const SONGBOOK_POLL_INTERVAL = 1 * 2000;

interface CurrentSongViewProps {
  asyncUser: UseAsyncReturn<false | AxiosResponse<User, any>, never[]>;
}

function CurrentSongView({ asyncUser }: CurrentSongViewProps) {
  const user = asyncUser.result && asyncUser.result.data;
  // state for showing ActionPrompt component instead of lyrics
  const [applicationState, setApplicationState] = useState(
    ApplicationState.ShowSong,
  );
  const [firstColDispIndex, setFirstColDispIndex] = useState(0);
  // const setColRef = useRef(setFirstColDispIndex);
  const columnsToDisplay = user ? user.userprofile.columns_to_display : 1;

  const advanceToNextAppState = () => {
    console.log("next app state");
    switch (applicationState) {
      case ApplicationState.ShowSong:
        setApplicationState(ApplicationState.ActionPrompt);
        break;
      case ApplicationState.ActionPrompt:
        setFirstColDispIndex(0);
        setApplicationState(ApplicationState.PrepForNextSong);
        break;
      case ApplicationState.PrepForNextSong:
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
      setApplicationState(ApplicationState.PrepForNextSong);
    }
  };

  useInterval(() => {
    if (!asyncSongbook.loading) {
      asyncSongbook.execute();
    }
  }, SONGBOOK_POLL_INTERVAL);

  return (
    <>
      <SongbookContext.Provider value={asyncSongbook?.result?.data}>
        <Flex padding="1rem" paddingTop=".5rem" flexDir="column" height="100%">
          <NavBar
            asyncSongbook={asyncSongbook}
            advanceToNextAppState={advanceToNextAppState}
            resetAppState={resetAppState}
            applicationState={applicationState}
            firstColDispIndex={firstColDispIndex}
            setFirstColDispIndex={setFirstColDispIndex}
            columnsToDisplay={columnsToDisplay}
            asyncUser={asyncUser}
          />
          <TabContainer
            asyncSongbook={asyncSongbook}
            asyncUser={asyncUser}
            applicationState={applicationState}
            firstColDispIndex={firstColDispIndex}
            columnsToDisplay={columnsToDisplay}
          />
        </Flex>
      </SongbookContext.Provider>
    </>
  );
}

export default CurrentSongView;
