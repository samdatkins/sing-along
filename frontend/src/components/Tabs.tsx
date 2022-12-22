import { Box, SkeletonText, Text } from "@chakra-ui/react";
import { ApplicationState } from "../models";

import ActionPrompt from "./ActionPrompt";

interface TabsProps {
  asyncSongbook: any;
  applicationState: ApplicationState;
}

function Tabs({ asyncSongbook, applicationState }: TabsProps) {
  // state for showing ActionPrompt component instead of lyrics
  // const [doActionPrompt, setDoActionPrompt] = useState(false);

  const splitTab =
    !asyncSongbook.loading &&
    !asyncSongbook.error &&
    asyncSongbook.result?.data?.current_song_entry?.song?.content
      .replaceAll("[tab]", "")
      .replaceAll("[/tab]", "")
      .split("\n");

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
        style={{ columnCount: 2, columnGap: "1rem" }}
        width="100%"
        height="100%"
      >
        <SkeletonText
          noOfLines={80}
          isLoaded={!asyncSongbook.loading}
          spacing="4"
        />
        {splitTab && (
          <pre style={{ fontSize: "1.25rem", fontFamily: "Ubuntu Mono" }}>
            Tab:{" "}
            {splitTab?.map((tabLine: string) => {
              if (tabLine.includes("[ch]")) {
                return (
                  <Text color="cyan.500" key={window.crypto.randomUUID()}>
                    {tabLine.replaceAll("[ch]", "").replaceAll("[/ch]", "")}
                  </Text>
                );
              } else {
                return <Text key={window.crypto.randomUUID()}>{tabLine}</Text>;
              }
            })}
          </pre>
        )}
      </Box>
    </>
  );
}

export default Tabs;
