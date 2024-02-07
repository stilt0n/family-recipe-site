import { LoaderFunction, json, redirect } from "@remix-run/node";
import { getUser } from "~/models/user.server";
import { getMagicLinkPayload } from "~/magicLinks.server";
import { commitSession, getSession } from "~/sessions";

const FIVE_MINUTES = 1000 * 60 * 5;

export const loader: LoaderFunction = async ({ request }) => {
  const magicLinkPayload = getMagicLinkPayload(request);
  const createdAt = new Date(magicLinkPayload.createdAt);
  const expiresAt = createdAt.getTime() + FIVE_MINUTES;
  if (Date.now() > expiresAt) {
    throw json({ message: "magic link has expired" }, { status: 400 });
  }

  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);
  // get call removes this cookie because we added it using session.flash
  if (session.get("nonce") !== magicLinkPayload.nonce) {
    throw json({ message: "invalid magic link" }, { status: 400 });
  }

  const user = await getUser(magicLinkPayload.email);
  if (user) {
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
