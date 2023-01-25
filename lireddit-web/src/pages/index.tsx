import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import Link from "next/link";
import { useState } from "react";
import { Layout } from "../components/Layout";
import UpdootSection from "../components/UpdootSection";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [variables, setVariables] = useState({ limit: 10, cursor: null as null | string });
  const [{ data, fetching }] = usePostsQuery({ variables });

  console.log({ variables });

  if (!data && !fetching) return <div>No posts</div>;

  return (
    <Layout>
      <Stack spacing={8}>
        {!data && fetching && <div>Loading</div>}
        {data?.posts.posts.map((p) => (
          <Box key={p.id} p={5} shadow='md'>
            <Flex>
              <UpdootSection post={p} />
              <Box>
                <Link href={`/post/${p.id}`}>
                  <Heading fontSize='xl'>{p.title}</Heading>
                </Link>
                <Text>Posted by {p.creator.username}</Text>
                <Text>{p.textSnippet}</Text>
              </Box>
            </Flex>
          </Box>
        ))}
      </Stack>
      {data && data.posts.hasMore && (
        <Flex justifyContent='center'>
          <Button
            onClick={() => setVariables({ limit: variables.limit, cursor: data.posts.posts[data.posts.posts.length - 1].createdAt })}
            isLoading={fetching}
            my={8}>
            Load more
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
