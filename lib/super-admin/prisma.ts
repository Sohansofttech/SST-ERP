import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & { superAdminPrisma?: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.superAdminPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.superAdminPrisma = prisma;
