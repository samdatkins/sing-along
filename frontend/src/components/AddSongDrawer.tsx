import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  SlideFade,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import SongbookContext from "../contexts/SongbookContext";
import useWindowDimensions from "../helpers/useWindowDimensions";
import { ChakraAlertStatus } from "../models";
import { addSongToSongbook, deleteSongbookSong } from "../services/songs";
import SongSearchAutocomplete from "./SongSearchAutocomplete";

export default function AddSongDrawer() {
  const navigate = useNavigate();
  const { isOpen: isDrawerOpen, onClose: onDrawerClose } = useDisclosure({
    defaultIsOpen: true,
  });

  const [alertText, setAlertText] = useState("");
  const [alertStatus, setAlertStatus] = useState<ChakraAlertStatus>();
  const [undoSongEntryID, setUndoSongEntryID] = useState<number | undefined>();
  const songbook = useContext(SongbookContext);

  const songRequestInput = React.useRef(null);

  const { height: windowHeight } = useWindowDimensions();

  return (
    <>
      <Drawer
        isOpen={isDrawerOpen}
        initialFocusRef={songRequestInput}
        placement="bottom"
        onClose={() => {
          onDrawerClose();
          // Finish animation before navigating
          setTimeout(() => navigate("../"), 100);
        }}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Request a song for "{songbook?.title}"</DrawerHeader>

          <DrawerBody>
            <Box height={windowHeight * 0.6}>
              <SongSearchAutocomplete
                songRequestInput={songRequestInput}
                onSubmit={async (song) => {
                  setAlertText("");
                  setAlertStatus(undefined);

                  const addSongResult = await addSongToSongbook(
                    song,
                    songbook?.id
                  );
                  if (typeof addSongResult === "string") {
                    const isWarning = addSongResult.includes("already");
                    setAlertStatus(isWarning ? "warning" : "error");
                    setAlertText(addSongResult);
                    if (isWarning) {
                      return true;
                    }
                    return false;
                  } else {
                    setUndoSongEntryID(addSongResult.data.id);
                    setAlertStatus("success");
                    setAlertText(
                      `Successfully added "${song.title}" by ${song.artist}.`
                    );
                    return true;
                  }
                }}
              />

              <SlideFade in={!!alertText} style={{ zIndex: 10 }} offsetY="20px">
                <Alert status={alertStatus} py="2rem" rounded="md" mt="3rem">
                  <Flex direction="column">
                    <Flex direction="row" alignItems="center">
                      <AlertIcon />
                      <AlertDescription>{alertText}</AlertDescription>
                    </Flex>
                    {undoSongEntryID !== undefined && (
                      <Button
                        mt="1rem"
                        onClick={() => {
                          deleteSongbookSong(undoSongEntryID);
                          setUndoSongEntryID(undefined);
                          setAlertText("");
                          setAlertStatus(undefined);
                        }}
                      >
                        Undo
                      </Button>
                    )}
                  </Flex>
                </Alert>
              </SlideFade>
            </Box>
          </DrawerBody>

          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
