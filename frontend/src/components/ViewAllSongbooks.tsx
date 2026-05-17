import {
  Avatar,
  AvatarGroup,
  Button,
  ButtonGroup,
  Card,
  Flex,
  Heading,
  Icon,
  Input,
  Kbd,
  SimpleGrid,
  Skeleton,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useMediaQuery,
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
  const asyncSongbooks = useAsync(async () => getAllSongbooks(), []);
  const songbooks = asyncSongbooks.result?.data.results;
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const [isMobile] = useMediaQuery("(max-width: 600px)");

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


  const songCountLabel = (count: number) => {
    if (count === 0) return "no songs yet";
    if (count === 1) return "1 song";
    return `${count} songs`;
  };

  const renderMobileCard = (songbook: SongbookListItem, idx: number) => {
    const bgColor = songbook.is_noodle_mode ? songbookCardBg : singAlongCardBg;

    return (
      <Card
        key={idx}
        padding="12px 16px"
        onClick={() => navigate(`/live/${songbook.session_key}/`)}
        cursor="pointer"
        bg={bgColor}
        direction="row"
        alignItems="center"
        gap="12px"
      >
        <Icon
          as={songbook.is_noodle_mode ? BsFillJournalBookmarkFill : RxLapTimer}
          boxSize="20px"
          flexShrink={0}
        />
        <Text fontWeight="bold" fontSize="sm" isTruncated flex="1">
          {songbook.title}
        </Text>
        <Text fontSize="xs" color="gray.500" flexShrink={0}>
          {songCountLabel(songbook.total_songs)}
        </Text>
      </Card>
    );
  };

  const renderDesktopCard = (songbook: SongbookListItem, idx: number) => {
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
            {songCountLabel(songbook.total_songs)}
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
      <Flex direction="column" alignItems="center" width="100%">
        {isMobile ? (
          <Flex direction="column" gap="8px" width="100%">
            <Skeleton height="48px" borderRadius="md" />
            <Skeleton height="48px" borderRadius="md" />
            <Skeleton height="48px" borderRadius="md" />
          </Flex>
        ) : (
          <SimpleGrid columns={[1, 2, 3]} spacing="10px" maxW="900px">
            <Skeleton height="250px" padding="20px" width="250px" />
            <Skeleton height="250px" padding="20px" width="250px" />
            <Skeleton height="250px" padding="20px" width="250px" />
          </SimpleGrid>
        )}
      </Flex>
    );
  }

  return (
    <Flex direction="column" alignItems="center" width="100%">
      <CreateEditSongbook
        isOpen={isOpen}
        onClose={onClose}
        asyncSongbook={null}
        is_noodle_mode={false}
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

      {isMobile ? (
        <Flex direction="column" gap="8px" width="100%">
          <Card
            padding="12px 16px"
            cursor="pointer"
            direction="row"
            alignItems="center"
            justifyContent="center"
            onClick={onOpen}
          >
            <Heading size="md">+ New</Heading>
          </Card>
          {filteredSongbooks?.map((songbook, idx) =>
            renderMobileCard(songbook, idx)
          )}
        </Flex>
      ) : (
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
            cursor="pointer"
            onClick={onOpen}
          >
            <Heading size="2xl">+</Heading>
          </Card>
          {filteredSongbooks?.map((songbook, idx) =>
            renderDesktopCard(songbook, idx)
          )}
        </SimpleGrid>
      )}
    </Flex>
  );
};

export default ViewAllSongbooks;
