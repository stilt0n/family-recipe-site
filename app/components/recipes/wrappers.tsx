import { useParams } from "@remix-run/react";
import { ReactNode } from "react";
import cn from "classnames";

interface SharedWrapperProps {
  children: ReactNode;
}

export const RecipePageWrapper = ({ children }: SharedWrapperProps) => {
  return <div className="lg:flex h-full">{children}</div>;
};

export const RecipeListWrapper = ({ children }: SharedWrapperProps) => {
  const params = useParams();
  return (
    <div
      className={cn(
        "lg:block lg:w-1/3 lg:pr-4 overflow-auto",
        params.recipeId ? "hidden" : ""
      )}
    >
      {children}
      <br />
    </div>
  );
};

export const RecipeDetailWrapper = ({ children }: SharedWrapperProps) => {
  return <div className="lg:w-2/3 overflow-auto pr-4 pl-4">{children}</div>;
};
