import { useFetcher } from "@remix-run/react";
import { ShelfItems } from "./shelfItems";
import { Button } from "./forms/button";
import cn from "classnames";

interface PantryShelfProps {
  shelf: {
    id: string;
    name: string;
    items: {
      id: string;
      name: string;
    }[];
  };
}

export const PantryShelf = ({ shelf }: PantryShelfProps) => {
  const DeleteShelfFetcher = useFetcher();
  const isDeletingShelf =
    DeleteShelfFetcher.formData?.get("_action") === "deleteShelf" &&
    DeleteShelfFetcher.formData?.get("shelfId") === shelf.id;
  return (
    <li
      className={cn(
        "border-2 border-primary rounded-md p-4 h-fit",
        "w-[calc(100vw-2rem)] flex-none snap-center",
        "md:w-96"
      )}
    >
      <h1 className="text-2xl font-extrabold mb-2">{shelf.name}</h1>
      <ShelfItems items={shelf.items} />
      <DeleteShelfFetcher.Form method="post" className="pt-8">
        <input type="hidden" name="shelfId" value={shelf.id} />
        <Button
          variant="delete"
          className="w-full"
          name="_action"
          value="deleteShelf"
          isBusy={isDeletingShelf}
        >
          {isDeletingShelf ? "Deleting Shelf" : "Delete Shelf"}
        </Button>
      </DeleteShelfFetcher.Form>
    </li>
  );
};
