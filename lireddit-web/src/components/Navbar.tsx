import { Box, Button, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useMeQuery } from "../generated/graphql";

export const Navbar: React.FC = () => {
  const [{ data, fetching }] = useMeQuery();

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
        <Button ml='4' variant='link'>
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
