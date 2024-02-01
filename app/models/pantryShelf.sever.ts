import { Prisma } from "@prisma/client";
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

export const deleteShelf = async (shelfId: string) => {
  try {
    const result = await db.pantryShelf.delete({
      where: {
        id: shelfId,
      },
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return error.message;
      }
    }
    throw error;
  }
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
