import { Form, useSearchParams, useNavigation } from "@remix-run/react";
import { SearchIcon } from "../icons";
import cn from "classnames";

interface SearchFormProps {
  placeholder?: string;
  className?: string;
}

export const SearchForm = ({ className, ...props }: SearchFormProps) => {
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  // See MDN docs for formData. If the page is navigating
  // and it is doing it with form data that has "query"
  // then that means we triggered the navigation using the Form
  const isBusy = navigation.formData?.has("query");
  return (
    <Form
      className={cn(
        "flex border-2 border-gray-300 rounded-md",
        "focus-within:border-primary",
        isBusy ? "animate-pulse" : "",
        className
      )}
    >
      <button className="px-2 mr-1">
        <SearchIcon />
      </button>
      <input
        defaultValue={searchParams.get("query") ?? ""}
        type="text"
        name="query"
        className="w-full py-3 px-2 outline-none rounded-md"
        autoComplete="off"
        {...props}
      />
    </Form>
  );
};
