import { Text, useColorModeValue, useMediaQuery } from "@chakra-ui/react";

function formatTab(tab) {
  let tabStartIndex = 0;
  const capoArray = tab.filter((e) => e.toLowerCase().includes("capo"));
  for (let i = 0; i < tab.length; i++) {
    if (tab[i].includes("[ch]")) {
      tabStartIndex = i;
      break;
    }
  }
  const newArray = tab.slice(tabStartIndex, tab.length);
  const fixedTabArray = [capoArray[0] || [], ...newArray];
  return fixedTabArray;
}

interface TabDisplayProps {
  tab: string | false | undefined;
  isNoodleMode: boolean | undefined;
}

export default function TabDisplay({ tab, isNoodleMode }: TabDisplayProps) {
  const splitTab = (tab || "")
    .replaceAll("[tab]", "")
    .replaceAll("[/tab]", "")
    .replaceAll("\r\n", "\n")
    .split("\n");

  const fixedTabArray = formatTab(splitTab);
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
          <TabWithChords tabToDisplay={tabToDisplay} />
        ))}
    </>
  );
}

function TabWithChords({ tabToDisplay }) {
  const chordColor = useColorModeValue("teal.500", "cyan.500");

  return (
    <pre style={{ fontSize: "1rem", fontFamily: "Ubuntu Mono" }}>
      {tabToDisplay?.map((tabLine: string) => {
        if (tabLine.includes("[ch]")) {
          return (
            <Text color={chordColor} key={window.crypto.randomUUID()}>
              {tabLine.replaceAll("[ch]", "").replaceAll("[/ch]", "")}
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
