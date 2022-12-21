import {
  Button,
  Flex,
  Icon,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import {
  AddIcon,
  DeleteIcon,
  HamburgerIcon,
  MoonIcon,
  SunIcon,
} from "@chakra-ui/icons";
import {
  FaExpandAlt,
  FaFastBackward,
  FaFastForward,
  FaPause,
  FaPlay,
  FaUndoAlt,
} from "react-icons/fa";
import axios, { AxiosResponse } from "axios";
import { UseAsyncReturn } from "react-async-hook";
import { Songbook } from "../models/song";
import { useParams } from "react-router-dom";
import { useRef, useState, useCallback, useEffect } from "react";

import Timer from "./Timer";
import QRCode from "react-qr-code";

interface NavBarProps {
  asyncSongbook: any;
  colorControls: any;
  updateActionStatus: any;
  doActionPrompt: boolean;
}

const addSongUrl = window.location.origin + "/addSong";

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

export default function NavBar({
  asyncSongbook,
  colorControls,
  updateActionStatus,
  doActionPrompt,
}: NavBarProps) {
  // gets session key from url
  const { sessionKey } = useParams();
  // ref for controlling the timer from parent component
  const timerRef = useRef<any>();
  // state for triggering refresh in Timer component when restart is clicked
  const [timerKey, setTimerKey] = useState(Date.now());
  // state for whether time is running or not
  const [isLive, setIsLive] = useState(true);

  const currentSongbook =
    !asyncSongbook.loading &&
    !asyncSongbook.error &&
    asyncSongbook.result?.data;

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

  const isSongbookOwner = true;

  // handle what happens on key press
  const handleKeyPress = useCallback((event: any) => {
    if (event.code === "Delete") {
      alert(`This deletes the current song and advances to the next song.`);
    } else if (event.code === "Space") {
      timerControls.playPauseToggle();
      // prevents scrolling from spacebar
      event.preventDefault();
    } else if (event.code === "ArrowLeft") {
      timerControls.refresh();
      prevSongbookSong(sessionKey, asyncSongbook);
    } else if (event.code === "ArrowRight") {
      timerControls.refresh();
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

  return (
    <Flex flexDir="row" w="100%" justifyContent="space-between">
      {/* LEFT COLUMN */}
      <Flex w="33%" justifyContent="space-between">
        <Flex paddingRight="1rem">
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
                        timerControls.refresh();
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
                      onClick={() => {
                        nextSongbookSong(sessionKey, asyncSongbook);
                        timerControls.refresh();
                      }}
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
                icon={
                  colorControls.colorMode === "light" ? (
                    <MoonIcon />
                  ) : (
                    <SunIcon />
                  )
                }
                onClick={colorControls.toggleColorMode}
              >
                {colorControls.colorMode === "light"
                  ? "Night Mode"
                  : "Day Mode"}
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
        </Flex>
        <Flex style={{ background: "white", padding: "8px" }}>
          <a href={addSongUrl} target="_blank" rel="noreferrer">
            <QRCode size={56} value={addSongUrl} />
          </a>
        </Flex>
        <Flex></Flex>
      </Flex>
      {/* MIDDLE COLUMN */}
      <Flex w="34%" alignContent="center" justifyContent="center">
        <Flex minWidth="24rem" direction="column">
          {!asyncSongbook.loading ? (
            <>
              <Text
                as="h2"
                display="inline-block"
                fontSize="2xl"
                align="center"
              >
                <Link
                  fontWeight="bold"
                  href={currentSongbook.current_song_entry?.song.url}
                >
                  "{currentSongbook.current_song_entry?.song.title}" by{" "}
                  {currentSongbook.current_song_entry?.song.artist}
                </Link>{" "}
              </Text>
              <Text align="center" fontSize="1.5xl">
                {currentSongbook.title}
                {" - "} ({"song "}
                {currentSongbook.current_song_position} of{" "}
                {currentSongbook.total_songs})
              </Text>
            </>
          ) : (
            <Skeleton
              isLoaded={!asyncSongbook.loading}
              flex="1"
              height="2rem"
            />
          )}
        </Flex>
      </Flex>
      {/* RIGHT COLUMN */}
      <Flex w="33%" justifyContent="space-between">
        <Flex></Flex>
        <Flex>
          {/* Only show timer if running, hide when expired */}
          {!doActionPrompt && (
            <Flex>
              <Timer
                reference={timerRef}
                key={timerKey}
                // this function will be where we set off the song transition when that is ready, a redirect instead of reload

                updateActionStatus={updateActionStatus}
                moveForward={() => nextSongbookSong(sessionKey, asyncSongbook)}
              />
            </Flex>
          )}
        </Flex>
        <Button colorScheme="blue" onClick={() => alert("Add Song")}>
          <AddIcon />
        </Button>
      </Flex>
    </Flex>
  );
}
