import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Flex,
  Heading,
  SlideFade,
  Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useAsync } from "react-async-hook";
import { useNavigate, useParams } from "react-router-dom";
import { useInterval } from "usehooks-ts";
import { ChakraAlertStatus } from "../models";
import {
  addSongToSongbook,
  deleteSongbookSong,
  getCurrentSong,
} from "../services/songs";
import HeartButton from "./LikeButton";
import SongSearchAutocomplete from "./SongSearchAutocomplete";

const AddSongPage = () => {
  const [alertText, setAlertText] = useState("");
  const navigate = useNavigate();
  const [alertStatus, setAlertStatus] = useState<ChakraAlertStatus>();
  const [undoSongEntryID, setUndoSongEntryID] = useState<number | undefined>();

  const { sessionKey } = useParams();

  const asyncSongbook = useAsync(async () => getCurrentSong(sessionKey), [], {
    setLoading: (state) => ({ ...state, loading: true }),
  });

  useInterval(() => {
    if (!asyncSongbook.loading) {
      asyncSongbook.execute();
    }
  }, 5000);

  const songRequestInput = React.useRef(null);

  return (
    <>
      <HeartButton asyncSongbook={asyncSongbook} />
      <Text
        cursor="pointer"
        onClick={() => navigate(`/live/${sessionKey}`)}
        align="center"
        m="1rem"
      >
        <ArrowBackIcon />{" "}
        {asyncSongbook?.result?.data?.current_song_entry?.song?.title !==
        undefined
          ? `Back to "${asyncSongbook?.result?.data?.current_song_entry?.song?.title}" by 
        ${asyncSongbook?.result?.data?.current_song_entry?.song?.artist}`
          : `Back to Songbook`}
      </Text>
      {asyncSongbook.result?.data.title ? (
        <Heading m="1rem" size="md">
          Request a song for "{asyncSongbook.result?.data.title}":
        </Heading>
      ) : (
        <Heading m="1rem" size="md">
          Loading Songbook...
        </Heading>
      )}
      {asyncSongbook.result?.data.session_key && (
        <SongSearchAutocomplete
          songRequestInput={songRequestInput}
          session_key={asyncSongbook.result?.data.session_key}
          onSubmit={async (song) => {
            setAlertText("");
            setAlertStatus(undefined);

            const addSongResult = await addSongToSongbook(
              song,
              asyncSongbook.result?.data.id
            );
            if (typeof addSongResult === "string") {
              const isWarning = addSongResult.includes("already");
              setAlertStatus(isWarning ? "warning" : "error");
              setAlertText(addSongResult);
              if (isWarning) {
                return true;
              }
              return false;
            } else {
              setUndoSongEntryID(addSongResult.data.id);
              setAlertStatus("success");
              setAlertText(
                `Successfully added "${song.title}" by ${song.artist}.`
              );
              return true;
            }
          }}
        />
      )}
      <Flex direction="column" m="1rem">
        <SlideFade in={!!alertText} style={{ zIndex: 10 }} offsetY="20px">
          <Alert status={alertStatus} py="1rem" rounded="md">
            <Flex direction="column" alignItems="center" width="100%">
              <Flex direction="row" alignItems="center">
                <AlertIcon />
                <AlertDescription>{alertText}</AlertDescription>
              </Flex>
              {undoSongEntryID !== undefined && (
                <Button
                  width="100%"
                  maxWidth="20rem"
                  mt="1rem"
                  onClick={() => {
                    deleteSongbookSong(undoSongEntryID);
                    setUndoSongEntryID(undefined);
                    setAlertText("");
                    setAlertStatus(undefined);
                  }}
                >
                  Undo
                </Button>
              )}
            </Flex>
          </Alert>
        </SlideFade>
      </Flex>
    </>
  );
};
export default AddSongPage;
