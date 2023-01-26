import {
  Box,
  Button,
  Heading,
  Icon,
  Link,
  ListItem,
  UnorderedList,
} from "@chakra-ui/react";
import { useAsync } from "react-async-hook";
import { FaEdit } from "react-icons/fa";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { getSongbookDetails, setSongbookSong } from "../services/songs";

export default function SongbookList() {
  const { sessionKey } = useParams();
  const navigate = useNavigate();
  const asyncSongbook = useAsync(
    async () => getSongbookDetails(sessionKey),
    [],
  );
  const songbook = asyncSongbook.result?.data;
  return (
    <Box margin="3rem">
      {songbook && (
        <>
          <Heading mb="2rem" fontFamily="Ubuntu Mono">
            Song List for{" "}
            <RouterLink to={`../live/${sessionKey}/`}>
              {songbook.title}
            </RouterLink>
          </Heading>
          <RouterLink to={`../live/${sessionKey}/`}>
            <Button colorScheme="blue" mb="2rem">
              Back to Songbook
            </Button>
          </RouterLink>
          <UnorderedList>
            {songbook.song_entries.map((entry) => (
              <ListItem key={entry.id}>
                <Link
                  onClick={async () => {
                    const result = await setSongbookSong(
                      sessionKey,
                      entry.created_at,
                    );
                    if (result) {
                      navigate(`/live/${sessionKey}/`);
                    }
                  }}
                >
                  "{entry.song.title}" by {entry.song.artist}
                </Link>{" "}
                <RouterLink to={`../admin/api/song/${entry.song.id}/change/`}>
                  <Icon as={FaEdit} />
                </RouterLink>
              </ListItem>
            ))}
          </UnorderedList>
        </>
      )}
    </Box>
  );
}
