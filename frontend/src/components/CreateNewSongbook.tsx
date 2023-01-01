import { Box, Button, Checkbox, Heading, Input, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNewSongbook } from "../services/songs";

export default function CreateNewSongbook() {
  const [key, setKey] = useState("");
  const [maxSongs, setMaxSongs] = useState("");
  const [title, setTitle] = useState("");
  const [noodleMode, setNoodleMode] = useState(false);
  const navigate = useNavigate();
  const parsedSongCap = parseInt(maxSongs);
  return (
    <Box padding="2rem">
      <Heading size="lg" mb="3rem">
        Create a New Songbook:
      </Heading>
      <form>
        <Text mb="1rem">
          Title (<i>displays on songbook</i>):
          <Input
            value={title}
            onChange={(e) =>
              e.target.value.length <= 40 && setTitle(e.target.value)
            }
          />
        </Text>
        <Text mb="1rem">
          Session Key (<i>alphanumeric plus dashes</i>):
          <Input
            value={key}
            onChange={(e) =>
              e.target.value.length <= 20 && setKey(e.target.value)
            }
          />
        </Text>
        <Text mb="1rem">
          Max Songs (<i>leave blank for no max</i>):
          <Input
            value={maxSongs}
            onChange={(e) => setMaxSongs(e.target.value)}
          />
        </Text>
        <Text mb="1rem">
          Action Verb (<i>coming soon</i>):
          <Input disabled defaultValue={"DANCE"} />
        </Text>
        <Text mb="1rem">
          Noodle Mode:{" "}
          <Checkbox
            checked={noodleMode}
            onChange={(e) => setNoodleMode(e.target.checked)}
          />
        </Text>
        <Button
          disabled={
            key.length < 1 ||
            title.length < 1 ||
            (maxSongs.length > 0 && isNaN(parsedSongCap))
          }
          onClick={async (e) => {
            e.preventDefault();
            const result = await createNewSongbook(
              key,
              maxSongs,
              title,
              noodleMode,
            );
            if (result === true) {
              navigate(`/live/${key}`);
            } else {
              console.log("Couldn't create new songbook.");
            }
          }}
          mt="1rem"
        >
          Create Songbook
        </Button>
      </form>
    </Box>
  );
}
