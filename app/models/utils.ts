import { Prisma } from "@prisma/client";

export const handleDelete = async <T>(deleteFn: () => T) => {
  try {
    const result = await deleteFn();
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
