import {
  Avatar,
  Card,
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
} from "@chakra-ui/react";
import QRCode from "react-qr-code";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionKey: string;
  songbookTitle: string;
}

const StatsModal = ({
  isOpen,
  onClose,
  sessionKey,
  songbookTitle,
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
      songs_requested: 99,
    },

    {
      user: {
        id: 33,
        first_name: "Angel",
        last_name: "Olsen",
        social_auth: [
          {
            picture: "/olsen.jpg",
          },
        ],
      },
      songs_requested: 99,
    },
    {
      user: {
        id: 44,
        first_name: "Stephen",
        last_name: "Malkmus",
        social_auth: [
          {
            picture: "/malkmus.jpg",
          },
        ],
      },
      songs_requested: 99,
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
      songs_requested: 99,
    },
  ];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <Heading textAlign="center" margin="1rem">
              {songbookTitle}
            </Heading>
            <Flex direction="column" alignItems="center">
              <Flex
                bgColor="white"
                width="166px"
                justifyContent="center"
                border="8px solid white"
                margin="1rem"
              >
                <QRCode size={150} value={addSongUrl} />
              </Flex>
              <Heading
                size="2xl"
                margin="1rem"
                fontFamily="Ubuntu Mono"
                textAlign="center"
              >
                {sessionKey}
              </Heading>
              <Grid templateColumns="repeat(3, 1fr)" margin="1rem">
                {songbookStats &&
                  songbookStats.length &&
                  songbookStats.map((stat) => {
                    return (
                      <GridItem key={stat.user.id}>
                        <Card
                          margin="5px"
                          padding="10px"
                          width="95%"
                          colorScheme="blue"
                          variant="filled"
                        >
                          <Flex
                            direction="row"
                            justifyContent="baseline"
                            alignItems="center"
                          >
                            <Avatar
                              ml="5px"
                              mr="10px"
                              src={stat.user.social_auth[0].picture}
                            />{" "}
                            <Heading size="sm" verticalAlign="center">
                              {stat.user.first_name} requested{" "}
                              {stat.songs_requested} songs!
                            </Heading>
                          </Flex>
                        </Card>
                      </GridItem>
                    );
                  })}
              </Grid>
            </Flex>
          </ModalBody>

          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default StatsModal;
