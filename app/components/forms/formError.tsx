import { HTMLAttributes } from "react";
import cn from "classnames";

interface FormErrorProps extends HTMLAttributes<HTMLParagraphElement> {}

export const FormError = ({ className, ...props }: FormErrorProps) => {
  return props.children ? (
    <p {...props} className={cn("text-red-600 text-xs", className)}></p>
  ) : null;
};
