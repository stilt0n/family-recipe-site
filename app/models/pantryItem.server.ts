import db from "~/db.server";

export const createShelfItem = (shelfId: string, name: string) => {
  return db.pantryItem.create({
    data: {
      shelfId,
      name,
    },
  });
};
