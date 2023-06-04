import {
  Box,
  Button,
  Flex,
  FormLabel,
  Input,
  Switch,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNewSongbook } from "../services/songs";

export default function CreateNewSongbook() {
  const [maxSongs, setMaxSongs] = useState("");
  const [title, setTitle] = useState<string>("");
  const [actionVerb, setActionVerb] = useState<string>("DANCE");
  const [isNoodleMode, setIsNoodleMode] = useState<boolean>(false);
  const navigate = useNavigate();
  const parsedSongCap = parseInt(maxSongs);
  return (
    <Box padding="1rem">
      <form>
        <FormLabel>Songbook Title:</FormLabel>
        <Input
          value={title}
          mb="1rem"
          onChange={(e) =>
            e.target.value.length <= 40 && setTitle(e.target.value)
          }
        />
        <FormLabel>Song Cap (optional):</FormLabel>
        <Input
          value={maxSongs}
          width="70px"
          mb="1rem"
          onChange={(e) => {
            e.target.value.length < 4 && setMaxSongs(e.target.value);
          }}
        />
        <FormLabel>Action Verb:</FormLabel>
        <Input
          mb="1rem"
          disabled
          defaultValue={actionVerb}
          onChange={(e) => {
            e.target.value.length < 9 && setActionVerb(e.target.value);
          }}
        />

        <Flex
          direction="row"
          justifyContent="space-between"
          mb="1rem"
          mt="1rem"
        >
          <FormLabel htmlFor="night-mode" mb="0">
            <Text>
              Songbook Type:{" "}
              {isNoodleMode ? (
                <span>Noodle Mode</span>
              ) : (
                <span>Power Hour</span>
              )}
            </Text>
          </FormLabel>
          <Switch
            id="noodle-mode"
            isChecked={isNoodleMode}
            onChange={() => {
              setIsNoodleMode(!isNoodleMode);
            }}
          />
        </Flex>
        <Flex justifyContent="center">
          <Button
            disabled={
              title.length < 1 || (maxSongs.length > 0 && isNaN(parsedSongCap))
            }
            onClick={async (e) => {
              e.preventDefault();
              const result = await createNewSongbook(
                maxSongs,
                title,
                isNoodleMode,
              );
              if (result !== false) {
                navigate(`/live/${result.data.session_key}`);
              } else {
                console.log("Couldn't create new songbook.");
              }
            }}
            mt="1rem"
          >
            Create Songbook
          </Button>
        </Flex>
      </form>
    </Box>
  );
}
