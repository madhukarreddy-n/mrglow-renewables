import { spawnSync } from "node:child_process";

const url = process.env.DATABASE_URL || "";
const placeholder = url.startsWith("postgresql://prisma:prisma@127.0.0.1");

if (!url || placeholder) {
  console.info("[migrate] skipped — set DATABASE_URL to a real Postgres URL on Vercel to apply migrations.");
  process.exit(0);
}

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: true,
});
process.exit(result.status ?? 1);
