import { Text, useColorModeValue, useMediaQuery } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import transposer from "./transposer";

function formatTab(tab, toneSteps) {
  let tabStartIndex = 0;
  const capoArray = tab.filter((e) => e.toLowerCase().includes("capo"));
  for (let i = 0; i < tab.length; i++) {
    if (tab[i].includes("[ch]")) {
      tabStartIndex = i;
      break;
    }
  }
  const trimmedTab = tab.slice(tabStartIndex, tab.length);
  const capoDisplay = capoArray[0] || [];
  const transposeDisplay =
    toneSteps != 0 ? "transposed " + toneSteps + " steps" : "";
  const capoAndTranspositionDisplay = capoDisplay + " " + transposeDisplay;
  const fixedTab = [capoAndTranspositionDisplay, ...trimmedTab];
  return fixedTab;
}

interface TabDisplayProps {
  tab: string | false | undefined;
  isNoodleMode: boolean | undefined;
}

export default function TabDisplay({ tab, isNoodleMode }: TabDisplayProps) {
  const [toneSteps, setToneSteps] = useState(0);
  const [usesSharps, setUsesSharps] = useState(true);

  function handleTransposeChange(num) {
    let newTone = toneSteps + num;
    if (newTone === 12 || newTone === -12) {
      newTone = 0;
    }
    setToneSteps(newTone);
  }

  const handleKeyPress = useCallback(
    (event: any) => {
      // This first one is the only one that non-admins are allowed to use
      if (event.key === "+") {
        handleTransposeChange(1);
      } else if (event.key === "-") {
        handleTransposeChange(-1);
      } else if (event.key === "#") {
        setUsesSharps(!usesSharps);
      }
    },
    [handleTransposeChange, usesSharps, setUsesSharps],
  );

  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  const splitTab = (tab || "")
    .replaceAll("[tab]", "")
    .replaceAll("[/tab]", "")
    .replaceAll("\r\n", "\n")
    .split("\n");

  const fixedTabArray = formatTab(splitTab, toneSteps);
  const truncatedSplitTabArray = fixedTabArray && fixedTabArray?.slice(0, 120);
  const [isSmallerThan900] = useMediaQuery("(max-width: 900px)");
  /*
    truncatedSplitTab &&
      truncatedSplitTab?.splice(
        Math.floor(truncatedSplitTab.length / 2 - 1),
        0,
        "FIX CHORDS ON BOTTOM OF SCREEN -- TBD",
      );
    */
  const tabToDisplay = isNoodleMode ? fixedTabArray : truncatedSplitTabArray;
  return (
    <>
      {tabToDisplay &&
        (isSmallerThan900 ? (
          <TabWithoutChords tabToDisplay={tabToDisplay} />
        ) : (
          <TabWithChords
            tabToDisplay={tabToDisplay}
            toneSteps={toneSteps}
            usesSharps={usesSharps}
          />
        ))}
    </>
  );
}

type TabWithChordsProps = {
  tabToDisplay: any[];
  toneSteps: number;
  usesSharps: boolean;
};

function TabWithChords({
  tabToDisplay,
  toneSteps,
  usesSharps,
}: TabWithChordsProps) {
  const chordColor = useColorModeValue("teal.500", "cyan.300");

  return (
    <pre style={{ fontSize: "1rem", fontFamily: "Ubuntu Mono" }}>
      {tabToDisplay?.map((tabLine: string) => {
        if (tabLine.includes("[ch]")) {
          return (
            <Text color={chordColor} key={window.crypto.randomUUID()}>
              {transposer(tabLine, toneSteps, usesSharps)}
            </Text>
          );
        } else {
          return (
            <Text key={window.crypto.randomUUID()}>
              {tabLine.length > 0 ? tabLine : " "}
            </Text>
          );
        }
      })}
    </pre>
  );
}

function TabWithoutChords({ tabToDisplay }) {
  return (
    <pre style={{ fontSize: "1rem", fontFamily: "Helvetica" }}>
      {tabToDisplay?.map((tabLine: string) => {
        if (!tabLine.includes("[ch]")) {
          return (
            <Text key={window.crypto.randomUUID()}>
              {tabLine.length > 0 ? tabLine : " "}
            </Text>
          );
        }
        return;
      })}
    </pre>
  );
}
