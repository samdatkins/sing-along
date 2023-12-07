import { WarningIcon } from "@chakra-ui/icons";
import { Button, Flex, Heading, Input, Text } from "@chakra-ui/react";
import { AxiosResponse } from "axios";
import { useState } from "react";
import { UseAsyncReturn, useAsync } from "react-async-hook";
import { useNavigate } from "react-router-dom";
import { User } from "../models";
import { getAllSongbooks } from "../services/songs";
import UserProfile from "./AvatarProfileLink";
import SongbookIndexTable from "./SongbookIndexTable";

interface WelcomePageProps {
  asyncUser: UseAsyncReturn<false | AxiosResponse<User, any>, never[]>;
}

export default function WelcomePage({ asyncUser }: WelcomePageProps) {
  const [sessionKey, setSessionKey] = useState<string>("");
  const asyncSongbooks = useAsync(async () => getAllSongbooks(), []);
  const songbooks = asyncSongbooks.result?.data.results;
  const activeSingalongs = songbooks?.filter((songbook) => {
    const currentTime = new Date(Date.now()).getTime();
    const songbookTime = new Date(songbook.created_at).getTime();
    return (
      songbook.is_noodle_mode === false &&
      (currentTime - songbookTime) / (1000 * 60 * 60) < 8
    );
  });
  const navigate = useNavigate();

  return (
    <>
      <Flex position="fixed" top="0" right="0">
        <UserProfile asyncUser={asyncUser} />
      </Flex>
      <Flex justifyContent="center" width="100%">
        <Flex alignItems="center" direction="column" width="100%">
          <Text
            fontSize="2rem"
            fontFamily="Ubuntu Mono"
            color="blue.600"
            pt="2rem"
            pb="2rem"
          >
            livepowerhour.com
          </Text>
          <Flex direction="column" mb="2rem">
            <Heading textAlign="center">Join a Sing-Along</Heading>
            <Flex direction="row">
              <Input
                value={sessionKey}
                mr="1rem"
                mt="1rem"
                maxLength={4}
                onChange={(e) => setSessionKey(e.target.value.toUpperCase())}
              ></Input>
              <Button mt="1rem" onClick={() => navigate(`/live/${sessionKey}`)}>
                Join
              </Button>
            </Flex>
          </Flex>
          {activeSingalongs &&
            activeSingalongs.map((songbook) => (
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
          <SongbookIndexTable songbooks={songbooks} />
        </Flex>
      </Flex>
    </>
  );
}
