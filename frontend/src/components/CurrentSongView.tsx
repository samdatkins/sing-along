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
import axios, { AxiosResponse } from "axios";
import { useRef, useState } from "react";
import { useAsync, UseAsyncReturn } from "react-async-hook";
import { Song, Songbook } from "../models/song";

import QRCode from "react-qr-code";
import ActionPrompt from "./ActionPrompt";
import Timer from "./Timer";

import { useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";

async function nextSongbookSong(
  sessionKey: string | undefined,
  asyncSongbook: UseAsyncReturn<AxiosResponse<Songbook, any>, never[]>
) {
  if (!sessionKey) return;
  const result = await axios.patch<Songbook>(
    `/api/songbooks/${sessionKey}/next-song/`
  );
  if (result.status !== 200) {
    console.error("Couldn't get next song");
  } else {
    asyncSongbook.execute();
  }
}

async function prevSongbookSong(
  sessionKey: string | undefined,
  asyncSongbook: UseAsyncReturn<AxiosResponse<Songbook, any>, never[]>
) {
  if (!sessionKey) return;
  const result = await axios.patch<Songbook>(
    `/api/songbooks/${sessionKey}/previous-song/`
  );
  if (result.status !== 200) {
    console.error("Couldn't get previous song");
  } else {
    asyncSongbook.execute();
  }
}

function CurrentSongView() {
  // state for toggling night/day modes
  const { colorMode, toggleColorMode } = useColorMode();
  // state for showing ActionPrompt component instead of lyrics
  const [doActionPrompt, setDoActionPrompt] = useState(false);
  // state for triggering refresh in Timer component when restart is clicked
  const [timerKey, setTimerKey] = useState(Date.now());
  // state for whether time is running or not
  const [isLive, setIsLive] = useState(true);
  // global action variable
  const globalActionSetting = "DANCE";
  // ref for controlling the timer from parent component
  const { sessionKey } = useParams();
  const timerRef = useRef<any>();
  const asyncSongbook = useAsync(
    async () => await axios.get<Songbook>(`/api/songbooks/${sessionKey}/`),
    []
  );
  const splitTab =
    !asyncSongbook.loading &&
    !asyncSongbook.error &&
    asyncSongbook.result?.data?.current_song_entry?.song?.content
      .replaceAll("[tab]", "")
      .replaceAll("[/tab]", "")
      .split("\n");
  const currentSongbook =
    !asyncSongbook.loading &&
    !asyncSongbook.error &&
    asyncSongbook.result?.data;
  const currentSong =
    !asyncSongbook.loading &&
    !asyncSongbook.error &&
    asyncSongbook?.result?.data?.current_song_entry?.song;
  const timerControls = {
    playPauseToggle: () => {
      if (timerRef?.current?.api?.isPaused()) {
        timerRef?.current?.api?.start();
        setIsLive(true);
      } else {
        timerRef.current.api?.pause();
        setIsLive(false);
      }
    },
    refresh: () => {
      setTimerKey(Date.now());
      setIsLive(true);
    },
  };

  // handle what happens on key press
  const handleKeyPress = useCallback((event: any) => {
    if (event.code === "Delete") {
      alert(`This deletes the current song and advances to the next song.`);
    } else if (event.code === "Space") {
      timerControls.playPauseToggle();
      // prevents scrolling from spacebar
      event.preventDefault();
    } else if (event.code === "ArrowLeft") {
      prevSongbookSong(sessionKey, asyncSongbook);
    } else if (event.code === "ArrowRight") {
      nextSongbookSong(sessionKey, asyncSongbook);
    } else if (event.code === "KeyR") {
      timerControls.refresh();
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
                          prevSongbookSong(sessionKey, asyncSongbook);
                        }}
                      >
                        <Icon as={FaFastBackward} />
                      </Button>
                      <Button
                        colorScheme="blue"
                        onClick={timerControls.playPauseToggle}
                      >
                        <Icon as={isLive ? FaPause : FaPlay} />
                      </Button>
                      <Button
                        colorScheme="blue"
                        onClick={() =>
                          nextSongbookSong(sessionKey, asyncSongbook)
                        }
                      >
                        <Icon as={FaFastForward} />
                      </Button>
                    </Flex>
                    <Flex flex="space-between" mx="1rem" my=".5rem">
                      <Button
                        flex="1"
                        colorScheme="blue"
                        onClick={timerControls.refresh}
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
                  <MenuItem
                    icon={<Icon as={FaExpandAlt} />}
                    onClick={() => {
                      if (!document.fullscreenElement) {
                        document.body.requestFullscreen();
                      } else {
                        document.exitFullscreen();
                      }
                    }}
                  >
                    Toggle Fullscreen
                  </MenuItem>
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
            <Flex minWidth="24rem" direction="column">
              <Skeleton
                isLoaded={!asyncSongbook.loading}
                flex="1"
                height="2rem"
              />

              {currentSongbook && currentSong && (
                <>
                  <Heading as="h2" display="inline-block" fontSize="2xl">
                    <Link href={currentSongbook?.current_song_entry.song.url}>
                      "{currentSong.title}" by {currentSong.artist}
                    </Link>{" "}
                    ({currentSongbook.current_song_position} of{" "}
                    {currentSongbook.total_songs})
                  </Heading>
                  <Text>{currentSongbook.title}</Text>
                </>
              )}
            </Flex>
          </Flex>
          <Flex w="15%" justifyContent="space-between">
            <Flex>
              {/* Only show timer if running, hide when expired */}
              {!doActionPrompt && (
                <div>
                  <Timer
                    reference={timerRef}
                    key={timerKey}
                    // this function will be where we set off the song transition when that is ready, a redirect instead of reload
                    startActionPrompt={() => {
                      setDoActionPrompt(true);
                      nextSongbookSong(sessionKey, asyncSongbook);
                    }}
                  />
                  {!isLive && <div>PAUSED</div>}
                </div>
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
              isLoaded={!asyncSongbook.loading}
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
