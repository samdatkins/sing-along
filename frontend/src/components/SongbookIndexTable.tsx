import {
  ListItem,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  UnorderedList,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function SongbookIndexTable({ songbooks }) {
  return (
    <Tabs isFitted variant="enclosed-colored" width="26rem">
      <TabList>
        <Tab>Songbooks</Tab>
        <Tab>Power Hours</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <UnorderedList>
            {songbooks
              ?.filter(({ is_noodle_mode }) => is_noodle_mode)
              .map(({ title, session_key }) => (
                <ListItem key={session_key}>
                  <Link to={`/live/${session_key}/`}>{title}</Link>
                </ListItem>
              ))}
          </UnorderedList>
        </TabPanel>
        <TabPanel>
          <UnorderedList>
            {songbooks
              ?.filter(({ is_noodle_mode }) => !is_noodle_mode)
              .map(({ title, session_key }) => (
                <ListItem key={session_key}>
                  <Link to={`/live/${session_key}/`}>{title}</Link>
                </ListItem>
              ))}
          </UnorderedList>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
