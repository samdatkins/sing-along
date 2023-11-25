import { Flex, Portal, useBoolean } from "@chakra-ui/react";
import { AxiosResponse } from "axios";
import { BsSuitHeart, BsSuitHeartFill } from "react-icons/bs";
import { Songbook } from "../models";
import { UseAsyncReturn } from "react-async-hook";
import { setSongLikeStatus } from "../services/songs";
import { useEffect } from "react";

const heartIconStyle = {
  size: "34px",
  color: "red",
  opacity: "65%",
  filter: "drop-shadow(1px 1px 0 #666666",
  cursor: "pointer",
};

type HeartButtonProps = {
  asyncSongbook: UseAsyncReturn<AxiosResponse<Songbook, any>, never[]>;
};

export default function HeartButton({ asyncSongbook }: HeartButtonProps) {
  const [isLiked, setIsLiked] = useBoolean(false);

  const handleHeartClick = async () => {
    if (!asyncSongbook?.result?.data) {
      return;
    }
    setIsLiked.toggle();
    const newLikeState = !isLiked;
    const entry_id = asyncSongbook.result.data.current_song_entry.id;
    setSongLikeStatus(entry_id, newLikeState);
    asyncSongbook.execute();
  };

  useEffect(() => {
    asyncSongbook?.result?.data?.is_current_song_liked
      ? setIsLiked.on()
      : setIsLiked.off();
  }, [asyncSongbook?.result?.data?.is_current_song_liked, setIsLiked]);

  return (
    <Portal>
      <Flex position="fixed" right="10px" top="10px">
        {isLiked ? (
          <BsSuitHeartFill {...heartIconStyle} onClick={handleHeartClick} />
        ) : (
          <BsSuitHeart {...heartIconStyle} onClick={handleHeartClick} />
        )}
      </Flex>
    </Portal>
  );
}
