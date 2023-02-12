import { Box, Heading } from "@chakra-ui/react";
import { NextPage } from "next";
import { FC } from "react";
import EditDeletePostButtons from "../../components/EditDeletePostButtons";
import { Layout } from "../../components/Layout";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";
import { withApollo } from "../../utils/withApollo";

const Post: FC = () => {
  const { data, loading } = useGetPostFromUrl();

  if (loading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find post</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading mb={4}>{data.post.title}</Heading>
      <Box mb={8}>{data.post.text}</Box>
      <EditDeletePostButtons id={data.post.id} />
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post as NextPage<unknown, unknown>);
