import { Avatar, AvatarGroup, Flex } from "@chakra-ui/react";

const MemberAvatarGroup = () => {
  const membersList = [
    {
      user: {
        id: 2,
        first_name: "David",
        last_name: "Bowie",
        social_auth: [
          {
            picture: "/bowie.jpg",
          },
        ],
      },
      songs_requested: 38,
    },
    {
      user: {
        id: 3,
        first_name: "Annie",
        last_name: "Lennox",
        social_auth: [
          {
            picture: "/lennox.jpg",
          },
        ],
      },
      songs_requested: 14,
    },
    {
      user: {
        id: 1,
        first_name: "Prince",
        last_name: "Formerly",
        social_auth: [
          {
            picture: "/prince.jpg",
          },
        ],
      },
      songs_requested: 27,
    },
    {
      user: {
        id: 12,
        first_name: "Cyndi",
        last_name: "Lauper",
        social_auth: [
          {
            picture: "/lauper.jpg",
          },
        ],
      },
      songs_requested: 0,
    },
    {
      user: {
        id: 33,
        first_name: "Rivers",
        last_name: "Cuomo",
        social_auth: [
          {
            picture: "/cuomo.jpg",
          },
        ],
      },
      songs_requested: 6,
    },
    {
      user: {
        id: 66,
        first_name: "Billy",
        last_name: "Corgan",
        social_auth: [
          {
            picture: "/corgan.jpg",
          },
        ],
      },
      songs_requested: 12,
    },
    {
      user: {
        id: 34,
        first_name: "Angel",
        last_name: "Olsen",
        social_auth: [
          {
            picture: "/olsen.jpg",
          },
        ],
      },
      songs_requested: 5,
    },
    {
      user: {
        id: 44,
        first_name: "Stephen",
        last_name: "Malkmus",
        social_auth: [
          {
            picture: "/malkmus.jpg",
          },
        ],
      },
      songs_requested: 7,
    },
    {
      user: {
        id: 55,
        first_name: "Gwen",
        last_name: "Stefani",
        social_auth: [
          {
            picture: "/stefani.jpg",
          },
        ],
      },
      songs_requested: 19,
    },
  ];

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
