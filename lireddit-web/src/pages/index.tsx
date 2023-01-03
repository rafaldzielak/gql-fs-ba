import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import Link from "next/link";
import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";

const Index = () => {
  const [{ data }] = usePostsQuery({ variables: { limit: 10 } });

  if (!data) return null;

  return (
    <Layout>
      <Flex justifyContent='space-between' alignItems='center'>
        <Heading>LiReddit</Heading>
        <Link href='/create-post'>Create post</Link>
      </Flex>
      <Stack spacing={8}>
        {data &&
          data.posts.map((p) => (
            <Box key={p.id} p={5} shadow='md'>
              <Heading fontSize='xl'>{p.title}</Heading>
              <Text>{p.textSnippet}</Text>
            </Box>
          ))}
      </Stack>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Index);
