import { useColorModeValue } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { ChordBox } from "vexchords";
import { VexchordData } from "../helpers/chordDiagrams";

interface ChordDiagramProps {
  chordData: VexchordData;
  width?: number;
  height?: number;
}

export default function ChordDiagram({
  chordData,
  width = 100,
  height = 120,
}: ChordDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const defaultColor = useColorModeValue("#444", "#ddd");
  const bgColor = useColorModeValue("#fff", "#1a202c");
  const labelColor = useColorModeValue("#fff", "#1a202c");

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    new ChordBox(containerRef.current, {
      width,
      height,
      defaultColor,
      bgColor,
      labelColor,
      numFrets: 5,
      fontWeight: "400",
      labelWeight: "400",
    }).draw(chordData);
  }, [chordData, width, height, defaultColor, bgColor, labelColor]);

  return <div ref={containerRef} style={{ display: "inline-block" }} />;
}
