import {
  Box,
  Button,
  Flex,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function UserProfile() {
  return (
    <>
      <Text
        fontSize="3rem"
        align="center"
        fontFamily="Ubuntu Mono"
        color="blue.600"
        pt="2rem"
        pb="2rem"
      >
        Your User Profile
      </Text>
      <Flex justifyContent="center">
        <Box>
          <Text mb="1rem" fontFamily="Ubuntu Mono" fontSize="1.5rem">
            Upcoming personalizations:
          </Text>
          <UnorderedList mb="2rem" alignItems="center">
            <ListItem>Toggle Night Mode</ListItem>
            <ListItem>Toggle Chord Display</ListItem>
            <ListItem>Set 1, 2, or 3 Columns</ListItem>
            <ListItem>Your Requested Songs</ListItem>
            <ListItem>Your Songbooks</ListItem>
          </UnorderedList>
          <Flex justifyContent="center">
            <Link to="/live">
              <Button colorScheme="blue">Back to Home</Button>
            </Link>
          </Flex>
        </Box>
      </Flex>
    </>
  );
}
