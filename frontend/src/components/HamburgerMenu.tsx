import { HamburgerIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorMode,
} from "@chakra-ui/react";
import { AxiosResponse } from "axios";
import { useCallback, useEffect } from "react";
import { UseAsyncReturn } from "react-async-hook";
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
import { Link as RouterLink } from "react-router-dom";
import { Songbook } from "../models";
import {
  deleteSongbookSong,
  nextSongbookSong,
  prevSongbookSong,
} from "../services/songs";

interface HamburgerMenuProps {
  isSongbookOwner: boolean;
  isMobileDevice: boolean;
  timerControls: {
    playPauseToggle: () => void;
    refresh: () => void;
  };
  isLive: boolean;
  setIsLive: React.Dispatch<React.SetStateAction<boolean>>;
  addSongDrawerOutlet: React.ReactElement<
    any,
    string | React.JSXElementConstructor<any>
  > | null;
  asyncSongbook: UseAsyncReturn<AxiosResponse<Songbook, any>, never[]>;
  resetAppState: () => void;
}
export default function HamburgerMenu({
  isSongbookOwner,
  isMobileDevice,
  timerControls,
  isLive,
  asyncSongbook,
  resetAppState,
  addSongDrawerOutlet,
  setIsLive,
}: HamburgerMenuProps) {
  const { colorMode, toggleColorMode } = useColorMode();

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

  return (
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
            <MenuItem icon={<Icon as={GrUnorderedList} />}>Song List</MenuItem>
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
  );
}
