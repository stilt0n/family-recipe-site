# Notes

Since this is my first time using Remix, I am using this markdown file to take notes on what I learn.

## Hydration

Server-side rendered React apps render all the markup for an app on the server before anyone sends a request
this way the use can see markup very quickly. For the HTML to become interactive, it needs React's event listeners
to be attached to it. The process of attaching these event listeners is called hydration.

## Routes in remix

Remix routes are files that define:

- A segment of the URL -- defined by route name
- The UI to display that URL -- defined by the route file's `default` export
- The data needed to render that UI -- defined by an exported function called `loader`

### Other exports for Route files

- `action` -- Handles form submissions
- `links` -- defines <link> elements
- `meta` -- defines metadata for the page
- `ErrorBoundary` -- A react component that is displayed when there is an error
- `headers` -- HTTP headers to return with the page
- `handle` -- custom application conventions (probably want to refer to the docs on this)
- `shouldRevalidate` -- [see docs](https://remix.run/docs/en/main/route/should-revalidate)

### Additional notes

- Loaders and actions exports go only to the server build
- Component goes to _both_ server _and_ browser build

## Remix imports

- Node related imports are generally found in the `@remix-run/node` package
- React related imports are generally found in the `@remix-run/react` package.

## Nested Routes

- Remix nests routes similarly to how SvelteKit does: by using nested directories.
- We need to tell remix where to display nested routes using `<Outlet />` component

## Links

Remix is built on top of React Router, so Link components are the same Link components that you use in React Router.

### Importing CSS Links

Importing CSS is a little different from vanilla react. Redux has a links function which will add an html link when you're in a particular route. If you want the link to be global (e.g. if you have global css) then you would include this in the `root.tsx` route. Or you can link elsewhere. An example:

```css
/* In app/styles/index.css */
h1 {
  color: blue;
}
```

We can import this file into the index component like this:

```tsx
import { LinksFunction } from "@remix-run/node";
// `~` is configured to be shorthand for the app directory
import styles from "~/styles/index.css";
export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};
```

In general:

- exported links function returns an array of link objects
- links are scoped to the route they're exported from
- links export is tied to routes and not components

### Styles

Remix is a little weird with styles. With standard React you
import stylesheets like this:

```js
import "./styles.css";
```

Remix uses links, which can be a little boilerplate-y but has the benefit of only needing to load relevant css for each page and being cached. Since links exports are only picked up in route level components this means you'll need to import css links imported from a non-route component into the routes that use it:

```js
// In non-route component
import styles from "./styles.css";
export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

// In route component
import { links as nonRouteLinks } from "../components/nonRouteComponent";

export const links: LinksFunction = () => {
  return [...nonRouteLinks()];
};
```

In this app we're going to make use of Tailwind to handle styles.
