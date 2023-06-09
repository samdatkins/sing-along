import { HamburgerIcon, SettingsIcon } from "@chakra-ui/icons";
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
  useDisclosure,
} from "@chakra-ui/react";
import { AxiosResponse } from "axios";
import { useEffect } from "react";
import { UseAsyncReturn } from "react-async-hook";
import {
  FaExclamationTriangle,
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
import { MdOutlineMenuOpen } from "react-icons/md";
import QRCode from "react-qr-code";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Songbook, User } from "../models";
import {
  deleteSongbookSong,
  nextSongbookSong,
  prevSongbookSong,
  setSongEntryFlagged,
} from "../services/songs";
import JumpSearch from "./JumpSearch";
import SettingModal from "./SettingsModal";

interface HamburgerMenuProps {
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
  firstColDispIndex: number;
  setFirstColDispIndex: React.Dispatch<React.SetStateAction<number>>;
  totalColumns: number;
  columnsToDisplay: number;
  asyncUser: UseAsyncReturn<false | AxiosResponse<User, any>, never[]>;
}
export default function HamburgerMenu({
  isMobileDevice,
  timerControls,
  isLive,
  asyncSongbook,
  resetAppState,
  addSongDrawerOutlet,
  setIsLive,
  firstColDispIndex,
  setFirstColDispIndex,
  totalColumns,
  columnsToDisplay,
  asyncUser,
}: HamburgerMenuProps) {
  const { toggleColorMode } = useColorMode();
  const { isOpen: isJumpSearchOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isProfileOpen,
    onOpen: onProfileOpen,
    onClose: onProfileClose,
  } = useDisclosure();

  const isSongbookOwner = asyncSongbook.result
    ? asyncSongbook.result.data.is_songbook_owner
    : false;
  const { sessionKey } = useParams();
  const addSongUrl = window.location.origin + `/live/${sessionKey}/add-song`;

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
  const handleKeyPress = async (event: KeyboardEvent) => {
    // if the add song drawer is open, ignore all typing
    if (addSongDrawerOutlet || isJumpSearchOpen || !isSongbookOwner) return;

    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    // This first one is the only one that non-admins are allowed to use
    if (event.code === "Backquote") {
      toggleColorMode();
    } else if (event.code === "Delete") {
      performSongNavAction("delete");
    } else if (event.key === "!") {
      await setSongEntryFlagged(
        asyncSongbook?.result?.data?.current_song_entry?.id,
      );
      asyncSongbook.execute();
    } else if (event.code === "Space") {
      timerControls.playPauseToggle();
    } else if (event.code === "ArrowLeft" && event.shiftKey) {
      performSongNavAction("prev");
    } else if (event.code === "ArrowRight" && event.shiftKey) {
      performSongNavAction("next");
    } else if (event.code === "ArrowLeft") {
      if (firstColDispIndex - 1 >= 0) {
        setFirstColDispIndex(firstColDispIndex - 1);
      }
    } else if (event.code === "ArrowRight") {
      if (firstColDispIndex + columnsToDisplay + 1 <= totalColumns) {
        setFirstColDispIndex(firstColDispIndex + 1);
      }
    } else if (event.code === "KeyR") {
      resetAppState();
      timerControls.refresh();
    } else if (event.code === "KeyF") {
      alert(`This cancels the tab view truncation AND pauses the timer.`);
    } else if (event.code === "Slash") {
      onOpen();
    } else {
      return;
    }
    event.preventDefault();
  };

  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <>
      {isJumpSearchOpen && (
        <JumpSearch
          isOpen={isJumpSearchOpen}
          onClose={onClose}
          asyncSongbook={asyncSongbook}
        />
      )}
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
          <MenuItem
            onClick={() => {
              onProfileOpen();
            }}
            cursor="pointer"
            icon={<Icon as={SettingsIcon} />}
          >
            Settings
          </MenuItem>
          {asyncSongbook?.result?.data?.is_noodle_mode && (
            <RouterLink to="list">
              <MenuItem icon={<Icon as={GrUnorderedList} />}>
                Song List
              </MenuItem>
            </RouterLink>
          )}
          <MenuItem
            color={"red.600"}
            icon={<Icon as={FaExclamationTriangle} />}
            onClick={async () => {
              await setSongEntryFlagged(
                asyncSongbook?.result?.data?.current_song_entry?.id,
              );
              asyncSongbook.execute();
            }}
          >
            Flag Song
          </MenuItem>

          <MenuItem
            icon={<Icon as={MdOutlineMenuOpen} boxSize={4} />}
            onClick={onOpen}
          >
            Jump To...
          </MenuItem>
          <Flex direction="column" justifyContent="center" alignItems="center">
            <Flex
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
              bgColor="white"
              width="166px"
              border="8px solid white"
            >
              <QRCode size={150} value={addSongUrl} />
            </Flex>
          </Flex>
        </MenuList>
      </Menu>
      <SettingModal
        asyncUser={asyncUser}
        isOpen={isProfileOpen}
        onClose={onProfileClose}
      />
    </>
  );
}
