import { Button, Box } from "@chakra-ui/react";
import React from "react";
import { Form, Formik } from "formik";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useMutation } from "urql";
import { useRegisterMutation } from "../generated/graphql";

interface RegisterProps {}

export const Register: React.FC<RegisterProps> = ({}) => {
  const [, register] = useRegisterMutation();

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values) => {
          const response = await register(values);
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
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
