import { ApolloCache } from "@apollo/client";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { IconButton, Stack, Text } from "@chakra-ui/react";
import gql from "graphql-tag";
import { FC } from "react";
import { Post, PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

const updateAfterVote = (value: number, postId: number, cache: ApolloCache<any>) => {
  const data = cache.readFragment<Pick<Post, "id" | "points" | "voteStatus">>({
    id: "Post:" + postId,
    fragment: gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
    variables: { id: postId },
  });

  if (data) {
    if (data.voteStatus === value) return;
    const newPoints = data.points + (data.voteStatus ? 2 : 1) * value;
    cache.writeFragment({
      id: "Post:" + postId,
      fragment: gql`
        fragment __ on Post {
          points
          voteStatus
        }
      `,
      data: { id: postId, points: newPoints, voteStatus: value },
    });
  }
};

const UpdootSection: FC<UpdootSectionProps> = ({ post }) => {
  const [vote] = useVoteMutation();

  return (
    <Stack mr='4'>
      <IconButton
        colorScheme={post.voteStatus === 1 ? "green" : undefined}
        onClick={async () => {
          if (post.voteStatus !== 1)
            await vote({
              variables: { postId: post.id, value: 1 },
              update: (cache) => updateAfterVote(1, post.id, cache),
            });
        }}
        icon={<ChevronUpIcon boxSize='24px' />}
        aria-label='Upvote'
      />
      <Text textAlign='center'>{post.points}</Text>
      <IconButton
        colorScheme={post.voteStatus === -1 ? "red" : undefined}
        onClick={async () => {
          if (post.voteStatus !== -1)
            await vote({
              variables: { postId: post.id, value: -1 },
              update: (cache) => updateAfterVote(-1, post.id, cache),
            });
        }}
        icon={<ChevronDownIcon boxSize='24px' />}
        aria-label='Downvote'
      />
    </Stack>
  );
};

export default UpdootSection;
