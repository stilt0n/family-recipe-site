import { Form } from "@remix-run/react";
import { PlusIcon } from "~/components/icons";
import { Button } from "./button";

interface ShelfCreationFormProps {
  isBusy?: boolean;
}

export const ShelfCreationForm = (props: ShelfCreationFormProps) => {
  return (
    <Form method="post">
      <Button
        variant="primary"
        name="_action"
        value="createShelf"
        className="mt-4 w-full md:w-fit"
        isBusy={props.isBusy}
      >
        <PlusIcon />
        <span className="pl-2">
          {props.isBusy ? "Creating Shelf..." : "Create Shelf"}
        </span>
      </Button>
    </Form>
  );
};
