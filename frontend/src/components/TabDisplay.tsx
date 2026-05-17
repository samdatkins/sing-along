import { Box, Flex, Text, useColorModeValue, useMediaQuery } from "@chakra-ui/react";
import { AxiosResponse } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { UseAsyncReturn } from "react-async-hook";
import { formatTab, splitTabIntoColumns } from "../helpers/tab";
import { LINES_PER_COLUMN, User } from "../models";
import transposer from "./transposer";

function useBumpAnimation(
  bumpDirection: "left" | "right" | null | undefined,
  bumpKey: number | undefined,
  clearBump: (() => void) | undefined
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bumpDirection || !ref.current) return;
    const offset = bumpDirection === "left" ? -12 : 12;
    const animation = ref.current.animate(
      [
        { transform: "translateX(0)" },
        { transform: `translateX(${offset}px)`, offset: 0.3 },
        { transform: `translateX(${-offset / 3}px)`, offset: 0.6 },
        { transform: "translateX(0)" },
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
  bumpDirection?: "left" | "right" | null;
  bumpKey?: number;
  clearBump?: () => void;
}

export default function TabDisplay({
  tab,
  firstColDispIndex,
  columnsOnScreen,
  asyncUser,
  fontScale,
  defaultTranspose,
  bumpDirection,
  bumpKey,
  clearBump,
}: TabDisplayProps) {
  const [toneSteps, setToneSteps] = useState(0);
  const [usesSharps, setUsesSharps] = useState(true);

  const user = asyncUser.result && asyncUser.result.data;
  const showChords = user ? user.userprofile.is_showing_chords : false;

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
      {tabColumns &&
        (isMobileDevice ? (
          <MobileChords
            tabToDisplay={formattedTabArray}
            showChords={showChords}
            bumpDirection={bumpDirection}
            bumpKey={bumpKey}
            clearBump={clearBump}
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
            bumpDirection={bumpDirection}
            bumpKey={bumpKey}
            clearBump={clearBump}
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
  bumpDirection?: "left" | "right" | null;
  bumpKey?: number;
  clearBump?: () => void;
};

function DesktopChords({
  tabToDisplay,
  toneSteps,
  usesSharps,
  firstColDispIndex,
  columnsOnScreen,
  isLoading,
  fontScale,
  bumpDirection,
  bumpKey,
  clearBump,
}: DesktopChordsProps) {
  const chordColor = useColorModeValue("teal.500", "cyan.300");
  const columnsToDisplayOnScreen = Math.min(
    columnsOnScreen,
    tabToDisplay.length
  );
  const totalPercentageWidthOfScreen =
    100 * (tabToDisplay?.length / columnsToDisplayOnScreen);

  const bumpRef = useBumpAnimation(bumpDirection, bumpKey, clearBump);

  return (
    <Flex
      ref={bumpRef}
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

function MobileChords({
  tabToDisplay,
  showChords,
  bumpDirection,
  bumpKey,
  clearBump,
}: {
  tabToDisplay: string[];
  showChords: boolean;
  bumpDirection?: "left" | "right" | null;
  bumpKey?: number;
  clearBump?: () => void;
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

  const bumpRef = useBumpAnimation(bumpDirection, bumpKey, clearBump);

  return (
    <Box ref={bumpRef} as="pre" sx={fontStyles as any}>
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
