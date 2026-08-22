"use client";

export function SignOutButton() {
  return (
    <button
      className="text-xs text-white/50"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
    >
      Sign out
    </button>
  );
}
