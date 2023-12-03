import { QuestionIcon, RepeatIcon } from "@chakra-ui/icons";
import { IoSparklesSharp } from "react-icons/io5";

import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
  Spinner,
  Stack,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAsync } from "react-async-hook";
import { MdCancel } from "react-icons/md";
import { useDebounce } from "usehooks-ts";
import { Song } from "../models";
import {
  deleteWishlistSong,
  getRecommendations,
  searchForSong,
} from "../services/songs";

type SongSearchAutocompleteProps = {
  onSubmit: (song: Song) => Promise<boolean>;
  session_key: string;
  songRequestInput: React.MutableRefObject<null>;
};

export default function SongSearchAutocomplete({
  onSubmit,
  session_key,
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

  const asyncRecommendations = useAsync(
    async () => getRecommendations(session_key),
    [session_key]
  );

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
  }, [debouncedSearchText]); //missing asyncSongSearch

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

  const handleWishlistClick = async (wishlistSong) => {
    const songString = `${wishlistSong.artist} - ${wishlistSong.title}`;
    setSearchText(songString);
    if (wishlistSong.id) {
      await deleteWishlistSong(wishlistSong);
    }
    asyncRecommendations.execute();
  };

  const refreshRecommendations = () => {
    asyncRecommendations.execute();
  };

  return (
    <>
      <InputGroup size="md">
        <Input
          m="1rem"
          mt="0"
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
        <InputRightElement m="1rem" mt="0">
          {asyncSongSearch.loading ? (
            <Spinner />
          ) : (
            <>
              {searchText.length > 0 && (
                <MdCancel
                  onClick={() => {
                    setSearchText("");
                  }}
                />
              )}
            </>
          )}
        </InputRightElement>
      </InputGroup>
      {!isSubmitting && searchText.length >= 3 && !asyncSongSearch.loading && (
        <Flex
          direction="column"
          bg="gray.100"
          borderRadius="md"
          overflow="hidden"
          m="1rem"
          mt="0"
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
                <Flex direction="row" alignItems="center">
                  <Text color="gray.900">
                    {song.artist} - {song.title}{" "}
                  </Text>
                  {song?.song_entry_count !== undefined &&
                    song.song_entry_count === 0 && (
                      <Box ml="8px" color="yellow.300">
                        <IoSparklesSharp />
                      </Box>
                    )}
                </Flex>
              </Box>
            ))
          ) : (
            <Box padding="1rem">
              <Text color="gray.900">No Results Found</Text>
            </Box>
          )}
        </Flex>
      )}

      {searchText?.length < 1 && session_key && (
        <>
          <Flex direction="row" alignItems="center" m="1rem" mt="0">
            <Heading size="sm">Recommended Songs:</Heading>
            <Popover size="sm">
              <PopoverTrigger>
                <QuestionIcon ml="5px" />
              </PopoverTrigger>
              <PopoverContent>
                <PopoverCloseButton />
                <PopoverBody>
                  <Text fontSize="sm" p="5px">
                    Your wishlist, your favorites, and most common requests all
                    help build your recommendation list.
                  </Text>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Flex>
          {asyncRecommendations &&
          asyncRecommendations?.result?.data &&
          !asyncRecommendations.loading ? (
            <Flex direction="column" m="1rem">
              {asyncRecommendations?.result?.data?.length > 0 ? (
                asyncRecommendations.result.data
                  .slice(0, 6)
                  .map((song, index: number) => {
                    return (
                      <Button
                        key={index}
                        size="xs"
                        p="1rem"
                        my="5px"
                        isTruncated
                        justifyContent="left"
                        colorScheme="gray"
                        onClick={() => handleWishlistClick(song)}
                      >
                        <Text isTruncated>
                          {song.artist} - {song.title}
                        </Text>
                      </Button>
                    );
                  })
              ) : (
                <Text justifySelf="center" fontSize="xs">
                  No recommendations were found.
                </Text>
              )}
              <Flex
                direction="row"
                justifyContent="center"
                cursor="pointer"
                onClick={() => refreshRecommendations()}
              >
                <Text m="1rem" fontSize="xs">
                  <RepeatIcon mr="3px" /> Refresh Recommendations
                </Text>
              </Flex>
            </Flex>
          ) : (
            <>
              <Stack>
                <Skeleton height="32px" my="2px" />
                <Skeleton height="32px" my="2px" />
                <Skeleton height="32px" my="2px" />
                <Skeleton height="32px" my="2px" />
                <Skeleton height="32px" my="2px" />
                <Skeleton height="32px" my="2px" />
              </Stack>
              <Flex justifyContent="center" m="1rem" fontSize="xs">
                Loading recommendations... <Spinner color="blue.500" />
              </Flex>
            </>
          )}
        </>
      )}
    </>
  );
}
