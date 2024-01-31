import { LoaderFunctionArgs, json } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { getAllShelves } from "~/models/pantryShelf.sever";
import { ShelfItems } from "~/components/shelfItems";
import { SearchIcon } from "~/components/icons";
import cn from "classnames";

// Remix creates an API layer from the loader and that api layer gets called
// when we fetch data from the component
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("query");
  // This is basically select * from pantryShelf
  const shelves = await getAllShelves(query);
  return json({ shelves });
};

const Pantry = () => {
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  // See MDN docs for formData. If the page is navigating
  // and it is doing it with form data that has "query"
  // then that means we triggered the navigation using the Form
  const isSearching = navigation.formData?.has("query");

  return (
    <div>
      <Form
        className={cn(
          "flex border-2 border-gray-300 rounded-md",
          "focus-within:border-primary md:w-80",
          isSearching ? "animate-pulse" : ""
        )}
      >
        <button className="px-2 mr-1">
          <SearchIcon />
        </button>
        <input
          defaultValue={searchParams.get("query") ?? ""}
          type="text"
          name="query"
          placeholder="Search shelves..."
          className="w-full py-3 px-2 outline-none"
          autoComplete="off"
        />
      </Form>
      <ul
        className={cn(
          "flex gap-8 overflow-x-auto",
          "snap-x snap-mandatory md:snap-none",
          "mt-4"
        )}
      >
        {data.shelves.map((shelf) => (
          <li
            key={shelf.id}
            className={cn(
              "border-2 border-primary rounded-md p-4 h-fit",
              "w-[calc(100vw-2rem)] flex-none snap-center",
              "md:w-96"
            )}
          >
            <h1 className="text-2xl font-extrabold mb-2">{shelf.name}</h1>
            <ShelfItems items={shelf.items} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Pantry;
