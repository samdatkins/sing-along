import { Avatar, AvatarGroup, Flex, useColorModeValue } from "@chakra-ui/react";
import { useAsync } from "react-async-hook";
import { getSongbookStats } from "../services/songs";

interface MemberAvatarGroupProps {
  sessionKey: string;
}

const MemberAvatarGroup = ({ sessionKey }: MemberAvatarGroupProps) => {
  //change this fetch when member list is being served on asyncSongbook
  const asyncSongbookStats = useAsync(getSongbookStats, [sessionKey], {
    setLoading: (state) => ({ ...state, loading: true }),
  });
  const membersList = asyncSongbookStats?.result?.data;

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
                name={`${member.user.first_name} ${member.user.last_initial}`}
                referrerPolicy="no-referrer"
                src={member.user.social_auth[0].picture}
                key={member.user.id}
              />
            );
          })}
      </AvatarGroup>
    </Flex>
  );
};
export default MemberAvatarGroup;
