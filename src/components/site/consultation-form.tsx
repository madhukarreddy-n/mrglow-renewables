"use client";

import { useState } from "react";
import Link from "next/link";
import { INDIAN_STATES } from "@/lib/india-states";

const BILLS = [
  "Less than ₹1,500",
  "₹1,500 – ₹2,500",
  "₹2,500 – ₹4,000",
  "₹4,000 – ₹8,000",
  "More than ₹8,000",
];

export function ConsultationForm({
  compact,
  reportId,
  intent,
}: {
  compact?: boolean;
  reportId?: string;
  intent?: string;
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
    const payload = Object.fromEntries(form.entries());
    const res = await fetch("/api/consultation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, calculatorReportId: reportId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setError(data.error || "Could not submit. Please try again.");
      return;
    }
    window.location.href = `/consultation-success?ref=${encodeURIComponent(data.leadNumber)}`;
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
      {!compact && intent !== "maintenance" && (
        <>
          <label className="block text-sm">
            Monthly electricity bill
            <select name="monthlyBillRange" required defaultValue="">
              <option value="" disabled>Select</option>
              {BILLS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            PIN code
            <input name="pincode" required pattern="[0-9]{6}" />
          </label>
          <label className="block text-sm">
            State
            <select name="state" required defaultValue="TS">
              {INDIAN_STATES.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Category
            <select name="category" defaultValue="RESIDENTIAL">
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="INDUSTRIAL">Industrial</option>
            </select>
          </label>
          <label className="block text-sm">
            Preferred callback time
            <input name="preferredCallback" />
          </label>
        </>
      )}
      <label className="block text-sm">
        Additional message
        <textarea name="message" rows={3} defaultValue={defaultMessage} />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="agree" required className="mt-1 h-4 w-4" />
        <span>
          I agree to Mr.GLOW RENEWABLES PVT LTD{" "}
          <Link className="underline" href="/terms">Terms of Use</Link> and{" "}
          <Link className="underline" href="/privacy">Privacy Policy</Link>.
        </span>
      </label>
      {error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}
      <button className="btn-primary w-full" disabled={status === "loading"}>
        {status === "loading"
          ? "Submitting…"
          : intent === "maintenance"
            ? "Schedule Cleaning / Request Maintenance"
            : "Book Free Consultation"}
      </button>
    </form>
  );
}
