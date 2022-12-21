import { Box, Center, Flex, SkeletonText, Text } from "@chakra-ui/react";
import { useState } from "react";

import ActionPrompt from "./ActionPrompt";

interface TabsProps {
  asyncSongbook: any;
  doActionPrompt: boolean;
}

function Tabs({ asyncSongbook, doActionPrompt }: TabsProps) {
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
      {/* hide lyrics when time to do action */}
      {doActionPrompt ? (
        <Flex width="100%" height="100%" justify="center" marginTop="25%">
          <Center>
            <ActionPrompt />
          </Center>
        </Flex>
      ) : (
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
                    <Text color="cyan.500">
                      {tabLine.replaceAll("[ch]", "").replaceAll("[/ch]", "")}
                    </Text>
                  );
                } else {
                  return <Text>{tabLine}</Text>;
                }
              })}
            </pre>
          )}
        </Box>
      )}
    </>
  );
}

export default Tabs;
