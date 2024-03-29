import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  json,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import {
  HomeIcon,
  DiscoverIcon,
  RecipeBookIcon,
  SettingsIcon,
  LoginIcon,
  LogoutIcon,
} from "./components/icons";
import { AppNavLink } from "./components/appNavLink";
import cn from "classnames";
import tailwindStyles from "./tailwind.css";
import { HandledError, UnhandledError } from "./components/error";
import { getCurrentUser } from "./utils/auth.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStyles },
];

export const meta: MetaFunction = () => {
  return [
    { title: "Leino Family Recipes" },
    {
      name: "description",
      content: "Welcome to the Leino Family Recipes website!",
    },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getCurrentUser(request);
  return json({ isLoggedIn: user !== null });
};

export default function App() {
  const data = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="md:flex md:h-screen bg-background">
        <nav
          className={cn(
            "bg-primary text-white md:w-16",
            "flex justify-between md:flex-col"
          )}
        >
          <ul className="flex md:flex-col">
            <AppNavLink to="/">
              <HomeIcon />
            </AppNavLink>
            <AppNavLink to="discover">
              <DiscoverIcon />
            </AppNavLink>
            {data.isLoggedIn ? (
              <AppNavLink to="app/recipes">
                <RecipeBookIcon />
              </AppNavLink>
            ) : null}
            <AppNavLink to="settings">
              <SettingsIcon />
            </AppNavLink>
          </ul>
          <ul>
            {data.isLoggedIn ? (
              <AppNavLink to="/logout">
                <LogoutIcon />
              </AppNavLink>
            ) : (
              <AppNavLink to="/login">
                <LoginIcon />
              </AppNavLink>
            )}
          </ul>
        </nav>
        <div className="p-4 w-full md:w-[calc(100% - 4rem)]">
          <Outlet />
        </div>
        {/* emulates browser scroll restoration behavior */}
        <ScrollRestoration />
        {/* Loads scripts that have been code-split */}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export const ErrorBoundary = () => {
  const error = useRouteError();
  return (
    <html lang="en">
      <head>
        <title>Whoops!</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="p-4">
          {isRouteErrorResponse(error) ? (
            <HandledError error={error} />
          ) : (
            <UnhandledError error={error} />
          )}
        </div>
      </body>
    </html>
  );
};
