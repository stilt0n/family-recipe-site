import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import tailwindStyles from "./tailwind.css";

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
      <body>
        <nav>
          <Link to="/">Home</Link>
          <Link to="discover">Discover</Link>
          <Link to="app">App</Link>
          <Link to="settings">Settings</Link>
        </nav>
        <Outlet />
        {/* emulates browser scroll restoration behavior */}
        <ScrollRestoration />
        {/* Loads scripts that have been code-split */}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
