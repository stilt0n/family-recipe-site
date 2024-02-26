import { useRef, useState } from "react";
import { useFetcher } from "@remix-run/react";
import { ShelfItems, ShelfItemData } from "./shelfItems";
import { Button } from "./forms/button";
import { SaveIcon } from "./icons";
import { FormError } from "./forms/formError";
import { getFetcherErrors } from "~/utils/getFetcherErrors";
import { useIsHydrated, useServerLayoutEffect } from "~/utils/misc";
import cn from "classnames";
import { Input } from "./forms/input";

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
  const isHydrated = useIsHydrated();
  const { renderedItems, addItem } = useOptimisticItems(
    shelf.items,
    CreateItemFetcher.state
  );
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
        <div className="w-full mb-2 peer">
          <Input
            variant="bottom-border"
            type="text"
            className="text-2xl font-extrabold"
            error={!!saveErrors?.shelfName}
            defaultValue={shelf.name}
            name="shelfName"
            placeholder="Shelf Name"
            autoComplete="off"
            required
            onChange={(event) => {
              if (event.target.value === "") return;
              SaveShelfNameFetcher.submit(
                {
                  _action: "saveShelfName",
                  shelfName: event.target.value,
                  shelfId: shelf.id,
                },
                { method: "post" }
              );
            }}
          />
          <FormError className="pl-2">{saveErrors?.shelfName}</FormError>
        </div>
        {!isHydrated ? (
          // opacity-0 makes the button invisible by default which will prevent
          // it from flickering. The other opacities allow it to be visible
          // when the DOM is not yet hydrated and the button may be required to
          // submit form data.
          <button
            name="_action"
            value="saveShelfName"
            className={cn(
              "ml-4 opacity-0 hover:opacity-100 focus:opacity-100",
              "peer-focus-within:opacity-100"
            )}
          >
            <SaveIcon />
          </button>
        ) : null}
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
        <div className="w-full mb-2 peer">
          <Input
            type="text"
            variant="bottom-border"
            error={!!createItemErrors?.shelfName}
            name="itemName"
            placeholder="New Item"
            autoComplete="off"
            required
          />
          <FormError className="pl-2">{createItemErrors?.itemName}</FormError>
        </div>
        {!isHydrated ? (
          <button
            name="_action"
            value="createShelfItem"
            className={cn(
              "ml-4 opacity-0 hover:opacity-100 focus:opacity-100",
              "peer-focus-within:opacity-100"
            )}
          >
            <SaveIcon />
          </button>
        ) : null}
        <input type="hidden" name="shelfId" value={shelf.id} />
        <FormError className="pb-2">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {createItemErrors?.shelfId}
        </FormError>
      </CreateItemFetcher.Form>
      <ShelfItems items={renderedItems} />
      <DeleteShelfFetcher.Form
        method="post"
        className="pt-8"
        onSubmit={(event) => {
          if (!window.confirm("Are you sure you want to delete this shelf?")) {
            event.preventDefault();
          }
        }}
      >
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

const useOptimisticItems = (
  savedItems: ShelfItemData[],
  createShelfItemState: "idle" | "submitting" | "loading"
) => {
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
    if (createShelfItemState === "idle") {
      setOptimisticItems([]);
    }
  }, [createShelfItemState]);

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
