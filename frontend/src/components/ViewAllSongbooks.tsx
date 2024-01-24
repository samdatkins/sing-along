import {
  Avatar,
  AvatarGroup,
  Card,
  Flex,
  Heading,
  Kbd,
  SimpleGrid,
  Skeleton,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAsync } from "react-async-hook";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import { RxLapTimer } from "react-icons/rx";
import { useNavigate, useParams } from "react-router-dom";
import { getAllSongbooks } from "../services/songs";
import CreateEditSongbook from "./CreateEditSongbook";

const ViewAllSongbooks = () => {
  const is_noodle = useParams()["is_noodle"] === "true";
  dayjs.extend(relativeTime);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const asyncSongbooks = useAsync(async () => getAllSongbooks(), []);
  const songbooks = asyncSongbooks.result?.data.results;
  const navigate = useNavigate();
  const avatarBackgroundStyle = {
    color: useColorModeValue("white", "black"),
    bg: useColorModeValue("teal.500", "cyan.300"),
  };
  const renderSongbooks = (is_noodle) => {
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
            <Flex alignItems="baseline">
              <Heading size="2xl" mr="1rem">
                +
              </Heading>
              {is_noodle ? (
                <BsFillJournalBookmarkFill size="30px" />
              ) : (
                <RxLapTimer size="30px" />
              )}
            </Flex>
          </Card>
          {songbooks
            ?.filter((songbook) => songbook.is_noodle_mode === is_noodle)
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
    <>
      <Flex direction="column" alignItems="center">
        <CreateEditSongbook
          isOpen={isOpen}
          onClose={onClose}
          asyncSongbook={null}
          is_noodle_mode={is_noodle || false}
        />
        {renderSongbooks(is_noodle)}
      </Flex>
    </>
  );
};
export default ViewAllSongbooks;
