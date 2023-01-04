import { Box, Flex, ListItem, Text, UnorderedList } from "@chakra-ui/react";
import { useAsync } from "react-async-hook";
import { Link } from "react-router-dom";
import { getAllSongbooks } from "../services/songs";
import SongbookIndexTable from "./SongbookIndexTable";

export default function WelcomePage() {
  const asyncSongbooks = useAsync(async () => getAllSongbooks(), []);
  const songbooks = asyncSongbooks.result?.data.results;
  return (
    <Box>
      <Text
        fontSize="3rem"
        align="center"
        fontFamily="Ubuntu Mono"
        color="blue.600"
        pt="2rem"
        pb="2rem"
      >
        livepowerhour.com
      </Text>
      <Flex justifyContent="center">
        <Flex justifyContent="center" direction="column">
          <Text
            mb="1rem"
            fontSize="2rem"
            color="gray.400"
            fontFamily="Ubuntu Mono"
          >
            Upcoming Features
          </Text>
          <UnorderedList mb="2rem">
            <ListItem>User Profile & Settings</ListItem>
            <ListItem>Access Playlists You Own</ListItem>
            <ListItem>Participation History & Stats</ListItem>
            <ListItem>Spotify & Shazam Integration</ListItem>
          </UnorderedList>
          <Text
            mb="1rem"
            fontSize="2rem"
            fontFamily="Ubuntu Mono"
            color="gray.400"
          >
            Your Songbooks
          </Text>
          <Text mb="1rem">
            <Link to={`/live/createsongbook/`}>+ Create a New Songbook</Link>
          </Text>
          <Text mb="1rem">
            <SongbookIndexTable songbooks={songbooks} />
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}
