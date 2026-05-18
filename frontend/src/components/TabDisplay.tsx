import { Box, Flex, Text, useColorModeValue, useMediaQuery } from "@chakra-ui/react";
import { AxiosResponse } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { UseAsyncReturn } from "react-async-hook";
import { formatTab, splitTabIntoColumns } from "../helpers/tab";
import {
  getShowChordDiagrams,
  setShowChordDiagrams,
} from "../helpers/chordDiagramSettings";
import { LINES_PER_COLUMN, User } from "../models";
import transposer from "./transposer";
import ChordHeader from "./ChordHeader";
import ChordTooltipLine from "./ChordTooltip";

export function useBumpAnimation(
  bumpDirection: "left" | "right" | null | undefined,
  bumpKey: number | undefined,
  clearBump: (() => void) | undefined
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bumpDirection || !ref.current) {
      return;
    }
    const el = ref.current;
    const offset = bumpDirection === "left" ? -20 : 20;
    const animation = el.animate(
      [
        { transform: "translateX(0)", opacity: 1 },
        { transform: `translateX(${offset}px)`, opacity: 0.7, offset: 0.3 },
        { transform: `translateX(${-offset / 3}px)`, opacity: 0.9, offset: 0.6 },
        { transform: "translateX(0)", opacity: 1 },
      ],
      { duration: 300, easing: "ease-out" }
    );
    animation.onfinish = () => clearBump?.();
    return () => animation.cancel();
  }, [bumpDirection, bumpKey, clearBump]);

  return ref;
}

interface TabDisplayProps {
  tab: string | false | undefined;
  firstColDispIndex: number;
  columnsOnScreen: number;
  asyncUser: UseAsyncReturn<false | AxiosResponse<User, any>, never[]>;
  fontScale: number;
  defaultTranspose: number | undefined;
}

export default function TabDisplay({
  tab,
  firstColDispIndex,
  columnsOnScreen,
  asyncUser,
  fontScale,
  defaultTranspose,
}: TabDisplayProps) {
  const [toneSteps, setToneSteps] = useState(0);
  const [usesSharps, setUsesSharps] = useState(true);
  const [showDiagrams, setShowDiagrams] = useState(getShowChordDiagrams);

  const user = asyncUser.result && asyncUser.result.data;
  const showChords = user ? user.userprofile.is_showing_chords : false;

  useEffect(() => {
    const handleStorage = () => setShowDiagrams(getShowChordDiagrams());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function handleTransposeChange(num) {
    let newTone = toneSteps + num;
    if (newTone === 12 || newTone === -12) {
      newTone = 0;
    }
    setToneSteps(newTone);
  }

  const handleKeyPress = useCallback(
    (event: any) => {
      if (event.key === "+") {
        handleTransposeChange(1);
      } else if (event.key === "-") {
        handleTransposeChange(-1);
      } else if (event.key === "#") {
        setUsesSharps(!usesSharps);
      } else if (event.key === "c" && !event.metaKey && !event.ctrlKey) {
        setShowDiagrams((prev) => {
          const next = !prev;
          setShowChordDiagrams(next);
          return next;
        });
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
    if (typeof defaultTranspose === "number") {
      setToneSteps(defaultTranspose);
    } else {
      setToneSteps(0);
    }
    setUsesSharps(true);
  }, [setToneSteps, setUsesSharps, tab]);

  const formattedTabArray = formatTab(tab, toneSteps);
  const tabColumns = splitTabIntoColumns(
    formattedTabArray,
    LINES_PER_COLUMN,
    fontScale
  );
  const [isSmallerThan900] = useMediaQuery("(max-width: 900px)");
  const isMobileDevice = isSmallerThan900;

  return (
    <>
      <ChordHeader tab={tab} show={showDiagrams} />
      {tabColumns &&
        (isMobileDevice ? (
          <MobileChords
            tabToDisplay={formattedTabArray}
            showChords={showChords}
          />
        ) : (
          <DesktopChords
            isLoading={!!tab}
            tabToDisplay={tabColumns}
            toneSteps={toneSteps}
            usesSharps={usesSharps}
            firstColDispIndex={firstColDispIndex}
            columnsOnScreen={columnsOnScreen}
            fontScale={fontScale}
          />
        ))}
    </>
  );
}

type DesktopChordsProps = {
  isLoading: boolean;
  tabToDisplay: string[][];
  toneSteps: number;
  usesSharps: boolean;
  firstColDispIndex: number;
  columnsOnScreen: number;
  fontScale: number;
};

function DesktopChords({
  tabToDisplay,
  toneSteps,
  usesSharps,
  firstColDispIndex,
  columnsOnScreen,
  isLoading,
  fontScale,
}: DesktopChordsProps) {
  const columnsToDisplayOnScreen = Math.min(
    columnsOnScreen,
    tabToDisplay.length
  );
  const totalPercentageWidthOfScreen =
    100 * (tabToDisplay?.length / columnsToDisplayOnScreen);

  return (
    <Flex
      direction="row"
      left={`-${50 * firstColDispIndex}%`}
      width={`${totalPercentageWidthOfScreen}%`}
      position="relative"
      transition={isLoading ? "left 0.4s ease" : ""}
    >
      {tabToDisplay &&
        tabToDisplay.map((column, idx) => (
          <Text
            key={idx}
            as="pre"
            style={{
              fontSize: `${fontScale / 10}rem`,
              fontFamily: "Ubuntu Mono",
            }}
            w={`${100 / columnsToDisplayOnScreen}%`}
            pl="1rem"
            overflow="hidden"
          >
            {column.map((tabLine) => {
              if (tabLine.includes("[ch]")) {
                return (
                  <ChordTooltipLine
                    key={window.crypto.randomUUID()}
                    tabLine={tabLine}
                    toneSteps={toneSteps}
                    usesSharps={usesSharps}
                  />
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

function MobileChords({
  tabToDisplay,
  showChords,
}: {
  tabToDisplay: string[];
  showChords: boolean;
}) {
  const chordColor = useColorModeValue("teal.500", "cyan.300");
  const fontStyles = showChords
    ? { fontSize: "1rem", fontFamily: "Ubuntu Mono" }
    : {
        fontSize: "1rem",
        fontFamily: "Helvetica",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
      };

  return (
    <Box as="pre" sx={fontStyles as any}>
      {tabToDisplay &&
        tabToDisplay.map((tabLine: string) => {
          if (tabLine.includes("[ch]")) {
            if (showChords) {
              return (
                <Text
                  overflowWrap="anywhere"
                  color={chordColor}
                  key={window.crypto.randomUUID()}
                >
                  {transposer(tabLine, 0, true)}
                </Text>
              );
            }
          } else {
            return (
              <Text key={window.crypto.randomUUID()}>
                {tabLine.length > 0 ? tabLine : " "}
              </Text>
            );
          }
          return;
        })}
    </Box>
  );
}
