"use client";

import { useMemo, useState } from "react";
import {
  calculateSolarSavings,
  CALCULATOR_DISCLAIMER,
  DEFAULT_CALCULATOR_PARAMS,
  SUBSIDY_DISCLAIMER,
  type CalculatorInput,
  type CalculatorResult,
} from "@/lib/calculator/engine";
import { formatInr, formatNumber } from "@/lib/utils";
import { ConsultationForm } from "@/components/site/consultation-form";
import { INDIAN_STATES } from "@/lib/india-states";

const STEPS = ["Electricity Usage", "Property", "Electricity Cost", "Your Savings"];

export function CalculatorWizard() {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"BILL" | "UNITS">("BILL");
  const [monthlyBill, setMonthlyBill] = useState(5000);
  const [monthlyUnits, setMonthlyUnits] = useState(500);
  const [stateCode, setStateCode] = useState("TS");
  const [category, setCategory] = useState<"RESIDENTIAL" | "COMMERCIAL" | "INDUSTRIAL">("RESIDENTIAL");
  const [subsidyType, setSubsidyType] = useState<"DCR" | "NON_DCR">("DCR");
  const [unitCost, setUnitCost] = useState(8);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [showAssumptions, setShowAssumptions] = useState(false);

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

  function calculate() {
    const params = {
      ...DEFAULT_CALCULATOR_PARAMS,
      subsidy: {
        ...DEFAULT_CALCULATOR_PARAMS.subsidy,
        eligible: category === "RESIDENTIAL" && subsidyType === "DCR",
        type: category === "RESIDENTIAL" ? subsidyType : "NONE",
      },
    };
    setResult(calculateSolarSavings(input, params));
    setStep(3);
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
                className={`rounded-2xl border p-4 text-left ${mode === m ? "border-navy bg-sand" : "border-navy/10"}`}
                onClick={() => setMode(m)}
              >
                {m === "BILL" ? "Monthly electricity bill" : "Monthly units (kWh)"}
              </button>
            ))}
          </div>
          {mode === "BILL" ? (
            <label className="mt-6 block text-sm">
              Monthly bill (₹)
              <input type="number" min={500} value={monthlyBill} onChange={(e) => setMonthlyBill(Number(e.target.value))} />
            </label>
          ) : (
            <label className="mt-6 block text-sm">
              Monthly units
              <input type="number" min={50} value={monthlyUnits} onChange={(e) => setMonthlyUnits(Number(e.target.value))} />
            </label>
          )}
          <button className="btn-primary mt-6" onClick={() => setStep(1)}>
            Next
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="font-display text-2xl">Property details</h2>
          <label className="mt-4 block text-sm">
            State
            <select value={stateCode} onChange={(e) => setStateCode(e.target.value)}>
              {INDIAN_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block text-sm">
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
              <option value="RESIDENTIAL">Home</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="INDUSTRIAL">Industrial</option>
            </select>
          </label>
          {category === "RESIDENTIAL" ? (
            <label className="mt-4 block text-sm">
              Module type (subsidy estimate)
              <select value={subsidyType} onChange={(e) => setSubsidyType(e.target.value as typeof subsidyType)}>
                <option value="DCR">DCR (estimated subsidy)</option>
                <option value="NON_DCR">Non-DCR</option>
              </select>
            </label>
          ) : null}
          <div className="mt-6 flex gap-3">
            <button className="btn-outline" onClick={() => setStep(0)}>
              Back
            </button>
            <button className="btn-primary" onClick={() => setStep(2)}>
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="font-display text-2xl">Electricity cost</h2>
          <label className="mt-4 block text-sm">
            ₹ / kWh
            <input type="number" min={2} max={20} step={0.01} value={unitCost} onChange={(e) => setUnitCost(Number(e.target.value))} />
          </label>
          <div className="mt-6 flex gap-3">
            <button className="btn-outline" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn-primary" onClick={calculate}>
              Calculate My Solar Savings
            </button>
          </div>
        </div>
      )}

      {step === 3 && result && (
        <div className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-lime">Indicative estimate</p>
            <h2 className="font-display text-3xl">Your Solar Savings Potential</h2>
          </div>
          <div className="rounded-3xl bg-navy p-8 text-white">
            <p className="text-sm text-white/70">Recommended plant size</p>
            <p className="font-display text-5xl">{result.recommendedKwp} kWp</p>
            <div className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
              <div>
                Panels (est.)
                <br />
                <strong>{result.panelCount}</strong>
              </div>
              <div>
                Roof area (est.)
                <br />
                <strong>{result.roofAreaSqm} sq.m</strong>
              </div>
              <div>
                System type
                <br />
                <strong>{result.systemType}</strong>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Monthly savings", formatInr(result.monthlySavings)],
              ["Annual savings", formatInr(result.annualSavings)],
              ["Lifetime savings", formatInr(result.lifetimeSavings, true)],
            ].map(([l, v]) => (
              <div key={l} className="card p-5">
                <p className="text-xs">{l}</p>
                <p className="font-display text-2xl">{v}</p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border p-6">
            <h3 className="font-display text-xl">System cost & estimated subsidy</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>System cost</span>
                <span>{formatInr(result.systemCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated subsidy</span>
                <span>− {formatInr(result.estimatedSubsidy)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Your net investment</span>
                <span>{formatInr(result.netInvestment)}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">{SUBSIDY_DISCLAIMER}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-sand p-6">
              <p className="text-sm">Simple payback</p>
              <p className="font-display text-3xl">{result.paybackYears ?? "—"} years</p>
            </div>
            <div className="rounded-3xl bg-sand p-6">
              <p className="text-sm">Generation (year 1)</p>
              <p className="font-display text-3xl">{formatNumber(result.annualGenerationKwh)} kWh</p>
            </div>
          </div>
          <button className="text-sm underline" onClick={() => setShowAssumptions((v) => !v)}>
            How did we calculate this?
          </button>
          {showAssumptions ? (
            <dl className="grid gap-2 rounded-2xl bg-mist p-4 text-sm">
              {Object.entries(result.assumptions).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-muted">{k}</dt>
                  <dd>{String(v)}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <p className="text-xs text-muted">{CALCULATOR_DISCLAIMER}</p>
          <div className="rounded-3xl bg-navy p-6 text-white">
            <h3 className="font-display text-2xl">Want a precise proposal for your property?</h3>
            <div className="mt-6 rounded-2xl bg-white p-4 text-navy">
              <ConsultationForm
                source="calculator"
                estimatedSystemKwp={result.recommendedKwp}
                estimatedAnnualSavingsInr={result.annualSavings}
                monthlyBillInr={mode === "BILL" ? monthlyBill : undefined}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
