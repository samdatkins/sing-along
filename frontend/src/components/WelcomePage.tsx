import { HamburgerIcon, WarningIcon } from "@chakra-ui/icons";
import {
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { AxiosResponse } from "axios";
import { useState } from "react";
import { UseAsyncReturn } from "react-async-hook";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { SongbookListItem, User } from "../models";
import UserProfile from "./AvatarProfileLink";
import ViewAllSongbooks from "./ViewAllSongbooks";
import WishlistForm from "./WishlistForm";
import { isSongbookActive } from "../helpers/time";

interface WelcomePageProps {
  asyncUser: UseAsyncReturn<false | AxiosResponse<User, any>, never[]>;
  songbooks: SongbookListItem[] | undefined;
}

export default function WelcomePage({
  songbooks,
  asyncUser,
}: WelcomePageProps) {
  const [sessionKey, setSessionKey] = useState<string>("");
  const { colorMode, toggleColorMode } = useColorMode();
  const activeSingalongs = songbooks?.filter((songbook) => {
    return songbook.is_noodle_mode === false && isSongbookActive(songbook);
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
            <Flex direction="column" p=".5rem">
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
                />
                <Button
                  mt=".5rem"
                  onClick={() => navigate(`/live/${sessionKey}`)}
                >
                  Join
                </Button>
              </Flex>
            </Flex>
            <MenuItem
              icon={colorMode === "light" ? <MdDarkMode /> : <MdLightMode />}
              onClick={toggleColorMode}
            >
              {colorMode === "light" ? "Dark Mode" : "Light Mode"}
            </MenuItem>
          </MenuList>
        </Menu>

        <Text
          fontSize="2rem"
          fontFamily="Ubuntu Mono"
          color="blue.600"
          mb="1rem"
        >
          livepowerhour.com
        </Text>
        <UserProfile asyncUser={asyncUser} />
      </Flex>

      <Flex direction="column" alignItems="center" width="100%">
        {activeSingalongs && activeSingalongs.length > 0 && (
          <Flex direction="column">
            {activeSingalongs.map((songbook) => (
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
        )}
        <WishlistForm />
        <Divider my="1rem" />
        <ViewAllSongbooks />
      </Flex>
    </>
  );
}
