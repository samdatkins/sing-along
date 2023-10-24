import {
  Link,
  ListItem,
  Skeleton,
  Stack,
  UnorderedList,
} from "@chakra-ui/react";
import { getSongbookDetails, setSongbookSong } from "../services/songs";

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useAsync } from "react-async-hook";

interface SongbookListProps {
  isListOpen: boolean;
  onListClose: () => void;
  sessionKey: string;
}

export default function SongbookList({
  isListOpen,
  onListClose,
  sessionKey,
}: SongbookListProps) {
  const asyncSongbookDetails = useAsync(getSongbookDetails, [sessionKey], {
    executeOnMount: false,
  });
  const songbook = asyncSongbookDetails?.result?.data;

  useEffect(() => {
    if (isListOpen && !asyncSongbookDetails.loading) {
      asyncSongbookDetails.execute(sessionKey);
    }
  }, [isListOpen, sessionKey]);

  return (
    <Modal isOpen={isListOpen} onClose={onListClose} size="lg">
      <ModalOverlay />
      <ModalContent p="10px">
        {asyncSongbookDetails.loading ? (
          <ModalHeader>Loading Song List...</ModalHeader>
        ) : (
          <ModalHeader>Song List for {songbook?.title}</ModalHeader>
        )}
        <ModalCloseButton />
        <ModalBody>
          <UnorderedList mb="50px">
            {asyncSongbookDetails.loading ? (
              <Stack>
                <Skeleton height="20px" />
                <Skeleton height="20px" />
                <Skeleton height="20px" />
              </Stack>
            ) : (
              songbook?.song_entries.map((entry) => (
                <ListItem key={entry.id}>
                  <Link
                    onClick={async () => {
                      const result = await setSongbookSong(
                        sessionKey,
                        entry.created_at
                      );
                      if (result) {
                        onListClose();
                        // navigate(`/live/${sessionKey}/`);
                      }
                    }}
                  >
                    "{entry.song.title}" by {entry.song.artist}
                  </Link>
                </ListItem>
              ))
            )}
          </UnorderedList>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
