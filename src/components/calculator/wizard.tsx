"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { INDIAN_STATES } from "@/lib/india-states";
import { CalculatorInput, CalculatorResult, CALCULATOR_DISCLAIMER, SUBSIDY_DISCLAIMER } from "@/lib/calculator/engine";
import { formatInr, formatNumber, whatsappLink } from "@/lib/utils";
import { ConsultationForm } from "@/components/site/consultation-form";

const STEPS = ["Electricity Usage", "Property", "Electricity Cost", "Your Savings"];

export function CalculatorWizard() {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"BILL" | "UNITS">("BILL");
  const [monthlyBill, setMonthlyBill] = useState(5000);
  const [monthlyUnits, setMonthlyUnits] = useState(500);
  const [stateCode, setStateCode] = useState("TS");
  const [category, setCategory] = useState<"RESIDENTIAL" | "COMMERCIAL" | "INDUSTRIAL">("RESIDENTIAL");
  const [subsidyType, setSubsidyType] = useState<"DCR" | "NON_DCR">("DCR");
  const [unitCost, setUnitCost] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [reportId, setReportId] = useState("");
  const [shareToken, setShareToken] = useState("");
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [whatsapp, setWhatsapp] = useState("9912343142");

  const input: CalculatorInput = useMemo(
    () => ({
      mode,
      monthlyBill: mode === "BILL" ? monthlyBill : undefined,
      monthlyUnits: mode === "UNITS" ? monthlyUnits : undefined,
      stateCode,
      category,
      subsidyType: category === "RESIDENTIAL" ? subsidyType : "NONE",
      unitCost,
    }),
    [mode, monthlyBill, monthlyUnits, stateCode, category, subsidyType, unitCost],
  );

  async function calculate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Calculation failed");
      setResult(data.result);
      setReportId(data.reportNumber);
      setShareToken(data.shareToken);
      if (data.whatsapp) setWhatsapp(data.whatsapp);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Calculation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card mt-8 p-6 sm:p-10">
      <ol className="relative mb-10 grid grid-cols-4 gap-2" aria-label="Calculator path">
        <span className="pointer-events-none absolute left-[12%] right-[12%] top-4 hidden h-0.5 bg-mist sm:block" aria-hidden />
        {STEPS.map((s, i) => (
          <li key={s} className="relative z-10 flex flex-col items-center text-center">
            <span
              className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                i < step ? "bg-lime text-navy" : i === step ? "bg-navy text-lime" : "bg-mist text-muted"
              }`}
            >
              {i + 1}
            </span>
            <span className={`mt-2 text-[11px] leading-tight sm:text-xs ${i === step ? "font-semibold text-navy" : "text-muted"}`}>
              {s}
            </span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div>
          <h2 className="font-display text-2xl">How would you like to calculate your solar requirement?</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {(["BILL", "UNITS"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-2xl border p-5 text-left ${mode === m ? "border-lime bg-mist" : "border-navy/10"}`}
              >
                {m === "BILL" ? "Monthly Electricity Bill" : "Monthly Electricity Units"}
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">
            Don’t know your monthly units? You can use your approximate monthly electricity bill.
          </p>
          {mode === "BILL" ? (
            <label className="mt-6 block text-sm">
              ₹ / month
              <input
                type="number"
                min={500}
                max={500000}
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(Number(e.target.value))}
                required
              />
            </label>
          ) : (
            <label className="mt-6 block text-sm">
              kWh / month
              <input
                type="number"
                min={50}
                max={500000}
                value={monthlyUnits}
                onChange={(e) => setMonthlyUnits(Number(e.target.value))}
                required
              />
            </label>
          )}
          <button className="btn-primary mt-6" onClick={() => setStep(1)}>Continue</button>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="font-display text-2xl">Tell us about your property</h2>
          <label className="mt-6 block text-sm">
            State
            <select value={stateCode} onChange={(e) => setStateCode(e.target.value)}>
              {INDIAN_STATES.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="mt-4 block text-sm">
            Customer category
            <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="INDUSTRIAL">Industrial</option>
            </select>
          </label>
          {category === "RESIDENTIAL" && (
            <div className="mt-4">
              <p className="text-sm font-medium">Subsidy</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <button type="button" className={`rounded-2xl border p-4 ${subsidyType === "DCR" ? "border-lime bg-mist" : "border-navy/10"}`} onClick={() => setSubsidyType("DCR")}>
                  With Subsidy — DCR
                </button>
                <button type="button" className={`rounded-2xl border p-4 ${subsidyType === "NON_DCR" ? "border-lime bg-mist" : "border-navy/10"}`} onClick={() => setSubsidyType("NON_DCR")}>
                  No Subsidy — Non-DCR
                </button>
              </div>
              <details className="mt-3 text-sm text-muted">
                <summary className="cursor-pointer">What is DCR / Non-DCR?</summary>
                <p className="mt-2">DCR typically means the system follows domestic-content rules used by applicable residential subsidy programmes. Non-DCR systems generally do not include estimated subsidy. Eligibility is never guaranteed.</p>
              </details>
            </div>
          )}
          {category !== "RESIDENTIAL" && (
            <p className="mt-4 rounded-2xl bg-mist p-4 text-sm">Subsidy options are shown only where they may apply. Commercial and industrial estimates do not include a residential subsidy amount.</p>
          )}
          <div className="mt-6 flex gap-3">
            <button className="btn-outline" onClick={() => setStep(0)}>Back</button>
            <button className="btn-primary" onClick={() => setStep(2)}>Continue</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="font-display text-2xl">What do you pay for electricity?</h2>
          <p className="mt-6 font-display text-4xl">₹{unitCost.toFixed(2)} / kWh</p>
          <input
            type="range"
            min={2}
            max={15}
            step={0.1}
            value={unitCost}
            onChange={(e) => setUnitCost(Number(e.target.value))}
            aria-label="Electricity unit cost"
          />
          <label className="mt-4 block text-sm">
            Or enter ₹ / kWh
            <input type="number" min={2} max={20} step={0.01} value={unitCost} onChange={(e) => setUnitCost(Number(e.target.value))} />
          </label>
          {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
          <div className="mt-6 flex gap-3">
            <button className="btn-outline" onClick={() => setStep(1)}>Back</button>
            <button className="btn-primary" disabled={loading} onClick={calculate}>
              {loading ? "Calculating…" : "Calculate My Solar Savings"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && result && (
        <div className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-lime">Your personalized solar investment report</p>
            <h2 className="font-display text-3xl">Your Solar Savings Potential</h2>
            <p className="text-sm text-muted">Report {reportId}</p>
          </div>
          <div className="rounded-3xl bg-navy p-8 text-white">
            <p className="text-sm text-white/70">Recommended plant size</p>
            <p className="font-display text-5xl">{result.recommendedKwp} kWp</p>
            <p className="mt-2 text-sm text-white/70">Based on your electricity consumption.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3 text-sm">
              <div>Panels (est.)<br /><strong>{result.panelCount}</strong></div>
              <div>Roof area (est.)<br /><strong>{result.roofAreaSqm} sq.m</strong></div>
              <div>System type<br /><strong>{result.systemType}</strong></div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-mist p-6">
              <p className="text-sm text-muted">Daily generation</p>
              <p className="font-display text-3xl">{result.dailyGenerationKwh} kWh/day</p>
            </div>
            <div className="rounded-3xl bg-mist p-6">
              <p className="text-sm text-muted">Peak sun hours</p>
              <p className="font-display text-3xl">{result.peakSunHours} hrs/day</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Monthly", `${formatNumber(result.monthlyGenerationKwh)} kWh`],
              ["Annual", `${formatNumber(result.annualGenerationKwh)} kWh`],
              ["30-year", `${formatNumber(result.lifetimeGenerationKwh)} kWh`],
            ].map(([l, v]) => (
              <div key={l} className="rounded-3xl border p-5">
                <p className="text-xs text-muted">{l} generation</p>
                <p className="font-display text-2xl">{v}</p>
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-display text-xl">Electricity bill savings</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="card p-5"><p className="text-xs">Monthly</p><p className="font-display text-2xl">{formatInr(result.monthlySavings)}</p></div>
              <div className="card p-5"><p className="text-xs">Annual</p><p className="font-display text-2xl">{formatInr(result.annualSavings)}</p></div>
              <div className="card p-5"><p className="text-xs">Lifetime</p><p className="font-display text-2xl">{formatInr(result.lifetimeSavings, true)}</p></div>
            </div>
          </div>
          <div className="rounded-3xl border p-6">
            <h3 className="font-display text-xl">System cost & estimated subsidy</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>System cost</span><span>{formatInr(result.systemCost)}</span></div>
              <div className="flex justify-between"><span>Estimated subsidy</span><span>− {formatInr(result.estimatedSubsidy)}</span></div>
              <div className="flex justify-between font-semibold"><span>Your net investment</span><span>{formatInr(result.netInvestment)}</span></div>
            </div>
            <p className="mt-3 text-xs text-muted">{SUBSIDY_DISCLAIMER}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-sand p-6">
              <p className="text-sm">Simple payback</p>
              <p className="font-display text-3xl">{result.paybackYears ?? "—"} years</p>
            </div>
            <div className="rounded-3xl bg-sand p-6">
              <p className="text-sm">Annual ROI</p>
              <p className="font-display text-3xl">{result.annualRoiPct ?? "—"}%</p>
            </div>
          </div>
          <div className="h-64">
            <p className="mb-2 text-sm font-medium">Cumulative savings vs net investment</p>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={result.yearly.filter((y) => [1, 5, 10, 15, 20, 25, 30].includes(y.year))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Area dataKey="cumulativeSavings" stroke="#0b1f3a" fill="#7cb342" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-6">
              <p className="text-sm">CO₂ emissions mitigated</p>
              <p className="font-display text-3xl">{result.co2TonsLifetime} t</p>
              <p className="text-xs text-muted">over the configured lifetime</p>
            </div>
            <div className="card p-6">
              <p className="text-sm">Trees equivalent</p>
              <p className="font-display text-3xl">{result.treesEquivalent}</p>
            </div>
          </div>
          <button className="text-sm underline" onClick={() => setShowAssumptions((v) => !v)}>
            How did we calculate this?
          </button>
          {showAssumptions && (
            <dl className="grid gap-2 rounded-2xl bg-mist p-4 text-sm">
              {Object.entries(result.assumptions).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-muted">{k}</dt>
                  <dd>{String(v)}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="text-xs text-muted">{CALCULATOR_DISCLAIMER}</p>
          <div className="flex flex-wrap gap-3">
            <a className="btn-outline" href={`/api/calculator/report/${shareToken}/pdf`}>Download PDF</a>
            <a
              className="btn-outline"
              href={whatsappLink(whatsapp, `My Mr.GLOW solar report ${reportId}: ${typeof window !== "undefined" ? window.location.origin : ""}/r/${shareToken}`)}
            >
              Share on WhatsApp
            </a>
            <button
              className="btn-outline"
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/r/${shareToken}`)}
            >
              Copy report link
            </button>
          </div>
          <div className="rounded-3xl bg-navy p-6 text-white">
            <h3 className="font-display text-2xl">Want a precise proposal for your property?</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/book-consultation" className="btn-primary">Book Free Consultation</Link>
            </div>
            <div className="mt-6 rounded-2xl bg-white p-4 text-navy">
              <ConsultationForm reportId={shareToken} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
