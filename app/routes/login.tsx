import cn from "classnames";
import { useActionData } from "@remix-run/react";
import { ActionFunction, json } from "@remix-run/node";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { FormError } from "~/components/forms/formError";
import { Button } from "~/components/forms/button";
import { validateForm, sendErrors } from "~/utils/validation";
import { commitSession, getSession } from "~/sessions";
import { generateMagicLink } from "~/magicLinks.server";
import { Input } from "~/components/forms/input";

const loginSchema = z.object({
  email: z.string().email(),
});

export const action: ActionFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("cookie");
  // This comes back null if signature does not match
  const session = await getSession(cookieHeader);
  const formData = await request.formData();
  return validateForm(
    formData,
    loginSchema,
    async ({ email }) => {
      const nonce = uuid();
      // using set instead of flash to avoid things breaking
      // on form reload when user enters invalid input
      session.set("nonce", nonce);
      const link = generateMagicLink(email, nonce);
      console.log(link);
      return json("okay", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
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
          <Input
            type="email"
            name="email"
            defaultValue={actionData?.email}
            placeholder="Email"
            autoComplete="off"
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
