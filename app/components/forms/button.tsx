import cn from "classnames";
import { ReactNode } from "react";

type ButtonVariant = "primary";

interface ButtonProps {
  children?: ReactNode;
  className?: string;
  overrideDefaults?: boolean;
  variant?: ButtonVariant;
  name?: string;
}

const variantStyles = new Map<ButtonVariant, string>([
  ["primary", "text-white bg-primary hover:bg-primary-light"],
]);

export const Button = ({
  children,
  variant = "primary",
  ...props
}: ButtonProps) => {
  const className = props.overrideDefaults
    ? props.className
    : cn(
        "flex px-3 py-2 rounded-md justify-center",
        variantStyles.get(variant),
        props.className
      );
  return (
    <button className={className} name={props.name}>
      {children}
    </button>
  );
};
