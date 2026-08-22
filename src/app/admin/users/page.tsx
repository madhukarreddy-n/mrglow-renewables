import { prisma } from "@/lib/db";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="font-display text-2xl">Users & roles</h1>
      <p className="mt-2 text-sm text-muted">Permissions are enforced in server actions and APIs, not only in the UI.</p>
      <ul className="mt-6 space-y-3">
        {users.map((u) => (
          <li key={u.id} className="rounded-2xl bg-white p-4">
            <p className="font-semibold">{u.name}</p>
            <p className="text-sm text-muted">{u.email} · {u.role} · {u.active ? "active" : "disabled"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
