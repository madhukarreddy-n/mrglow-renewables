"use client";

import { createBrowserSupabase } from "@/lib/supabase/browser";

export function SignOutButton({ className = "text-xs text-white/50" }: { className?: string }) {
  return (
    <button
      className={className}
      onClick={async () => {
        const supabase = createBrowserSupabase();
        await supabase.auth.signOut();
        window.location.href = "/admin/login";
      }}
    >
      Sign out
    </button>
  );
}
