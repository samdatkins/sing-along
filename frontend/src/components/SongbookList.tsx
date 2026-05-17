import { DragHandleIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Link,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  getSongbookDetails,
  reorderSongEntries,
  setSongbookSong,
} from "../services/songs";

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";
import { useAsync } from "react-async-hook";
import { SongEntry } from "../models";

interface SortableItemProps {
  entry: SongEntry;
  onSongClick: (position: number) => void;
}

function SortableSongItem({ entry, onSongClick }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Flex
      ref={setNodeRef}
      style={style}
      alignItems="center"
      py="6px"
      px="8px"
      borderRadius="md"
      _hover={{ bg: "gray.50" }}
      gap="8px"
    >
      <Box
        cursor="grab"
        color="gray.400"
        _hover={{ color: "gray.600" }}
        {...attributes}
        {...listeners}
      >
        <DragHandleIcon />
      </Box>
      <Link
        flex="1"
        onClick={() => onSongClick(entry.position)}
      >
        <Text>
          "{entry.song.title}" by {entry.song.artist}
        </Text>
      </Link>
    </Flex>
  );
}

interface SongbookListProps {
  isListOpen: boolean;
  onListClose: () => void;
  sessionKey: string;
}

export default function SongbookList({
  isListOpen,
  onListClose,
  sessionKey,
}: SongbookListProps) {
  const asyncSongbookDetails = useAsync(getSongbookDetails, [sessionKey], {
    executeOnMount: false,
  });
  const songbook = asyncSongbookDetails?.result?.data;
  const [localEntries, setLocalEntries] = useState<SongEntry[]>([]);

  useEffect(() => {
    if (isListOpen && !asyncSongbookDetails.loading) {
      asyncSongbookDetails.execute(sessionKey);
    }
  }, [isListOpen, sessionKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (songbook?.song_entries) {
      setLocalEntries(songbook.song_entries);
    }
  }, [songbook?.song_entries]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localEntries.findIndex((e) => e.id === active.id);
    const newIndex = localEntries.findIndex((e) => e.id === over.id);
    const reordered = arrayMove(localEntries, oldIndex, newIndex);
    setLocalEntries(reordered);

    const entryIds = reordered.map((e) => e.id);
    await reorderSongEntries(sessionKey, entryIds);
  };

  const handleSongClick = async (position: number) => {
    const result = await setSongbookSong(sessionKey, position);
    if (result) {
      onListClose();
    }
  };

  return (
    <Modal isOpen={isListOpen} onClose={onListClose} size="lg">
      <ModalOverlay />
      <ModalContent p="10px">
        {asyncSongbookDetails.loading ? (
          <ModalHeader>Loading Song List...</ModalHeader>
        ) : (
          <ModalHeader>Song List for {songbook?.title}</ModalHeader>
        )}
        <ModalCloseButton />
        <ModalBody>
          {asyncSongbookDetails.loading ? (
            <Stack mb="50px">
              <Skeleton height="20px" />
              <Skeleton height="20px" />
              <Skeleton height="20px" />
            </Stack>
          ) : (
            <Box mb="50px">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={localEntries.map((e) => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {localEntries.map((entry) => (
                    <SortableSongItem
                      key={entry.id}
                      entry={entry}
                      onSongClick={handleSongClick}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
