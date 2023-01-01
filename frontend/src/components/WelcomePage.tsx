import { Box, Flex, ListItem, Text, UnorderedList } from "@chakra-ui/react";
import { useAsync } from "react-async-hook";
import { Link } from "react-router-dom";
import { getAllSongbooks } from "../services/songs";

export default function WelcomePage() {
  const asyncSongbooks = useAsync(async () => getAllSongbooks(), []);
  const songbooks = asyncSongbooks.result?.data.results;
  return (
    <Box>
      <Text
        fontSize="2rem"
        backgroundColor="black"
        align="center"
        color="gray.200"
        pt="2rem"
        pb="2rem"
        mb="4rem"
      >
        🎸 LIVEPOWERHOUR.COM 🎶
      </Text>
      <Flex justifyContent="center">
        <Flex justifyContent="center" direction="column">
          <Text fontSize="1rem" alignSelf="center">
            Is there an active power hour live at this time?
          </Text>
          <Text mb="2rem" fontSize="1rem" alignSelf="center">
            Check with the event host for QR code access.
          </Text>
          <Text mb="1rem" fontSize="2rem" color="gray.400">
            Your Songbooks
          </Text>
          <UnorderedList mb="2rem">
            {songbooks &&
              songbooks.map(({ title, session_key }) => (
                <ListItem>
                  <Link to={`/live/${session_key}/`}>{title}</Link>
                </ListItem>
              ))}
          </UnorderedList>
          <Text mb="3rem">
            <Link to={`/live/createsongbook/`}>Create a New Songbook</Link>
          </Text>
          <Text mb="1rem" fontSize="2rem" color="gray.400">
            Upcoming Features:
          </Text>
          <UnorderedList mb="2rem">
            <ListItem>User Profile & Settings</ListItem>
            <ListItem>Access Playlists You Own</ListItem>
            <ListItem>Participation History & Stats</ListItem>
            <ListItem>Spotify & Shazam Integration</ListItem>
          </UnorderedList>
        </Flex>
      </Flex>
    </Box>
  );
}
