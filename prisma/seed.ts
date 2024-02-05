import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const createUser = () => {
  return db.user.create({
    data: {
      email: "me@test.com",
      firstName: "Mattias",
      lastName: "Leino",
    },
  });
};

const getShelves = (userId: string) => {
  return [
    {
      userId,
      name: "Dairy",
      items: {
        create: [
          { name: "Milk", userId },
          { name: "Eggs", userId },
          { name: "Cheese", userId },
        ],
      },
    },
    {
      userId,
      name: "Fruits",
      items: {
        create: [
          { name: "Apples", userId },
          { name: "Bananas", userId },
          { name: "Oranges", userId },
        ],
      },
    },
  ];
};

const seed = async () => {
  const user = await createUser();
  await Promise.all(
    getShelves(user.id).map((shelf) => db.pantryShelf.create({ data: shelf }))
  );
};

seed();
