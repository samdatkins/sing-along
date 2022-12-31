import { Box, Heading, Link, ListItem, UnorderedList } from "@chakra-ui/react";
import { useAsync } from "react-async-hook";
import { useNavigate, useParams } from "react-router-dom";
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
          <Heading mb="2rem">{songbook.title}</Heading>
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
                (edit)
              </ListItem>
            ))}
          </UnorderedList>
        </>
      )}
    </Box>
  );
}
