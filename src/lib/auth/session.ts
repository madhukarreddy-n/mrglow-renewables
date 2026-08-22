import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";
import { hasPermission, Permission } from "./rbac";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

const COOKIE = process.env.AUTH_COOKIE_NAME || "mrglow_session";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function readSession(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE)?.value;
    if (!token) return null;
    if (!process.env.AUTH_SECRET) return null;
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function requireUser() {
  const user = await readSession();
  if (!user) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  return user;
}

export async function requirePermission(permission: Permission) {
  const user = await requireUser();
  if (!hasPermission(user.role, permission)) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }
  return user;
}
