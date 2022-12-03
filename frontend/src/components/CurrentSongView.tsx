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
  Spinner,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Song } from "../models/song";

function CurrentSongView() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [currentSong, setCurrentSong] = useState<Song>();
  const splitTab =
    currentSong &&
    currentSong.tab
      .replaceAll("[tab]", "")
      .replaceAll("[/tab]", "")
      .split("\n");

  useEffect(() => {
    async function getCurrentSong() {
      const curSong = await axios.get<Song>("/live/sams-test/current");
      setCurrentSong(curSong.data);
    }

    getCurrentSong();
  }, []);

  return (
    <>
      {!currentSong ? (
        <Spinner />
      ) : (
        <Flex padding="1rem" flexDir="column">
          <Flex flexDir="row" w="100%" justifyContent="space-between">
            <Button colorScheme="blue" onClick={() => alert("PREV")}>
              <ArrowBackIcon />
            </Button>
            <span>
              <Heading as="h2" display="inline-block" fontSize="2xl">
                <Link href={currentSong.tabUrl}>
                  "{currentSong.title}" by {currentSong.artist}
                </Link>{" "}
                ({currentSong.current} of {currentSong.total})
              </Heading>
              <Button
                marginLeft="1rem"
                colorScheme="blue"
                onClick={toggleColorMode}
              >
                {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              </Button>
            </span>
            <Button colorScheme="blue" onClick={() => alert("NEXT")}>
              <ArrowForwardIcon />
            </Button>
          </Flex>
          <Box mt="1rem" p="1rem" style={{ columnCount: 2, columnGap: "1rem" }}>
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
          </Box>
        </Flex>
      )}
    </>
  );
}

export default CurrentSongView;
