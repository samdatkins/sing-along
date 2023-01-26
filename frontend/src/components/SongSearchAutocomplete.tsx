import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAsync } from "react-async-hook";
import { useDebounce } from "usehooks-ts";
import { Song } from "../models";
import { searchForSong } from "../services/songs";

type SongSearchAutocompleteProps = {
  onSubmit: (song: Song) => Promise<boolean>;
};

export default function SongSearchAutocomplete({
  onSubmit,
}: SongSearchAutocompleteProps) {
  const [searchText, setSearchText] = useState("");
  const [isSubmitting, setIsSubmitting] = useBoolean(false);
  const asyncSongSearch = useAsync(async () => {
    const trimmedSearch = debouncedSearchText.trim();
    if (!trimmedSearch || trimmedSearch.length < 3) {
      return null;
    }
    return await searchForSong(trimmedSearch);
  }, []);
  const debouncedSearchText = useDebounce(searchText, 250);

  useEffect(() => {
    asyncSongSearch.execute();
  }, [debouncedSearchText]);

  return (
    <>
      <InputGroup size="md">
        <Input
          placeholder="Lynyrd Skynyrd - Free Bird"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          disabled={isSubmitting}
        />
        <InputRightElement>
          {asyncSongSearch.loading && <Spinner />}
        </InputRightElement>
      </InputGroup>
      {!isSubmitting && searchText.length >= 3 && !asyncSongSearch.loading && (
        <Flex
          direction="column"
          bg="gray.100"
          borderRadius="md"
          overflow="hidden"
        >
          {typeof asyncSongSearch?.result !== "string" &&
          (asyncSongSearch?.result?.data?.length || 0) > 0 ? (
            asyncSongSearch?.result?.data?.map((song) => (
              <Box
                key={song.id}
                padding="1rem"
                cursor="pointer"
                onClick={async () => {
                  setIsSubmitting.on();
                  const success = await onSubmit(song);
                  if (success) {
                    setSearchText("");
                  }
                  asyncSongSearch.reset();
                  setIsSubmitting.off();
                }}
                _hover={{ bg: "gray.400" }}
              >
                <Text color="gray.900">
                  {song.artist} - {song.title}
                </Text>
              </Box>
            ))
          ) : (
            <Box padding="1rem">
              <Text color="gray.900">No Results Found</Text>
            </Box>
          )}
        </Flex>
      )}
    </>
  );
}
