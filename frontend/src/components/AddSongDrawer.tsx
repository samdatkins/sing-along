import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Input,
  Slide,
  useBoolean,
  useDisclosure,
} from "@chakra-ui/react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import SongbookContext from "../contexts/SongbookContext";
import { ChakraAlertStatus } from "../models";
import {
  addSongToSongbook,
  deleteSongbookSong,
  searchForSong,
} from "../services/songs";

export default function AddSongDrawer() {
  const navigate = useNavigate();
  const { isOpen: isDrawerOpen, onClose: onDrawerClose } = useDisclosure({
    defaultIsOpen: true,
  });
  const [searchText, setSearchText] = useState("");
  const [alertText, setAlertText] = useState("");
  const [alertStatus, setAlertStatus] = useState<ChakraAlertStatus>();
  const [undoSongEntryID, setUndoSongEntryID] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useBoolean();
  const songbook = useContext(SongbookContext);

  return (
    <>
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => {
          onDrawerClose();
          // Finish animation before navigating
          setTimeout(() => navigate("../"), 100);
        }}
        size="sm"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Request a song for "{songbook?.title}"</DrawerHeader>

          <DrawerBody>
            <form>
              <Input
                placeholder="Lynyrd Skynyrd - Free Bird"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Flex direction="row" justifyContent="end">
                <Button
                  type="submit"
                  mt="1rem"
                  onClick={async (e) => {
                    setAlertText("");
                    setAlertStatus(undefined);
                    setIsSubmitting.on();

                    const searchSongResult = await searchForSong(searchText);
                    if (typeof searchSongResult === "string") {
                      setAlertStatus("error");
                      setAlertText(searchSongResult);
                    } else {
                      const addSongResult = await addSongToSongbook(
                        searchSongResult?.data,
                        songbook?.id
                      );
                      if (typeof addSongResult === "string") {
                        setAlertStatus(
                          addSongResult.includes("already")
                            ? "warning"
                            : "error"
                        );
                        setAlertText(addSongResult);
                      } else {
                        setUndoSongEntryID(addSongResult.data.id);
                        setAlertStatus("success");
                        setAlertText(
                          `Successfully added "${searchSongResult?.data?.title}" by ${searchSongResult?.data?.artist}.`
                        );
                        setSearchText("");
                      }
                    }
                    setIsSubmitting.off();

                    e.preventDefault();
                  }}
                  isLoading={isSubmitting}
                  width="100%"
                >
                  Submit
                </Button>
              </Flex>
            </form>

            <Slide direction="bottom" in={!!alertText} style={{ zIndex: 10 }}>
              <Alert status={alertStatus} py="2rem" roundedTop="md">
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
            </Slide>
          </DrawerBody>

          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
