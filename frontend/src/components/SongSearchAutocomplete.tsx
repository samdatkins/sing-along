import { QuestionIcon, RepeatIcon } from "@chakra-ui/icons";
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
    [],
    {
      setLoading: (state) => ({ ...state, loading: true }),
    }
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

      {searchText?.length < 1 && (
        <>
          <Flex direction="row" alignItems="center">
            <Heading size="sm" mt="1rem" mb=".5rem">
              Recommended Songs:
            </Heading>
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
            <Flex direction="column">
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
                <Text mt="5px" fontSize="xs">
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
              <Flex mt="4px" justifyContent="center" fontSize="xs">
                Loading recommendations...{" "}
                <Spinner size="sm" color="blue.500" />
              </Flex>
            </>
          )}
        </>
      )}
    </>
  );
}
