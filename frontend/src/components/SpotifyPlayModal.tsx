import { IoCloseCircle } from "react-icons/io5";
import { Box, useDisclosure } from "@chakra-ui/react";
import { FaSpotify } from "react-icons/fa";
import { Spotify } from "react-spotify-embed";

export default function SpotifyPlayModal({ spotify_ID }) {
  const { isOpen, onToggle } = useDisclosure();

  if (!spotify_ID) {
    return <></>;
  }

  const iconProps = {
    onClick: onToggle,
    cursor: "pointer",
  };

  return (
    <>
      {isOpen && (
        <Box pos="fixed" top="44px" zIndex="999">
          <Spotify wide link={`https://open.spotify.com/track/${spotify_ID}`} />
        </Box>
      )}
      {isOpen ? (
        <IoCloseCircle {...iconProps} size="30" />
      ) : (
        <FaSpotify {...iconProps} size="24" />
      )}
    </>
  );
}
