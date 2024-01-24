import { ReactNode } from "react";

interface HeaderProps {
  children?: ReactNode;
}

export const Header = ({ children }: HeaderProps) => {
  return <h1>{children}</h1>;
};
