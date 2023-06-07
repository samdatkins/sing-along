import { Image, SkeletonCircle, useDisclosure } from "@chakra-ui/react";
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

  return (
    <>
      {user ? (
        <Image
          referrerPolicy="no-referrer"
          src={user?.social_auth.picture}
          rounded="100%"
          margin="1rem"
          height="32px"
          cursor="pointer"
          onClick={onOpen}
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
