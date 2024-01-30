import { LoaderFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = () => {
  return { message: "Hello, World!" };
};

const Settings = () => {
  const data = useLoaderData<{ message: string }>();
  return (
    <div>
      <h1>Settings</h1>
      <p>Message from loader: {data.message}</p>
      <nav>
        <Link to="app">App</Link>
        <Link to="profile">Profile</Link>
      </nav>
      <Outlet />
    </div>
  );
};

export default Settings;
