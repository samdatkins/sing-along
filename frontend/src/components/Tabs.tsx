import { Box, SkeletonText } from "@chakra-ui/react";
import { ApplicationState } from "../models";

import ActionPrompt from "./ActionPrompt";
import TabDisplay from "./TabDisplay";

interface TabsProps {
  asyncSongbook: any;
  applicationState: ApplicationState;
}

function Tabs({ asyncSongbook, applicationState }: TabsProps) {
  // state for showing ActionPrompt component instead of lyrics
  // const [doActionPrompt, setDoActionPrompt] = useState(false);

  const tab =
    !asyncSongbook.loading &&
    !asyncSongbook.error &&
    asyncSongbook.result?.data?.current_song_entry?.song?.content;

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
        style={{ columnCount: 3, columnGap: "1rem" }}
        width="100%"
        height="100%"
      >
        <SkeletonText
          noOfLines={80}
          isLoaded={!asyncSongbook.loading}
          spacing="4"
        />
        <TabDisplay
          tab={tab}
          isNoodleMode={asyncSongbook?.result?.is_noodle_mode}
        />
      </Box>
    </>
  );
}

export default Tabs;
