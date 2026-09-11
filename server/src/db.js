import { PrismaClient } from "@prisma/client";

// USE ONE PRISMA CLIENT PER NODE PROCESS TO MANAGE THE DATABASE CONNECTION POOL
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "production" ? ["warn", "error"] : ["warn", "error"],
});

export default prisma;
