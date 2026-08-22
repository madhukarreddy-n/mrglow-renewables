import { prisma } from "./db";

export async function rateLimit(key: string, limit: number, windowMs: number) {
  const since = new Date(Date.now() - windowMs);
  const count = await prisma.rateLimitHit.count({
    where: { key, createdAt: { gte: since } },
  });
  if (count >= limit) return false;
  await prisma.rateLimitHit.create({ data: { key } });
  return true;
}
