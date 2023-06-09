import { Avatar, AvatarGroup, Flex } from "@chakra-ui/react";
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

  return (
    <Flex>
      <AvatarGroup max={6}>
        {membersList &&
          membersList.length &&
          membersList.map((member) => {
            return (
              <Avatar
                name={member.user.first_name}
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
