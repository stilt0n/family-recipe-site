import db from "~/db.server";

export const getAllShelves = (query?: string | null) => {
  return db.pantryShelf.findMany({
    where: {
      name: {
        contains: query ?? "",
        mode: "insensitive",
      },
    },
    include: {
      items: {
        orderBy: {
          name: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const createShelf = (name: string) => {
  return db.pantryShelf.create({
    data: {
      name,
    },
  });
};
