import { useFetcher } from "@remix-run/react";
import { FormError } from "./forms/formError";
import { DeleteIcon } from "./icons";
import { getFetcherErrors } from "~/utils/getFetcherErrors";

export interface ShelfItemData {
  id: string;
  name: string;
  isOptimistic?: boolean;
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
  // Form data is only defined when the request is in flight
  const isDeletingItem = !!DeleteItemFetcher.formData;
  return !isDeletingItem ? (
    <li className="py-2">
      <DeleteItemFetcher.Form method="post" className="flex">
        <p className="w-full">{shelfItem.name}</p>
        {!shelfItem.isOptimistic ? (
          <button name="_action" value="deleteShelfItem">
            <DeleteIcon />
          </button>
        ) : null}
        <input type="hidden" name="itemId" value={shelfItem.id} />
        <FormError>{deleteItemErrors?.itemId}</FormError>
      </DeleteItemFetcher.Form>
    </li>
  ) : null;
};
