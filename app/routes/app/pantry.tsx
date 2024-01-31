import { LoaderFunctionArgs, json } from "@remix-run/node";
import {
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { getAllShelves } from "~/models/pantryShelf.sever";
import { ShelfItems } from "~/components/shelfItems";
import { SearchForm } from "~/components/searchForm";
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
      <SearchForm
        defaultValue={searchParams.get("query") ?? ""}
        isSearching={isSearching}
      />
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
