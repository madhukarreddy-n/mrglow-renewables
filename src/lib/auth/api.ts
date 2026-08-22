import { NextResponse } from "next/server";
import { Permission } from "./rbac";
import { requirePermission, type SessionUser } from "./session";

export async function requireApiPermission(
  permission: Permission,
): Promise<{ user: SessionUser; response?: never } | { user?: never; response: NextResponse }> {
  try {
    const user = await requirePermission(permission);
    return { user };
  } catch (e) {
    const status = (e as { status?: number }).status || 401;
    return {
      response: NextResponse.json(
        { error: status === 403 ? "Forbidden" : "Unauthorized" },
        { status },
      ),
    };
  }
}
