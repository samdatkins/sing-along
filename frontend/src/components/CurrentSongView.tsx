import { Flex } from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { useAsync } from "react-async-hook";
import { ApplicationState, Songbook } from "../models";
import NavBar from "./NavBar";
import Tabs from "./Tabs";

import { useParams } from "react-router-dom";

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

  const asyncSongbook = useAsync(
    async () => await axios.get<Songbook>(`/api/songbooks/${sessionKey}/`),
    []
  );

  return (
    <>
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
    </>
  );
}

export default CurrentSongView;
