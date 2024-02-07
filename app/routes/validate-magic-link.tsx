import cn from "classnames";
import {
  ActionFunction,
  LoaderFunction,
  json,
  redirect,
} from "@remix-run/node";
import { z } from "zod";
import { createUser, getUser } from "~/models/user.server";
import { getMagicLinkPayload } from "~/magicLinks.server";
import { commitSession, getSession } from "~/sessions";
import { FormError } from "~/components/forms/formError";
import { Input } from "~/components/forms/input";
import { Button } from "~/components/forms/button";
import { validateForm } from "~/utils/validation";
import { useActionData } from "@remix-run/react";

const FIVE_MINUTES = 1000 * 60 * 5;

const signUpSchema = z.object({
  firstName: z.string().min(1, "First name cannot be blank"),
  lastName: z.string().min(1, "Last name cannot be blank"),
});

export const loader: LoaderFunction = async ({ request }) => {
  const magicLinkPayload = getMagicLinkPayload(request);
  const createdAt = new Date(magicLinkPayload.createdAt);
  const expiresAt = createdAt.getTime() + FIVE_MINUTES;
  if (Date.now() > expiresAt) {
    throw json({ message: "magic link has expired" }, { status: 400 });
  }

  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);
  if (session.get("nonce") !== magicLinkPayload.nonce) {
    throw json({ message: "invalid magic link" }, { status: 400 });
  }

  const user = await getUser(magicLinkPayload.email);
  if (user) {
    session.unset("nonce");
    session.set("userId", user.id);
    return redirect("/app/pantry", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
  // need to set cookie header or nonce will not be removed on get call
  return json("ok", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  return validateForm(
    formData,
    signUpSchema,
    async ({ firstName, lastName }) => {
      const magicLinkPayload = getMagicLinkPayload(request);
      const user = await createUser(
        magicLinkPayload.email,
        firstName,
        lastName
      );
      const cookie = request.headers.get("cookie");
      const session = await getSession(cookie);
      session.set("userId", user.id);
      session.unset("nonce");
      return redirect("/app/pantry", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    },
    (errors) =>
      json(
        {
          errors,
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
        },
        { status: 400 }
      )
  );
};

const ValidateMagicLink = () => {
  const actionData = useActionData<typeof action>();
  return (
    <div className="text-center">
      <div className="mt-24">
        <h1 className="text-2xl my-8">You&apos;re almost done!</h1>
        <h2>Add your name below to complete the signup process</h2>
        <form
          method="post"
          className={cn(
            "flex flex-col px-8 mx-16 md:mx-auto border-2",
            "border-gray-200 rounded-md p-8 mt-8 md:w-80"
          )}
        >
          <fieldset className="mb-8 flex flex-col">
            <div className="text-left mb-4">
              <label htmlFor="firstName">First Name</label>
              <Input
                variant="primary"
                id="firstName"
                autoComplete="off"
                name="firstName"
                defaultValue={actionData?.firstName}
              />
              <FormError>{actionData?.errors?.firstName}</FormError>
            </div>
            <div className="text-left">
              <label htmlFor="lastName">Last Name</label>
              <Input
                variant="primary"
                id="lastName"
                autoComplete="off"
                name="lastName"
                defaultValue={actionData?.lastName}
              />
              <FormError>{actionData?.errors?.lastName}</FormError>
            </div>
          </fieldset>
          <Button variant="primary" className="2-36 mx-auto">
            Sign Up
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ValidateMagicLink;
