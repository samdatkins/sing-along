import Countdown from "react-countdown";
import { Text, Box, keyframes } from "@chakra-ui/react";
import React, { useState } from "react";

export default function Timer() {
  const [styles, setStyles] = useState({ color: "#FAEBD7", fontSize: "6xl" });

  const animationKeyframes = keyframes`
  0% { transform: scale(1) rotate(0); }
  25% { transform: scale(1.5) rotate(0); }
  30% { transform: scale(1.5) }
  35% { transform: scale(1.5) }
  50% { transform: scale(1) rotate(0); }
`;

  const animation = `${animationKeyframes} 1s ease-in-out infinite`;

  return (
    <Box>
      <Text
        // as={styles.color === "tomato" ? motion.div : ""}
        animation={styles.color === "tomato" ? animation : ""}
        bgClip="text"
        fontSize={styles.fontSize}
        fontWeight="extrabold"
        color={styles.color}
      >
        <Countdown
          date={Date.now() + 60000}
          intervalDelay={0}
          renderer={(props) => (
            <div>{props.total > 0 ? props.total / 1000 : ""}</div>
          )}
          onTick={(props) => {
            if (props.total / 1000 === 5) {
              setStyles({ color: "tomato", fontSize: "8xl" });
            }
          }}
          onComplete={() => window.location.reload()}
        />
      </Text>
    </Box>
  );
}
