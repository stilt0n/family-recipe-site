import { Form } from "@remix-run/react";
import { SearchIcon } from "../icons";
import cn from "classnames";

interface SearchFormProps {
  defaultValue: string;
  isBusy?: boolean;
}

export const SearchForm = ({ isBusy, defaultValue }: SearchFormProps) => {
  return (
    <Form
      className={cn(
        "flex border-2 border-gray-300 rounded-md",
        "focus-within:border-primary md:w-80",
        isBusy ? "animate-pulse" : ""
      )}
    >
      <button className="px-2 mr-1">
        <SearchIcon />
      </button>
      <input
        defaultValue={defaultValue}
        type="text"
        name="query"
        placeholder="Search shelves..."
        className="w-full py-3 px-2 outline-none"
        autoComplete="off"
      />
    </Form>
  );
};
