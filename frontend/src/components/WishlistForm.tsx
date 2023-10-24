import { CloseIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  FormLabel,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAsync } from "react-async-hook";
import {
  addSongToWishlist,
  deleteWishlistSong,
  getWishlistSongs,
} from "../services/songs";

const WishlistForm = () => {
  const asyncWishlist = useAsync(async () => getWishlistSongs(), [], {
    setLoading: (state) => ({ ...state, loading: true }),
  });

  const [artist, setArtist] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  const handleDelete = async (song) => {
    await deleteWishlistSong(song);
    asyncWishlist.execute();
  };

  const handleAdd = async () => {
    const newSong = { artist: artist || "?", title: title || "?" };
    await addSongToWishlist(newSong);
    setArtist("");
    setTitle("");
    asyncWishlist.execute();
  };

  return (
    <Flex direction="column">
      <Heading textAlign="center" mt="2rem">
        Your Song Wishlist
      </Heading>

      <Flex direction="column" mb="1.5rem">
        <FormLabel mt="1rem">Artist:</FormLabel>
        <Input value={artist} onChange={(e) => setArtist(e.target.value)} />
        <FormLabel mt="1rem">Title:</FormLabel>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button
          m="1.5rem"
          colorScheme="blue"
          alignSelf="center"
          onClick={() => handleAdd()}
        >
          Add Song to Wishlist
        </Button>
      </Flex>
      {asyncWishlist &&
        asyncWishlist?.result?.data?.results.map((song) => {
          return (
            <Text key={song.id} mr="1rem">
              {song.artist} - {song.title}
              <CloseIcon
                ml="1rem"
                cursor="pointer"
                onClick={() => handleDelete(song)}
              />
            </Text>
          );
        })}
    </Flex>
  );
};

export default WishlistForm;
