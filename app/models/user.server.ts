import db from "~/db.server";

export const getUser = (email: string) => {
  return db.user.findUnique({ where: { email } });
};
