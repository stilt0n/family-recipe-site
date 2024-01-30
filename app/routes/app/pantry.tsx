import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllShelves } from "~/models/pantryShelf.sever";

// Remix creates an API layer from the loader and that api layer gets called
// when we fetch data from the component
export const loader = async () => {
  // This is basically select * from pantryShelf
  const shelves = await getAllShelves();
  return json({ shelves });
};

const Pantry = () => {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Pantry</h1>
      <ul>
        {data.shelves.map((shelf) => (
          <li key={shelf.id}>{shelf.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Pantry;
