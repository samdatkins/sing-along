import {
  Box,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import ChordDiagram from "./ChordDiagram";
import { getChordDiagram, VexchordData } from "../helpers/chordDiagrams";
import transposer from "./transposer";

interface ChordTooltipLineProps {
  tabLine: string;
  toneSteps: number;
  usesSharps: boolean;
}

interface ChordSegment {
  text: string;
  isChord: boolean;
  diagram: VexchordData | null;
}

function parseChordLine(
  tabLine: string,
  toneSteps: number,
  usesSharps: boolean
): ChordSegment[] {
  const segments: ChordSegment[] = [];
  const parts = tabLine.split(/(\[ch\].*?\[\/ch\])/g);

  for (const part of parts) {
    const chordMatch = part.match(/^\[ch\](.*?)\[\/ch\]$/);
    if (chordMatch) {
      const rawChord = chordMatch[1];
      const transposed = transposer(`[ch]${rawChord}[/ch]`, toneSteps, usesSharps);
      const diagram = getChordDiagram(transposed);
      segments.push({ text: transposed, isChord: true, diagram });
    } else if (part.length > 0) {
      segments.push({ text: part, isChord: false, diagram: null });
    }
  }

  return segments;
}

export default function ChordTooltipLine({
  tabLine,
  toneSteps,
  usesSharps,
}: ChordTooltipLineProps) {
  const chordColor = useColorModeValue("teal.500", "cyan.300");
  const segments = parseChordLine(tabLine, toneSteps, usesSharps);

  return (
    <Text color={chordColor} as="span" display="block">
      {segments.map((segment, idx) => {
        if (!segment.isChord) {
          return <span key={idx}>{segment.text}</span>;
        }
        if (!segment.diagram) {
          return <span key={idx}>{segment.text}</span>;
        }
        return (
          <ChordPopover key={idx} text={segment.text} diagram={segment.diagram} />
        );
      })}
    </Text>
  );
}

function ChordPopover({
  text,
  diagram,
}: {
  text: string;
  diagram: VexchordData;
}) {
  const popoverBg = useColorModeValue("white", "gray.800");

  return (
    <Popover trigger="hover" placement="top" openDelay={200} closeDelay={100} isLazy lazyBehavior="keepMounted">
      <PopoverTrigger>
        <Box
          as="span"
          cursor="pointer"
          textDecoration="underline"
          textDecorationStyle="dotted"
          textUnderlineOffset="2px"
        >
          {text}
        </Box>
      </PopoverTrigger>
      <Portal>
        <PopoverContent width="auto" bg={popoverBg} shadow="xl" zIndex="popover">
          <PopoverArrow bg={popoverBg} />
          <PopoverBody p={1}>
            <ChordDiagram chordData={diagram} width={100} height={120} />
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}
