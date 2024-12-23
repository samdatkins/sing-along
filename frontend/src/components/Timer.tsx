import Countdown from "react-countdown";
import { Text, useColorModeValue } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useEffect, useState } from "react";

interface TimerProps {
  triggerOnTimerComplete: () => void;
  reference: any;
  timerKey: number;
  isLive: boolean;
  countdownTimeInSeconds: number;
}

function getTimerResetTime(countdownTimeInSeconds: number) {
  return Date.now() + countdownTimeInSeconds * 1000;
}

const animationKeyframes = keyframes`
0% { transform: scale(1); }
25% { transform: scale(1.5) }
50% { transform: scale(1); }
`;

export default function Timer({
  triggerOnTimerComplete,
  reference,
  timerKey,
  isLive,
  countdownTimeInSeconds,
}: TimerProps) {
  // length of time for timer
  const [expTime, setExpTime] = useState(
    getTimerResetTime(countdownTimeInSeconds)
  );

  // Default to something greater than 5 so we don't get alert styling at the start
  const [remainingSeconds, setRemainingSeconds] = useState(100);

  const defaultStyle = {};

  const pausedStyle = {
    color: useColorModeValue("blackAlpha.500", "whiteAlpha.500"),
  };

  const alertStyle = {
    color: "tomato",
    // time is calibrated to emulate the hearbeat effect
    animation: `${animationKeyframes} 1s ease-in-out infinite`,
    fontWeight: "extrabold",
  };
  const fontStyles = !isLive
    ? pausedStyle
    : remainingSeconds <= 5
    ? alertStyle
    : defaultStyle;

  useEffect(() => {
    setExpTime(getTimerResetTime(countdownTimeInSeconds));
  }, [timerKey, countdownTimeInSeconds]);

  return (
    <Text fontSize="3em" {...fontStyles}>
      <Countdown
        ref={reference}
        key={timerKey}
        text-align="top"
        date={expTime}
        intervalDelay={250}
        // displays the whole second time until expiration
        renderer={(props) => (
          <span>{props.total > 0 ? props.total / 1000 : ""}</span>
        )}
        onTick={(props) => {
          setRemainingSeconds(props.total / 1000);
        }}
        onComplete={(_, completedOnStart) => {
          !completedOnStart && triggerOnTimerComplete();
        }}
      />
    </Text>
  );
}
