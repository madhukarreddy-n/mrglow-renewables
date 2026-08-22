import { Suspense } from "react";
import { Logo } from "@/components/site/logo";
import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-navy-deep p-6">
      <div className="card w-full max-w-md p-8">
        <Logo />
        <h1 className="mt-6 font-display text-2xl">Staff sign in</h1>
        <p className="mt-2 text-sm text-muted">CRM and operations access is restricted.</p>
        <Suspense>
          <div className="mt-6">
            <LoginForm />
          </div>
        </Suspense>
      </div>
    </div>
  );
}
