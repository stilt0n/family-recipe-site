import db from "~/db.server";

export const getAllShelves = () => {
  return db.pantryShelf.findMany({
    include: {
      items: {
        orderBy: {
          name: "asc",
        },
      },
    },
  });
};
