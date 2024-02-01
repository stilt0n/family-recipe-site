import { useFetcher } from "@remix-run/react";
import { PlusIcon } from "~/components/icons";
import { Button } from "./button";

export const ShelfCreationForm = () => {
  const CreateShelfFetcher = useFetcher();
  const isBusy = CreateShelfFetcher.formData?.get("_action") === "createShelf";
  return (
    <CreateShelfFetcher.Form method="post">
      <Button
        variant="primary"
        name="_action"
        value="createShelf"
        className="mt-4 w-full md:w-fit"
        isBusy={isBusy}
      >
        <PlusIcon />
        <span className="pl-2">
          {isBusy ? "Creating Shelf..." : "Create Shelf"}
        </span>
      </Button>
    </CreateShelfFetcher.Form>
  );
};
