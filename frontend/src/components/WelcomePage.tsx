import { WarningIcon } from "@chakra-ui/icons";
import { Button, Flex, Heading, Input, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useAsync } from "react-async-hook";
import { Link, useNavigate } from "react-router-dom";
import { getAllSongbooks } from "../services/songs";
import SongbookIndexTable from "./SongbookIndexTable";

export default function WelcomePage() {
  const [sessionKey, setSessionKey] = useState<string>("");
  const asyncSongbooks = useAsync(async () => getAllSongbooks(), []);
  const songbooks = asyncSongbooks.result?.data.results;
  const activePowerHours = songbooks?.filter((songbook) => {
    const currentTime = new Date(Date.now()).getTime();
    const songbookTime = new Date(songbook["current_song_timestamp"]).getTime();
    return (
      songbook.is_noodle_mode === false &&
      (currentTime - songbookTime) / (1000 * 60 * 60) < 8
    );
  });
  const navigate = useNavigate();

  return (
    <>
      <Flex justifyContent="center">
        <Flex alignItems="center" direction="column">
          <Text
            fontSize="3rem"
            fontFamily="Ubuntu Mono"
            color="blue.600"
            pt="2rem"
            pb="2rem"
          >
            livepowerhour.com
          </Text>
          <Flex direction="column" mb="2rem">
            <Heading textAlign="center">Join a Power Hour:</Heading>
            <Flex direction="row">
              <Input
                value={sessionKey}
                mr="1rem"
                onChange={(e) => setSessionKey(e.target.value)}
              ></Input>
              <Button onClick={() => navigate(`/live/${sessionKey}`)}>
                Join
              </Button>
            </Flex>
          </Flex>
          {activePowerHours &&
            activePowerHours.map((songbook) => (
              <Button
                key={songbook.session_key}
                margin="2rem"
                leftIcon={<WarningIcon />}
                colorScheme="yellow"
                textAlign="center"
                onClick={() => navigate(`/live/${songbook.session_key}`)}
              >
                "{songbook.title}" is live!
              </Button>
            ))}
          <Text
            mb="1rem"
            fontSize="2rem"
            fontFamily="Ubuntu Mono"
            color="gray.400"
            justifyContent="center"
          >
            Your Songbooks
          </Text>
          <SongbookIndexTable songbooks={songbooks} />
          <Link to={`/live/createsongbook/`}>
            <Button margin="2rem" colorScheme="blue">
              Create a New Songbook
            </Button>
          </Link>
        </Flex>
      </Flex>
    </>
  );
}
