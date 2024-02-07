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

## useFetcher

Remix form submissions act as navigations, so since you can only navigate to one page at a time, only one form can be submitted
at a time. This can result in some weird behavior when using the `useNavigation` hook and submitting multiple forms at once.

Requests will be processed after they are sent, but the UI's state can temporarily become inaccurate if it's using navigation
form data to inform its rendering.

So not all forms make much sense to treat as navigations, in this case. When we don't want to model a form as a navigation we
can use the `useFetcher` hook. `useFetcher` allows you to submit a form on without navigating.

Use fetcher returns a fetcher which does a few things:

```js
const Fetcher = useFetcher();
```

It has a Form component that submits requests without navigating:

```js
<Fetcher.Form />
```

And it also can be used as a stand-in for the `useNavigation` api:

```js
// Navigation API
navigation.formData?.get("key");
// Fetcher equivalent
Fetcher.formData?.get("key");
```

### Nice features of Remix

When we submit a delete request (or create request) we are communicating to the database that we need to change the data there.

Usually we'd need to then update the data to stay current with the database, but with Remix, Remix will assume that if it gets
a request back that data could be out of date and rerun loaders. This means your page stays in synch with your database with
minimal effort.

Remix will also manage potential race condition bugs. Generally you're not guaranteed responses come back in order. Consider a
case where we delete two shelves (X and Y). We'd expect the flow to look something like this:

Send delete request for shelf X => Shelf X is deleted from database => backend sends back the updated list of shelves (includes shelf Y)
Send delete request for shelf Y => Shelf Y is deleted from database => backend sends back the updated list of shelves (with both X and Y missing)

But in practice, these steps may get mixed up. If we delete Shelf X and Shelf Y but the deltes happen _before_ the responses get sent back we could
recieve the responses in the wrong order and wrongly see that one shelf is still present when it has been deleted.

Remix handles this case by:

- Noting that the request for shelf X happens first.
- When a response comes back, if it is from the shelf X request:
  - Update the UI with data from shelf X request
  - UNLESS Remix has already recieved a response from shelf Y request
    - In this case, cancel the shelf X request

This request helps solve this particular issue:

```
X --> --> delete X --> --> return Shelves
    Y --> delete Y --> return Shelves
```

But theres is still potential for a rarer issues:

```
X --> request cancelled / interrupted --> --> --> --> --> delete X (still happens because X has already been sent but will not return)
    Y --> delete Y --> return Shelves
```

In practice this is rare but can be handled with backend logic if the use case is a concern in a particular circumstance.

[See concurrency section in remix docs for more information](https://remix.run/docs/en/main/discussion/concurrency)

## Optimistic UI

In many cases, we have a good idea what the result of a request will be if it succeeds. In these cases, we may not want to show pending UI and may instead want to assume that the request succeeded and update the UI instantly.

If we do this:

- Form is submitted
- UI is updated
- When response is recieved:
  - If it succeeded do nothing
  - If it failed revert UI and show error message

Usually step 3 is pretty tricky, but Remix will handle this for you. After recieving the response, Remix calls all the loaders. When it recieves the response from the loader, if the request failed, remixes revalidation will just return the old state.

## Fetcher states

Fetchers have three states:

- Idle
- Submitting
- Loading

Starts in idle. Submission triggers submitting state. Revalidation triggers loading state. When loading is finished goes back to idle.

## Client-Side vs Server-Side validation

While things can be validated on the client side to improve user experience, it's important to keep in mind that requests don't come
exclusively from the client. For this reason we always need to validate on the server even if we already did on the client.

# Notes on Authentication

## Cookies and authentication

Cookies are a fundamental building block of the web and necessary for our magic link authentication strategy.

Cookies are a small amount of data that the server sends to the browser. The browsers stores this and sends it back on subsequent responses.

Chain of events:

Server -> "Set-Cookie": "name=value" -> Browser
Browser -> "Cookie": "name=value" -> Server

Cookies keep track of state on the web. Things cookies are commonly used for:

- Determine which user made a request
- Store user preferences
- Record user behavior

### Setting cookies with remix

Remix lets you set cookies using the headers function export:

```js
export const headers = () => {
  return {
    "Set-Cookie": "remix-recipes-cookie=myValue",
  };
};
```

Note this isn't really Remix specific. Sending this header would set the cookie even without using JavaScript.

### Cookie attributes

Cookies have more than just a name attribute.
Cookie attributes can be set through the header like this:

```js
"Set-Cookie": "name=value;attributeName=attributeValue;"
```

Some cookie attributes:

- Name: value <- Only attributes that get sent back to the server. Uniquely identifies cookie
- Domain: path <- determines which urls to send cookie to. Defaults to the url you sent cookie from.
  - Can't set domain to anything other than domain of server
  - Can't specifiy port number
  - Subdomains are excluded by default but can be included by manually setting domain attribute
  - Matches all sub paths (e.g. if path is `/app` then `/app/pantry` is included)
- Expires/Max-Age <- Determines when cookie expires. If cookie expires browser will delete it and not send it.
  - Can be set like this: `Expires=Wed, 5 Feb 2024 00:49:00 GMT`
  - Or can set Max-Age to a number of seconds: `Max-Age=86400` <- Expires in one day
  - Can be set to expire at the end of the current session: `Expires=Session`
    - Default value for Expires/Max-Age
    - Some browsers (e.g. Chrome) implement session restore which will restore this cookie
    - This means this setting can potentially last forever
- Size <- number of bytes in "name=value"
  - Browser sets limits on size of cookies to 4096 bytes
- Secure <- When Secure: true the browser will only send cookie over https
- HttpOnly <- Makes cookie inaccessible to JavaScript
- Same site <- Determines where the cookie can be sent from
  - Strict <- Cookie can be sent from same site that set it
  - Lax <- (default) Cookie can also be sent when navigating from another site to the site that sent the cookie
  - None <- Cookie can be sent from any site as long as _Secure_ is set.

We want both Secure and HttpOnly for the Auth cookie.

### Basic Cookie Auth Flow

_Important: this is for explanatory purposes and is not a secure way to handle auth_

```js
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("cookie");
  // browser sends all cookies associated with the domain
  // so we need to parse the header to find the relevant one
  findRelevantCookie(cookieHeader);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  return validateForm(
    formData,
    loginSchema,
    async ({ email }) => {
      const user = await getUser(email);
      if (user == null) {
        return json(
          { errors: { email: "User with this email does not exist" } },
          { status: 401 }
        );
      }
      return json(
        { user },
        {
          headers: {
            "Set-Cookie": `remix-recipes__userId=${user.id}; HttpOnly; Secure;`,
          },
        }
      );
    },
    sendErrors
  );
};
```

### Remix cookie helper

Can use the remix function `createCookie` to create cookies:

```js
const myCookie = createCookie("cookie_name", {
  httpOnly: true,
  secure: true,
  ...cookieAttributes,
});
```

To use it:

```js
{
  headers: {
    "Set-Cookie": await myCookie.serialize(myValue),
  }
}
```

To get cookie in loader:

```js
const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("cookie");
  const cookieValue = await myCookie.parse(cookieHeader);
  console.log(cookieValue); // this will be base64
  return cookieValue;
};
```

`cookie.serialize()`:

- Calls JSON.stringify(value)
- Encodes result with base64

base64 encoding helps prevent cookie corruption from characters that can't be handled well by browsers.
base64 is _not_ encryption and can easily be decoded

### Cryptographic signatures and cookie signing

Signing takes:

- Data to be signed
- Secret key
  Then uses those to produce a signature.

Mock function def:

```ts
type Signature string;

function sign(data: string, secret_key: string): Signature {}
```

Sign function:

- Must be deterministic
- Resulting signature must be nearly impossible to produces without secret key

This helps determine message is sent from the right person:

- Suppose you and one other person have secret key
- Person signs message w/ key
- You receive message and signature
- You sign message with your key
- If signatures match message must have been sent from someone w/ same key

But this isn't exactly how it works.

For cookie auth the user does not have the secret key. _Only the server has the secret key._

```
When server sends data:
Server --> "Cookie": "name=data.signature" --> Browser
sign()
```

```
When browser sends data back:
Browser --> "Cookie": "name=data.signature" --> Server
                                                sign()
```

Since server has the sign function it can sign the data it recieved from the user.
If the signature matches the original one then it is the original data.

### Signing cookies in Remix

The remix cookie helper has an option called `secrets`:

```js
createCookie("remix-recipes__userId", {
  // IMPORTANT: Don't store raw secrets like this
  secrets: ["a", "b", "c"],
  httpOnly: true,
  secure: true,
});
```

Remix uses strings in this array to automatically sign cookie when array is serialized.
Remix also verifies signature when parsing cookie
Each secret is considered a valid secret key when verifying incoming cookies.
Only first string signs outgoing cookies which means we can rotate secrets by prepending new keys.

### Sessions

Session is a common term but in this case there are two things it can refer to:

The time period the user has the cookie active:

- Session ends when cookie expires
- Session ends when user deletes cookie manually by logging out

Session information:

- User Id
- Data/Time started
- Which browser/device started session (user-agent)
- Actions the user takes

Why both definitions?

- Useful to have shorthand for data about a current user's session
- Standard word

A cookie that stores session data is usually called a session cookie. There are some conventions for session cookies:

- Name is of form: `<name-of-app>__session`
- Value is typically base64 stringified json object

### Session Storage

Our current strategy is to store base64 serialized JSON data in a session cookie. But we don't need to store data this way.

We could also store session data in a database or a file or elsewhere.

One good reason to store session data outside of the cookie is because cookie size is limited:

- Instead of storing a large amount of session data you can store a pointer to it
- Can then store the data elsewhere

It's also good to avoid burdening the network with larger than necessary cookies.

If we're changing session state a lot we may end up sending an excessive amount of Set-Cookie headers.

Can centralize sessions:

- Easier to analyze session data if it's all in one place
- Can share sessions between a user's different devices
- Can log a user out of multiple devices at once
- Generally more control

For our app we're only going to track the userId. We'd already have to track this if we stored session info elsewhere
so there's not a good reason to create the additional storage.

### Remix session helpers

Remix can abstract away specific storage location of sessions which makes transitioning less painful.

Remix has a `SessionStorage` object with three methods:

- getSession
- commitSession
- destroySession

Remix has storage-location-specific options for creating `SessionStorage` objects:

- createCookieSessionStorage
- createMemorySessionStorage
- createFileSessionStorage
- createCloudflareKVSessionStorage
- createArcTableSessionStorage
- createSessionStorage <- Generic and allows custom storage location

We'll use first option.

We can create session storage like this:

```js
const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: sessionCookie,
  });

export { getSession, commitSession, destroySession };
```

Then we can use them like this:

```js
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("cookie");
  // This comes back null if signature does not match
  const session = await getSession(cookieHeader);
  console.log("Session data: ", session.data);
  // browser sends all cookies so we need to parse to find the specific one
};
```

Session object is essentially a key-value Map.

Can read _all_ data with `session.data`

**Or:**

Call `session.get()`. Some useful methods:

```js
session.data; // get all data
session.get(key); // get data from key
session.has(key); // check if session has key
session.set(key, value); // set key to value
session.unset(key); // remove key
session.flash(key, value); // sets temporary data that is automatically deleted on next get call
```

These functions _do not_ persist to the storage location. If you want to do that you need to pass the session to commit session:

```js
session.set("foo", "bar");
// headerInfo is a string that can be used for "Set-Cookie" header's value
const headerInfo = commitSession(session);
```

destroySession accepts a session object and returns a "Set-Cookie" header. The set cookie header sets the expiration to Date.now();

## Magic Link Sign In

When a user sends a request to the server, the server will create url with magic link params and send it to the user's email. The user having access to the email helps authenticate the user. But magic links have some additional properties:

- Can only be used one time
- Must be used from the same device and browser that they were requested from
- Only valid for a few minutes

Magic link anatomy:

http://localhost:3000/magic-link-signin?magic=83hhfdslnv921u

<origin-url>/<route>?[param]=[payload]

The payload is an encrypted value. In this case a json string:

```json
{
  "email": "jeffy@family-circus.com",
  "nonce": "stands-for-Number-used-ONCE",
  "createdAt": "a-timestamp-for-creation-time"
}
```

### More on the nonce

We need the nonce to help establish that the login request is coming from
the same browser that requested the magic link. To do this:

- Send nonce in payload to the user's email
- Send nonce to user's browser as a cookie

Now when we check the magic link we can confirm the nonce matches the nonce
that the user has stored in their cookies.

For our setup we'll just be reusing the session cookie for this.
