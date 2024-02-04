import { useRef, useState } from "react";
import { useFetcher } from "@remix-run/react";
import { ShelfItems, ShelfItemData } from "./shelfItems";
import { Button } from "./forms/button";
import { SaveIcon } from "./icons";
import { FormError } from "./forms/formError";
import { getFetcherErrors } from "~/utils/getFetcherErrors";
import cn from "classnames";
import { useServerLayoutEffect } from "../utils/misc";

type Shelf = {
  id: string;
  name: string;
  items: ShelfItemData[];
};

interface PantryShelfProps {
  shelf: Shelf;
}

export const PantryShelf = ({ shelf }: PantryShelfProps) => {
  const DeleteShelfFetcher = useFetcher();
  const SaveShelfNameFetcher = useFetcher();
  const CreateItemFetcher = useFetcher();
  const { renderedItems, addItem } = useOptimisticItems(shelf.items);
  const createItemFormRef = useRef<HTMLFormElement>(null);
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
      <CreateItemFetcher.Form
        method="post"
        className="flex py-2"
        ref={createItemFormRef}
        onSubmit={(event) => {
          const target = event.target as HTMLFormElement;
          const itemNameInput = target.elements.namedItem(
            "itemName"
          ) as HTMLInputElement;
          addItem(itemNameInput.value);
          // need to submit imperatively so that submit
          // happens before the form is cleared
          event.preventDefault();
          CreateItemFetcher.submit(
            {
              itemName: itemNameInput.value,
              shelfId: shelf.id,
              _action: "createShelfItem",
            },
            { method: "post" }
          );
          createItemFormRef.current?.reset();
        }}
      >
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
      <ShelfItems items={renderedItems} />
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

const useOptimisticItems = (savedItems: ShelfItemData[]) => {
  const [optimisticItems, setOptimisticItems] = useState<ShelfItemData[]>([]);
  const renderedItems = [...optimisticItems, ...savedItems];
  if (optimisticItems.length > 0) {
    // sorting savedItems is a waste of time when optimisticItems is empty
    // because savedItems is always sorted. We could also sort optimisticItems
    // on its own and then merge the arrays but this optimization is probably
    // not necessary with the realistic input size
    renderedItems.sort((a, b) =>
      a.name === b.name ? 0 : a.name < b.name ? -1 : 1
    );
  }

  // we want useLayoutEffect here because useEffect gets called *after* the UI
  // is rendered to the screen, which means we'll get flickers when savedItems
  // is updated.
  useServerLayoutEffect(() => {
    setOptimisticItems([]);
  }, [savedItems]);

  const addItem = (name: string) => {
    setOptimisticItems((items) => [
      ...items,
      { name, id: createTemporaryId(), isOptimistic: true },
    ]);
  };

  return { renderedItems, addItem };
};

const createTemporaryId = () => {
  return `tmp-${Math.round(Math.random() * 1000000)}`;
};
