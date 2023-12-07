import {
  Box,
  Button,
  Flex,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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

  useEffect(() => {
    if (isOpen && asyncSongbook && asyncSongbook.result) {
      if (asyncSongbook?.result?.data.max_active_songs !== null)
        setMaxSongs(asyncSongbook?.result?.data.max_active_songs);
      setTitle(asyncSongbook?.result?.data.title);
      setActionVerb(asyncSongbook?.result?.data.action_verb);
      setTheme(asyncSongbook?.result?.data.theme);
    }
  }, [
    isOpen,
    asyncSongbook?.result?.data.max_active_songs,
    asyncSongbook?.result?.data.title,
    asyncSongbook?.result?.data.theme,
    asyncSongbook?.result?.data.is_noodle_mode,
    asyncSongbook?.result?.data.action_verb,
  ]);

  const navigate = useNavigate();

  const handleButtonClick = async (e) => {
    e.preventDefault();
    if (asyncSongbook === null) {
      const result = await createNewSongbook(
        maxSongs,
        title,
        actionVerb,
        is_noodle_mode,
        theme
      );
      if (result !== false) {
        navigate(`/live/${result.data.session_key}`);
      } else {
        console.log("Couldn't create new songbook.");
      }
    }
    if (asyncSongbook && asyncSongbook.result) {
      const result = await editSongbook(
        asyncSongbook.result.data.session_key,
        maxSongs,
        title,
        actionVerb,
        theme
      );
      if (result !== false) {
        onClose();
      } else {
        console.log("Couldn't edit songbook details.");
      }
    }
  };

  const bookType = is_noodle_mode ? "Songbook" : "Sing-Along";

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {asyncSongbook !== null
              ? `Settings for ${asyncSongbook.result?.data.title || bookType}`
              : `Create ${bookType}`}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box padding="1rem">
              <form>
                <FormLabel>{bookType} Title:</FormLabel>
                <Input
                  value={title}
                  mb="1rem"
                  onChange={(e) =>
                    e.target.value.length <= 40 && setTitle(e.target.value)
                  }
                />
                <FormLabel>Song Cap (optional):</FormLabel>
                <Input
                  value={maxSongs || ""}
                  width="70px"
                  mb="1rem"
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
                {!is_noodle_mode && (
                  <>
                    <FormLabel>Action Verb:</FormLabel>
                    <Input
                      mb="1rem"
                      value={actionVerb}
                      onChange={(e) => {
                        if (e.target.value.length < 9) {
                          setActionVerb(e.target.value.toUpperCase());
                        }
                      }}
                    />
                  </>
                )}
                <FormLabel>Theme:</FormLabel>
                <Input
                  mb="1rem"
                  value={theme}
                  onChange={(e) => {
                    e.target.value.length <= 40 && setTheme(e.target.value);
                  }}
                />
                <Flex justifyContent="center">
                  <Button
                    disabled={title.length < 1}
                    onClick={handleButtonClick}
                    mt="1rem"
                  >
                    {asyncSongbook !== null ? `Update` : `Create`}
                  </Button>
                </Flex>
              </form>
            </Box>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
