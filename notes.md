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

## Loaders

In remix, when you want to get data from an outside source
you do it with a `loader` export inside of a route file.

Loaders can return any JSON serializable data

Example:

```jsx
import { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const loader: LoaderFunction = () => {
  return { message: 'Hello, World!' };
}

const Component = () => {
  const data = useLoaderData<{ message: string }>();
  return <p>{data.message}</p>;
}
```

If you look in the network tab, you'll see that the loader message is in the document that gets sent. That is because the data is loaded on the server-side.

Loader is only included on the server so it can do stuff like interface with a database or read secret tokens.

We can send response objects from the loader:

```js
export const loader: LoaderFunction = () => {
  return new Response(JSON.stringify({message: 'Hello, World!'}), {
    headers: "Content-Type": "application/json",
  })
}
```

Remix has a `json` helper that simplifies the above

## Pending Data

When data is loading, how to show an indicator?

- Remix waits till your data loads to transition to a new route
- This can be a confusing user experience
- Can't add pending state to component
- Need to go up a level

### Let browser take care of it

```jsx
// Tells Remix to reload full page, in which case browser handles pending UI
<NavLink to={to} reloadDocument />
```

### Build custom pending UI

Use the `useNavigation()` hook.

`useNavigation` gives you information about your route's navigation.

Can use it to determine if remix is loading a page associated with link:

```jsx
const Example = ({ children, to }) => {
  const navigation = useNavigation();
  const resolvedPath = useResolvedPath(to);
  const isLoading =
    navigation.state === 'loading' &&
    navigation.location.pathname === resolvedPath.pathname;
  return (
    <NavLink to={to} >
      <div className={isLoading ? "animate-pulse bg-primary-light" : ""}>
        {children}
      </div>
    <NavLink />
  )
}

```

Could obviously extract this into a hook:

```js
const useIsLoading = (route: string) => {
  const resolvedPath = useResolvedPath();
  const navigation = useNavigation();
  return (
    navigation.state === "loading" &&
    navigation.location.pathname === resolvedPath.pathname
  );
};

// in other file
const Example = ({ to }) => {
  const isLoading = useIsLoading();
  // ...
};
```

### Why load before route transition?

- Remixes all data _before_ component loads
- Transitions after all the data is in

Good because:

- non-blocking to the user. User can continue to use current content
- Separation of concerns between UI and data. Makes fetching data not a concern of React component
- Good for performance. Avoids stuff like fetch waterfalls

Fetch waterfall example:

```jsx
const Bar = () => {
  const bar = useLoadBar();
  if (bar.isLoading) {
    return <Spinner />;
  }

  return <Foo bar={bar} />;
};

// Can't start fetching until Bar is done fetching
// Especially bad if Foo does not depend on Bar
const Foo = (props) => {
  const foo = useLoadFoo(props.bar);
  if (foo.isLoading) {
    return <Spinner />;
  }

  return (
    <>
      {foo.data.map((f) => (
        <p>{f}</p>
      ))}
    </>
  );
};
```

Remix can fetch all this data at once

### useLoaderData

Use loader data provides data through context, so when you call it inside of a component you will get data from
the closest route above your component.

If the route above the component does NOT have loader data, the component will NOT look above that component.

Remix has a hook called `useMatches`:

```js
// This gives you a list of all routes that match the current page
const matches = useMatches();
// Can then get data from a match
matches[0].data;
// This also allows grabbing child data from parent route
matches.find((route) => route.id === "parent/child").data;
```

In a hook:

```js
const useMatchesData(id: string) => {
  const matches = useMatches();
  const route = useMemo(() => {
    matches.find(route => route.id === id),
    [matches, id]
  });
  return route?.data;
}
```

## Error handling in remix

To create custom error UI export an ErrorBoundary component

```jsx
export const ErrorBoundary = () => {
  return <h1>Whoops!</h1>;
};
```

Can also do this:

```jsx
export const ErrorBoundary = () => {
  const routeError = useRouteError();
  if (routeError instanceof Error) {
    return (
      <div>
        <h1>Whoops! Something went wrong!</h1>
        <p>{error.message}</p>
      </div>
    );
  }
  return <div>Unexpected error!</div>;
};
```

## Resource routes

In remix, a route that doesn't display a UI is called a resource route.

Resource routes can be used to do stuff like reroute users, or provider resources like json, images, etc.

To redirect we return a response with status 302 which is for redirect and a Location header:

```js
return new Response(null, {
  status: 302,
  headers: {
    Location: redirectUrl,
  },
});
```

Remix has a redirect helper that accomplishes the above, but I am not currently using it because I want to
get more used to the web API:

```js
import { LoaderFunction, redirect } from "@remix-run/node";

export const loader: LoaderFunction = () => {
  // Shortcut for above
  return redirect(redirectUrl);
};
```

### Prisma Studio

For prisma if you want a GUI you can use

```sh
npx prisma studio
```

## Working with form data

Consider this form:

```jsx
<form>
  <input type="text" name="firstName" className="border-2 border-gray-300" />
  <input type="text" name="lastName" className="border-2 border-gray-300" />
  <button>Submit</button>
</form>
```

When Submit is clicked, the page will reload and the browser will send a request.

The request goes to the current route `"http://mysite/current/route"` but with an
added query string. In this case `"?firstName=<submittedValue>&lastName=<lastNameValue>"`

The parts of the query string are called query parameters (I've used these before at work).

The form submit causes the page to _navigate_ to the current page.

A form can have a action prop:

```html
<form action="/app/pantry">
  <button>Submit</button>
</form>
```

That tells the form where to navigate to on submit.

So forms can be seen as an anchor tag with query params

When we navigate using the form, remix will call the loaders associated with the route.
Remember that this includes parent routes (e.g. routes/app/pantry also includes routes/app and root)

After data is gathered from loaders remix will pass the data to `handleRequest` in `entry.server.tsx`
as `remixContext.routeData` which allows you to render the html

The loader will get the request object passed to it. The request object will have a property called URL

To use this with a loader, you need to use the `useSearchParams` hook in order to persist the url after reload.

### More

An interesting thing about this approach is that it allows us to use the url to manage state. This has a few benefits,
one of them being that it makes it easy to share state between the server and the client.

This also means we can do cool optimizations. For example, if we realize a lot of users search for something specific
we can send cache control headers and cache the search result to avoid searching the database.

This also allows the back and forward button to change search queries.

Finally, this also means the search bar works without JS.

## Remix Form

Remix `Form` is similar to `form` but instead of doing whole page reloads it handles things client-side with javascript.
It also allows custom pending UI with the `useTransition` hook.

## actions

Remix actions allow you to respond to non-GET requests that are directed to a route.

Remix responds in this order:

- Call action
- Call associated loaders
- Send back HTML
