import React, { PropsWithChildren } from "react";
import { Navbar } from "./Navbar";
import { Wrapper, WrapperVariant } from "./Wrapper";

interface LayoutProps extends PropsWithChildren {
  variant?: WrapperVariant;
}

export const Layout: React.FC<LayoutProps> = ({ variant, children }) => {
  return (
    <>
      <Navbar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
};
