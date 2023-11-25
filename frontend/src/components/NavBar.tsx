import { AddIcon, Icon, WarningTwoIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Kbd,
  Link,
  Portal,
  Skeleton,
  Text,
  keyframes,
  useBoolean,
  useDisclosure,
  useMediaQuery,
  usePrevious,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BsSuitHeartFill } from "react-icons/bs";
import {
  AppStateToTimerMap,
  ApplicationState,
  LINES_PER_COLUMN,
  Songbook,
  User,
} from "../models";

import { AxiosResponse } from "axios";
import { UseAsyncReturn } from "react-async-hook";
import { FaFastBackward, FaFastForward } from "react-icons/fa";
import { Link as RouterLink, useOutlet } from "react-router-dom";
import { countTabColumns } from "../helpers/tab";
import { nextSongbookSong, prevSongbookSong } from "../services/songs";
import ColumnMap from "./ColumnMap";
import HamburgerMenu from "./HamburgerMenu";
import MemberAvatarGroup from "./MemberAvatarGroup";
import SongbookList from "./SongbookList";
import StatsModal from "./StatsModal";
import Timer from "./Timer";
import HeartButton from "./LikeButton";

interface NavBarProps {
  asyncSongbook: UseAsyncReturn<AxiosResponse<Songbook, any>, never[]>;
  advanceToNextAppState: () => void;
  resetAppState: () => void;
  applicationState: ApplicationState;
  firstColDispIndex: number;
  setFirstColDispIndex: React.Dispatch<React.SetStateAction<number>>;
  columnsToDisplay: number;
  asyncUser: UseAsyncReturn<false | AxiosResponse<User, any>, never[]>;
  setFontScale: React.Dispatch<React.SetStateAction<number>>;
  fontScale: number;
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
  setFontScale,
  fontScale,
}: NavBarProps) {
  // Outlet that conditionally renders the add song drawer based on URL
  const addSongModalOutlet = useOutlet();
  // ref for controlling the timer from parent component
  const timerRef = useRef<any>();
  // state for triggering refresh in Timer component when restart is clicked
  const [timerKey, setTimerKey] = useState(Date.now());
  // state for whether time is running or not
  const [isLive, setIsLive] = useState(true);

  const [shouldAnimateHeart, setShouldAnimateHeart] = useState(false);

  const [countdownTimerInSeconds, setCountdownTimerInSeconds] = useState(
    AppStateToTimerMap[applicationState]
  );
  const [isTimerVisible, setIsTimerVisible] = useBoolean(false);
  const [isSmallerThan900] = useMediaQuery("(max-width: 900px)");
  const isMobileDevice = isSmallerThan900;

  const currentSongbook = asyncSongbook.result?.data;
  const likesCount =
    asyncSongbook?.result?.data?.current_song_entry?.likes_count;
  const previousLikesCount = usePrevious(
    asyncSongbook?.result?.data?.current_song_entry?.likes_count
  );

  useEffect(() => {
    if (
      previousLikesCount !== undefined &&
      likesCount !== undefined &&
      likesCount > previousLikesCount
    ) {
      setShouldAnimateHeart(true);
    }
  }, [likesCount, previousLikesCount]);

  const {
    isOpen: isStatsOpen,
    onOpen: onStatsOpen,
    onClose: onStatsClose,
  } = useDisclosure();
  const {
    isOpen: isListOpen,
    onOpen: onListOpen,
    onClose: onListClose,
  } = useDisclosure();

  const totalColumns = useMemo(
    () =>
      countTabColumns(
        asyncSongbook.result?.data?.current_song_entry?.song?.content,
        LINES_PER_COLUMN,
        fontScale
      ),
    [fontScale, asyncSongbook.result?.data?.current_song_entry?.song?.content]
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

  const addIconStyle = {
    opacity: "65%",
    margin: "0px",
    padding: "0px",
  };

  const animationKeyframes = keyframes`
0% { transform: scale(1); }
25% { transform: scale(1.5) }
50% { transform: scale(1); }
`;

  const handleNextClick = async (sessionKey) => {
    if (asyncSongbook?.result?.data?.is_noodle_mode)
      await nextSongbookSong(sessionKey);
  };

  const handlePreviousClick = async (sessionKey) => {
    if (asyncSongbook?.result?.data?.is_noodle_mode)
      await prevSongbookSong(sessionKey);
  };

  const handleSongbookClick = () => {
    if (!currentSongbook?.is_songbook_owner) return;
    onListOpen();
  };

  return (
    <Flex flexDir="row" justifyContent="space-between">
      {/* LEFT COLUMN */}
      <Flex
        justifyContent="space-between"
        width={!isMobileDevice ? "33%" : "12%"}
      >
        <Flex paddingRight="1rem">
          <HamburgerMenu
            isMobileDevice={isMobileDevice}
            timerControls={timerControls}
            isLive={isLive}
            setIsLive={setIsLive}
            addSongModalOutlet={addSongModalOutlet}
            asyncSongbook={asyncSongbook}
            resetAppState={resetAppState}
            firstColDispIndex={firstColDispIndex}
            setFirstColDispIndex={setFirstColDispIndex}
            totalColumns={totalColumns}
            columnsToDisplay={columnsToDisplay}
            asyncUser={asyncUser}
            applicationState={applicationState}
            setFontScale={setFontScale}
            fontScale={fontScale}
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
              {currentSongbook.session_key.split("").map((char, keyIdx) => (
                <Kbd key={keyIdx}>{char}</Kbd>
              ))}
            </Heading>
          </Box>
        ) : (
          <Flex></Flex>
        )}
      </Flex>
      {/* MIDDLE COLUMN */}
      <Flex
        alignItems="center"
        width={!isMobileDevice ? "34%" : "78%"}
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
                <HStack spacing="8px" justifyContent="center">
                  <Link
                    fontWeight="bold"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={currentSongbook.current_song_entry?.song.url}
                  >
                    "{currentSongbook.current_song_entry?.song.title}" by{" "}
                    {currentSongbook.current_song_entry?.song.artist}
                  </Link>
                  {currentSongbook?.current_song_entry?.likes_count > 0 && (
                    <HStack spacing="4px">
                      <Icon
                        as={BsSuitHeartFill}
                        color="red"
                        size="16px"
                        animation={
                          shouldAnimateHeart
                            ? `${animationKeyframes} 1s ease-in-out`
                            : ""
                        }
                        onAnimationEnd={() => setShouldAnimateHeart(false)}
                      />
                      <Text fontSize="16px">
                        {currentSongbook.current_song_entry.likes_count || 0}
                      </Text>
                    </HStack>
                  )}
                </HStack>
              </Text>
              <Flex direction="row" justifyContent="center" alignItems="center">
                {asyncSongbook?.result?.data?.is_noodle_mode && (
                  <Button
                    mr="20px"
                    size="xs"
                    colorScheme="blue"
                    isDisabled={currentSongbook.current_song_position === 1}
                    onClick={() =>
                      handlePreviousClick(
                        asyncSongbook?.result?.data?.session_key
                      )
                    }
                  >
                    <FaFastBackward />
                  </Button>
                )}
                <Text
                  onClick={handleSongbookClick}
                  cursor={
                    currentSongbook?.is_songbook_owner ? "pointer" : "default"
                  }
                  align="center"
                  fontSize="1.5xl"
                >
                  {currentSongbook.title}
                  {" - "} ({"song "}
                  {currentSongbook.current_song_position} of{" "}
                  {currentSongbook.total_songs})
                </Text>
                <SongbookList
                  isListOpen={isListOpen}
                  onListClose={onListClose}
                  sessionKey={asyncSongbook?.result?.data?.session_key}
                />
                {asyncSongbook?.result?.data?.is_noodle_mode && (
                  <Button
                    ml="20px"
                    size="xs"
                    colorScheme="blue"
                    isDisabled={
                      currentSongbook.current_song_position ===
                      currentSongbook.total_songs
                    }
                    onClick={() =>
                      handleNextClick(asyncSongbook?.result?.data?.session_key)
                    }
                  >
                    <FaFastForward />
                  </Button>
                )}
              </Flex>
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
      <Flex
        width={!isMobileDevice ? "33%" : "10%"}
        justifyContent="space-between"
      >
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
          <Flex justifyContent="end"> </Flex>
        )}
        {addSongModalOutlet}
      </Flex>

      {(!asyncSongbook?.result?.data?.is_songbook_owner ||
        isMobileDevice ||
        asyncSongbook?.result?.data?.is_noodle_mode) && (
        <HeartButton asyncSongbook={asyncSongbook} />
      )}

      {(!asyncSongbook?.result?.data?.is_songbook_owner ||
        isMobileDevice ||
        asyncSongbook?.result?.data?.is_noodle_mode) && (
        <Portal>
          <Flex position="fixed" right="10px" bottom="10px">
            <Button
              as={RouterLink}
              to={"add-song"}
              colorScheme="blue"
              {...addIconStyle}
            >
              <AddIcon />
            </Button>
          </Flex>
        </Portal>
      )}
    </Flex>
  );
}
