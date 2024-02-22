import { Form, useSearchParams, useNavigation } from "@remix-run/react";
import { SearchIcon } from "../icons";
import cn from "classnames";

interface SearchFormProps {
  placeholder?: string;
}

export const SearchForm = (props: SearchFormProps) => {
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
        "focus-within:border-primary md:w-80",
        isBusy ? "animate-pulse" : ""
      )}
    >
      <button className="px-2 mr-1">
        <SearchIcon />
      </button>
      <input
        defaultValue={searchParams.get("query") ?? ""}
        type="text"
        name="query"
        className="w-full py-3 px-2 outline-none"
        autoComplete="off"
        {...props}
      />
    </Form>
  );
};
