import { Button, Box } from "@chakra-ui/react";
import React from "react";
import { Form, Formik } from "formik";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useMutation } from "urql";

interface RegisterProps {}

const REGISTER_MUTATION = `
mutation Register($username: String!, $password: String! ){
  register(options: {password: $password username:$username})   {
    errors {
      field
      message
    }
    user{
      createdAt
      id
      updatedAt
      username
    }
  }
}`;

export const Register: React.FC<RegisterProps> = ({}) => {
  const [, register] = useMutation(REGISTER_MUTATION);

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={(values) => {
          console.log(values);
          return register(values);
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
