import {
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { FaSpotify } from "react-icons/fa";
import { Spotify } from "react-spotify-embed";

type SpotifyPlayModalParams = {
  timerControls: {
    playPauseToggle: () => void;
    refresh: () => void;
  };
  spotify_ID: string;
};

export default function SpotifyPlayModal({
  spotify_ID,
  timerControls,
}: SpotifyPlayModalParams) {
  const { isOpen, onToggle } = useDisclosure();

  const toggleModal = () => {
    timerControls.playPauseToggle();
    onToggle();
  };

  if (!spotify_ID) {
    return <></>;
  }

  return (
    <>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={toggleModal}
          isCentered={true}
          size="lg"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalBody p="0">
              <Spotify
                wide
                link={`https://open.spotify.com/track/${spotify_ID}`}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
      <FaSpotify onClick={toggleModal} cursor="pointer" size="24" />
    </>
  );
}
