import { Box, Button, Center, Flex, Text } from "@chakra-ui/react";
import { useAsync } from "react-async-hook";
import { Link } from "react-router-dom";
import { getAllSongbooks, getUserDetails } from "../services/songs";
import SongbookIndexTable from "./SongbookIndexTable";

export default function WelcomePage() {
  const asyncSongbooks = useAsync(async () => getAllSongbooks(), []);
  const songbooks = asyncSongbooks.result?.data.results;
  const asyncUser = useAsync(async () => getUserDetails(), []);
  const user = asyncUser.result && asyncUser.result.data;
  return (
    <Box>
      <Text
        fontSize="3rem"
        align="center"
        fontFamily="Ubuntu Mono"
        color="blue.600"
        pt="1rem"
        pb="1rem"
      >
        livepowerhour.com
      </Text>
      {user && <Center>Welcome, {user?.first_name}!</Center>}
      <Center>
        <Link to={`/live/profile/`}>
          <Button colorScheme="blue" m="1rem">
            Your Profile
          </Button>
        </Link>
      </Center>
      <Flex justifyContent="center">
        <Flex alignItems="center" direction="column">
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
            <Button colorScheme="blue">Create a New Songbook</Button>
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
}
