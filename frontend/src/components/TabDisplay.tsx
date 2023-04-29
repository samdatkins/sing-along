import { Flex, Text, useColorModeValue, useMediaQuery } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import transposer from "./transposer";
import { formatTab, splitTabIntoColumns } from "../helpers/tab";
import { LINES_PER_COLUMN } from "../models";

interface TabDisplayProps {
  tab: string | false | undefined;
  firstColDispIndex: number;
  columnsToDisplay: number;
}

export default function TabDisplay({
  tab,
  firstColDispIndex,
  columnsToDisplay,
}: TabDisplayProps) {
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
    [handleTransposeChange, usesSharps, setUsesSharps]
  );

  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    setToneSteps(0);
    setUsesSharps(true);
  }, [setToneSteps, setUsesSharps, tab]);

  const formattedTabArray = formatTab(tab, toneSteps);
  const tabColumns = splitTabIntoColumns(formattedTabArray, LINES_PER_COLUMN);
  const [isSmallerThan900] = useMediaQuery("(max-width: 900px)");

  return (
    <>
      {tabColumns &&
        (isSmallerThan900 ? (
          <TabWithoutChords tabToDisplay={formattedTabArray} />
        ) : (
          <TabWithChords
            tabToDisplay={tabColumns}
            toneSteps={toneSteps}
            usesSharps={usesSharps}
            firstColDispIndex={firstColDispIndex}
            columnsToDisplay={columnsToDisplay}
          />
        ))}
    </>
  );
}

type TabWithChordsProps = {
  tabToDisplay: string[][];
  toneSteps: number;
  usesSharps: boolean;
  firstColDispIndex: number;
  columnsToDisplay: number;
};

function TabWithChords({
  tabToDisplay,
  toneSteps,
  usesSharps,
  firstColDispIndex,
  columnsToDisplay,
}: TabWithChordsProps) {
  const chordColor = useColorModeValue("teal.500", "cyan.300");

  return (
    <Flex direction="row" width="100%">
      {tabToDisplay &&
        tabToDisplay
          .slice(firstColDispIndex, firstColDispIndex + columnsToDisplay)
          .map((column) => (
            <Text
              as="pre"
              style={{ fontSize: "1rem", fontFamily: "Ubuntu Mono" }}
              w={`${100 / columnsToDisplay}%`}
            >
              {column.map((tabLine) => {
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
            </Text>
          ))}
    </Flex>
  );
}

function TabWithoutChords({ tabToDisplay }: { tabToDisplay: string[] }) {
  return (
    <pre style={{ fontSize: "1rem", fontFamily: "Helvetica" }}>
      {tabToDisplay &&
        tabToDisplay.map((tabLine: string) => {
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
