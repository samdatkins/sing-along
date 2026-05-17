import {
  Avatar,
  AvatarGroup,
  Button,
  ButtonGroup,
  Card,
  Flex,
  Heading,
  Input,
  Kbd,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  SimpleGrid,
  Skeleton,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useMemo, useState } from "react";
import { useAsync } from "react-async-hook";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import { RxLapTimer } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { SongbookListItem } from "../models";
import { getAllSongbooks } from "../services/songs";
import CreateEditSongbook from "./CreateEditSongbook";

dayjs.extend(relativeTime);

type TypeFilter = "all" | "songbooks" | "sing-alongs";

const ViewAllSongbooks = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [createNoodleMode, setCreateNoodleMode] = useState(false);
  const asyncSongbooks = useAsync(async () => getAllSongbooks(), []);
  const songbooks = asyncSongbooks.result?.data.results;
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const songbookCardBg = useColorModeValue("blue.50", "blue.900");
  const singAlongCardBg = useColorModeValue("yellow.50", "yellow.900");
  const avatarColor = useColorModeValue("white", "black");
  const avatarBg = useColorModeValue("teal.500", "cyan.300");

  const filteredSongbooks = useMemo(() => {
    if (!songbooks) return undefined;

    let filtered = [...songbooks];

    if (typeFilter === "songbooks") {
      filtered = filtered.filter((sb) => sb.is_noodle_mode === true);
    } else if (typeFilter === "sing-alongs") {
      filtered = filtered.filter((sb) => sb.is_noodle_mode === false);
    }

    if (searchText.trim()) {
      const query = searchText.trim().toLowerCase();
      filtered = filtered.filter((sb) =>
        sb.title.toLowerCase().includes(query)
      );
    }

    filtered.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    return filtered;
  }, [songbooks, typeFilter, searchText]);

  const handleCreate = (isNoodle: boolean) => {
    setCreateNoodleMode(isNoodle);
    onOpen();
  };

  const renderCard = (songbook: SongbookListItem, idx: number) => {
    const bgColor = songbook.is_noodle_mode ? songbookCardBg : singAlongCardBg;

    return (
      <Card
        padding="20px"
        width="250px"
        height="250px"
        key={idx}
        onClick={() => navigate(`/live/${songbook.session_key}/`)}
        cursor="pointer"
        bg={bgColor}
      >
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="flex-start"
        >
          {songbook.is_noodle_mode ? (
            <Tooltip label="songbook">
              <span>
                <BsFillJournalBookmarkFill size="30px" />
              </span>
            </Tooltip>
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
          <AvatarGroup size="sm" max={6} mt="10px" justifyContent="center">
            {songbook.membership_set?.length &&
              songbook.membership_set.map((member) => (
                <Avatar
                  color={avatarColor}
                  bg={avatarBg}
                  key={member.user.id}
                  name={`${member.user.first_name} ${member.user.last_initial}`}
                  referrerPolicy="no-referrer"
                  src={member.user.social_auth?.[0]?.picture}
                />
              ))}
          </AvatarGroup>
        )}
        <Flex direction="column" height="100%" justifyContent="end">
          <Text fontSize="10" textAlign="center">
            {songbook.total_songs === 0 && <>no songs yet</>}
            {songbook.total_songs === 1 && <>1 song</>}
            {songbook.total_songs > 1 && <>{songbook.total_songs} songs</>}
          </Text>
          <Tooltip
            label={`updated ${dayjs(songbook.updated_at).format("MM/DD/YY")}`}
          >
            <Text fontSize="10" textAlign="center">
              last updated {dayjs(songbook.updated_at).fromNow()}
            </Text>
          </Tooltip>
        </Flex>
      </Card>
    );
  };

  if (!songbooks) {
    return (
      <Flex direction="column" alignItems="center" mt="2rem" width="100%">
        <SimpleGrid columns={[1, 2, 3]} spacing="10px" maxW="900px">
          <Skeleton height="250px" padding="20px" width="250px" />
          <Skeleton height="250px" padding="20px" width="250px" />
          <Skeleton height="250px" padding="20px" width="250px" />
        </SimpleGrid>
      </Flex>
    );
  }

  return (
    <Flex direction="column" alignItems="center" width="100%">
      <CreateEditSongbook
        isOpen={isOpen}
        onClose={onClose}
        asyncSongbook={null}
        is_noodle_mode={createNoodleMode}
      />

      <Flex
        direction="column"
        alignItems="center"
        gap="0.75rem"
        mb="1rem"
        width="100%"
        maxW="600px"
      >
        <Input
          placeholder="Filter by title..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="sm"
          maxW="300px"
        />
        <ButtonGroup size="sm" isAttached variant="outline">
          <Button
            onClick={() => setTypeFilter("all")}
            variant={typeFilter === "all" ? "solid" : "outline"}
            colorScheme={typeFilter === "all" ? "blue" : "gray"}
          >
            All
          </Button>
          <Button
            onClick={() => setTypeFilter("songbooks")}
            variant={typeFilter === "songbooks" ? "solid" : "outline"}
            colorScheme={typeFilter === "songbooks" ? "blue" : "gray"}
          >
            Songbooks
          </Button>
          <Button
            onClick={() => setTypeFilter("sing-alongs")}
            variant={typeFilter === "sing-alongs" ? "solid" : "outline"}
            colorScheme={typeFilter === "sing-alongs" ? "blue" : "gray"}
          >
            Sing-Alongs
          </Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid
        columns={[1, 2, 3]}
        spacing="10px"
        maxW="900px"
        justifyItems="center"
      >
        <Popover placement="bottom">
          <PopoverTrigger>
            <Card
              padding="20px"
              width="250px"
              height="250px"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
            >
              <Heading size="2xl">+</Heading>
            </Card>
          </PopoverTrigger>
          <PopoverContent width="auto">
            <PopoverBody>
              <Flex direction="column" gap="0.5rem">
                <Button
                  leftIcon={<BsFillJournalBookmarkFill />}
                  onClick={() => handleCreate(true)}
                  size="sm"
                >
                  New Songbook
                </Button>
                <Button
                  leftIcon={<RxLapTimer />}
                  onClick={() => handleCreate(false)}
                  size="sm"
                >
                  New Sing-Along
                </Button>
              </Flex>
            </PopoverBody>
          </PopoverContent>
        </Popover>

        {filteredSongbooks?.map((songbook, idx) => renderCard(songbook, idx))}
      </SimpleGrid>
    </Flex>
  );
};

export default ViewAllSongbooks;
