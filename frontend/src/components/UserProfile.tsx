import {
  Button,
  Flex,
  Image,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useAsync } from "react-async-hook";
import { Link } from "react-router-dom";
import { getUserDetails } from "../services/songs";

export default function UserProfile() {
  const asyncUser = useAsync(getUserDetails, []);
  const user = asyncUser.result && asyncUser.result.data;
  const joinedDate =
    user && user.date_joined
      ? new Date(user?.date_joined)
      : new Date(Date.now());
  return (
    <>
      {user ? (
        <>
          <Flex direction="column" justifyContent="center">
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
          <Flex direction="column" alignItems="center">
            <Image
              referrerPolicy="no-referrer"
              src={user?.social.picture}
              rounded="100%"
            />
            <Text>
              {user?.first_name} {user?.last_name}
            </Text>
            <Text>{user?.email}</Text>
            <Text>Joined on {joinedDate.toDateString()}</Text>
            <Link to="/live">
              <Button mt="20px" colorScheme="blue">
                Back to Home
              </Button>
            </Link>
          </Flex>
        </>
      ) : (
        <>
          <Flex direction="column" alignItems="center" mt="70px">
            <Stack width="80%" alignSelf="center">
              <Skeleton height="50px" mt="20px" />
              <SkeletonCircle alignSelf="center" size="10" />
              <Skeleton height="20px" />
              <Skeleton height="20px" />
              <Skeleton height="20px" />
            </Stack>
          </Flex>
        </>
      )}
    </>
  );
}
