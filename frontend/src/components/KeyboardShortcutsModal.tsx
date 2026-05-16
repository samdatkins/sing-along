import {
  Flex,
  Kbd,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSongbookOwner: boolean;
}

interface Shortcut {
  keys: React.ReactNode;
  description: string;
}

const isMac =
  typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
const modKey = isMac ? "Cmd" : "Ctrl";

function ShortcutSection({
  title,
  shortcuts,
}: {
  title: string;
  shortcuts: Shortcut[];
}) {
  return (
    <>
      <Text fontWeight="bold" fontSize="md" mt={4} mb={1}>
        {title}
      </Text>
      <Table size="sm" variant="simple">
        <Thead>
          <Tr>
            <Th width="45%">Key</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {shortcuts.map((s, i) => (
            <Tr key={i}>
              <Td>
                <Flex gap="4px" alignItems="center" flexWrap="wrap">
                  {s.keys}
                </Flex>
              </Td>
              <Td>{s.description}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
}

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
  isSongbookOwner,
}: KeyboardShortcutsModalProps) {
  const generalShortcuts: Shortcut[] = [
    {
      keys: <Kbd>`</Kbd>,
      description: "Toggle dark / light mode",
    },
    {
      keys: <Kbd>?</Kbd>,
      description: "Open this help menu",
    },
  ];

  const ownerShortcuts: Shortcut[] = [
    {
      keys: <Kbd>Space</Kbd>,
      description: "Play / pause timer",
    },
    {
      keys: (
        <>
          <Kbd>Shift</Kbd> + <Kbd>&larr;</Kbd>
        </>
      ),
      description: "Preview previous song",
    },
    {
      keys: (
        <>
          <Kbd>Shift</Kbd> + <Kbd>&rarr;</Kbd>
        </>
      ),
      description: "Preview next song",
    },
    {
      keys: (
        <>
          <Kbd>&larr;</Kbd> / <Kbd>&rarr;</Kbd>
        </>
      ),
      description: "Scroll columns (hold 3s to navigate songs)",
    },
    {
      keys: <Kbd>Delete</Kbd>,
      description: "Delete current song",
    },
    {
      keys: <Kbd>!</Kbd>,
      description: "Flag current song",
    },
    {
      keys: <Kbd>R</Kbd>,
      description: "Refresh / restart timer",
    },
    {
      keys: <Kbd>/</Kbd>,
      description: 'Open "Jump To\u2026" search',
    },
    {
      keys: (
        <>
          <Kbd>{modKey}</Kbd> + <Kbd>=</Kbd>
        </>
      ),
      description: "Increase font size",
    },
    {
      keys: (
        <>
          <Kbd>{modKey}</Kbd> + <Kbd>-</Kbd>
        </>
      ),
      description: "Decrease font size",
    },
  ];

  const transposeShortcuts: Shortcut[] = [
    {
      keys: <Kbd>+</Kbd>,
      description: "Transpose up one semitone",
    },
    {
      keys: <Kbd>-</Kbd>,
      description: "Transpose down one semitone",
    },
    {
      keys: <Kbd>#</Kbd>,
      description: "Toggle sharps / flats",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Keyboard Shortcuts</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <ShortcutSection title="General" shortcuts={generalShortcuts} />
          {isSongbookOwner && (
            <ShortcutSection
              title="Songbook Owner"
              shortcuts={ownerShortcuts}
            />
          )}
          <ShortcutSection title="Transpose" shortcuts={transposeShortcuts} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
