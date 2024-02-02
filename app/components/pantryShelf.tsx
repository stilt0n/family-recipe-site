import { useFetcher } from "@remix-run/react";
import { ShelfItems } from "./shelfItems";
import { Button } from "./forms/button";
import { SaveIcon } from "./icons";
import { FormError } from "./forms/formError";
import cn from "classnames";
import { FieldErrors } from "../utils/validation";

type ShelfItem = {
  id: string;
  name: string;
};

type Shelf = {
  id: string;
  name: string;
  items: ShelfItem[];
};

interface PantryShelfProps {
  shelf: Shelf;
}

export const PantryShelf = ({ shelf }: PantryShelfProps) => {
  const DeleteShelfFetcher = useFetcher();
  const SaveShelfNameFetcher = useFetcher();
  const CreateItemFetcher = useFetcher();
  const isDeletingShelf =
    DeleteShelfFetcher.formData?.get("_action") === "deleteShelf" &&
    DeleteShelfFetcher.formData?.get("shelfId") === shelf.id;

  if (isDeletingShelf) {
    return null;
  }

  const deleteErrors = getFetcherErrors(DeleteShelfFetcher);
  const saveErrors = getFetcherErrors(SaveShelfNameFetcher);
  const createItemErrors = getFetcherErrors(CreateItemFetcher);

  return (
    <li
      className={cn(
        "border-2 border-primary rounded-md p-4 h-fit",
        "w-[calc(100vw-2rem)] flex-none snap-center",
        "md:w-96"
      )}
    >
      <SaveShelfNameFetcher.Form method="post" className="flex">
        <div className="w-full mb-2">
          <input
            type="text"
            className={cn(
              "text-2xl font-extrabold w-full outline-none",
              "border-b-2 border-b-background focus:border-b-primary",
              saveErrors?.shelfName ? "border-b-red-600" : ""
            )}
            defaultValue={shelf.name}
            name="shelfName"
            placeholder="Shelf Name"
            autoComplete="off"
          />
          <FormError className="pl-2">{saveErrors?.shelfName}</FormError>
        </div>
        <button name="_action" value="saveShelfName" className="ml-4">
          <SaveIcon />
        </button>
        <input type="hidden" name="shelfId" value={shelf.id} />
        <FormError className="pb-2">{deleteErrors?.shelfId}</FormError>
      </SaveShelfNameFetcher.Form>
      <CreateItemFetcher.Form method="post" className="flex py-2">
        <div className="w-full mb-2">
          <input
            type="text"
            className={cn(
              "w-full outline-none",
              "border-b-2 border-b-background focus:border-b-primary",
              createItemErrors?.shelfName ? "border-b-red-600" : ""
            )}
            name="itemName"
            placeholder="New Item"
            autoComplete="off"
          />
          <FormError className="pl-2">{createItemErrors?.itemName}</FormError>
        </div>
        <button name="_action" value="createShelfItem" className="ml-4">
          <SaveIcon />
        </button>
        <input type="hidden" name="shelfId" value={shelf.id} />
        <FormError className="pb-2">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {createItemErrors?.shelfId}
        </FormError>
      </CreateItemFetcher.Form>
      <ShelfItems items={shelf.items} />
      <DeleteShelfFetcher.Form method="post" className="pt-8">
        <input type="hidden" name="shelfId" value={shelf.id} />
        <Button
          variant="delete"
          className="w-full"
          name="_action"
          value="deleteShelf"
        >
          {"Delete Shelf"}
        </Button>
      </DeleteShelfFetcher.Form>
    </li>
  );
};

// This could be avoided by using `useFetcher<typeof action>` but
// the action is in the parent component. So this will need to be
// refactored to avoid this cast to `any`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getFetcherErrors = (fetcher: any): FieldErrors | undefined => {
  return fetcher?.data?.errors;
};
