import { Text, keyframes } from "@chakra-ui/react";

interface ActionPromptProps {
  actionPromptText: string;
}

export default function Action({ actionPromptText }: ActionPromptProps) {
  const animationKeyframes = keyframes`
  from { transform: scale(1) }
  to { transform: scale(3) rotate(360deg) }
`;

  return (
    <Text
      animation={`${animationKeyframes} 1.6s ease-in`}
      bgClip="text"
      fontSize="5em"
      fontWeight="extrabold"
      color="periwinkle"
    >
      {actionPromptText}!
    </Text>
  );
}
