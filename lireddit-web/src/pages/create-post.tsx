import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
import { useIsAuth } from "../utils/useIsAuth";
import { withApollo } from "../utils/withApollo";

const CreatePost: React.FC = ({}) => {
  const [createPost] = useCreatePostMutation();
  useIsAuth();

  const router = useRouter();

  return (
    <Layout variant='small'>
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values) => {
          const { errors } = await createPost({
            variables: { input: values },
            update: (cache) => cache.evict({ fieldName: "posts" }),
          });
          if (errors?.[0]?.message.includes("not authenticated")) {
            router.push("/login");
          } else {
            router.push("/");
          }
        }}>
        {({ isSubmitting }) => (
          <Form>
            <Box mt='4'>
              <InputField name='title' placeholder='title' label='title' />
            </Box>
            <Box mt='4'>
              <InputField name='text' placeholder='text...' label='Body' textarea />
            </Box>
            <Button mt='4' type='submit' isLoading={isSubmitting}>
              Create post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(CreatePost as NextPage<unknown, unknown>);
