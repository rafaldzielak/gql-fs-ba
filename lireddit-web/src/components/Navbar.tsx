import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";

export const Navbar: React.FC = () => {
  const [{ data, fetching }] = useMeQuery();

  const [{ fetching: isLoggingOut }, logout] = useLogoutMutation();

  let body = null;

  if (fetching) {
  } else if (!data?.me) {
    body = (
      <Flex alignItems='center'>
        <Link mr='2' as={NextLink} href='/login'>
          Login
        </Link>
        <Link as={NextLink} href='/register'>
          Register
        </Link>
      </Flex>
    );
  } else {
    body = (
      <Flex alignItems='center'>
        <NextLink href='/create-post'>
          <Button mr='4'>Create post</Button>
        </NextLink>
        <Box>{data.me.username}</Box>
        <Button isLoading={isLoggingOut} ml='4' variant='link' onClick={() => logout({})}>
          Logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex bg='tomato' p='4' justifyContent='center'>
      <Flex width='100%' maxW='800px'>
        <Heading mr='auto'>
          <NextLink href='/'>LiReddit</NextLink>
        </Heading>
        {body}
      </Flex>
    </Flex>
  );
};
