import {
  Avatar,
  AvatarGroup,
  Card,
  Flex,
  Heading,
  Kbd,
  SimpleGrid,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import { RxLapTimer } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import CreateNewSongbook from "./CreateEditSongbook";
import WishlistForm from "./WishlistForm";

export default function SongbookIndexTable({ songbooks }) {
  const navigate = useNavigate();
  dayjs.extend(relativeTime);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const avatarBackgroundStyle = {
    color: useColorModeValue("white", "black"),
    bg: useColorModeValue("teal.500", "cyan.300"),
  };

  const renderSongbooks = (displayNoodle) => {
    if (!songbooks) {
      return (
        <SimpleGrid columns={[1, 2, 3]} spacing="10px" maxW="900px">
          <Skeleton height="250px" padding="20px" width="250px" />
          <Skeleton height="250px" padding="20px" width="250px" />
          <Skeleton height="250px" padding="20px" width="250px" />
        </SimpleGrid>
      );
    } else {
      return (
        <SimpleGrid
          columns={[1, 2, 3]}
          spacing="10px"
          maxW="900px"
          justifyItems="center"
        >
          <Card
            padding="20px"
            width="250px"
            height="250px"
            alignItems="center"
            justifyContent="center"
            onClick={onOpen}
            cursor="pointer"
          >
            <Heading size="2xl">+</Heading>
          </Card>
          {songbooks
            ?.filter((songbook) => songbook.is_noodle_mode === displayNoodle)
            .map((songbook, idx) => {
              return (
                <Card
                  padding="20px"
                  width="250px"
                  height="250px"
                  key={idx}
                  onClick={() => {
                    navigate(`/live/${songbook.session_key}/`);
                  }}
                  cursor="pointer"
                >
                  <Flex
                    direction="column"
                    alignItems="center"
                    justifyContent="flex-start"
                  >
                    {songbook.is_noodle_mode ? (
                      <>
                        <Tooltip label="songbook">
                          <span>
                            <BsFillJournalBookmarkFill size="30px" />
                          </span>
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip label="sing-along">
                        <span>
                          <RxLapTimer size="30px" />
                        </span>
                      </Tooltip>
                    )}
                  </Flex>
                  <Heading size="md" textAlign="center" mb="1rem" mt="5px">
                    {songbook.session_key.split("").map((char, keyIdx) => (
                      <Kbd key={keyIdx}>{char}</Kbd>
                    ))}
                  </Heading>
                  <Heading
                    size={songbook.title.length > 20 ? "sm" : "md"}
                    textAlign="center"
                    mb="1rem"
                  >
                    {songbook.title}
                  </Heading>
                  {songbook.is_songbook_owner && (
                    <AvatarGroup
                      size="sm"
                      max={6}
                      mt="10px"
                      justifyContent="center"
                    >
                      {songbook.membership_set?.length &&
                        songbook.membership_set.map((member) => {
                          return (
                            <Avatar
                              {...avatarBackgroundStyle}
                              key={member.user.id}
                              name={`${member.user.first_name} ${member.user.last_initial}`}
                              referrerPolicy="no-referrer"
                              src={member.user.social_auth?.[0]?.picture}
                            />
                          );
                        })}
                    </AvatarGroup>
                  )}
                  <Flex direction="column" height="100%" justifyContent="end">
                    <Text fontSize="10" textAlign="center">
                      {songbook.total_songs === 0 && <>no songs yet</>}
                      {songbook.total_songs === 1 && <>1 song</>}
                      {songbook.total_songs > 1 && (
                        <>{songbook.total_songs} songs</>
                      )}
                    </Text>

                    {songbook.is_noodle_mode ? (
                      <Tooltip
                        label={`updated ${dayjs(songbook.updated_at).format(
                          "MM/DD/YY"
                        )}`}
                      >
                        <Text fontSize="10" textAlign="center">
                          last updated {dayjs(songbook.updated_at).fromNow()}
                        </Text>
                      </Tooltip>
                    ) : (
                      <Tooltip
                        label={`created ${dayjs(songbook.created_at).format(
                          "MM/DD/YY"
                        )}`}
                      >
                        <Text fontSize="10" textAlign="center">
                          created {dayjs(songbook.created_at).fromNow()}
                        </Text>
                      </Tooltip>
                    )}
                  </Flex>
                </Card>
              );
            })}
        </SimpleGrid>
      );
    }
  };
  return (
    <Flex direction="column" alignItems="center">
      <CreateNewSongbook
        isOpen={isOpen}
        onClose={onClose}
        asyncSongbook={null}
        is_noodle_mode={false}
      />
      <Tabs variant="soft-rounded" colorScheme="blue">
        <TabList justifyContent="center">
          <Tab>Wishlist</Tab>
          <Tab>Songbooks</Tab>
          <Tab>Sing-Alongs</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <WishlistForm />
          </TabPanel>
          <TabPanel>{renderSongbooks(true)}</TabPanel>
          <TabPanel>{renderSongbooks(false)}</TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}
