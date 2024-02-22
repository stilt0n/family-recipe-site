import cn from "classnames";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { z } from "zod";
import {
  createShelf,
  deleteShelf,
  getAllShelves,
  getShelf,
  saveShelfName,
} from "~/models/pantryShelf.sever";
import { SearchForm } from "~/components/forms/searchForm";
import { ShelfCreationForm } from "~/components/forms/shelfCreationForm";
import { PantryShelf } from "~/components/pantryShelf";
import { validateForm, sendErrors } from "~/utils/validation";
import {
  createShelfItem,
  deleteShelfItem,
  getShelfItem,
} from "~/models/pantryItem.server";
import { requireLoggedInUser } from "~/utils/auth.server";
import { HandledError, UnhandledError } from "../../components/error";

const saveShelfNameSchema = z.object({
  shelfId: z.string(),
  shelfName: z.string().min(1, "Shelf name cannot be blank"),
});

const deleteShelfSchema = z.object({
  shelfId: z.string(),
});

const createShelfItemSchema = z.object({
  shelfId: z.string(),
  itemName: z.string().min(1, "Item name cannot be blank"),
});

const deleteShelfItemSchema = z.object({
  itemId: z.string(),
});
// Remix creates an API layer from the loader and that api layer gets called
// when we fetch data from the component
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireLoggedInUser(request);
  const url = new URL(request.url);
  const query = url.searchParams.get("query");
  // This is basically select * from pantryShelf
  const shelves = await getAllShelves(user.id, query);
  return json({ shelves });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireLoggedInUser(request);
  const formData = await request.formData();
  switch (formData.get("_action")) {
    case "createShelf":
      return createShelf(user.id, "New Shelf");
    case "deleteShelf":
      return validateForm(
        formData,
        deleteShelfSchema,
        async ({ shelfId }) => {
          const shelf = await getShelf(shelfId);
          if (shelf && shelf.userId !== user.id) {
            throw json(
              {
                message: "You can not delete shelves that don't belong to you!",
              },
              { status: 401 }
            );
          }
          return deleteShelf(shelfId);
        },
        sendErrors
      );
    case "saveShelfName":
      return validateForm(
        formData,
        saveShelfNameSchema,
        async ({ shelfId, shelfName }) => {
          const shelf = await getShelf(shelfId);
          if (shelf && shelf.userId !== user.id) {
            throw json(
              {
                message: "You can not rename shelves that don't belong to you!",
              },
              { status: 401 }
            );
          }
          return saveShelfName(shelfId, shelfName);
        },
        sendErrors
      );
    case "createShelfItem":
      return validateForm(
        formData,
        createShelfItemSchema,
        ({ shelfId, itemName }) => createShelfItem(user.id, shelfId, itemName),
        sendErrors
      );
    case "deleteShelfItem":
      return validateForm(
        formData,
        deleteShelfItemSchema,
        async ({ itemId }) => {
          const item = await getShelfItem(itemId);
          if (item && item.userId !== user.id) {
            throw json(
              { message: "You can not delete items that don't belong to you!" },
              { status: 401 }
            );
          }
          return deleteShelfItem(itemId);
        },
        sendErrors
      );
    default:
      return null;
  }
};

const Pantry = () => {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <SearchForm className="md:w-80" placeholder="Search shelves..." />
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

export const ErrorBoundary = () => {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <div className="bg-red-600 text-white rounded-md p-4">
        <HandledError
          error={error}
          reroute="app/pantry"
          rerouteMessage="Return to Pantry"
        />
      </div>
    );
  }
  return <UnhandledError error={error} />;
};

export default Pantry;
