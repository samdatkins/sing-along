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
    <Tabs>
      <TabList>
        <Tab>Power Hour</Tab>
        <Tab>Noodle Mode</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <UnorderedList>
            {songbooks &&
              songbooks
                .filter(({ is_noodle_mode }) => !is_noodle_mode)
                .map(({ title, session_key }) => (
                  <ListItem>
                    <Link to={`/live/${session_key}/`}>{title}</Link>
                  </ListItem>
                ))}
          </UnorderedList>
        </TabPanel>
        <TabPanel>
          <UnorderedList>
            {songbooks &&
              songbooks
                .filter(({ is_noodle_mode }) => is_noodle_mode)
                .map(({ title, session_key }) => (
                  <ListItem>
                    <Link to={`/live/${session_key}/`}>{title}</Link>
                  </ListItem>
                ))}
          </UnorderedList>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
