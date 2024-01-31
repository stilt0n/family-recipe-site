// .server helps remixes compiler understand that this code belongs on the server side
// .client does the same for client side
import { PrismaClient } from "@prisma/client";

interface CustomNodeJSGlobal extends NodeJS.Global {
  db: PrismaClient;
}

declare const global: CustomNodeJSGlobal;

const db =
  (process.env.NODE_ENV === "development" && global.db) || new PrismaClient();

// This helps prevent forming too many connections from hot-reloads during development
if (process.env.NODE_ENV === "development") {
  global.db = db;
}

export default db;
