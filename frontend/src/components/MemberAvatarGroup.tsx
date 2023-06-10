import { Avatar, AvatarGroup, Flex, useColorModeValue } from "@chakra-ui/react";
import { PublicUser } from "../models";

interface MemberAvatarGroupProps {
  membersList: PublicUser[];
}

const MemberAvatarGroup = ({ membersList }: MemberAvatarGroupProps) => {
  const avatarBackgroundStyle = {
    color: useColorModeValue("white", "black"),
    bg: useColorModeValue("teal.500", "cyan.300"),
  };
  return (
    <Flex>
      <AvatarGroup max={6}>
        {membersList?.length &&
          membersList.map((member) => {
            return (
              <Avatar
                {...avatarBackgroundStyle}
                name={`${member["user"].first_name} ${member["user"].last_initial}`}
                referrerPolicy="no-referrer"
                src={member["user"].social_auth.picture}
                key={member["user"].id}
              />
            );
          })}
      </AvatarGroup>
    </Flex>
  );
};
export default MemberAvatarGroup;
