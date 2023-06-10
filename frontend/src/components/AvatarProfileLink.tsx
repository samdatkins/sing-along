import {
  Avatar,
  SkeletonCircle,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { AxiosResponse } from "axios";
import { UseAsyncReturn } from "react-async-hook";
import { User } from "../models";
import SettingModal from "./SettingsModal";

interface UserProfileProps {
  asyncUser: UseAsyncReturn<false | AxiosResponse<User, any>, never[]>;
}

export default function UserProfile({ asyncUser }: UserProfileProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const user = asyncUser.result && asyncUser.result.data;
  const avatarBackgroundStyle = {
    color: useColorModeValue("white", "black"),
    bg: useColorModeValue("teal.500", "cyan.300"),
  };
  return (
    <>
      {user ? (
        <Avatar
          onClick={onOpen}
          mr="10px"
          mt="10px"
          size="sm"
          referrerPolicy="no-referrer"
          {...avatarBackgroundStyle}
          name={`${user.first_name} ${user.last_name}`}
          src={user.social_auth?.[0]?.picture}
        />
      ) : (
        <SkeletonCircle alignSelf="center" margin="1rem" size="32px" />
      )}
      {user && (
        <SettingModal onClose={onClose} isOpen={isOpen} asyncUser={asyncUser} />
      )}
    </>
  );
}
