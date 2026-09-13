"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EmployeesManager({
  employees,
}: {
  employees: { id: string; name: string; email: string; role: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone") || undefined,
        role: form.get("role"),
        password: form.get("password"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not invite");
      return;
    }
    formEl.reset();
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="card p-6">
        <h2 className="font-display text-xl">Invite staff</h2>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <label className="block text-sm">
            Name
            <input name="name" required />
          </label>
          <label className="block text-sm">
            Email
            <input name="email" type="email" required />
          </label>
          <label className="block text-sm">
            Phone
            <input name="phone" />
          </label>
          <label className="block text-sm">
            Role
            <select name="role" defaultValue="employee">
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="block text-sm">
            Temporary password
            <input name="password" type="password" minLength={8} required />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button className="btn-primary">Create login</button>
        </form>
      </div>
      <div className="card p-6">
        <h2 className="font-display text-xl">Team</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {employees.map((emp) => (
            <li key={emp.id}>
              <p className="font-semibold">{emp.name}</p>
              <p className="text-muted">
                {emp.email} · {emp.role}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
