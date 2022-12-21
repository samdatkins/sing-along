import { Flex, useColorMode } from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { useAsync } from "react-async-hook";
import { Songbook } from "../models/song";
import NavBar from "./NavBar";
import Tabs from "./Tabs";

import { useParams } from "react-router-dom";

function CurrentSongView() {
  // state for toggling night/day modes
  const { colorMode, toggleColorMode } = useColorMode();
  // state for showing ActionPrompt component instead of lyrics
  const [doActionPrompt, setDoActionPrompt] = useState(false);

  const updateActionStatus = (status: boolean) => {
    setDoActionPrompt(status);
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
          colorControls={{
            colorMode,
            toggleColorMode,
          }}
          updateActionStatus={updateActionStatus}
          doActionPrompt={doActionPrompt}
        />
        <Tabs asyncSongbook={asyncSongbook} doActionPrompt={doActionPrompt} />
      </Flex>
    </>
  );
}

export default CurrentSongView;
