import { Alert, AlertIcon, Button, Center, Flex, Text } from "@chakra-ui/react";
import { useAsync } from "react-async-hook";
import { Link, useNavigate } from "react-router-dom";
import { getAllSongbooks, getUserDetails } from "../services/songs";
import SongbookIndexTable from "./SongbookIndexTable";

export default function WelcomePage() {
  const asyncSongbooks = useAsync(async () => getAllSongbooks(), []);
  const songbooks = asyncSongbooks.result?.data.results;
  const asyncUser = useAsync(async () => getUserDetails(), []);
  const user = asyncUser.result && asyncUser.result.data;
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
          {user && <Center>Welcome, {user?.first_name}!</Center>}
          <Alert
            status="warning"
            margin="1rem"
            justifyContent="center"
            cursor="pointer"
            onClick={() => navigate("/live/sams-test")}
          >
            <AlertIcon />
            Click here to return to your active power hour!
          </Alert>
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
    </>
  );
}
