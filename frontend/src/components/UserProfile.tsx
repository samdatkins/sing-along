import { Avatar, Button, Center, Flex, Text } from "@chakra-ui/react";
import { useAsync } from "react-async-hook";
import { Link } from "react-router-dom";
import { getUserDetails } from "../services/songs";

export default function UserProfile() {
  const asyncUser = useAsync(async () => getUserDetails(), []);
  const user = asyncUser.result && asyncUser.result.data;
  const joinedDate =
    user && user.date_joined
      ? new Date(user?.date_joined)
      : new Date(Date.now());
  return (
    <>
      {user ? (
        <>
          <Flex direction="row" justifyContent="center">
            <Text
              fontSize="3rem"
              align="center"
              fontFamily="Ubuntu Mono"
              color="blue.600"
              pt="2rem"
              pb="2rem"
            >
              {user?.first_name} {user?.last_name}'s Profile
            </Text>
          </Flex>
          <Center>
            <Avatar
              referrerPolicy="no-referrer"
              size="xl"
              name={`${user?.first_name} ${user?.last_name}`}
              src={user?.social.picture}
            />
          </Center>
          <Center>{user?.email}</Center>
          <Center>Member since {joinedDate.toDateString()}</Center>
          <Center>
            <Link to="/live">
              <Button mt="20px" colorScheme="blue">
                Back to Home
              </Button>
            </Link>
          </Center>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
