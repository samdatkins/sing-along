import { WarningIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { AxiosResponse } from "axios";
import { useState } from "react";
import { UseAsyncReturn, useAsync } from "react-async-hook";
import { useNavigate } from "react-router-dom";
import { User } from "../models";
import { getAllSongbooks } from "../services/songs";
import CreateNewSongbook from "./CreateNewSongbook";
import SongbookIndexTable from "./SongbookIndexTable";
import UserProfile from "./UserProfile";

interface WelcomePageProps {
  asyncUser: UseAsyncReturn<false | AxiosResponse<User, any>, never[]>;
}

export default function WelcomePage({ asyncUser }: WelcomePageProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [sessionKey, setSessionKey] = useState<string>("");
  const asyncSongbooks = useAsync(async () => getAllSongbooks(), []);
  const songbooks = asyncSongbooks.result?.data.results;
  const activePowerHours = songbooks?.filter((songbook) => {
    const currentTime = new Date(Date.now()).getTime();
    const songbookTime = new Date(songbook["current_song_timestamp"]).getTime();
    return (
      songbook.is_noodle_mode === false &&
      (currentTime - songbookTime) / (1000 * 60 * 60) < 8
    );
  });
  const navigate = useNavigate();

  return (
    <>
      <Flex position="fixed" top="0px" right="0px">
        <UserProfile asyncUser={asyncUser} />
      </Flex>
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
          <Flex direction="column" mb="2rem">
            <Heading textAlign="center">Join a Power Hour:</Heading>
            <Flex direction="row">
              <Input
                value={sessionKey}
                mr="1rem"
                maxLength={4}
                onChange={(e) => setSessionKey(e.target.value.toUpperCase())}
              ></Input>
              <Button onClick={() => navigate(`/live/${sessionKey}`)}>
                Join
              </Button>
            </Flex>
          </Flex>
          {activePowerHours &&
            activePowerHours.map((songbook) => (
              <Button
                key={songbook.session_key}
                margin="2rem"
                leftIcon={<WarningIcon />}
                colorScheme="yellow"
                textAlign="center"
                onClick={() => navigate(`/live/${songbook.session_key}`)}
              >
                "{songbook.title}" is live!
              </Button>
            ))}
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
          <Button margin="2rem" colorScheme="blue" onClick={onOpen}>
            Create a New Songbook
          </Button>
        </Flex>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">Create a New Songbook</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CreateNewSongbook />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
