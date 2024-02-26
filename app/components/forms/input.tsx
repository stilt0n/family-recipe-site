import { InputHTMLAttributes } from "react";
import cn from "classnames";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: "primary" | "bottom-border";
  error?: boolean;
}

const variantStyles: { [key: string]: string } = {
  primary: "border-2 border-gray-200 round-md p-2",
  "bottom-border": "border-b-2 border-b-background",
};

export const Input = ({
  className,
  variant = "primary",
  ...props
}: InputProps) => {
  return (
    <input
      {...props}
      className={cn(
        "w-full outline-none focus:border-primary",
        variantStyles[variant],
        props.error ? "border-b-red-600" : "",
        className
      )}
    />
  );
};
