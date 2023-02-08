import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { useApolloClient } from "@apollo/client";

export const Navbar: React.FC = () => {
  const { data, loading } = useMeQuery();

  const [logout, { loading: isLoggingOut }] = useLogoutMutation();
  const apolloClient = useApolloClient();

  const router = useRouter();

  let body = null;

  if (loading) {
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
        <Button
          isLoading={isLoggingOut}
          ml='4'
          variant='link'
          onClick={async () => {
            await logout({});
            await apolloClient.resetStore();
          }}>
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
