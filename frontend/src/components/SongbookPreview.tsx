import {
  Container,
  Flex,
  Heading,
  Skeleton,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { getSongbookDetails } from "../services/songs";
import { useAsync } from "react-async-hook";
import { useParams } from "react-router-dom";
import { useSongbookWebSocket } from "../hooks/useSongbookWebSocket";
import { isSongbookActive } from "../helpers/time";
import SongPreviewCard from "./SongPreviewCard";

export default function SongbookPreview() {
  const toast = useToast();
  const { sessionKey } = useParams();

  const asyncSongbookDetails = useAsync(getSongbookDetails, [sessionKey], {
    setLoading: (state) => ({ ...state, loading: true }),
  });

  const songbook = asyncSongbookDetails?.result?.data;
  const songPreviewList = isSongbookActive(songbook)
    ? songbook?.song_entries.slice(
        songbook.current_song_position - 1,
        songbook.current_song_position + 3
      )
    : songbook?.song_entries;

  useSongbookWebSocket({
    sessionKey,
    onMessage: () => {
      if (!asyncSongbookDetails.loading) {
        asyncSongbookDetails.execute(sessionKey);
      }
    },
  });

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
          {(songPreviewList || []).map((entry, idx) => (
            <SongPreviewCard
              key={entry.id}
              entry={entry}
              isHighlighted={idx === 0}
              onUpdate={() => asyncSongbookDetails.execute(sessionKey)} // Refresh data after update
              toast={toast}
            />
          ))}
        </Flex>
      )}
    </Container>
  );
}
