import { handleDelete } from "./utils";
import db from "~/db.server";

export const getAllShelves = (userId: string, query?: string | null) => {
  return db.pantryShelf.findMany({
    where: {
      userId,
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

export const createShelf = (userId: string, name: string) => {
  return db.pantryShelf.create({
    data: {
      userId,
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

export const getShelf = (id: string) => {
  return db.pantryShelf.findUnique({ where: { id } });
};
