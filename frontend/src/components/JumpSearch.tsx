import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import { AxiosResponse } from "axios";
import { useState } from "react";
import { useAsync, UseAsyncReturn } from "react-async-hook";
import { useParams } from "react-router-dom";
import { Songbook, SongEntry } from "../models";
import { getSongbookDetails, setSongbookSong } from "../services/songs";

interface JumpSearchProps {
  isOpen: boolean;
  onClose: () => void;
  asyncSongbook: UseAsyncReturn<AxiosResponse<Songbook, any>, never[]>;
}

export default function JumpSearch({
  isOpen,
  onClose,
  asyncSongbook,
}: JumpSearchProps) {
  const { sessionKey } = useParams();
  const asyncSongbookDetails = useAsync(getSongbookDetails, [sessionKey]);

  const [searchText, setSearchText] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isSubmitting, setIsSubmitting] = useBoolean(false);

  const updateSelectedIndexWithValidValue = (index: number) => {
    let newIndex = index;
    const maxIndex =
      ((typeof asyncSongbookDetails?.result !== "string" &&
        asyncSongbookDetails?.result?.data?.song_entries?.length) ||
        0) - 1;
    if (index < 0) {
      newIndex = maxIndex;
    } else if (index > maxIndex) {
      newIndex = 0;
    }
    setSelectedIndex(newIndex);
  };

  const submit = async (song: SongEntry | undefined | false) => {
    if (!song) return;

    setIsSubmitting.on();
    asyncSongbook.reset();
    const success = await setSongbookSong(sessionKey, song.created_at);
    if (success) {
      setSearchText("");
      onClose();
    }
    asyncSongbook.execute();
    setIsSubmitting.off();
  };

  const filteredSongs = asyncSongbookDetails?.result?.data?.song_entries
    ?.map((songEntry, index) => ({
      ...songEntry,
      displayIndex: index + 1,
    }))
    ?.filter((songEntry) => {
      if (searchText.length < 1) return false;

      const parsedNum = parseInt(searchText);
      if (!Number.isNaN(parsedNum)) {
        return songEntry.displayIndex === parsedNum;
      } else {
        return (
          songEntry.song.artist.toLowerCase().includes(searchText) ||
          songEntry.song.title.toLowerCase().includes(searchText)
        );
      }
    })
    .slice(0, 5);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered={true} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <Flex alignContent="space-between" alignItems="center">
            <Text mr="1rem">Jump to:</Text>
            <Box width="70%">
              <InputGroup size="md">
                <Input
                  placeholder="Lynyrd Skynyrd - Free Bird"
                  value={searchText}
                  onChange={(e) => {
                    setSelectedIndex(-1);
                    setSearchText(e.target.value);
                  }}
                  disabled={isSubmitting}
                  onKeyDown={async (e) => {
                    if (e.key === "ArrowDown") {
                      updateSelectedIndexWithValidValue(selectedIndex + 1);
                      e.preventDefault();
                    } else if (e.key === "ArrowUp") {
                      updateSelectedIndexWithValidValue(selectedIndex - 1);
                      e.preventDefault();
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      const songEntry =
                        typeof asyncSongbookDetails?.result !== "string" &&
                        (filteredSongs || [])[selectedIndex];
                      submit(songEntry);
                    }
                  }}
                />
                <InputRightElement>
                  {asyncSongbookDetails.loading && <Spinner />}
                </InputRightElement>
              </InputGroup>
              {!isSubmitting && !asyncSongbookDetails.loading && (
                <Flex
                  direction="column"
                  bg="gray.100"
                  borderRadius="md"
                  overflow="hidden"
                  position="absolute"
                  width="100%"
                  mt=".5rem"
                  left="0"
                >
                  {typeof asyncSongbookDetails?.result !== "string" &&
                  (asyncSongbookDetails?.result?.data?.song_entries?.length ||
                    0) > 0 ? (
                    (filteredSongs || []).map((songEntry, index) => (
                      <Box
                        key={songEntry.id}
                        padding="1rem"
                        cursor="pointer"
                        onClick={async () => {
                          submit(songEntry);
                        }}
                        onMouseOver={() => setSelectedIndex(index)}
                        bg={index === selectedIndex ? undefined : "gray.400"}
                      >
                        <Text color="gray.900">
                          {songEntry.displayIndex}: {songEntry.song.artist} -{" "}
                          {songEntry.song.title}
                        </Text>
                      </Box>
                    ))
                  ) : (
                    <Box padding="1rem">
                      <Text color="gray.900">No Results Found</Text>
                    </Box>
                  )}
                </Flex>
              )}
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
