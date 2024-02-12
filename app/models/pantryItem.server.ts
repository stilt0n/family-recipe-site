import { handleDelete } from "./utils";
import db from "~/db.server";

export const createShelfItem = (
  userId: string,
  shelfId: string,
  name: string
) => {
  return db.pantryItem.create({
    data: {
      userId,
      shelfId,
      name,
    },
  });
};

export const deleteShelfItem = (id: string) => {
  return handleDelete(() =>
    db.pantryItem.delete({
      where: {
        id,
      },
    })
  );
};

export const getShelfItem = (id: string) => {
  return db.pantryItem.findUnique({ where: { id } });
};
