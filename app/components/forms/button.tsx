import cn from "classnames";
import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "delete";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  overrideDefaults?: boolean;
  variant?: ButtonVariant;
  isBusy?: boolean;
}

const variantStyles = new Map<ButtonVariant, string>([
  ["primary", "text-white bg-primary hover:bg-primary-light"],
  [
    "delete",
    "border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white",
  ],
]);

const getVariantStyles = (variant: string, isBusy?: boolean) => {
  switch (variant) {
    case "primary":
      return cn(variantStyles.get("primary"), isBusy ? "bg-primary-light" : "");
    case "delete":
      return cn(
        variantStyles.get("delete"),
        isBusy ? "border-red-400 text-red-400" : ""
      );
  }
};

export const Button = ({
  children,
  variant = "primary",
  overrideDefaults,
  className,
  isBusy,
  ...buttonProps
}: ButtonProps) => {
  const classes = overrideDefaults
    ? className
    : cn(
        "flex px-3 py-2 rounded-md justify-center",
        getVariantStyles(variant, isBusy),
        className
      );
  return (
    <button className={classes} {...buttonProps} disabled={isBusy}>
      {children}
    </button>
  );
};
