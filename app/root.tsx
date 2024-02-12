import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import {
  HomeIcon,
  DiscoverIcon,
  RecipeBookIcon,
  SettingsIcon,
  LoginIcon,
} from "./components/icons";
import { AppNavLink } from "./components/appNavLink";
import cn from "classnames";
import tailwindStyles from "./tailwind.css";
import { HandledError, UnhandledError } from "./components/error";

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

export default function App() {
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
            <AppNavLink to="app/pantry">
              <RecipeBookIcon />
            </AppNavLink>
            <AppNavLink to="settings">
              <SettingsIcon />
            </AppNavLink>
          </ul>
          <ul>
            <AppNavLink to="/login">
              <LoginIcon />
            </AppNavLink>
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
