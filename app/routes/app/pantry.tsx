import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import {
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { z } from "zod";
import {
  createShelf,
  deleteShelf,
  getAllShelves,
  saveShelfName,
} from "~/models/pantryShelf.sever";
import { SearchForm } from "~/components/forms/searchForm";
import { ShelfCreationForm } from "~/components/forms/shelfCreationForm";
import { PantryShelf } from "~/components/pantryShelf";
import cn from "classnames";
import { validateForm } from "../../utils/validation";

const saveShelfNameSchema = z.object({
  shelfId: z.string(),
  shelfName: z.string().min(1, "Shelf name cannot be blank"),
});

const deleteShelfSchema = z.object({
  shelfId: z.string(),
});

// Remix creates an API layer from the loader and that api layer gets called
// when we fetch data from the component
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("query");
  // This is basically select * from pantryShelf
  const shelves = await getAllShelves(query);
  return json({ shelves });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  switch (formData.get("_action")) {
    case "createShelf":
      return createShelf("New Shelf");
    case "deleteShelf":
      return validateForm(
        formData,
        deleteShelfSchema,
        ({ shelfId }) => deleteShelf(shelfId),
        (errors) => json({ errors }, { status: 400 })
      );
    case "saveShelfName":
      return validateForm(
        formData,
        saveShelfNameSchema,
        ({ shelfId, shelfName }) => saveShelfName(shelfId, shelfName),
        (errors) => json({ errors }, { status: 400 })
      );
    default:
      return null;
  }
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
        isBusy={isSearching}
      />
      <ShelfCreationForm />
      <ul
        className={cn(
          "flex gap-8 overflow-x-auto",
          "snap-x snap-mandatory md:snap-none",
          "mt-4 pb-4"
        )}
      >
        {data.shelves.map((shelf) => (
          <PantryShelf key={shelf.id} shelf={shelf} />
        ))}
      </ul>
    </div>
  );
};

export default Pantry;
