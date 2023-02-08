import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { IconButton, Box } from "@chakra-ui/react";
import Link from "next/link";
import React, { FC } from "react";
import { useDeletePostMutation } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  id: number;
}

const EditDeletePostButtons: FC<EditDeletePostButtonsProps> = ({ id }) => {
  const [deletePost] = useDeletePostMutation();
  return (
    <Box>
      <Link href={`/post/edit/${id}`}>
        <IconButton aria-label='Edit post' icon={<EditIcon />} mr='4' />
      </Link>
      <IconButton colorScheme='red' aria-label='Delete post' icon={<DeleteIcon />} onClick={() => deletePost({ variables: { id } })} />
    </Box>
  );
};

export default EditDeletePostButtons;
