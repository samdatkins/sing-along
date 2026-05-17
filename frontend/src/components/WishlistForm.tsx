import { DeleteIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useAsync } from "react-async-hook";
import { Song } from "../models";
import {
  addSongToWishlist,
  deleteWishlistSong,
  getWishlistSongs,
} from "../services/songs";
import SongSearchAutocomplete from "./SongSearchAutocomplete";

const COLLAPSED_LIMIT = 5;

const WishlistForm = () => {
  const asyncWishlist = useAsync(async () => getWishlistSongs(), []);
  const [isExpanded, setIsExpanded] = useState(false);
  const itemBg = useColorModeValue("gray.100", "gray.700");

  const handleDelete = async (song) => {
    await deleteWishlistSong(song);
    asyncWishlist.execute();
  };

  const handleSongSubmit = async (song: Song) => {
    const newSong = { artist: song.artist || "?", title: song.title || "?" };
    await addSongToWishlist(newSong);
    asyncWishlist.execute();
    return true;
  };

  const songRequestInput = React.useRef(null);

  const allSongs = asyncWishlist?.result?.data?.results;
  const totalCount = allSongs?.length ?? 0;
  const displayedSongs =
    allSongs && !isExpanded ? allSongs.slice(0, COLLAPSED_LIMIT) : allSongs;

  return (
    <Flex direction="column" width="100%" maxW="600px">
      <Flex direction="column" mb="0.5rem" width="100%">
        <Heading size="md" mb="10px">
          Add to My Wishlist:
        </Heading>
        <SongSearchAutocomplete
          onSubmit={handleSongSubmit}
          session_key={""}
          songRequestInput={songRequestInput}
        />
      </Flex>
      {displayedSongs ? (
        <>
          <Flex direction="column" gap="6px">
            {displayedSongs.map((song) => (
              <Flex
                key={song.id}
                bg={itemBg}
                borderRadius="md"
                px="12px"
                py="8px"
                alignItems="center"
                justifyContent="space-between"
              >
                <Text fontSize="sm" isTruncated mr="8px">
                  {song.artist} - {song.title}
                </Text>
                <IconButton
                  aria-label="Remove from wishlist"
                  icon={<DeleteIcon />}
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => handleDelete(song)}
                />
              </Flex>
            ))}
          </Flex>
          {totalCount > COLLAPSED_LIMIT && (
            <Button
              variant="link"
              size="sm"
              mt="0.5rem"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Show less" : `Show all (${totalCount})`}
            </Button>
          )}
        </>
      ) : (
        <Flex dir="row">
          Loading wishlist songs ... <Spinner size="sm" />
        </Flex>
      )}
    </Flex>
  );
};

export default WishlistForm;
