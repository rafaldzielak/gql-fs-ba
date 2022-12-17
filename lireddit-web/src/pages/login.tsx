import { Button, Box } from "@chakra-ui/react";
import React from "react";
import { Form, Formik } from "formik";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";

interface LoginProps {}

export const Login: React.FC<LoginProps> = ({}) => {
  const [, login] = useLoginMutation();

  const router = useRouter();

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({ options: values });
          if (response.data?.login.errors) setErrors(toErrorMap(response.data.login.errors));
          else if (response.data?.login.user) router.push("/");
        }}>
        {({ isSubmitting }) => (
          <Form>
            <Box mt='4'>
              <InputField name='username' placeholder='username' label='Username' />
            </Box>
            <Box mt='4'>
              <InputField name='password' placeholder='password' label='Password' type='password' />
            </Box>
            <Button mt='4' type='submit' isLoading={isSubmitting}>
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Login;
