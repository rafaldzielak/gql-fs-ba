import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { IconButton, Stack, Text } from "@chakra-ui/react";
import { FC } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

const UpdootSection: FC<UpdootSectionProps> = ({ post }) => {
  const [, vote] = useVoteMutation();

  return (
    <Stack mr='4'>
      <IconButton
        colorScheme={post.voteStatus === 1 ? "green" : undefined}
        onClick={async () => {
          if (post.voteStatus !== 1) await vote({ postId: post.id, value: 1 });
        }}
        icon={<ChevronUpIcon boxSize='24px' />}
        aria-label='Upvote'
      />
      <Text textAlign='center'>{post.points}</Text>
      <IconButton
        colorScheme={post.voteStatus === -1 ? "red" : undefined}
        onClick={async () => {
          if (post.voteStatus !== -1) await vote({ postId: post.id, value: -1 });
        }}
        icon={<ChevronDownIcon boxSize='24px' />}
        aria-label='Downvote'
      />
    </Stack>
  );
};

export default UpdootSection;
