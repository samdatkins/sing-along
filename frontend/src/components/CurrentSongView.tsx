import {
  AddIcon,
  DeleteIcon,
  HamburgerIcon,
  MoonIcon,
  SunIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Icon,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  SkeletonText,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import {
  FaExpandAlt,
  FaFastBackward,
  FaFastForward,
  FaPause,
  FaPlay,
  FaUndoAlt,
} from "react-icons/fa";
import axios from "axios";
import { useRef, useState } from "react";
import { useAsync } from "react-async-hook";
import { Song } from "../models/song";

import QRCode from "react-qr-code";
import ActionPrompt from "./ActionPrompt";
import Timer from "./Timer";

import { useCallback, useEffect } from "react";

function CurrentSongView() {
  // state for toggling night/day modes
  const { colorMode, toggleColorMode } = useColorMode();
  // state for showing ActionPrompt component instead of lyrics
  const [doActionPrompt, setDoActionPrompt] = useState(false);
  // state for triggering refresh in Timer component when restart is clicked
  const [timerKey, setTimerKey] = useState(1);
  // state for whether time is running or not
  const [isLive, setIsLive] = useState(true);
  // global action variable
  const globalActionSetting = "DANCE";
  // ref for controlling the timer from parent component
  const timerRef = useRef<any>();
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

  // handle what happens on key press
  const handleKeyPress = useCallback((event: any) => {
    if (event.code === "Delete") {
      alert(`This deletes the current song and advances to the next song.`);
    } else if (event.code === "Space") {
      alert(`This pauses the timer on the current song.`);
    } else if (event.code === "ArrowLeft") {
      alert(`This sets the previous song to be the current song.`);
    } else if (event.code === "ArrowRight") {
      alert(`This sets the next song to be the current song.`);
    } else if (event.code === "KeyR") {
      alert(`This resets the timer back to its initial count.`);
    } else if (event.code === "KeyF") {
      alert(`This cancels the tab view truncation AND pauses the timer.`);
    }
  }, []);

  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  const addSongUrl = window.location.origin + "/addSong";
  const isSongbookOwner = true;

  return (
    <>
      <Flex padding="1rem" flexDir="column">
        <Flex flexDir="row" w="100%" justifyContent="space-between">
          <Flex>
            {/*hamburger menu starts here */}
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<HamburgerIcon />}
                variant="outline"
              />
              <MenuList>
                {isSongbookOwner && (
                  <Flex direction="column">
                    <Flex justifyContent="space-between" mx="1rem" my=".5rem">
                      <Button
                        colorScheme="blue"
                        onClick={() => {
                          alert("PREV");
                        }}
                      >
                        <Icon as={FaFastBackward} />
                      </Button>
                      <Button
                        colorScheme="blue"
                        onClick={() => {
                          if (timerRef?.current?.api?.isPaused()) {
                            timerRef?.current?.api?.start();
                            setIsLive(true);
                          } else {
                            timerRef.current.api?.pause();
                            setIsLive(false);
                          }
                        }}
                      >
                        <Icon as={isLive ? FaPause : FaPlay} />
                      </Button>
                      <Button colorScheme="blue" onClick={() => alert("NEXT")}>
                        <Icon as={FaFastForward} />
                      </Button>
                    </Flex>
                    <Flex flex="space-between" mx="1rem" my=".5rem">
                      <Button
                        flex="1"
                        colorScheme="blue"
                        onClick={() => {
                          setTimerKey(timerKey * -1);
                          setIsLive(true);
                        }}
                      >
                        <Icon as={FaUndoAlt} />
                      </Button>
                    </Flex>
                  </Flex>
                )}
                <MenuItem
                  icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                  onClick={toggleColorMode}
                >
                  {colorMode === "light" ? "Night Mode" : "Day Mode"}
                </MenuItem>
                {isSongbookOwner && (
                  <MenuItem icon={<Icon as={FaExpandAlt}/>}>Fullscreen</MenuItem>
                )}
                {isSongbookOwner && (
                  <MenuItem icon={<DeleteIcon />}>Delete Song</MenuItem>
                )}
              </MenuList>
            </Menu>
            {/* old nav is here */}
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
            </Flex>
          </Flex>
          <Flex w="15%" justifyContent="space-between">
            <Flex>
              {/* Only show timer if running, hide when expired */}
              {!doActionPrompt && (
                <Timer
                  reference={timerRef}
                  key={timerKey}
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
            <Button colorScheme="blue" onClick={() => alert("Add Song")}>
              <AddIcon />
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
