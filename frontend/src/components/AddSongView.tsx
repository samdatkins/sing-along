import { Button, Input, ListItem, Text, UnorderedList } from "@chakra-ui/react";
import { useState } from "react";

export default function AddSongView() {
  const [song, setSong] = useState("");
  return (
    <>
      <p>Request a song to add to the playlist:</p>
      <Input
        placeholder="Lynyrd Skynyrd - Freebird"
        onChange={(e) => setSong(e.target.value)}
        value={song}
      />
      <Button colorScheme="blue">Submit</Button>
      <Text>Or select one of these recommendations!</Text>
      <UnorderedList>
        <ListItem>Hash Pipe</ListItem>
        <ListItem>Hash Brown</ListItem>
        <ListItem>Charlie Brown</ListItem>
      </UnorderedList>
    </>
  );
}
