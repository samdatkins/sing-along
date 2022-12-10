import {
  ArrowBackIcon,
  ArrowForwardIcon,
  MoonIcon,
  SunIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Link,
  Skeleton,
  SkeletonText,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { useAsync } from "react-async-hook";
import { Song } from "../models/song";

import QRCode from "react-qr-code";
import ActionPrompt from "./ActionPrompt";
import Timer from "./Timer";

function CurrentSongView() {
  const { colorMode, toggleColorMode } = useColorMode();
  // state for showing Action component
  const [doActionPrompt, setDoActionPrompt] = useState(false);
  // global action variable
  const globalActionSetting = "DANCE";
  // length of time for each song
  const songIntervalLength = Date.now() + 60000;
  const asyncSong = useAsync(
    async () => await axios.get<Song>("/api/songs/1"),
    [],
  );
  const splitTab =
    !asyncSong.loading &&
    !asyncSong.error &&
    asyncSong.result?.data?.content
      .replaceAll("[tab]", "")
      .replaceAll("[/tab]", "")
      .split("\n");
  const currentSong =
    !asyncSong.loading && !asyncSong.error && asyncSong.result?.data;
  const addSongUrl = window.location.origin + "/addSong";
  return (
    <>
      <Flex padding="1rem" flexDir="column">
        <Flex flexDir="row" w="100%" justifyContent="space-between">
          <Flex>
            <Button colorScheme="blue" onClick={() => alert("PREV")}>
              <ArrowBackIcon />
            </Button>
          </Flex>
          <div style={{ background: "white", padding: "16px" }}>
            <a href={addSongUrl} target="_blank" rel="noreferrer">
              <QRCode size={56} value={addSongUrl} />
            </a>
          </div>
          <Flex>
            <Flex minWidth="24rem">
              <Skeleton isLoaded={!asyncSong.loading} flex="1" height="2rem" />
              <Heading as="h2" display="inline-block" fontSize="2xl">
                {currentSong && (
                  <>
                    <Link href={currentSong?.content}>
                      "{currentSong.title}" by {currentSong.artist}
                    </Link>{" "}
                    {/* ({currentSong.current} of {currentSong.total}) */}
                  </>
                )}
              </Heading>
              <Button
                marginLeft="1rem"
                colorScheme="blue"
                onClick={toggleColorMode}
                data-testid="darkMode"
              >
                {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              </Button>
            </Flex>
          </Flex>
          <Flex w="15%" justifyContent="space-between">
            <Flex>
              {/* Only show timer if running, hide when expired */}
              {!doActionPrompt && (
                <Timer
                  startTime={songIntervalLength}
                  // this function will be where we set off the song transition when that is ready, a redirect instead of reload
                  startActionPrompt={() => {
                    setDoActionPrompt(true);
                    setInterval(() => {
                      window.location.reload();
                    }, 1500);
                  }}
                />
              )}
            </Flex>
            <Button colorScheme="blue" onClick={() => alert("NEXT")}>
              <ArrowForwardIcon />
            </Button>
          </Flex>
        </Flex>
        {/* hide lyrics when time to do action */}
        {doActionPrompt ? (
          <Flex width="100%" height="100%" justify="center" marginTop="25%">
            <Center>
              <ActionPrompt actionPromptText={globalActionSetting} />
            </Center>
          </Flex>
        ) : (
          <Box
            mt="1rem"
            p="1rem"
            style={{ columnCount: 2, columnGap: "1rem" }}
            width="100%"
            height="100%"
          >
            <SkeletonText
              noOfLines={80}
              isLoaded={!asyncSong.loading}
              spacing="4"
            />
            {splitTab && (
              <pre style={{ fontSize: "1.25rem", fontFamily: "Ubuntu Mono" }}>
                Tab:{" "}
                {splitTab?.map((tabLine) => {
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
      </Flex>
    </>
  );
}

export default CurrentSongView;
