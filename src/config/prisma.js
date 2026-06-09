import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import {env} from "./env.js";

// L'adaptateur reçoit la DATABASE_URL et gère la connexion mysql2
const adapter = new PrismaMariaDb(env.DATABASE_URL);

let prisma;

// Singleton : réutilise l'instance existante en dev (hot-reload nodemon)
if (!global.prisma) {
  prisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;   // stocké globalement seulement en dev
  }
} else {
  prisma = global.prisma;
}

export default prisma;