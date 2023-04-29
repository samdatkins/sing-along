import { Icon } from "@chakra-ui/react";
import { FaAlignJustify } from "react-icons/fa";

interface ColumnMapProps {
  firstColDispIndex: number;
  setFirstColDispIndex: React.Dispatch<React.SetStateAction<number>>;
  columnsToDisplay: number;
  totalColumns: number;
}

export default function ColumnMap({
  firstColDispIndex,
  setFirstColDispIndex,
  columnsToDisplay,
  totalColumns,
}: ColumnMapProps) {
  return (
    <>
      {[...Array(totalColumns).keys()].map((idx) => {
        const isActiveColumn =
          idx >= firstColDispIndex &&
          idx < firstColDispIndex + columnsToDisplay;
        const isFirstActiveColumn = idx === firstColDispIndex;
        const isLastActiveColumn =
          idx === firstColDispIndex + columnsToDisplay - 1;
        return (
          <Icon
            key={idx}
            as={FaAlignJustify}
            color={isActiveColumn ? "blue.500" : ""}
            w="8"
            h="8"
            cursor="pointer"
            borderLeft={isFirstActiveColumn ? "2px" : ""}
            borderTop={isActiveColumn ? "2px" : ""}
            borderBottom={isActiveColumn ? "2px" : ""}
            borderRight={isLastActiveColumn ? "2px" : ""}
            onClick={() =>
              setFirstColDispIndex(Math.max(0, idx - (columnsToDisplay - 1)))
            }
          />
        );
      })}
    </>
  );
}
