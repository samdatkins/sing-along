import { Text, keyframes, useColorModeValue } from "@chakra-ui/react";

interface FullScreenPromptProps {
  animate: boolean;
  text: string;
}

export default function FullScreenPrompt({
  animate,
  text,
}: FullScreenPromptProps) {
  const animationKeyframes = keyframes`
  from { transform: scale(3) }
  to { transform: scale(1) rotate(360deg) }
`;

  return (
    <Text
      position="absolute"
      ml="auto"
      mr="auto"
      left="0"
      right="0"
      mt="6rem"
      textAlign="center"
      animation={animate ? `${animationKeyframes} 1.6s ease-in` : ""}
      fontSize="24rem"
      fontWeight="extrabold"
      color={useColorModeValue("blackAlpha.500", "whiteAlpha.500")}
      lineHeight="100%"
      pointerEvents="none" // This allows things behind the text to be clicked
    >
      {text}
    </Text>
  );
}
