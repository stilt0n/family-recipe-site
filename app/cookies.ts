import { createCookie } from "@remix-run/node";

if (typeof process.env.AUTH_COOKIE_SECRET !== "string") {
  throw new Error(
    "Auth will not work with an auth cookie secret. Hint: check env"
  );
}

export const sessionCookie = createCookie("remix-recipes__session", {
  secrets: [process.env.AUTH_COOKIE_SECRET],
  httpOnly: true,
  secure: true,
});
