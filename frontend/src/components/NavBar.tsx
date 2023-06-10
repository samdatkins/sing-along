import { AddIcon, WarningTwoIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Portal,
  Skeleton,
  Text,
  useBoolean,
  useDisclosure,
  useMediaQuery,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BsSuitHeart, BsSuitHeartFill } from "react-icons/bs";
import {
  AppStateToTimerMap,
  ApplicationState,
  LINES_PER_COLUMN,
  Songbook,
  User,
} from "../models";

import { AxiosResponse } from "axios";
import { UseAsyncReturn } from "react-async-hook";
import { Link as RouterLink, useOutlet } from "react-router-dom";
import { countTabColumns } from "../helpers/tab";
import { nextSongbookSong, setSongLikeStatus } from "../services/songs";
import ColumnMap from "./ColumnMap";
import HamburgerMenu from "./HamburgerMenu";
import MemberAvatarGroup from "./MemberAvatarGroup";
import StatsModal from "./StatsModal";
import Timer from "./Timer";

interface NavBarProps {
  asyncSongbook: UseAsyncReturn<AxiosResponse<Songbook, any>, never[]>;
  advanceToNextAppState: () => void;
  resetAppState: () => void;
  applicationState: ApplicationState;
  firstColDispIndex: number;
  setFirstColDispIndex: React.Dispatch<React.SetStateAction<number>>;
  columnsToDisplay: number;
  asyncUser: UseAsyncReturn<false | AxiosResponse<User, any>, never[]>;
}

export default function NavBar({
  asyncSongbook,
  advanceToNextAppState,
  resetAppState,
  applicationState,
  firstColDispIndex,
  setFirstColDispIndex,
  columnsToDisplay,
  asyncUser,
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

  const [countdownTimerInSeconds, setCountdownTimerInSeconds] = useState(
    AppStateToTimerMap[applicationState]
  );
  const [isTimerVisible, setIsTimerVisible] = useBoolean(false);
  const [isLiked, setIsLiked] = useBoolean(false);
  const [isSmallerThan900] = useMediaQuery("(max-width: 900px)");
  const isMobileDevice = isSmallerThan900;

  const currentSongbook = asyncSongbook.result?.data;

  const {
    isOpen: isStatsOpen,
    onOpen: onStatsOpen,
    onClose: onStatsClose,
  } = useDisclosure();

  const totalColumns = useMemo(
    () =>
      countTabColumns(
        asyncSongbook.result?.data?.current_song_entry?.song?.content,
        LINES_PER_COLUMN
      ),
    [asyncSongbook.result?.data?.current_song_entry?.song?.content]
  );

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

  useEffect(() => {
    async function appStateChanged() {
      setIsLive(false);

      const newCountdownTime = AppStateToTimerMap[applicationState];
      setCountdownTimerInSeconds(newCountdownTime);
      if (applicationState === ApplicationState.PrepForSong) {
        const sessionKey = asyncSongbook?.result?.data?.session_key;
        asyncSongbook.reset();
        await nextSongbookSong(sessionKey);
        asyncSongbook.execute();
      }
      if (applicationState === ApplicationState.ActionPrompt) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
    }

    appStateChanged();
  }, [applicationState]);

  useEffect(() => {
    asyncSongbook?.result?.data?.is_current_song_liked
      ? setIsLiked.on()
      : setIsLiked.off();
  }, [asyncSongbook?.result?.data?.is_current_song_liked, setIsLiked]);

  useEffect(() => {
    timerControls.refresh();
  }, [countdownTimerInSeconds]);

  useEffect(() => {
    if (
      asyncSongbook?.result?.data.total_songs === 0 &&
      currentSongbook?.is_songbook_owner
    ) {
      onStatsOpen();
    }
  }, [
    asyncSongbook.result?.data.total_songs,
    onStatsOpen,
    currentSongbook?.is_songbook_owner,
  ]);

  const heartIconStyle = {
    size: "34px",
    color: "red",
    opacity: "65%",
    filter: "drop-shadow(1px 1px 0 #666666",
    cursor: "pointer",
  };

  const handleHeartClick = async () => {
    if (!asyncSongbook?.result?.data) {
      return;
    }
    setIsLiked.toggle();
    const newLikeState = !isLiked;
    const songId = asyncSongbook.result.data.current_song_entry.song.id;
    setSongLikeStatus(songId, newLikeState);
    asyncSongbook.execute();
  };

  return (
    <Flex flexDir="row" justifyContent="space-between">
      {/* LEFT COLUMN */}
      <Flex justifyContent="space-between" width={!isMobileDevice ? "33%" : ""}>
        <Flex paddingRight="1rem">
          <HamburgerMenu
            isMobileDevice={isMobileDevice}
            timerControls={timerControls}
            isLive={isLive}
            setIsLive={setIsLive}
            addSongDrawerOutlet={addSongDrawerOutlet}
            asyncSongbook={asyncSongbook}
            resetAppState={resetAppState}
            firstColDispIndex={firstColDispIndex}
            setFirstColDispIndex={setFirstColDispIndex}
            totalColumns={totalColumns}
            columnsToDisplay={columnsToDisplay}
            asyncUser={asyncUser}
            applicationState={applicationState}
          />
        </Flex>
        <Box pt=".5rem">
          {!isMobileDevice && (
            <ColumnMap
              columnsToDisplay={columnsToDisplay}
              firstColDispIndex={firstColDispIndex}
              totalColumns={totalColumns}
              setFirstColDispIndex={setFirstColDispIndex}
            />
          )}
        </Box>

        {currentSongbook?.is_songbook_owner &&
        !currentSongbook?.is_noodle_mode &&
        !isMobileDevice ? (
          <Box>
            <Heading fontFamily="Ubuntu Mono">
              {currentSongbook.session_key}
            </Heading>
          </Box>
        ) : (
          <Flex></Flex>
        )}
      </Flex>
      {/* MIDDLE COLUMN */}
      <Flex
        alignItems="center"
        width={!isMobileDevice ? "34%" : ""}
        justifyContent="center"
      >
        <Flex direction="column">
          {!!asyncSongbook?.result && currentSongbook ? (
            <>
              <Text
                as="h2"
                display="inline-block"
                fontSize="2xl"
                align="center"
              >
                {currentSongbook?.current_song_entry?.is_flagged && (
                  <WarningTwoIcon />
                )}{" "}
                <Link
                  fontWeight="bold"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={currentSongbook.current_song_entry?.song.url}
                >
                  "{currentSongbook.current_song_entry?.song.title}" by{" "}
                  {currentSongbook.current_song_entry?.song.artist}
                </Link>{" "}
              </Text>
              <RouterLink to={`/live/${currentSongbook.session_key}/list`}>
                <Text align="center" fontSize="1.5xl">
                  {currentSongbook.title}
                  {" - "} ({"song "}
                  {currentSongbook.current_song_position} of{" "}
                  {currentSongbook.total_songs})
                </Text>
              </RouterLink>
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
      <Flex width={!isMobileDevice ? "33%" : ""} justifyContent="space-between">
        <Flex></Flex>
        <Flex>
          <Flex justifyContent="center">
            {!isMobileDevice &&
              !asyncSongbook?.result?.data?.is_noodle_mode &&
              currentSongbook?.is_songbook_owner && (
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
        {currentSongbook?.is_songbook_owner &&
        !isMobileDevice &&
        !asyncSongbook?.result?.data?.is_noodle_mode ? (
          currentSongbook?.session_key && (
            <>
              <Flex onClick={onStatsOpen}>
                <MemberAvatarGroup
                  membersList={currentSongbook.membership_set}
                />
              </Flex>
              <StatsModal
                isOpen={isStatsOpen}
                onClose={onStatsClose}
                sessionKey={currentSongbook.session_key}
                songbookTitle={currentSongbook.title}
                totalSongs={currentSongbook.total_songs}
                membersList={currentSongbook.membership_set}
              />
            </>
          )
        ) : (
          <Flex w="34%" justifyContent="end">
            <Button colorScheme="blue" as={RouterLink} to={"add-song"}>
              <AddIcon />
            </Button>
          </Flex>
        )}
        {addSongDrawerOutlet}
      </Flex>
      {/* LIKE ICON */}
      {(!asyncSongbook?.result?.data?.is_songbook_owner || isMobileDevice) && (
        <Portal>
          <Flex
            position="fixed"
            right="20px"
            bottom="20px"
            margin="0"
            padding="0"
          >
            {isLiked ? (
              <BsSuitHeartFill {...heartIconStyle} onClick={handleHeartClick} />
            ) : (
              <BsSuitHeart {...heartIconStyle} onClick={handleHeartClick} />
            )}
          </Flex>
        </Portal>
      )}
    </Flex>
  );
}
