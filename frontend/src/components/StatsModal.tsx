import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Progress,
  useColorModeValue,
} from "@chakra-ui/react";
import QRCode from "react-qr-code";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionKey: string;
  songbookTitle: string;
  totalSongs: number;
}

const StatsModal = ({
  isOpen,
  onClose,
  sessionKey,
  songbookTitle,
  totalSongs,
}: StatsModalProps) => {
  const addSongUrl = window.location.origin + `/live/${sessionKey}/add-song`;

  // const songbookStats = useAsync(getSongbookStats(sessionKey), [], {
  //   setLoading: (state) => ({ ...state, loading: true }),
  // });
  const songbookStats = [
    {
      user: {
        id: 2,
        first_name: "David",
        last_name: "Bowie",
        social_auth: [
          {
            picture: "/bowie.jpg",
          },
        ],
      },
      songs_requested: 38,
    },
    {
      user: {
        id: 3,
        first_name: "Annie",
        last_name: "Lennox",
        social_auth: [
          {
            picture: "/lennox.jpg",
          },
        ],
      },
      songs_requested: 14,
    },
    {
      user: {
        id: 1,
        first_name: "Prince",
        last_name: "Formerly",
        social_auth: [
          {
            picture: "/prince.jpg",
          },
        ],
      },
      songs_requested: 27,
    },
    {
      user: {
        id: 12,
        first_name: "Cyndi",
        last_name: "Lauper",
        social_auth: [
          {
            picture: "/lauper.jpg",
          },
        ],
      },
      songs_requested: 0,
    },
    {
      user: {
        id: 33,
        first_name: "Rivers",
        last_name: "Cuomo",
        social_auth: [
          {
            picture: "/cuomo.jpg",
          },
        ],
      },
      songs_requested: 6,
    },
    {
      user: {
        id: 66,
        first_name: "Billy",
        last_name: "Corgan",
        social_auth: [
          {
            picture: "/corgan.jpg",
          },
        ],
      },
      songs_requested: 12,
    },
    {
      user: {
        id: 34,
        first_name: "Angel",
        last_name: "Olsen",
        social_auth: [
          {
            picture: "/olsen.jpg",
          },
        ],
      },
      songs_requested: 5,
    },
    {
      user: {
        id: 44,
        first_name: "Stephen",
        last_name: "Malkmus",
        social_auth: [
          {
            picture: "",
          },
        ],
      },
      songs_requested: 7,
    },
    {
      user: {
        id: 55,
        first_name: "Gwen",
        last_name: "Stefani",
        social_auth: [
          {
            picture: "/stefani.jpg",
          },
        ],
      },
      songs_requested: 19,
    },
  ];

  const avatarBackgroundStyle = {
    color: useColorModeValue("white", "black"),
    bg: useColorModeValue("teal.500", "cyan.300"),
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <Heading textAlign="center" margin="1rem">
              {songbookTitle}
            </Heading>
            <Flex direction="column" alignItems="center">
              <Flex direction="row" alignItems="center">
                <Heading
                  size="4xl"
                  margin="1rem"
                  mr="3rem"
                  fontFamily="Ubuntu Mono"
                  textAlign="center"
                >
                  {sessionKey}
                </Heading>
                <Flex
                  bgColor="white"
                  width="166px"
                  justifyContent="center"
                  border="8px solid white"
                  margin="1rem"
                  mb="3rem"
                >
                  <QRCode size={150} value={addSongUrl} />
                </Flex>
                <Heading
                  size="xl"
                  margin="1rem"
                  ml="3rem"
                  fontFamily="Ubuntu Mono"
                  textAlign="center"
                >
                  {totalSongs} {totalSongs === 1 ? `song` : `songs`}
                </Heading>
              </Flex>
            </Flex>

            <Accordion defaultIndex={[0]} allowMultiple>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box as="span" flex="1" textAlign="left">
                      <Heading size="lg">Songbook Members</Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Grid templateColumns="repeat(5, 1fr)" gap={1}>
                    {songbookStats &&
                      songbookStats.length &&
                      songbookStats.map((userStats) => {
                        return (
                          <GridItem key={userStats.user.id}>
                            <Flex
                              margin="5px"
                              padding="10px"
                              width="95%"
                              direction="row"
                              justifyContent="baseline"
                              alignItems="center"
                            >
                              <Avatar
                                ml="5px"
                                mr="10px"
                                {...avatarBackgroundStyle}
                                name={`${
                                  userStats.user.first_name
                                } ${userStats.user.last_name.substring(0, 1)}`}
                                src={userStats.user.social_auth[0].picture}
                              />{" "}
                              <Heading
                                size="sm"
                                verticalAlign="center"
                                ml="5px"
                              >
                                {userStats.user.first_name}{" "}
                                {userStats.user.last_name.substring(0, 1)}.
                              </Heading>
                            </Flex>
                          </GridItem>
                        );
                      })}
                  </Grid>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box as="span" flex="1" textAlign="left">
                      <Heading size="lg">Requests Leaderboard</Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} justifyContent="center">
                  {songbookStats &&
                    songbookStats.length &&
                    songbookStats.map((stat, idx) => {
                      return stat.songs_requested > 0 ? (
                        <Flex
                          direction="row"
                          justifyContent="center"
                          alignItems="center"
                          margin="1rem"
                          width="100%"
                          key={idx}
                        >
                          <Flex
                            width="15%"
                            justifyContent="baseline"
                            alignItems="center"
                          >
                            <Avatar
                              ml="5px"
                              mr="10px"
                              {...avatarBackgroundStyle}
                              name={`${
                                stat.user.first_name
                              } ${stat.user.last_name.substring(0, 1)}`}
                              src={stat.user.social_auth[0].picture}
                            />{" "}
                            <Heading size="sm" verticalAlign="center" ml="5px">
                              {stat.user.first_name}{" "}
                              {stat.user.last_name.substring(0, 1)}.
                            </Heading>
                          </Flex>
                          <Heading
                            size="sm"
                            width="10%"
                            verticalAlign="center"
                            textAlign="center"
                            fontFamily="Ubuntu Mono"
                          >
                            {stat.songs_requested}
                          </Heading>
                          <Flex width={totalSongs * 8} justifyContent="center">
                            <Progress
                              ml="1rem"
                              mr="1rem"
                              width={totalSongs * 8}
                              value={stat.songs_requested}
                            />
                          </Flex>
                          <Heading
                            size="sm"
                            width="10%"
                            verticalAlign="center"
                            textAlign="center"
                            fontFamily="Ubuntu Mono"
                          >
                            {Math.round(
                              (stat.songs_requested / totalSongs) * 100,
                            )}
                            %
                          </Heading>
                        </Flex>
                      ) : (
                        <span key={idx}></span>
                      );
                    })}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default StatsModal;
