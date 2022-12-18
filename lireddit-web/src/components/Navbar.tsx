import { Box, Button, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

export const Navbar: React.FC = () => {
  const [{ data, fetching }] = useMeQuery({ pause: isServer() });

  const [{ fetching: isLoggingOut }, logout] = useLogoutMutation();

  let body = null;

  if (fetching) {
  } else if (!data?.me) {
    body = (
      <>
        <Link mr='2' as={NextLink} href='/login'>
          Login
        </Link>
        <Link as={NextLink} href='/register'>
          Register
        </Link>
      </>
    );
  } else {
    body = (
      <Flex>
        <Box>{data.me.username}</Box>
        <Button isLoading={isLoggingOut} ml='4' variant='link' onClick={() => logout({})}>
          Logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex bg='tomato' p='4' justifyContent='end'>
      {body}
    </Flex>
  );
};
