import { Box, SkeletonText } from "@chakra-ui/react";
import { AxiosResponse } from "axios";
import { UseAsyncReturn } from "react-async-hook";
import { ApplicationState, Songbook, User } from "../models";

import ActionPrompt from "./ActionPrompt";
import TabDisplay from "./TabDisplay";

interface TabsProps {
  asyncSongbook: UseAsyncReturn<AxiosResponse<Songbook, any>, never[]>;
  applicationState: ApplicationState;
  firstColDispIndex: number;
  columnsToDisplay: number;
  asyncUser: UseAsyncReturn<false | AxiosResponse<User, any>, never[]>;
}

function TabContainer({
  asyncSongbook,
  applicationState,
  firstColDispIndex,
  columnsToDisplay,
  asyncUser,
}: TabsProps) {
  const tab = asyncSongbook.result?.data?.current_song_entry?.song?.content;

  return (
    <>
      {applicationState === ApplicationState.ActionPrompt && (
        <ActionPrompt text="DANCE" animate={true} />
      )}
      {applicationState === ApplicationState.PrepForNextSong && (
        <ActionPrompt text="¡GET READY!" animate={false} />
      )}
      <Box p="1rem" width="100%" height="100%" overflow="hidden">
        <SkeletonText
          noOfLines={80}
          isLoaded={!!asyncSongbook?.result}
          spacing="4"
        />
        <TabDisplay
          tab={tab}
          firstColDispIndex={firstColDispIndex}
          columnsToDisplay={columnsToDisplay}
          asyncUser={asyncUser}
        />
      </Box>
    </>
  );
}

export default TabContainer;
