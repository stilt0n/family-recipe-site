import cn from "classnames";
import { useRef, useState, useEffect } from "react";
import { TimeIcon } from "../icons";

const useDelayedBool = (value: boolean | undefined, delay: number) => {
  const [delayed, setDelayed] = useState(false);
  const timeoutId = useRef<number>();
  useEffect(() => {
    if (value) {
      timeoutId.current = window.setTimeout(() => {
        setDelayed(true);
      }, delay);
    } else {
      window.clearTimeout(timeoutId.current);
      setDelayed(false);
    }
    return () => window.clearTimeout(timeoutId.current);
  }, [value, delay]);

  return delayed;
};

interface RecipeCardProps {
  name: string;
  totalTime: string;
  imageUrl?: string;
  isActive?: boolean;
  isLoading?: boolean;
}

export const RecipeCard = ({
  name,
  totalTime,
  imageUrl,
  isActive,
  isLoading,
}: RecipeCardProps) => {
  const delayedLoading = useDelayedBool(isLoading, 500);
  return (
    <div
      className={cn(
        "group flex shadow-md rounded-md border-2",
        "hover:text-primary hover:border-primary",
        isActive ? "border-primary text-primary" : "border-white",
        isLoading ? "border-gray-500 text-gray-500" : ""
      )}
    >
      <div className="w-14 h-14 rounded-full overflow-hidden my-4 ml-3">
        <img
          src={imageUrl}
          alt={`recipe named ${name}`}
          className="object-cover h-full w-full"
        />
      </div>
      <div className="p-4 flex-grow">
        <h3 className="font-semibold mb-1 text-left">
          {name}
          {delayedLoading ? "..." : ""}
        </h3>
        <div
          className={cn(
            "flex font-light",
            "group-hover:text-primary-light",
            isActive ? "text-primary-light" : "text-gray-500",
            isLoading ? "text-gray-500" : ""
          )}
        >
          <TimeIcon />
          <p className="ml-1">{totalTime}</p>
        </div>
      </div>
    </div>
  );
};
