import {
  Card,
  Flex,
  Heading,
  Kbd,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import { RxLapTimer } from "react-icons/rx";
import { useNavigate } from "react-router-dom";

export default function SongbookIndexTable({ songbooks }) {
  const navigate = useNavigate();
  dayjs.extend(relativeTime);

  const renderSongbooks = (displayNoodle) => {
    return (
      <Flex direction="row" wrap="wrap" justifyContent="center" mb="4rem">
        {songbooks
          ?.filter((songbook) => songbook.is_noodle_mode === displayNoodle)
          .map((songbook, idx) => {
            return (
              <Card
                padding="20px"
                margin="5px"
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
                          <BsFillJournalBookmarkFill
                            size="30px"
                            color="black"
                          />
                        </span>
                      </Tooltip>
                    </>
                  ) : (
                    <Tooltip label="power hour">
                      <span>
                        <RxLapTimer size="30px" color="black" />
                      </span>
                    </Tooltip>
                  )}
                </Flex>
                <Heading
                  size="md"
                  color="blue.400"
                  textAlign="center"
                  mb="1rem"
                  mt="5px"
                >
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
                <Flex direction="column" height="100%" justifyContent="end">
                  <Text fontSize="10" textAlign="center">
                    {songbook.total_songs > 0 ? (
                      <>{songbook.total_songs} songs</>
                    ) : (
                      <>no songs yet</>
                    )}
                  </Text>

                  {songbook.is_noodle_mode ? (
                    <Tooltip
                      label={dayjs(songbook.updated_at).format("MM/DD/YY")}
                    >
                      <Text fontSize="10" textAlign="center">
                        last updated {dayjs(songbook.updated_at).fromNow()}
                      </Text>
                    </Tooltip>
                  ) : (
                    <Tooltip
                      label={dayjs(songbook.created_at).format("MM/DD/YY")}
                    >
                      <Text fontSize="10" textAlign="center">
                        created {dayjs(songbook.created_at).fromNow()}
                      </Text>
                    </Tooltip>
                  )}
                  <Text pt="20px" fontSize="10" textAlign="center">
                    Members #
                  </Text>
                </Flex>
              </Card>
            );
          })}
      </Flex>
    );
  };
  return (
    <Flex direction="column" alignItems="center" maxW="900px">
      <Tabs variant="soft-rounded" colorScheme="blue" width="900px">
        <TabList justifyContent="center">
          <Tab>Songbooks</Tab>
          <Tab>Power Hours</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>{renderSongbooks(true)}</TabPanel>
          <TabPanel>{renderSongbooks(false)}</TabPanel>
        </TabPanels>
      </Tabs>
      <pre>{JSON.stringify(songbooks?.[0], null, 4)}</pre>
    </Flex>
  );
}
