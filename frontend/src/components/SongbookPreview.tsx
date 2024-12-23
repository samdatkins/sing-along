import {
  Card,
  Container,
  Flex,
  Heading,
  Skeleton,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { getSongbookDetails, toggleSongMemoPending } from "../services/songs";

import { useAsync } from "react-async-hook";
import { useParams } from "react-router-dom";
import { useInterval } from "usehooks-ts";
import { Icon } from "@chakra-ui/icons";
import { FaFlag, FaRegFlag } from "react-icons/fa";
import { isSongbookActive } from "../helpers/time";
const POLL_INTERVAL = 5 * 1000;

export default function SongbookPreview() {
  const toast = useToast();
  const { sessionKey } = useParams();

  const asyncSongbookDetails = useAsync(getSongbookDetails, [sessionKey], {
    setLoading: (state) => ({ ...state, loading: true }),
  });
  const songbook = asyncSongbookDetails?.result?.data;

  const songPreviewList = isSongbookActive(asyncSongbookDetails?.result?.data)
    ? asyncSongbookDetails?.result?.data?.song_entries.slice(
        asyncSongbookDetails?.result?.data?.current_song_position - 1,
        asyncSongbookDetails?.result?.data?.current_song_position + 3
      )
    : asyncSongbookDetails?.result?.data.song_entries;

  useInterval(() => {
    if (!asyncSongbookDetails.loading) {
      asyncSongbookDetails.execute(sessionKey);
    }
  }, POLL_INTERVAL);

  return (
    <Container maxW="container.lg">
      <Heading>
        {!asyncSongbookDetails.result
          ? "Loading Song Preview..."
          : `${songbook?.title} (${songbook?.session_key})`}
      </Heading>
      {!asyncSongbookDetails.result ? (
        <Stack>
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
        </Stack>
      ) : (
        <Flex flexDirection="column" justifyContent="space-between">
          {(songPreviewList || []).map((entry, idx) => {
            const isHighlighted = idx === 0;
            const hasSongMemo = entry.song.song_memo.text !== "";
            const hasPendingSongMemo = entry.song.song_memo.text === "pending";
            const songMemoText = hasPendingSongMemo
              ? "Memo pending"
              : hasSongMemo
              ? entry.song.song_memo.text
              : "No memo";

            return (
              <Card
                key={entry.id}
                p="4"
                m="4"
                borderRadius="lg"
                bgColor={!isHighlighted ? "gray.100" : ""}
                height={isHighlighted ? "30vh" : "16vh"}
              >
                <Flex direction={"row"} justifyContent={"space-between"}>
                  <Heading size="lg" mb="4">
                    "{entry.song.title}" by {entry.song.artist}
                  </Heading>
                  {(!hasSongMemo || hasPendingSongMemo) && (
                    <Icon
                      as={hasPendingSongMemo ? FaFlag : FaRegFlag}
                      color="blue.300"
                      fontSize={"48px"}
                      onClick={async () => {
                        const result = await toggleSongMemoPending(
                          entry.song.id
                        );
                        if (typeof result === "string") {
                          toast({
                            title: "Error",
                            description: "Could not toggle pending memo",
                            status: "error",
                            duration: 9000,
                            isClosable: true,
                          });
                        } else {
                          asyncSongbookDetails.execute(sessionKey);
                        }
                      }}
                    />
                  )}
                </Flex>
                {hasSongMemo && !hasPendingSongMemo ? (
                  <Text fontSize="xl">{songMemoText}</Text>
                ) : (
                  <Text fontSize="xl" fontStyle="italic">
                    {songMemoText}
                  </Text>
                )}
              </Card>
            );
          })}
        </Flex>
      )}
    </Container>
  );
}
