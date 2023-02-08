import { Alert, Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";

export const ChangePassword = ({}) => {
  const router = useRouter();
  const { token } = router.query;
  const [tokenError, setTokenError] = useState("");

  const [changePassword] = useChangePasswordMutation();
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({ variables: { ...values, token: token as string } });
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if ("token" in errorMap) setTokenError(errorMap.token);
            setErrors(errorMap);
          } else if (response.data?.changePassword.user) router.push("/");
        }}>
        {({ isSubmitting }) => (
          <Form>
            <Box mt='4'>
              <InputField name='newPassword' placeholder='new password' label='New password' type='password' />
            </Box>
            {tokenError && <Alert>{tokenError}</Alert>}
            <Button mt='4' type='submit' isLoading={isSubmitting}>
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default ChangePassword;
