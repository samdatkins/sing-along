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
import React, { useEffect, useRef } from "react";
import { UseAsyncReturn } from "react-async-hook";
import { BiSliderAlt } from "react-icons/bi";
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
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  ApplicationState,
  FONT_SCALE_INCREMENT,
  MAX_FONT_ONE_COLUMN,
  MAX_FONT_SCALE,
  MIN_FONT_SCALE,
  Songbook,
  User,
} from "../models";
import {
  deleteSongbookSong,
  nextSongbookSong,
  prevSongbookSong,
  setSongEntryFlagged,
} from "../services/songs";
import JumpSearch from "./JumpSearch";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import CreateEditSongbook from "./CreateEditSongbook";
import SettingModal from "./SettingsModal";

interface HamburgerMenuProps {
  isMobileDevice: boolean;
  timerControls: {
    playPauseToggle: () => void;
    refresh: () => void;
  };
  isLive: boolean;
  setIsLive: React.Dispatch<React.SetStateAction<boolean>>;
  addSongModalOutlet: React.ReactElement<
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
  applicationState: ApplicationState;
  setFontScale: React.Dispatch<React.SetStateAction<number>>;
  fontScale: number;
}
export default function HamburgerMenu({
  isMobileDevice,
  timerControls,
  isLive,
  asyncSongbook,
  resetAppState,
  addSongModalOutlet,
  setIsLive,
  firstColDispIndex,
  setFirstColDispIndex,
  totalColumns,
  columnsToDisplay,
  applicationState,
  setFontScale,
  fontScale,
  asyncUser,
}: HamburgerMenuProps) {
  const { toggleColorMode } = useColorMode();
  const { isOpen: isJumpSearchOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSettingsOpen,
    onOpen: onSettingsOpen,
    onClose: onSettingsClose,
  } = useDisclosure();
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();
  const {
    isOpen: isProfileOpen,
    onOpen: onProfileOpen,
    onClose: onProfileClose,
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const isSongbookOwner = asyncSongbook.result
    ? asyncSongbook.result.data.is_songbook_owner
    : false;
  const { sessionKey } = useParams();
  const addSongUrl = window.location.origin + `/live/${sessionKey}/add-song`;

  const handleFlagSong = async () => {
    await setSongEntryFlagged(
      asyncSongbook?.result?.data?.current_song_entry?.id
    );
    onAlertClose();
    asyncSongbook.execute();
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
        asyncSongbook?.result?.data?.current_song_entry?.id
      );
    }
    asyncSongbook.execute();

    resetAppState();
    timerControls.refresh();
  };
  // handle what happens on key press
  const handleKeyPress = async (event: KeyboardEvent) => {
    // if the add song drawer is open, ignore all typing
    if (
      addSongModalOutlet ||
      isJumpSearchOpen ||
      isSettingsOpen ||
      !isSongbookOwner
    )
      return;

    if (event.metaKey || event.ctrlKey || event.altKey) {
      if (event.code === "Equal" || event.code === "Minus") {
        const delta =
          event.code === "Equal"
            ? FONT_SCALE_INCREMENT
            : -1 * FONT_SCALE_INCREMENT;
        setFontScale((scale) => {
          const newScale = delta + scale;
          if (newScale < MIN_FONT_SCALE) {
            return MIN_FONT_SCALE;
          } else if (newScale > MAX_FONT_SCALE) {
            return MAX_FONT_SCALE;
          } else {
            return newScale;
          }
        });
        setFirstColDispIndex(0);
      }
      return;
    }

    // This first one is the only one that non-admins are allowed to use
    if (event.code === "Backquote") {
      toggleColorMode();
    } else if (event.code === "Delete") {
      performSongNavAction("delete");
    } else if (event.key === "!") {
      await setSongEntryFlagged(
        asyncSongbook?.result?.data?.current_song_entry?.id
      );
      asyncSongbook.execute();
    } else if (event.code === "Space") {
      timerControls.playPauseToggle();
    } else if (event.code === "ArrowLeft" && event.shiftKey) {
      performSongNavAction("prev");
    } else if (event.code === "ArrowRight" && event.shiftKey) {
      performSongNavAction("next");
    } else if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
      const absoluteColumnDelta =
        fontScale > MAX_FONT_ONE_COLUMN ? 1 : columnsToDisplay;
      const columnDelta =
        event.code === "ArrowLeft"
          ? -1 * absoluteColumnDelta
          : absoluteColumnDelta;
      if (
        firstColDispIndex + columnDelta >= 0 &&
        firstColDispIndex + columnDelta <= totalColumns - 1
      ) {
        setFirstColDispIndex(firstColDispIndex + columnDelta);
      }
    } else if (event.code === "KeyR") {
      if (applicationState === ApplicationState.ShowSong) {
        timerControls.refresh();
      }
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

  const navigate = useNavigate();

  const handleQRClick = () => {
    navigate(`add-song`);
  };

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
          {isSongbookOwner && (
            <>
              <MenuItem
                onClick={() => {
                  onSettingsOpen();
                }}
                cursor="pointer"
                icon={<Icon as={SettingsIcon} />}
              >
                Songbook Settings
              </MenuItem>
              <CreateEditSongbook
                isOpen={isSettingsOpen}
                onClose={onSettingsClose}
                asyncSongbook={asyncSongbook}
                is_noodle_mode={
                  asyncSongbook.result?.data.is_noodle_mode || false
                }
              />
            </>
          )}
          <MenuItem
            onClick={() => {
              onProfileOpen();
            }}
            cursor="pointer"
            icon={<BiSliderAlt />}
          >
            User Preferences
          </MenuItem>
          <SettingModal
            asyncUser={asyncUser}
            isOpen={isProfileOpen}
            onClose={onProfileClose}
          />
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
            onClick={onAlertOpen}
          >
            Flag Song
          </MenuItem>
          <AlertDialog
            isOpen={isAlertOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Proceed to Flag Song?
                </AlertDialogHeader>

                <AlertDialogBody>
                  Flag this song if the tab is inaccurate or there is some other
                  reason to mark it for further review.
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={onAlertClose}>
                    Cancel
                  </Button>
                  <Button colorScheme="yellow" onClick={handleFlagSong} ml={3}>
                    Flag Song
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
          {isSongbookOwner && (
            <MenuItem
              icon={<Icon as={MdOutlineMenuOpen} boxSize={4} />}
              onClick={onOpen}
            >
              Jump To...
            </MenuItem>
          )}
          <MenuItem onClick={handleQRClick}>
            <Flex
              flexDirection="row"
              width="100%"
              justifyContent="center"
              alignItems="center"
              bgColor="white"
              border="8px solid white"
            >
              <QRCode size={150} value={addSongUrl} />
            </Flex>
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
}
