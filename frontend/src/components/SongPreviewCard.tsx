import { useState, useEffect } from "react";
import {
  Card,
  Flex,
  Heading,
  Icon,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaFlag, FaRegFlag } from "react-icons/fa";
import { toggleSongMemoPending } from "../services/songs";

export default function SongPreviewCard({
  entry,
  isHighlighted,
  onUpdate,
  toast,
}) {
  const [optimisticMemo, setOptimisticMemo] = useState(entry.song.song_memo);

  // Sync local state with incoming props
  useEffect(() => {
    setOptimisticMemo(entry.song.song_memo);
  }, [entry.song.song_memo]);

  const handleToggleMemo = async () => {
    const previousMemo = optimisticMemo;
    const hasSongMemo = optimisticMemo !== null;
    const hasPendingSongMemo = hasSongMemo && optimisticMemo.text === "pending";

    // Optimistically update the memo
    setOptimisticMemo(
      hasPendingSongMemo
        ? null // Remove memo if toggling off
        : { text: "pending" } // Add pending memo if toggling on
    );

    try {
      const result = await toggleSongMemoPending(entry.song.id);
      if (typeof result === "string") {
        throw new Error("Failed to toggle memo");
      }
      onUpdate(); // Refresh parent data after a successful update
    } catch (error) {
      // Revert to previous state on failure
      setOptimisticMemo(previousMemo);
      toast({
        title: "Error",
        description: "Could not toggle pending memo",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const hasSongMemo = optimisticMemo !== null;
  const hasPendingSongMemo = hasSongMemo && optimisticMemo.text === "pending";
  const songMemoText = hasPendingSongMemo
    ? "Memo pending"
    : hasSongMemo
    ? optimisticMemo.text
    : "No memo";

  const iconColor = useColorModeValue("blue.300", "blue.700");
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const bgActiveColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("black", "white");

  return (
    <Card
      p="4"
      m="4"
      borderRadius="lg"
      bgColor={!isHighlighted ? bgActiveColor : bgColor}
      minH={isHighlighted ? "30vh" : "16vh"}
    >
      <Flex direction={"row"} justifyContent={"space-between"}>
        <Heading size="md" mb="4" textColor={textColor}>
          "{entry.song.title}" by {entry.song.artist}
        </Heading>
        {(!hasSongMemo || hasPendingSongMemo) && (
          <Icon
            as={hasPendingSongMemo ? FaFlag : FaRegFlag}
            color={iconColor}
            fontSize={"48px"}
            onClick={handleToggleMemo}
          />
        )}
      </Flex>
      {hasSongMemo && !hasPendingSongMemo ? (
        <Text fontSize="xl" textColor={textColor}>
          {songMemoText}
        </Text>
      ) : (
        <Text fontSize="xl" fontStyle="italic" textColor={textColor}>
          {songMemoText}
        </Text>
      )}
    </Card>
  );
}
