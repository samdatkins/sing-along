import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { useMemo } from "react";
import ChordDiagram from "./ChordDiagram";
import { extractChordsFromTab, getChordDiagram } from "../helpers/chordDiagrams";

interface ChordHeaderProps {
  tab: string | false | undefined;
  show: boolean;
}

export default function ChordHeader({ tab, show }: ChordHeaderProps) {
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const chordNames = useMemo(() => extractChordsFromTab(tab), [tab]);

  const chordsWithDiagrams = useMemo(
    () =>
      chordNames
        .map((name) => ({ name, diagram: getChordDiagram(name) }))
        .filter((c) => c.diagram !== null),
    [chordNames]
  );

  if (!show || chordsWithDiagrams.length === 0) return null;

  return (
    <Box
      borderBottom="1px solid"
      borderColor={borderColor}
      pb={2}
      mb={2}
      overflowX="auto"
    >
      <Flex wrap="wrap" gap={2} justify="center" align="flex-end">
        {chordsWithDiagrams.map(({ name, diagram }) => (
          <Flex
            key={name}
            direction="column"
            align="center"
            minW="80px"
          >
            <ChordDiagram chordData={diagram!} width={80} height={100} />
            <Text fontSize="xs" fontWeight="bold" mt={-1}>
              {name}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}
