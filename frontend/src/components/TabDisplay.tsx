import { Text } from "@chakra-ui/react";

const isFullSongMode = false;

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
  /*
    truncatedSplitTab &&
      truncatedSplitTab?.splice(
        Math.floor(truncatedSplitTab.length / 2 - 1),
        0,
        "FIX CHORDS ON BOTTOM OF SCREEN -- TBD",
      );
    */
  const tabToDisplay =
    isNoodleMode || isFullSongMode ? fixedTabArray : truncatedSplitTabArray;
  return (
    <>
      {tabToDisplay && (
        <pre style={{ fontSize: "1rem", fontFamily: "Ubuntu Mono" }}>
          {tabToDisplay?.map((tabLine: string) => {
            if (tabLine.includes("[ch]")) {
              return (
                <Text color="cyan.500" key={window.crypto.randomUUID()}>
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
      )}
    </>
  );
}
