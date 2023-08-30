import {
  Avatar,
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
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorModeValue,
} from "@chakra-ui/react";
import { useAsync } from "react-async-hook";
import QRCode from "react-qr-code";
import { Member } from "../models";
import { getSongbookStats } from "../services/songs";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionKey: string;
  songbookTitle: string;
  totalSongs: number;
  membersList: Member[];
}

const StatsModal = ({
  isOpen,
  onClose,
  sessionKey,
  songbookTitle,
  totalSongs,
  membersList,
}: StatsModalProps) => {
  const addSongUrl = window.location.origin + `/live/${sessionKey}/add-song`;

  const asyncSongbookStats = useAsync(getSongbookStats, [sessionKey], {
    setLoading: (state) => ({ ...state, loading: true }),
  });
  const songbookStats = asyncSongbookStats?.result?.data;
  const topRequestScore =
    songbookStats && songbookStats.length
      ? songbookStats[0].songs_requested
      : 1;

  const avatarBackgroundStyle = {
    color: useColorModeValue("white", "black"),
    bg: useColorModeValue("teal.500", "cyan.300"),
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="7xl">
        <ModalOverlay />
        <ModalContent minH="90vh">
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
            <Tabs variant="soft-rounded" colorScheme="blue" mt="20px">
              <TabList justifyContent="center">
                <Tab>Songbook Members</Tab>
                <Tab>Requests Leaderboard</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Grid templateColumns="repeat(5, 1fr)" gap={1}>
                    {(membersList?.length || 0) > 0 &&
                      membersList?.map((member) => {
                        return (
                          <GridItem key={member.user.id}>
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
                                referrerPolicy="no-referrer"
                                {...avatarBackgroundStyle}
                                name={`${member.user.first_name} ${member.user.last_initial}`}
                                src={member.user.social_auth?.[0]?.picture}
                              />{" "}
                              <Heading
                                size="md"
                                verticalAlign="center"
                                ml="5px"
                              >
                                {member.user.first_name}{" "}
                                {member.user.last_initial}.
                              </Heading>
                            </Flex>
                          </GridItem>
                        );
                      })}
                  </Grid>
                </TabPanel>
                <TabPanel>
                  {(songbookStats?.length || 0) > 0 &&
                    songbookStats?.map((stat, idx) => {
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
                              referrerPolicy="no-referrer"
                              {...avatarBackgroundStyle}
                              name={`${stat.user.first_name} ${stat.user.last_initial}`}
                              src={stat.user.social_auth?.[0]?.picture}
                            />{" "}
                            <Heading size="md" verticalAlign="center" ml="5px">
                              {stat.user.first_name} {stat.user.last_initial}.
                            </Heading>
                          </Flex>
                          <Heading
                            size="md"
                            width="20%"
                            verticalAlign="center"
                            textAlign="center"
                            fontFamily="Ubuntu Mono"
                          >
                            {stat.songs_requested}{" "}
                            {stat.songs_requested === 1 ? `song` : `songs`}
                          </Heading>
                          <Flex width="85%" justifyContent="center">
                            <Progress
                              ml="1rem"
                              mr="1rem"
                              width="100%"
                              colorScheme="blue"
                              value={
                                (stat.songs_requested / topRequestScore) * 100
                              }
                            />
                          </Flex>
                        </Flex>
                      ) : (
                        <span key={idx}></span>
                      );
                    })}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default StatsModal;
