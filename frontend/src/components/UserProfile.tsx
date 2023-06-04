import { Image, SkeletonCircle, useDisclosure } from "@chakra-ui/react";
import { useAsync } from "react-async-hook";
import { getUserDetails } from "../services/songs";
import ProfileModal from "./ProfileModal";

export default function UserProfile() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const asyncUser = useAsync(getUserDetails, []);
  const user = asyncUser.result && asyncUser.result.data;

  return (
    <>
      {user ? (
        <Image
          referrerPolicy="no-referrer"
          src={user?.social.picture}
          position="fixed"
          top="0px"
          right="0px"
          rounded="100%"
          margin="1rem"
          height="32px"
          cursor="pointer"
          onClick={onOpen}
        />
      ) : (
        <SkeletonCircle alignSelf="center" margin="1rem" size="20" />
      )}
      {user && <ProfileModal onClose={onClose} isOpen={isOpen} user={user} />}
    </>
  );
}
