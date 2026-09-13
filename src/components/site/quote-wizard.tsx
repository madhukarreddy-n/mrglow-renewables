"use client";

import { useState } from "react";
import Link from "next/link";

const BILLS = [
  { label: "Less than ₹1,500", value: 1200 },
  { label: "₹1,500 – ₹2,500", value: 2000 },
  { label: "₹2,500 – ₹4,000", value: 3200 },
  { label: "₹4,000 – ₹8,000", value: 6000 },
  { label: "More than ₹8,000", value: 10000 },
];

export function QuoteWizard() {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [siteType, setSiteType] = useState("home");
  const [bill, setBill] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [email, setEmail] = useState("");

  const [agree, setAgree] = useState(false);

  async function submit() {
    if (!agree) {
      setError("Please agree to the Terms and Privacy Policy.");
      return;
    }
    setLoading(true);
    setError("");
    const digits = phone.replace(/\D/g, "").slice(-10);
    const res = await fetch("/api/public/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone: digits,
        email: email || undefined,
        city,
        site_type: siteType,
        monthly_bill_inr: BILLS.find((b) => b.label === bill)?.value,
        source: "consultation",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not submit. Please try again.");
      setLoading(false);
      return;
    }
    window.location.href = `/consultation-success?ref=${encodeURIComponent(data.id || "")}`;
  }

  return (
    <div className="rounded-xl bg-white p-5 text-navy shadow-2xl sm:p-6">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-gold">Free quote</p>
      <h2 className="mt-1 text-center font-display text-2xl leading-snug">
        Get a personalised estimate in 3 steps
      </h2>
      <ol className="mt-4 mb-5 flex justify-center gap-2" aria-label="Quote steps">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className={`h-1.5 w-10 rounded-full ${i <= step ? "bg-gold" : "bg-mist"}`}
          />
        ))}
      </ol>

      {step === 0 ? (
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Your name
            <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
          </label>
          <label className="block text-sm font-medium">
            10-digit mobile
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              pattern="[0-9]{10}"
              placeholder="WhatsApp number"
            />
          </label>
          <button
            className="btn-quote w-full"
            onClick={() => {
              if (name.trim().length < 2 || phone.replace(/\D/g, "").length !== 10) {
                setError("Enter your name and a 10-digit mobile number.");
                return;
              }
              setError("");
              setStep(1);
            }}
          >
            Get started
          </button>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">Solar needed for?</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["home", "Home"],
              ["commercial", "Business"],
              ["industrial", "Industry"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`rounded-md border px-2 py-2 text-sm ${
                  siteType === value ? "border-gold bg-sand font-semibold" : "border-navy/10"
                }`}
                onClick={() => setSiteType(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="block text-sm font-medium">
            Monthly average electricity bill
            <select value={bill} onChange={(e) => setBill(e.target.value)} required>
              <option value="" disabled>
                Select
              </option>
              {BILLS.map((b) => (
                <option key={b.label}>{b.label}</option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <button className="btn-outline flex-1" onClick={() => setStep(0)}>
              Back
            </button>
            <button
              className="btn-quote flex-1"
              onClick={() => {
                if (!bill) {
                  setError("Select your monthly bill range.");
                  return;
                }
                setError("");
                setStep(2);
              }}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            City
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Hyderabad" />
          </label>
          <label className="block text-sm font-medium">
            Email (optional)
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="flex items-start gap-2 text-xs text-muted">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <span>
              I agree to the{" "}
              <Link className="underline" href="/terms">
                Terms
              </Link>{" "}
              and{" "}
              <Link className="underline" href="/privacy">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          <div className="flex gap-2">
            <button className="btn-outline flex-1" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn-quote flex-1" disabled={loading} onClick={() => void submit()}>
              {loading ? "Sending…" : "Request quote"}
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
