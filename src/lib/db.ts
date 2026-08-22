import { PrismaClient } from "@prisma/client";

/** Satisfies Prisma schema `env("DATABASE_URL")` during `next build` when Vercel has not injected env yet. Not used for real queries. */
const BUILD_PLACEHOLDER =
  "postgresql://prisma:prisma@127.0.0.1:5432/prisma?schema=public";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = BUILD_PLACEHOLDER;
}

export function isDatabaseConfigured() {
  const url = process.env.DATABASE_URL ?? "";
  return Boolean(url) && !url.startsWith("postgresql://prisma:prisma@127.0.0.1");
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: { db: { url: process.env.DATABASE_URL } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
