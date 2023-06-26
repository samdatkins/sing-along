import { Card, Flex, Heading, Text, Tooltip } from "@chakra-ui/react";
import dayjs from "dayjs";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import { RxLapTimer } from "react-icons/rx";
import { useNavigate } from "react-router-dom";

export default function SongbookIndexTable({ songbooks }) {
  const navigate = useNavigate();
  return (
    <Flex direction="column" alignItems="center" maxW="900px">
      <Text>Only show: OWNED</Text>
      <Text>Only show: SONGBOOKS</Text>
      <Card padding="5px" margin="5px" width="400px" bgColor="gray.100">
        ICON, CODE, TITLE, DATE, # MEMBERS, #SONGS, LIST OF MEMBERS
      </Card>
      <pre>{JSON.stringify(songbooks?.[0], null, 4)}</pre>
      <Flex direction="row" wrap="wrap" justifyContent="center" mb="4rem">
        {songbooks?.map((songbook, idx) => {
          return (
            <Card
              padding="20px"
              margin="5px"
              width="250px"
              height="250px"
              key={idx}
              bgColor="gray.100"
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
                        <BsFillJournalBookmarkFill size="30px" color="black" />
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
              <Heading size="md" color="blue.400" textAlign="center" mb="1rem">
                {songbook.session_key}
              </Heading>
              <Heading
                size={songbook.title.length > 20 ? "sm" : "md"}
                textAlign="center"
                mb="1rem"
              >
                "{songbook.title}"
              </Heading>
              <Flex direction="column" height="100%" justifyContent="end">
                <Text fontSize="10" textAlign="center">
                  # songs
                </Text>
                <Text fontSize="10" textAlign="center">
                  {songbook.is_noodle_mode ? (
                    <>
                      updated on {dayjs(songbook.updated_at).format("MM/DD/YY")}
                    </>
                  ) : (
                    <>
                      created on {dayjs(songbook.created_at).format("MM/DD/YY")}
                    </>
                  )}
                </Text>
                <Text pt="20px" fontSize="10" textAlign="center">
                  Members #
                </Text>
              </Flex>
            </Card>
          );
        })}
      </Flex>
    </Flex>
  );
}

// export default function SongbookIndexTable({ songbooks }) {
//   return (
//     <Tabs isFitted variant="enclosed-colored" width="26rem">
//       <TabList>
//         <Tab>Songbooks</Tab>
//         <Tab>Power Hours</Tab>
//       </TabList>
//       <TabPanels>
//         <TabPanel>
//           <UnorderedList>
//             {songbooks
//               ?.filter(({ is_noodle_mode }) => is_noodle_mode)
//               .map(({ title, session_key }) => (
//                 <ListItem key={session_key}>
//                   <Link to={`/live/${session_key}/`}>{title}</Link>
//                 </ListItem>
//               ))}
//           </UnorderedList>
//         </TabPanel>
//         <TabPanel>
//           <UnorderedList>
//             {songbooks
//               ?.filter(({ is_noodle_mode }) => !is_noodle_mode)
//               .map(({ title, session_key }) => (
//                 <ListItem key={session_key}>
//                   <Link to={`/live/${session_key}/`}>{title}</Link>
//                 </ListItem>
//               ))}
//           </UnorderedList>
//         </TabPanel>
//       </TabPanels>
//     </Tabs>
//   );
// }
