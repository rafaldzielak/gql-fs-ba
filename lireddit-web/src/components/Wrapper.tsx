import { Box } from "@chakra-ui/react";
import React from "react";

interface WrapperProps extends React.PropsWithChildren {
  variant?: "small" | "regular";
}

export const Wrapper: React.FC<WrapperProps> = ({ children, variant = "regular" }) => {
  return (
    <Box w='100%' mt='8' mx='auto' maxW={variant === "regular" ? "800px" : "400px"}>
      {children}
    </Box>
  );
};
