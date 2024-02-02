import { useFetcher } from "@remix-run/react";
import { FormError } from "./forms/formError";
import { DeleteIcon } from "./icons";
import { getFetcherErrors } from "~/utils/getFetcherErrors";

export interface ShelfItemData {
  id: string;
  name: string;
}

interface ShelfItemsProps {
  items: ShelfItemData[];
}

export const ShelfItems = (props: ShelfItemsProps) => {
  return (
    <ul>
      {props.items.map((item) => (
        <ShelfItem key={item.id} shelfItem={item} />
      ))}
    </ul>
  );
};

interface ShelfItemProps {
  shelfItem: ShelfItemData;
}

const ShelfItem = ({ shelfItem }: ShelfItemProps) => {
  const DeleteItemFetcher = useFetcher();
  const deleteItemErrors = getFetcherErrors(DeleteItemFetcher);
  return (
    <li className="py-2">
      <DeleteItemFetcher.Form method="post" className="flex">
        <p className="w-full">{shelfItem.name}</p>
        <button name="_action" value="deleteShelfItem">
          <DeleteIcon />
        </button>
        <input type="hidden" name="itemId" value={shelfItem.id} />
        <FormError>{deleteItemErrors?.itemId}</FormError>
      </DeleteItemFetcher.Form>
    </li>
  );
};
