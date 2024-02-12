import db from "~/db.server";

export const getUser = (email: string) => {
  return db.user.findUnique({ where: { email } });
};

export const createUser = (
  email: string,
  firstName: string,
  lastName: string
) => {
  return db.user.create({
    data: {
      email,
      firstName,
      lastName,
    },
  });
};

export const getUserById = (id: string) => {
  return db.user.findUnique({ where: { id } });
};
