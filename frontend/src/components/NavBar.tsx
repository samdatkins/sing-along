import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Link,
  Skeleton,
  Text,
  useBoolean,
  useMediaQuery,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AppStateToTimerMap,
  ApplicationState,
  LINES_PER_COLUMN,
  Songbook,
  User,
} from "../models";

import { AxiosResponse } from "axios";
import { UseAsyncReturn } from "react-async-hook";
import QRCode from "react-qr-code";
import {
  Link as RouterLink,
  useNavigate,
  useOutlet,
  useParams,
} from "react-router-dom";
import { countTabColumns } from "../helpers/tab";
import { nextSongbookSong } from "../services/songs";
import ColumnMap from "./ColumnMap";
import HamburgerMenu from "./HamburgerMenu";
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
  const navigate = useNavigate();
  const [countdownTimerInSeconds, setCountdownTimerInSeconds] = useState(
    AppStateToTimerMap[applicationState],
  );
  const [isTimerVisible, setIsTimerVisible] = useBoolean(false);
  const [isSmallerThan900] = useMediaQuery("(max-width: 900px)");
  const isMobileDevice = isSmallerThan900;

  const { sessionKey } = useParams();
  const addSongUrl = window.location.origin + `/live/${sessionKey}/add-song`;

  const currentSongbook = asyncSongbook.result?.data;

  const totalColumns = useMemo(
    () =>
      countTabColumns(
        asyncSongbook.result?.data?.current_song_entry?.song?.content,
        LINES_PER_COLUMN,
      ),
    [
      asyncSongbook.result?.data?.current_song_entry?.song?.content,
      LINES_PER_COLUMN,
    ],
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
                  {currentSongbook.title} {currentSongbook.session_key}
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
      <Flex w="33%" justifyContent="space-between">
        <Flex></Flex>
        <Flex>
          <Flex justifyContent="center">
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
        <Flex w="34%" justifyContent="end">
          <Button colorScheme="blue" as={RouterLink} to={"add-song"}>
            <AddIcon />
          </Button>
        </Flex>
        {addSongDrawerOutlet}
      </Flex>
    </Flex>
  );
}
