import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useIsAuth } from "../utils/useIsAuth";

const CreatePost: React.FC = ({}) => {
  const [_, createPost] = useCreatePostMutation();
  useIsAuth();

  const router = useRouter();

  return (
    <Layout variant='small'>
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setErrors }) => {
          const { error } = await createPost({ input: values });
          if (error?.message.includes("not authenticated")) {
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

export default withUrqlClient(createUrqlClient)(CreatePost);
