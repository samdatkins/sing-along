import {
  Avatar,
  Flex,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Switch,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { UseAsyncReturn } from "react-async-hook";
import { User } from "../models";
import {
  setUserColumnsDisplay,
  toggleUserChordsDisplay,
} from "../services/songs";

interface SettingsModalProps {
  asyncUser: UseAsyncReturn<false | AxiosResponse<User, any>, never[]>;
  isOpen: boolean;
  onClose: () => void;
}

const SettingModal = ({ asyncUser, isOpen, onClose }: SettingsModalProps) => {
  const user = asyncUser.result && asyncUser.result.data;
  const joinedDate =
    user && user.date_joined
      ? new Date(user?.date_joined)
      : new Date(Date.now());

  useEffect(() => {
    user && setShowingChords(user.userprofile.is_showing_chords);
    user && setColumns(user.userprofile.columns_to_display);
  }, [user]);

  const { colorMode, toggleColorMode } = useColorMode();
  const [showingChords, setShowingChords] = useState<boolean>(false);
  const [columns, setColumns] = useState<number>(1);

  const avatarBackgroundStyle = {
    color: useColorModeValue("white", "black"),
    bg: useColorModeValue("teal.500", "cyan.300"),
  };

  return user ? (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign="center">
          <Text>Settings</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" alignItems="center">
            <Avatar
              ml="5px"
              mr="10px"
              size="xl"
              referrerPolicy="no-referrer"
              {...avatarBackgroundStyle}
              name={`${user.first_name} ${user.last_name}`}
              src={user.social_auth?.[0]?.picture}
            />
            <Text>
              {user?.first_name} {user?.last_name}{" "}
            </Text>
            <Text>{user?.email}</Text>
            <Text mb="1rem">Joined on {joinedDate.toDateString()}</Text>
            <Flex direction="column" alignItems="space-between" width="200px">
              <Flex
                direction="row"
                margin="1rem"
                justifyContent="space-between"
              >
                <FormLabel htmlFor="show-chords" mb="0">
                  {showingChords && <>Showing chords</>}
                  {!showingChords && <>Hiding chords</>}
                </FormLabel>
                <Switch
                  id="show-chords"
                  isChecked={showingChords}
                  onChange={async () => {
                    const newChords = !showingChords;
                    setShowingChords(newChords);
                    await toggleUserChordsDisplay(newChords);
                    asyncUser.execute();
                  }}
                />
              </Flex>
              <Flex
                direction="row"
                margin="1rem"
                justifyContent="space-between"
              >
                <FormLabel htmlFor="number-of-columns" mb="0">
                  {columns === 1 && <>Single column</>}
                  {columns === 2 && <>Two columns</>}
                </FormLabel>
                <Switch
                  id="number-of-columns"
                  isChecked={columns > 1 && showingChords}
                  isDisabled={!showingChords}
                  onChange={async () => {
                    let newColumns: number;
                    if (columns > 1) {
                      newColumns = 1;
                    } else {
                      newColumns = 2;
                    }
                    setColumns(newColumns);
                    await setUserColumnsDisplay(newColumns);
                    asyncUser.execute();
                  }}
                />
              </Flex>
              <Flex
                direction="row"
                margin="1rem"
                justifyContent="space-between"
                mb="2rem"
              >
                <FormLabel htmlFor="night-mode" mb="0">
                  {colorMode === "light" && <>Day mode</>}
                  {colorMode === "dark" && <>Night mode</>}
                </FormLabel>
                <Switch
                  id="night-mode"
                  isChecked={colorMode !== "light"}
                  onChange={() => {
                    toggleColorMode();
                  }}
                />
              </Flex>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  ) : (
    <></>
  );
};
export default SettingModal;
