import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = () => {
  return new Response(JSON.stringify({ message: "I'm a teapot" }), {
    headers: {
      "Content-Type": "application/json",
    },
    status: 418,
  });
};

const Profile = () => {
  const data = useLoaderData<{ message: string }>();
  return (
    <div>
      <h1>Profile page</h1>
      <p>message: {data.message}</p>
    </div>
  );
};

export default Profile;
