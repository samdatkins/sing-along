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
import { UseAsyncReturn } from "react-async-hook";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import { FaListUl } from "react-icons/fa";
import { RxLapTimer } from "react-icons/rx";
import { Outlet, Link as RouterLink, useNavigate } from "react-router-dom";
import { User } from "../models";
import UserProfile from "./AvatarProfileLink";

interface WelcomePageProps {
  asyncUser: UseAsyncReturn<false | AxiosResponse<User, any>, never[]>;
  songbooks;
}

export default function WelcomePage({
  songbooks,
  asyncUser,
}: WelcomePageProps) {
  const [sessionKey, setSessionKey] = useState<string>("");
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
      <Flex
        width="100%"
        justifyContent="space-between"
        alignItems="baseline"
        mt="0"
      >
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
            <RouterLink to="/">
              <MenuItem icon={<FaListUl />}>My Wishlist</MenuItem>
            </RouterLink>
            <RouterLink to="songbooks">
              <MenuItem icon={<BsFillJournalBookmarkFill />}>
                My Songbooks
              </MenuItem>
            </RouterLink>
            <RouterLink to="sing-alongs">
              <MenuItem icon={<RxLapTimer />}>My Sing-Alongs</MenuItem>
            </RouterLink>
          </MenuList>
        </Menu>

        <Text
          fontSize="2rem"
          fontFamily="Ubuntu Mono"
          color="blue.600"
          pb="2rem"
        >
          livepowerhour.com
        </Text>
        <UserProfile asyncUser={asyncUser} />
        {/* This is currently where the add to wishlist lives: */}
      </Flex>

      <Flex direction="column" alignItems="center">
        <Flex direction="column" mb="2rem">
          {activeSingalongs &&
            activeSingalongs.map((songbook) => (
              <Button
                key={songbook.session_key}
                margin="1rem"
                leftIcon={<WarningIcon />}
                colorScheme="yellow"
                textAlign="center"
                fontSize={songbook.title.length < 21 ? "small" : "xs"}
                onClick={() => navigate(`/live/${songbook.session_key}`)}
              >
                "{songbook.title}" is live!
              </Button>
            ))}
        </Flex>
        <Outlet />
      </Flex>
    </>
  );
}
