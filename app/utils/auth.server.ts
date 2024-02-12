import { redirect } from "@remix-run/node";
import { getSession } from "~/sessions";
import { getUserById } from "~/models/user.server";

export const getCurrentUser = async (request: Request) => {
  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);
  const userId = session.get("userId");
  if (typeof userId !== "string") {
    return null;
  }

  return getUserById(userId);
};

export const requireLoggedOutUser = async (request: Request) => {
  const user = await getCurrentUser(request);
  if (user !== null) {
    throw redirect("/app/recipes");
  }
};

export const requireLoggedInUser = async (request: Request) => {
  const user = await getCurrentUser(request);
  if (user === null) {
    throw redirect("/login");
  }
  return user;
};
