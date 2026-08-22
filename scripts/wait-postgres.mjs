import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const attempts = 30;

for (let i = 1; i <= attempts; i++) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("PostgreSQL is ready.");
    await prisma.$disconnect();
    process.exit(0);
  } catch {
    console.log(`Waiting for PostgreSQL (${i}/${attempts})...`);
    await new Promise((r) => setTimeout(r, 2000));
  }
}

console.error("PostgreSQL did not become ready in time.");
await prisma.$disconnect();
process.exit(1);
