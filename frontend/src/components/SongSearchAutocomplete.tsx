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
import React, { useEffect, useState } from "react";
import { useAsync } from "react-async-hook";
import { useDebounce } from "usehooks-ts";
import { Song } from "../models";
import { searchForSong } from "../services/songs";

type SongSearchAutocompleteProps = {
  onSubmit: (song: Song) => Promise<boolean>;
  songRequestInput: React.MutableRefObject<null>;
};

export default function SongSearchAutocomplete({
  onSubmit,
  songRequestInput,
}: SongSearchAutocompleteProps) {
  const [searchText, setSearchText] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isSubmitting, setIsSubmitting] = useBoolean(false);
  const asyncSongSearch = useAsync(async () => {
    const trimmedSearch = debouncedSearchText.trim();
    if (!trimmedSearch || trimmedSearch.length < 3) {
      return null;
    }
    return await searchForSong(trimmedSearch);
  }, []);
  const debouncedSearchText = useDebounce(searchText, 250);
  const updateSelectedIndexWithValidValue = (index: number) => {
    let newIndex = index;
    const maxIndex =
      ((typeof asyncSongSearch?.result !== "string" &&
        asyncSongSearch?.result?.data?.length) ||
        0) - 1;
    if (index < 0) {
      newIndex = maxIndex;
    } else if (index > maxIndex) {
      newIndex = 0;
    }
    setSelectedIndex(newIndex);
  };

  useEffect(() => {
    asyncSongSearch.execute();
    setSelectedIndex(-1);
  }, [debouncedSearchText]);

  const submit = async (song: Song | undefined | false) => {
    if (!song) return;

    setIsSubmitting.on();
    const success = await onSubmit(song);
    if (success) {
      setSearchText("");
    }
    asyncSongSearch.reset();
    setIsSubmitting.off();
  };

  return (
    <>
      <InputGroup size="md">
        <Input
          placeholder="Lynyrd Skynyrd - Free Bird"
          ref={songRequestInput}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          disabled={isSubmitting}
          onKeyDown={async (e) => {
            if (e.key === "ArrowDown") {
              updateSelectedIndexWithValidValue(selectedIndex + 1);
              e.preventDefault();
            } else if (e.key === "ArrowUp") {
              updateSelectedIndexWithValidValue(selectedIndex - 1);
              e.preventDefault();
            } else if (e.key === "Enter") {
              e.preventDefault();
              const song =
                typeof asyncSongSearch?.result !== "string" &&
                asyncSongSearch?.result?.data?.[selectedIndex];
              submit(song);
            }
          }}
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
            asyncSongSearch?.result?.data?.map((song, index) => (
              <Box
                key={song.id}
                padding="1rem"
                cursor="pointer"
                onClick={async () => {
                  submit(song);
                }}
                onMouseOver={() => setSelectedIndex(index)}
                bg={index === selectedIndex ? undefined : "gray.400"}
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
