import {
  ArrowBackIcon,
  ArrowForwardIcon,
  MoonIcon,
  SunIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Skeleton,
  SkeletonText,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import axios from "axios";
import { useAsync } from "react-async-hook";
import { Song } from "../models/song";

function CurrentSongView() {
  const { colorMode, toggleColorMode } = useColorMode();
  const asyncSong = useAsync(
    async () => await axios.get<Song>("/api/songs/1"),
    []
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

  return (
    <>
      <Flex padding="1rem" flexDir="column">
        <Flex flexDir="row" w="100%" justifyContent="space-between">
          <Button colorScheme="blue" onClick={() => alert("PREV")}>
            <ArrowBackIcon />
          </Button>
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
          <Button colorScheme="blue" onClick={() => alert("NEXT")}>
            <ArrowForwardIcon />
          </Button>
        </Flex>
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
      </Flex>
    </>
  );
}

export default CurrentSongView;
