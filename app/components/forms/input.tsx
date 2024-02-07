import { InputHTMLAttributes } from "react";
import cn from "classnames";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: "primary";
}

export const Input = ({ className, ...props }: InputProps) => {
  return (
    <input
      {...props}
      className={cn(
        "w-full outline-none border-2 border-gray-200",
        "focus:border-primary round-md p-2",
        className
      )}
    />
  );
};
