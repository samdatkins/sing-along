import {
  Flex,
  FormLabel,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SkeletonCircle,
  Switch,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAsync } from "react-async-hook";
import {
  getUserDetails,
  setUserColumnsDisplay,
  toggleUserChordsDisplay,
} from "../services/songs";

export default function UserProfile() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const asyncUser = useAsync(getUserDetails, []);
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

  return (
    <>
      {user ? (
        <Image
          referrerPolicy="no-referrer"
          src={user?.social.picture}
          position="fixed"
          top="0px"
          right="0px"
          rounded="100%"
          margin="1rem"
          height="75px"
          cursor="pointer"
          onClick={onOpen}
        />
      ) : (
        <SkeletonCircle alignSelf="center" margin="1rem" size="20" />
      )}

      {user && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader textAlign="center">
              <Heading>Your Preferences</Heading>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex direction="column" alignItems="center">
                <Text>
                  {user?.first_name} {user?.last_name}{" "}
                </Text>
                <Text>{user?.email}</Text>
                <Text mb="1rem">Joined on {joinedDate.toDateString()}</Text>
                <Flex
                  direction="column"
                  alignItems="space-between"
                  width="200px"
                >
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
      )}
    </>
  );
}
