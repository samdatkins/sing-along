import Countdown from "react-countdown";
import { Text, keyframes } from "@chakra-ui/react";
import { forwardRef, useState } from "react";

interface TimerProps {
  startActionPrompt: () => void;
  reference: any;
  key: number;
}

function Timer({ startActionPrompt, reference, key }: TimerProps) {
  // length of time for timer
  const [expTime, setExpTime] = useState(Date.now() + 60000);
  // state to manage styles and animation, allows for "warning" styling on timer when nearly expired (<= 5 secs)
  const [styles, setStyles] = useState({
    color: "#FAEBD7",
    animation: "",
    fontWeight: "",
  });

  const animationKeyframes = keyframes`
  0% { transform: scale(1); }
  25% { transform: scale(1.5) }
  50% { transform: scale(1); }
`;

  return (
    <Text
      key={key}
      animation={styles.animation}
      bgClip="text"
      fontSize="2.5em"
      mx="1rem"
      my=".5rem"
      fontWeight={styles.fontWeight}
      color={styles.color}
    >
      <Countdown
        ref={reference}
        key={key}
        text-align="top"
        date={expTime}
        intervalDelay={0}
        // displays the whole second time until expiration
        renderer={(props) => (
          <div key={key}>{props.total > 0 ? props.total / 1000 : ""}</div>
        )}
        // triggers the change in styling
        onTick={(props) => {
          const remainingSeconds = props.total / 1000;
          if (remainingSeconds === 5) {
            setStyles({
              color: "tomato",
              // time is calibrated to emulate the hearbeat effect
              animation: `${animationKeyframes} 1s ease-in-out infinite`,
              fontWeight: "extrabold",
            });
          }
        }}
        // when expired, we run the startDoAction function, passed in as a prop
        onComplete={startActionPrompt}
      />
    </Text>
  );
}

export default forwardRef(Timer);
