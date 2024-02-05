import cn from "classnames";
import { ActionFunction } from "@remix-run/node";
import { z } from "zod";
import { FormError } from "~/components/forms/formError";
import { Button } from "~/components/forms/button";
import { validateForm, sendErrors } from "~/utils/validation";
import { useActionData } from "@remix-run/react";

const loginSchema = z.object({
  email: z.string().email(),
});

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  return validateForm(
    formData,
    loginSchema,
    ({ email }) => {
      console.log(email);
    },
    sendErrors
  );
};

const Login = () => {
  const actionData = useActionData<typeof action>();
  return (
    <div className="text-center mt-36">
      <h1 className="text-3xl mb-8">Family Recipes</h1>
      <form method="post" className="mx-auto md:w-1/3">
        <div className="text-left pb-4">
          <input
            type="email"
            name="email"
            defaultValue={actionData?.email}
            placeholder="Email"
            autoComplete="off"
            className={cn(
              "w-full outline-none border-2 border-gray-200",
              "focus:border-primary round-md p-2"
            )}
          />
          <FormError>{actionData?.errors?.email}</FormError>
        </div>
        <Button variant="primary" className="w-1/3 mx-auto">
          Log In
        </Button>
      </form>
    </div>
  );
};

export default Login;
