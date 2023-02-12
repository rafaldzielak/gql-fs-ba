import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import EditDeletePostButtons from "../components/EditDeletePostButtons";
import { Layout } from "../components/Layout";
import UpdootSection from "../components/UpdootSection";
import { useMeQuery, usePostsQuery } from "../generated/graphql";
import { withApollo } from "../utils/withApollo";

const Index = () => {
  const { data, error, loading, fetchMore, variables } = usePostsQuery({
    variables: { limit: 10, cursor: null as null | string },
    notifyOnNetworkStatusChange: true,
  });
  const { data: meData } = useMeQuery();

  if (!data && !loading)
    return (
      <div>
        <div>No posts</div>
        <div>{error?.message}</div>
      </div>
    );

  return (
    <Layout>
      <Stack spacing={8}>
        {!data && loading && <div>Loading</div>}
        {data?.posts.posts.map((p) => (
          <Box key={p.id} p={5} shadow='md'>
            <Flex>
              <UpdootSection post={p} />
              <Box flex={1}>
                <Link href={`/post/${p.id}`}>
                  <Heading fontSize='xl'>{p.title}</Heading>
                </Link>
                <Text>Posted by {p.creator.username}</Text>
                <Flex justifyContent='space-between'>
                  <Text>{p.textSnippet}</Text>
                  {meData?.me?.id === p.creator.id && <EditDeletePostButtons id={p.id} />}
                </Flex>
              </Box>
            </Flex>
          </Box>
        ))}
      </Stack>
      {data && data.posts.hasMore && (
        <Flex justifyContent='center'>
          <Button
            onClick={() => {
              fetchMore({
                variables: { limit: variables?.limit, cursor: data.posts.posts[data.posts.posts.length - 1].createdAt },
              });
            }}
            isLoading={loading}
            my={8}>
            Load more
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withApollo({ ssr: false })(Index);
