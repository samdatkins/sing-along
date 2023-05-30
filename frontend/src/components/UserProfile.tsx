import {
  Button,
  Flex,
  FormLabel,
  Heading,
  Image,
  Skeleton,
  SkeletonCircle,
  Stack,
  Switch,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAsync } from "react-async-hook";
import { Link } from "react-router-dom";
import {
  getUserDetails,
  toggleUserChordsDisplay,
  toggleUserColumnsDisplay,
} from "../services/songs";

export default function UserProfile() {
  const asyncUser = useAsync(getUserDetails, []);
  const user = asyncUser.result && asyncUser.result.data;
  const joinedDate =
    user && user.date_joined
      ? new Date(user?.date_joined)
      : new Date(Date.now());
  const newUserProperties = {
    is_night_mode: false,
    is_showing_chords: true,
    columns_to_display: 2,
  };
  const { colorMode, toggleColorMode } = useColorMode();
  const [showingChords, setShowingChords] = useState<boolean>(
    newUserProperties.is_showing_chords,
  );
  const [columns, setColumns] = useState<number>(
    newUserProperties.columns_to_display,
  );

  const handleColumnSwitch = () => {
    console.log("fired columns");
    toggleUserColumnsDisplay(columns);
  };
  const handleChordSwitch = () => {
    console.log("fired chords");
    toggleUserChordsDisplay(showingChords);
  };

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
            <Heading margin="1rem" mt="2rem" textAlign="center" size="lg">
              Preferences
            </Heading>
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
                    setShowingChords(!showingChords);
                    handleChordSwitch();
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
                    if (columns > 1) {
                      setColumns(1);
                    } else {
                      setColumns(2);
                    }
                    handleColumnSwitch();
                  }}
                />
              </Flex>
              <Flex
                direction="row"
                margin="1rem"
                justifyContent="space-between"
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
