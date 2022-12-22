import { Box, Flex, ListItem, Text, UnorderedList } from "@chakra-ui/react";

export default function WelcomePage() {
  return (
    <Box>
      <Text
        fontSize="4rem"
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
          <Text fontSize="1.5rem" alignSelf="center">
            Is there an active power hour live at this time?
          </Text>
          <Text mb="4rem" fontSize="1.5rem" alignSelf="center">
            Check with the event host for QR code access.
          </Text>
          <Text mb="1rem" fontSize="2rem" color="gray.300">
            Upcoming features:
          </Text>
          <UnorderedList>
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
