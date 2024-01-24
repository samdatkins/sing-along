import { HamburgerIcon, WarningIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { AxiosResponse } from "axios";
import { useState } from "react";
import { UseAsyncReturn, useAsync } from "react-async-hook";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import { RxLapTimer } from "react-icons/rx";
import { Link as RouterLink, useNavigate } from "react-router-dom";
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
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<HamburgerIcon />}
          variant="outline"
          m=".5rem"
        />
        <MenuList>
          <Flex direction="column">
            <Heading size="md" textAlign="center">
              Join a Sing-Along
            </Heading>
            <Flex direction="row">
              <Input
                value={sessionKey}
                width="8rem"
                m=".5rem"
                maxLength={4}
                onChange={(e) => setSessionKey(e.target.value.toUpperCase())}
              ></Input>
              <Button
                mt=".5rem"
                onClick={() => navigate(`/live/${sessionKey}`)}
              >
                Join
              </Button>
            </Flex>
          </Flex>
          <RouterLink to="../live/songbooks/true">
            <MenuItem icon={<BsFillJournalBookmarkFill />}>
              My Songbooks
            </MenuItem>
          </RouterLink>
          <RouterLink to="../live/songbooks/false">
            <MenuItem icon={<RxLapTimer />}>My Sing-Alongs</MenuItem>
          </RouterLink>
        </MenuList>
      </Menu>
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
