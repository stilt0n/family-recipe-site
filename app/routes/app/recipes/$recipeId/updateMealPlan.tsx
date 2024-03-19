import { Form, Link } from "@remix-run/react";
import ReactModal from "react-modal";
import { CloseIcon } from "~/components/icons";
import { IconInput } from "~/components/forms/iconInput";
import { Button } from "../../../../components/forms/button";

// For accessibility purposes react-modal needs to know where the root of the app is
// This is only needed for the client side so we need to check if window is defined
if (typeof window !== "undefined") {
  ReactModal.setAppElement("body");
}

const MealPlanModal = () => {
  return (
    <ReactModal isOpen className="md:h-fit lg:w-1/2 md:mx-auto md:mt-24">
      <div className="p-4 rounded-md bg-white shadow-md">
        <div className="flex justify-between mb-8">
          <h1 className="text-lg font-bold">Update Meal Plan</h1>
          {/* Using replace prevents closing the modal from
          adding an entry in the browser history stack */}
          <Link to=".." replace>
            <CloseIcon />
          </Link>
        </div>
        <Form method="post">
          <h2 className="mb-2">Recipe Name</h2>
          <IconInput
            icon={<CloseIcon />}
            defaultValue={1}
            type="number"
            autoComplete="off"
            name="mealPlanMultiplier"
          />
          <div className="flex justify-end gap-4 mt-8">
            <Button variant="delete" name="_action" value="removeFromMealPlan">
              Remove from Meal Plan
            </Button>
            <Button variant="primary" name="_action" value="updateMealPlan">
              Save
            </Button>
          </div>
        </Form>
      </div>
    </ReactModal>
  );
};

export default MealPlanModal;
