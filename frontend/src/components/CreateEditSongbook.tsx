import {
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
} from "@chakra-ui/react";
import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { UseAsyncReturn } from "react-async-hook";
import { useNavigate } from "react-router-dom";
import { Songbook } from "../models";
import { createNewSongbook, editSongbook } from "../services/songs";

interface CreateEditSongbookProps {
  isOpen: boolean;
  is_noodle_mode: boolean;
  onClose: () => void;
  asyncSongbook: UseAsyncReturn<AxiosResponse<Songbook, any>, never[]> | null;
}

export default function CreateEditSongbook({
  isOpen,
  onClose,
  asyncSongbook,
  is_noodle_mode,
}: CreateEditSongbookProps) {
  const [maxSongs, setMaxSongs] = useState<number | null>(null);
  const [title, setTitle] = useState<string>("");
  const [actionVerb, setActionVerb] = useState<string>("DANCE");
  const [theme, setTheme] = useState<string>("");
  const [isNoodle, setIsNoodle] = useState<boolean>(is_noodle_mode);

  const isCreating = asyncSongbook === null;

  useEffect(() => {
    if (isOpen) {
      if (asyncSongbook && asyncSongbook.result) {
        if (asyncSongbook.result.data.max_active_songs !== null)
          setMaxSongs(asyncSongbook.result.data.max_active_songs);
        setTitle(asyncSongbook.result.data.title);
        setActionVerb(asyncSongbook.result.data.action_verb);
        setTheme(asyncSongbook.result.data.theme);
        setIsNoodle(asyncSongbook.result.data.is_noodle_mode);
      } else {
        setIsNoodle(is_noodle_mode);
      }
    }
  }, [
    isOpen,
    asyncSongbook?.result?.data.max_active_songs,
    asyncSongbook?.result?.data.title,
    asyncSongbook?.result?.data.theme,
    asyncSongbook?.result?.data.is_noodle_mode,
    asyncSongbook?.result?.data.action_verb,
    is_noodle_mode,
  ]);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCreating) {
      const result = await createNewSongbook(
        maxSongs,
        title,
        actionVerb,
        isNoodle,
        theme
      );
      if (result !== false) {
        navigate(`/live/${result.data.session_key}`);
      }
    } else if (asyncSongbook && asyncSongbook.result) {
      const result = await editSongbook(
        asyncSongbook.result.data.session_key,
        maxSongs,
        title,
        actionVerb,
        theme
      );
      if (result !== false) {
        onClose();
      }
    }
  };

  const bookType = isNoodle ? "Songbook" : "Sing-Along";

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent mx="1rem" borderRadius="xl">
        <ModalHeader textAlign="center" pb="0">
          {isCreating ? "" : `Settings for ${asyncSongbook?.result?.data.title || bookType}`}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="2rem" pt="1rem">
          <form onSubmit={handleSubmit}>
            <VStack spacing="1rem" align="stretch">
              {isCreating && (
                <FormControl>
                  <Flex justifyContent="center">
                    <ButtonGroup size="sm" isAttached>
                      <Button
                        onClick={() => setIsNoodle(false)}
                        variant={!isNoodle ? "solid" : "outline"}
                        colorScheme={!isNoodle ? "blue" : "gray"}
                      >
                        Sing-Along
                      </Button>
                      <Button
                        onClick={() => setIsNoodle(true)}
                        variant={isNoodle ? "solid" : "outline"}
                        colorScheme={isNoodle ? "blue" : "gray"}
                      >
                        Songbook
                      </Button>
                    </ButtonGroup>
                  </Flex>
                </FormControl>
              )}

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Title
                </FormLabel>
                <Input
                  value={title}
                  placeholder={`My ${bookType}`}
                  onChange={(e) =>
                    e.target.value.length <= 40 && setTitle(e.target.value)
                  }
                />
              </FormControl>

              <FormControl isDisabled={isNoodle}>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Song Cap (optional)
                </FormLabel>
                <Input
                  value={maxSongs || ""}
                  width="80px"
                  placeholder="--"
                  onChange={(e) => {
                    if (typeof parseInt(e.target.value) === "number") {
                      e.target.value.length < 4 &&
                        setMaxSongs(parseInt(e.target.value));
                    }
                    if (e.target.value === "") {
                      setMaxSongs(null);
                    }
                  }}
                />
              </FormControl>

              <FormControl isDisabled={isNoodle}>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Action Verb
                </FormLabel>
                <Input
                  value={actionVerb}
                  placeholder="DANCE"
                  onChange={(e) => {
                    if (e.target.value.length < 9) {
                      setActionVerb(e.target.value.toUpperCase());
                    }
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Theme
                </FormLabel>
                <Input
                  value={theme}
                  placeholder="Optional"
                  onChange={(e) => {
                    e.target.value.length <= 40 && setTheme(e.target.value);
                  }}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                width="100%"
                mt="0.5rem"
                isDisabled={title.length < 1}
              >
                {isCreating ? `Create ${bookType}` : "Update"}
              </Button>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
