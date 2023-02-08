import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import { useUpdatePostMutation } from "../../../generated/graphql";
import { useGetIntId } from "../../../utils/useGetIntId";
import { useGetPostFromUrl } from "../../../utils/useGetPostFromUrl";

const EditPost = () => {
  const [updatePost] = useUpdatePostMutation();
  const intId = useGetIntId();

  const router = useRouter();
  const { data, loading } = useGetPostFromUrl();

  if (loading) return <div>Loading</div>;
  if (!data?.post) return <div>Could not ind post</div>;

  return (
    <Layout variant='small'>
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          await updatePost({ variables: { ...values, updatePostId: intId } });
          router.push("/");
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
              Update post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default EditPost;
