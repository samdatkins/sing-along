import { WarningIcon } from "@chakra-ui/icons";
import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import { useAsync } from "react-async-hook";
import { Link, useNavigate } from "react-router-dom";
import { getAllSongbooks, getUserDetails } from "../services/songs";
import SongbookIndexTable from "./SongbookIndexTable";

export default function WelcomePage() {
  const asyncSongbooks = useAsync(async () => getAllSongbooks(), []);
  const songbooks = asyncSongbooks.result?.data.results;
  const asyncUser = useAsync(async () => getUserDetails(), []);
  const user = asyncUser.result && asyncUser.result.data;
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
          {user && <Heading size="md">Welcome, {user?.first_name}!</Heading>}
          <Link to={`/live/profile/`}>
            <Button margin="1rem" colorScheme="blue">
              Profile
            </Button>
          </Link>
          {activePowerHours &&
            activePowerHours.map((songbook) => (
              <Button
                key={songbook.session_key}
                margin="1rem"
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
