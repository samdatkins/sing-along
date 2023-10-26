import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SlideFade,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import SongbookContext from "../contexts/SongbookContext";
import { ChakraAlertStatus } from "../models";
import { addSongToSongbook, deleteSongbookSong } from "../services/songs";
import SongSearchAutocomplete from "./SongSearchAutocomplete";

const AddSongModal = () => {
  const { onClose } = useDisclosure();
  const [alertText, setAlertText] = useState("");
  const navigate = useNavigate();
  const [alertStatus, setAlertStatus] = useState<ChakraAlertStatus>();
  const [undoSongEntryID, setUndoSongEntryID] = useState<number | undefined>();
  const songbook = useContext(SongbookContext);

  const songRequestInput = React.useRef(null);

  return (
    <>
      <Modal
        isOpen={true}
        initialFocusRef={songRequestInput}
        onClose={() => {
          onClose();
          // Finish animation before navigating
          setTimeout(() => navigate("../"), 100);
        }}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent minH="80vh">
          {songbook?.title ? (
            <ModalHeader>Request a song for "{songbook?.title}"</ModalHeader>
          ) : (
            <ModalHeader>Loading Songbook...</ModalHeader>
          )}
          <ModalCloseButton />
          <ModalBody>
            {songbook?.session_key && (
              <SongSearchAutocomplete
                songRequestInput={songRequestInput}
                session_key={songbook.session_key}
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
            )}
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
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default AddSongModal;
