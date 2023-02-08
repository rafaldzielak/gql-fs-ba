import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useRegisterMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";

interface RegisterProps {}

export const Register: React.FC<RegisterProps> = ({}) => {
  const [register] = useRegisterMutation();

  const router = useRouter();

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email: "", username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({ variables: { options: values } });
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

export default Register;
