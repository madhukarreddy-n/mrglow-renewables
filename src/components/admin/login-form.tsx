"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [mode, setMode] = useState<"login" | "setup">("login");

  useEffect(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then((d) => {
        if (d.needsSetup) {
          setNeedsSetup(true);
          setMode("setup");
        }
      })
      .catch(() => {});
  }, []);

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const supabase = createBrowserSupabase();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: String(form.get("email") || ""),
        password: String(form.get("password") || ""),
      });
      if (authError) {
        setError(authError.message === "Invalid login credentials" ? "Invalid email or password." : authError.message);
        setLoading(false);
        return;
      }
      const me = await fetch("/api/me");
      if (!me.ok) {
        await supabase.auth.signOut();
        setError("This login is not on the staff list. Create the first admin (setup) or ask an existing admin to invite you.");
        setLoading(false);
        return;
      }
      router.push(params.get("next") || "/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Supabase is not configured. Add keys to .env.local.");
      setLoading(false);
    }
  }

  async function onSetup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        setup_secret: form.get("setup_secret") || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Setup failed");
      setLoading(false);
      return;
    }
    const supabase = createBrowserSupabase();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    });
    if (authError) {
      setError("Admin created. Sign in with the same email and password.");
      setMode("login");
      setNeedsSetup(false);
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  if (mode === "setup") {
    return (
      <form onSubmit={onSetup} className="space-y-4">
        <p className="rounded-xl bg-mist p-3 text-sm">
          No staff accounts yet. This creates the first <strong>admin</strong> in Supabase Auth and the employees table.
        </p>
        <label className="block text-sm">
          Your name
          <input name="name" required autoComplete="name" />
        </label>
        <label className="block text-sm">
          Email
          <input name="email" type="email" required autoComplete="username" />
        </label>
        <label className="block text-sm">
          Password (8+ characters)
          <input name="password" type="password" minLength={8} required autoComplete="new-password" />
        </label>
        <label className="block text-sm">
          Setup secret (if you set SETUP_SECRET)
          <input name="setup_secret" type="password" autoComplete="off" />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating…" : "Create first admin"}
        </button>
        {needsSetup ? null : (
          <button type="button" className="w-full text-sm underline" onClick={() => setMode("login")}>
            Back to sign in
          </button>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={onLogin} className="space-y-4">
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
      {needsSetup ? (
        <button type="button" className="w-full text-sm underline" onClick={() => setMode("setup")}>
          Create first admin
        </button>
      ) : null}
    </form>
  );
}
