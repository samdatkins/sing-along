import { Box, SkeletonText, useMediaQuery } from "@chakra-ui/react";
import { AxiosResponse } from "axios";
import { UseAsyncReturn } from "react-async-hook";
import { ApplicationState, Songbook } from "../models";

import ActionPrompt from "./ActionPrompt";
import TabDisplay from "./TabDisplay";

interface TabsProps {
  asyncSongbook: UseAsyncReturn<AxiosResponse<Songbook, any>, never[]>;
  applicationState: ApplicationState;
}

function TabContainer({ asyncSongbook, applicationState }: TabsProps) {
  const tab = asyncSongbook.result?.data?.current_song_entry?.song?.content;
  const [isLargerThan1900] = useMediaQuery("(min-width: 1900px)");

  return (
    <>
      {applicationState === ApplicationState.ActionPrompt && (
        <ActionPrompt text="DANCE" animate={true} />
      )}
      {applicationState === ApplicationState.PrepForNextSong && (
        <ActionPrompt text="¡GET READY!" animate={false} />
      )}
      <Box
        p="1rem"
        style={{
          columnCount: isLargerThan1900 ? 3 : 1,
          columnGap: "1rem",
        }}
        width="100%"
        height="100%"
        overflow="hidden"
      >
        <SkeletonText
          noOfLines={80}
          isLoaded={!!asyncSongbook?.result}
          spacing="4"
        />
        <TabDisplay
          tab={tab}
          isNoodleMode={asyncSongbook?.result?.data?.is_noodle_mode}
        />
      </Box>
    </>
  );
}

export default TabContainer;
