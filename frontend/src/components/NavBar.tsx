import {
  AddIcon,
  DeleteIcon,
  HamburgerIcon,
  MoonIcon,
  SunIcon,
} from "@chakra-ui/icons";
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
  useBoolean,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaExpandAlt,
  FaFastBackward,
  FaFastForward,
  FaPause,
  FaPlay,
  FaUndoAlt,
} from "react-icons/fa";
import { ApplicationState, AppStateToTimerMap, Songbook } from "../models";
import AddSongMenu from "./AddSongMenu";

import QRCode from "react-qr-code";
import {
  deleteSongbookSong,
  nextSongbookSong,
  prevSongbookSong,
} from "../services/navigation";
import { AxiosResponse } from "axios";
import { UseAsyncReturn } from "react-async-hook";
import Timer from "./Timer";

interface NavBarProps {
  asyncSongbook: UseAsyncReturn<AxiosResponse<Songbook, any>, never[]>;
  advanceToNextAppState: () => void;
  resetAppState: () => void;
  applicationState: ApplicationState;
}

const addSongUrl = window.location.origin + "/addSong";

export default function NavBar({
  asyncSongbook,
  advanceToNextAppState,
  resetAppState,
  applicationState,
}: NavBarProps) {
  // ref for controlling the timer from parent component
  const timerRef = useRef<any>();
  // state for triggering refresh in Timer component when restart is clicked
  const [timerKey, setTimerKey] = useState(Date.now());
  // state for whether time is running or not
  const [isLive, setIsLive] = useState(true);
  // state for length of countdown timer in seconds
  const [countdownTimerInSeconds, setCountdownTimerInSeconds] = useState(
    AppStateToTimerMap[applicationState]
  );
  const { colorMode, toggleColorMode } = useColorMode();
  const [isTimerVisible, setIsTimerVisible] = useBoolean(false);

  const currentSongbook = asyncSongbook.result?.data;

  const timerControls = {
    playPauseToggle: () => {
      if (isTimerVisible) {
        if (timerRef?.current?.api?.isPaused()) {
          timerRef?.current?.api?.start();
          setIsLive(true);
        } else {
          timerRef?.current?.api?.pause();
          setIsLive(false);
        }
      }
    },
    refresh: () => {
      setTimerKey(Date.now());
      setIsLive(true);
      timerRef?.current?.api?.start();
    },
  };

  const performSongNavAction = (action: "next" | "prev" | "delete") => {
    setIsLive(false);
    if (action === "next") {
      nextSongbookSong(asyncSongbook);
    } else if (action === "prev") {
      prevSongbookSong(asyncSongbook);
    } else {
      deleteSongbookSong(asyncSongbook);
    }
    resetAppState();
    timerControls.refresh();
  };

  const isSongbookOwner = true;

  // handle what happens on key press
  const handleKeyPress = useCallback(
    (event: any) => {
      // This first one is the only one that non-admins are allowed to use
      if (event.code === "Backquote") {
        toggleColorMode();
      } else if (event.code === "Delete") {
        performSongNavAction("delete");
      } else if (event.code === "Space") {
        timerControls.playPauseToggle();
        // prevents scrolling from spacebar
        event.preventDefault();
      } else if (event.code === "ArrowLeft") {
        performSongNavAction("prev");
      } else if (event.code === "ArrowRight") {
        performSongNavAction("next");
      } else if (event.code === "KeyR") {
        resetAppState();
        timerControls.refresh();
      } else if (event.code === "KeyF") {
        alert(`This cancels the tab view truncation AND pauses the timer.`);
      }
    },
    [timerControls, toggleColorMode]
  );

  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    setIsLive(false);

    const newCountdownTime = AppStateToTimerMap[applicationState];
    setCountdownTimerInSeconds(newCountdownTime);
    if (applicationState === ApplicationState.PrepForNextSong) {
      nextSongbookSong(asyncSongbook);
    }
  }, [applicationState]);

  useEffect(() => {
    timerControls.refresh();
  }, [countdownTimerInSeconds]);

  const { isOpen, onOpen, onClose } = useDisclosure();

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
                        performSongNavAction("prev");
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
                        performSongNavAction("next");
                      }}
                    >
                      <Icon as={FaFastForward} />
                    </Button>
                  </Flex>
                  <Flex flex="space-between" mx="1rem" my=".5rem">
                    <Button
                      flex="1"
                      colorScheme="blue"
                      onClick={() => {
                        resetAppState();
                        timerControls.refresh();
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
                <MenuItem
                  onClick={() => performSongNavAction("delete")}
                  icon={<DeleteIcon />}
                >
                  Delete Current Song
                </MenuItem>
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
          {!!asyncSongbook?.result && currentSongbook ? (
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
              isLoaded={!!asyncSongbook?.result}
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
          <Flex>
            {isTimerVisible ? (
              <Timer
                isLive={isLive}
                reference={timerRef}
                timerKey={timerKey}
                triggerOnTimerComplete={advanceToNextAppState}
                countdownTimeInSeconds={countdownTimerInSeconds}
              />
            ) : (
              <Button onClick={setIsTimerVisible.toggle}>Start</Button>
            )}
          </Flex>
        </Flex>
        <Button colorScheme="blue" onClick={onOpen}>
          <AddIcon />
        </Button>
        <AddSongMenu isOpen={isOpen} onClose={onClose} />
      </Flex>
    </Flex>
  );
}
