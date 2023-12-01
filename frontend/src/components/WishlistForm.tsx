import { DeleteIcon } from "@chakra-ui/icons";
import { Flex, Heading, Spinner, Text } from "@chakra-ui/react";
import React from "react";
import { useAsync } from "react-async-hook";
import { Song } from "../models";
import {
  addSongToWishlist,
  deleteWishlistSong,
  getWishlistSongs,
} from "../services/songs";
import SongSearchAutocomplete from "./SongSearchAutocomplete";

const WishlistForm = () => {
  const asyncWishlist = useAsync(async () => getWishlistSongs(), []);

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

  return (
    <Flex direction="column">
      <Flex direction="column" mb="1.5rem" width="100%">
        <Heading size="md" mb="10px" mt="10px">
          Add to Wishlist:
        </Heading>
        <SongSearchAutocomplete
          onSubmit={handleSongSubmit}
          session_key={""}
          songRequestInput={songRequestInput}
        />
      </Flex>
      <Heading size="md" mb="10px">
        {asyncWishlist &&
        asyncWishlist.result &&
        asyncWishlist?.result?.data?.results?.length > 0
          ? `Wishlist Songs:`
          : `No Wishlist Songs`}
      </Heading>
      {asyncWishlist && asyncWishlist?.result?.data?.results ? (
        asyncWishlist?.result?.data?.results.map((song) => {
          return (
            <Flex dir="row" alignItems="center" key={song.id} mb="3px">
              <DeleteIcon
                color="blue.500"
                cursor="pointer"
                onClick={() => handleDelete(song)}
              />
              <Text isTruncated ml="1rem">
                {song.artist} - {song.title}
              </Text>
            </Flex>
          );
        })
      ) : (
        <Flex dir="row">
          Loading wishlist songs ... <Spinner size="sm" />
        </Flex>
      )}
    </Flex>
  );
};

export default WishlistForm;
