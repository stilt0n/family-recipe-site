import { handleDelete } from "./utils";
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

export const deleteShelf = (shelfId: string) => {
  return handleDelete(() =>
    db.pantryShelf.delete({
      where: {
        id: shelfId,
      },
    })
  );
};

export const saveShelfName = async (shelfId: string, newShelfName: string) => {
  return db.pantryShelf.update({
    where: {
      id: shelfId,
    },
    data: {
      name: newShelfName,
    },
  });
};
