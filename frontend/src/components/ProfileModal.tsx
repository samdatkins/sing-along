import {
  Flex,
  FormLabel,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Switch,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { User } from "../models";
import {
  setUserColumnsDisplay,
  toggleUserChordsDisplay,
} from "../services/songs";

interface ProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ user, isOpen, onClose }: ProfileModalProps) => {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign="center">
          <Text>Profile & Settings</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" alignItems="center">
            <Image
              referrerPolicy="no-referrer"
              src={user?.social.picture}
              rounded="100%"
              height="75px"
              mb="1rem"
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
                  onChange={() => {
                    const newChords = !showingChords;
                    toggleUserChordsDisplay(newChords);
                    setShowingChords(newChords);
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
                  isChecked={columns > 1}
                  onChange={() => {
                    let newColumns: number;
                    if (columns > 1) {
                      newColumns = 1;
                    } else {
                      newColumns = 2;
                    }
                    setUserColumnsDisplay(newColumns);
                    setColumns(newColumns);
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
  );
};
export default ProfileModal;
