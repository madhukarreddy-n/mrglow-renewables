"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    if (!res.ok) {
      setError("Invalid credentials");
      setLoading(false);
      return;
    }
    router.push(params.get("next") || "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        Email
        <input name="email" type="email" required autoComplete="username" />
      </label>
      <label className="block text-sm">
        Password
        <input name="password" type="password" required autoComplete="current-password" />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
