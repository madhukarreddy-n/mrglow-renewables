"use client";

import { useState } from "react";
import Link from "next/link";

const BILLS: { label: string; value: number }[] = [
  { label: "Less than ₹1,500", value: 1200 },
  { label: "₹1,500 – ₹2,500", value: 2000 },
  { label: "₹2,500 – ₹4,000", value: 3200 },
  { label: "₹4,000 – ₹8,000", value: 6000 },
  { label: "More than ₹8,000", value: 10000 },
];

export function ConsultationForm({
  compact,
  intent,
  source = "consultation",
  estimatedSystemKwp,
  estimatedAnnualSavingsInr,
  monthlyBillInr,
}: {
  compact?: boolean;
  intent?: string;
  source?: "calculator" | "consultation";
  estimatedSystemKwp?: number;
  estimatedAnnualSavingsInr?: number;
  monthlyBillInr?: number;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const defaultMessage =
    intent === "maintenance"
      ? "I would like to schedule solar panel cleaning / request maintenance."
      : "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = new FormData(e.currentTarget);
    const billLabel = String(form.get("monthly_bill_range") || "");
    const bill = monthlyBillInr ?? BILLS.find((b) => b.label === billLabel)?.value;
    const category = String(form.get("site_type") || "home");
    const phone = String(form.get("phone") || "").replace(/\D/g, "").slice(-10);
    const payload = {
      name: form.get("name"),
      phone,
      email: form.get("email") || undefined,
      city: form.get("city") || undefined,
      site_type: category,
      monthly_bill_inr: bill,
      estimated_system_kwp: estimatedSystemKwp,
      estimated_annual_savings_inr: estimatedAnnualSavingsInr,
      source,
      company: form.get("company"),
      message: form.get("message") || undefined,
    };
    const res = await fetch("/api/public/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setError(data.error || "Could not submit. Please try again.");
      return;
    }
    window.location.href = `/consultation-success?ref=${encodeURIComponent(data.id || "")}`;
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
      <label className="block text-sm">
        Full name
        <input name="name" required autoComplete="name" />
      </label>
      <label className="block text-sm">
        WhatsApp number
        <input name="phone" required inputMode="tel" pattern="[0-9]{10}" placeholder="10-digit mobile" />
      </label>
      <label className="block text-sm">
        Email
        <input name="email" type="email" autoComplete="email" />
      </label>
      {!compact && intent !== "maintenance" ? (
        <>
          <label className="block text-sm">
            Monthly electricity bill
            <select name="monthly_bill_range" required defaultValue="">
              <option value="" disabled>
                Select
              </option>
              {BILLS.map((b) => (
                <option key={b.label}>{b.label}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            City
            <input name="city" placeholder="Hyderabad" />
          </label>
          <label className="block text-sm">
            Property
            <select name="site_type" defaultValue="home">
              <option value="home">Home</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
            </select>
          </label>
        </>
      ) : (
        <input type="hidden" name="site_type" value="home" />
      )}
      <label className="block text-sm">
        Additional message
        <textarea name="message" rows={compact ? 2 : 3} defaultValue={defaultMessage} />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="agree" required className="mt-1 h-4 w-4" />
        <span>
          I agree to Mr.GLOW RENEWABLES PVT LTD{" "}
          <Link className="underline" href="/terms">
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link className="underline" href="/privacy">
            Privacy Policy
          </Link>
          .
        </span>
      </label>
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <button className="btn-primary w-full" disabled={status === "loading"}>
        {status === "loading"
          ? "Submitting…"
          : intent === "maintenance"
            ? "Schedule Cleaning / Request Maintenance"
            : "Get a free quote"}
      </button>
    </form>
  );
}
