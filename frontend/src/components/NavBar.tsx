import { AddIcon, HamburgerIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  Box,
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
  useMediaQuery,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaExpandAlt,
  FaFastBackward,
  FaFastForward,
  FaHome,
  FaPause,
  FaPlay,
  FaTrash,
  FaUndoAlt,
} from "react-icons/fa";
import { GrUnorderedList } from "react-icons/gr";
import { ApplicationState, AppStateToTimerMap, Songbook } from "../models";

import { AxiosResponse } from "axios";
import { UseAsyncReturn } from "react-async-hook";
import QRCode from "react-qr-code";
import {
  Link as RouterLink,
  useNavigate,
  useOutlet,
  useParams,
} from "react-router-dom";
import {
  deleteSongbookSong,
  nextSongbookSong,
  prevSongbookSong,
} from "../services/songs";
import Timer from "./Timer";

interface NavBarProps {
  asyncSongbook: UseAsyncReturn<AxiosResponse<Songbook, any>, never[]>;
  advanceToNextAppState: () => void;
  resetAppState: () => void;
  applicationState: ApplicationState;
}

export default function NavBar({
  asyncSongbook,
  advanceToNextAppState,
  resetAppState,
  applicationState,
}: NavBarProps) {
  // Outlet that conditionally renders the add song drawer based on URL
  const addSongDrawerOutlet = useOutlet();
  // ref for controlling the timer from parent component
  const timerRef = useRef<any>();
  // state for triggering refresh in Timer component when restart is clicked
  const [timerKey, setTimerKey] = useState(Date.now());
  // state for whether time is running or not
  const [isLive, setIsLive] = useState(true);
  // state for length of countdown timer in seconds
  const navigate = useNavigate();
  const [countdownTimerInSeconds, setCountdownTimerInSeconds] = useState(
    AppStateToTimerMap[applicationState],
  );
  const { colorMode, toggleColorMode } = useColorMode();
  const [isTimerVisible, setIsTimerVisible] = useBoolean(false);
  const [isSmallerThan900] = useMediaQuery("(max-width: 900px)");
  const isMobileDevice = isSmallerThan900;

  const { sessionKey } = useParams();
  const addSongUrl = window.location.origin + `/live/${sessionKey}/add-song`;

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

  const performSongNavAction = async (action: "next" | "prev" | "delete") => {
    const sessionKey = asyncSongbook?.result?.data?.session_key;
    setIsLive(false);

    asyncSongbook.reset();
    if (action === "next") {
      await nextSongbookSong(sessionKey);
    } else if (action === "prev") {
      await prevSongbookSong(sessionKey);
    } else {
      await deleteSongbookSong(
        asyncSongbook?.result?.data?.current_song_entry?.id,
      );
    }
    asyncSongbook.execute();

    resetAppState();
    timerControls.refresh();
  };

  const isSongbookOwner = true;

  // handle what happens on key press
  const handleKeyPress = useCallback(
    (event: any) => {
      // if the add song drawer is open, ignore all typing
      if (addSongDrawerOutlet) return;

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
    [timerControls, toggleColorMode],
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
    async function appStateChanged() {
      setIsLive(false);

      const newCountdownTime = AppStateToTimerMap[applicationState];
      setCountdownTimerInSeconds(newCountdownTime);
      if (applicationState === ApplicationState.PrepForNextSong) {
        const sessionKey = asyncSongbook?.result?.data?.session_key;
        asyncSongbook.reset();
        await nextSongbookSong(sessionKey);
        asyncSongbook.execute();
      }
    }

    appStateChanged();
  }, [applicationState]);

  useEffect(() => {
    timerControls.refresh();
  }, [countdownTimerInSeconds]);

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
              {isSongbookOwner && !isMobileDevice && (
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
                  <Flex justifyContent="space-between" mx="1rem" my=".5rem">
                    <Button
                      colorScheme="gray"
                      onClick={() => {
                        resetAppState();
                        timerControls.refresh();
                      }}
                    >
                      <Icon as={FaUndoAlt} />
                    </Button>
                    <Button
                      colorScheme="gray"
                      onClick={() => performSongNavAction("delete")}
                    >
                      <Icon as={FaTrash} />
                    </Button>
                    <Button
                      colorScheme="gray"
                      onClick={() => {
                        if (!document.fullscreenElement) {
                          document.body.requestFullscreen();
                        } else {
                          document.exitFullscreen();
                        }
                      }}
                    >
                      <Icon as={FaExpandAlt} />
                    </Button>
                  </Flex>
                </Flex>
              )}
              <RouterLink to="../live/">
                <MenuItem icon={<Icon as={FaHome} />}>Home</MenuItem>
              </RouterLink>
              {asyncSongbook?.result?.data?.is_noodle_mode && (
                <RouterLink to="list">
                  <MenuItem icon={<Icon as={GrUnorderedList} />}>
                    Song List
                  </MenuItem>
                </RouterLink>
              )}
              <MenuItem
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
              >
                {colorMode === "light" ? "Night Mode" : "Day Mode"}
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>

        {!isMobileDevice && (
          <Box bgColor="white" p="8px" position="fixed" right="0" bottom="0">
            <Link onClick={() => navigate(`add-song`)}>
              <QRCode size={200} value={addSongUrl} />
            </Link>
          </Box>
        )}

        <Flex></Flex>
      </Flex>
      {/* MIDDLE COLUMN */}
      <Flex w="34%" alignContent="center" justifyContent="center">
        <Flex direction="column">
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
            {!isMobileDevice &&
              !asyncSongbook?.result?.data?.is_noodle_mode && (
                <>
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
                </>
              )}
          </Flex>
        </Flex>
        <Button colorScheme="blue" as={RouterLink} to={"add-song"}>
          <AddIcon />
        </Button>
        {addSongDrawerOutlet}
      </Flex>
    </Flex>
  );
}
