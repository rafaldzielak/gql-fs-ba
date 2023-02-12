import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withApollo } from "../utils/withApollo";

export const ForgotPassword: React.FC = ({}) => {
  const [forgotPassword] = useForgotPasswordMutation();
  const [isComplete, setIsComplete] = useState(false);

  const router = useRouter();
  if (isComplete) return <Box>We've sent you an email.</Box>;
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values, { setErrors }) => {
          await forgotPassword({ variables: values });
          setIsComplete(true);
        }}>
        {({ isSubmitting }) => (
          <Form>
            <Box mt='4'>
              <InputField name='email' placeholder='email' label='email' type='email' />
            </Box>

            <Button mt='4' type='submit' isLoading={isSubmitting}>
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(ForgotPassword as NextPage<unknown, unknown>);
