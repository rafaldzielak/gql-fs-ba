import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { MeDocument, useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { withApollo } from "../utils/withApollo";

interface RegisterProps {}

export const Register: React.FC<RegisterProps> = ({}) => {
  const [register] = useRegisterMutation();

  const router = useRouter();

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email: "", username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({
            variables: { options: values },
            update: (cache, { data }) => {
              cache.writeQuery({
                query: MeDocument,
                data: {
                  __typename: "Query",
                  me: data?.register.user,
                },
              });
            },
          });
          if (response.data?.register.errors) setErrors(toErrorMap(response.data.register.errors));
          else if (response.data?.register.user) router.push("/");
        }}>
        {({ isSubmitting }) => (
          <Form>
            <Box mt='4'>
              <InputField name='username' placeholder='username' label='Username' />
            </Box>
            <Box mt='4'>
              <InputField name='email' placeholder='email' label='email' />
            </Box>
            <Box mt='4'>
              <InputField name='password' placeholder='password' label='Password' type='password' />
            </Box>
            <Button mt='4' type='submit' isLoading={isSubmitting}>
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(Register as NextPage<unknown, unknown>);
