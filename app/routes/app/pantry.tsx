import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllShelves } from "~/models/pantryShelf.sever";
import cn from "classnames";

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
      <ul
        className={cn(
          "flex gap-8 overflow-x-auto",
          "snap-x snap-mandatory md:snap-none"
        )}
      >
        {data.shelves.map((shelf) => (
          <li
            key={shelf.id}
            className={cn(
              "border-2 border-primary rounded-md p-4 h-fit",
              "w-[calc(100vw-2rem)] flex-none snap-center",
              "md:w-96"
            )}
          >
            <h1 className="text-2xl font-extrabold mb-2">{shelf.name}</h1>
            <ul>
              {shelf.items.map((item) => (
                <li key={item.id} className="py-2">
                  {item.name}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Pantry;
