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
