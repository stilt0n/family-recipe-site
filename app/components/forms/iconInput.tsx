import { InputHTMLAttributes, ReactNode } from "react";
import cn from "classnames";

interface IconInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ReactNode;
}

export const IconInput = ({ icon, ...props }: IconInputProps) => {
  return (
    <div
      className={cn(
        "flex items-stretch border-2 border-gray-300 rounded-md",
        "focus-within:border-primary"
      )}
    >
      <div className="px-2 flex flex-col justify-center">{icon}</div>
      <input {...props} className="w-full py-3 px-2 outline-none rounded-md" />
    </div>
  );
};
