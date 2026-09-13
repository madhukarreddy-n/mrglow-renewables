const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const windowStart = now - windowMs;
  const prev = (hits.get(key) || []).filter((t) => t > windowStart);
  if (prev.length >= limit) return false;
  prev.push(now);
  hits.set(key, prev);
  return true;
}
