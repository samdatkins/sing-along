import { useEffect, useState } from "react";
import axios from "axios";
import { Song } from "../models/song";
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";

function CurrentSongView() {
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
            <Button colorScheme="blue">
              <ArrowBackIcon />
            </Button>
            <Heading as="h2" display="inline-block" fontSize="2xl">
              <Link href={currentSong.tabUrl}>
                "{currentSong.title}" by {currentSong.artist}
              </Link>{" "}
              ({currentSong.current} of {currentSong.total})
            </Heading>
            <Button colorScheme="blue">
              <ArrowForwardIcon />
            </Button>
          </Flex>
          <Box mt="1rem" p="1rem" style={{ columnCount: 2, columnGap: "1rem" }}>
            <pre style={{ fontSize: "1.25rem", fontFamily: "Ubuntu Mono" }}>
              Tab:{" "}
              {splitTab?.map((tabLine) => {
                if (tabLine.includes("[ch]")) {
                  return (
                    <Text color="blue">
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
