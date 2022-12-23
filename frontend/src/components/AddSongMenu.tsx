import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Input,
} from "@chakra-ui/react";

interface AddSongMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSongMenu({ isOpen, onClose }: AddSongMenuProps) {
  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Request a song:</DrawerHeader>

          <DrawerBody>
            <Input placeholder="Lynyrd Skynyrd - Free Bird" />
            <Flex direction="row" justifyContent="end">
              <Button type="submit" mt="1rem">
                Submit
              </Button>
            </Flex>
          </DrawerBody>

          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
