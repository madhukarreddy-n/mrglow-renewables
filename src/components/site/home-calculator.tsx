"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { calculateSolarSavings, DEFAULT_CALCULATOR_PARAMS } from "@/lib/calculator/engine";
import { formatInr, formatNumber } from "@/lib/utils";

export function HomeCalculator() {
  const [kind, setKind] = useState<"home" | "commercial">("home");
  const [bill, setBill] = useState(5000);
  const [show, setShow] = useState(false);

  const result = useMemo(
    () =>
      calculateSolarSavings(
        {
          mode: "BILL",
          monthlyBill: bill,
          stateCode: "TS",
          category: kind === "home" ? "RESIDENTIAL" : "COMMERCIAL",
          subsidyType: kind === "home" ? "DCR" : "NONE",
          unitCost: 8,
        },
        {
          ...DEFAULT_CALCULATOR_PARAMS,
          subsidy: {
            ...DEFAULT_CALCULATOR_PARAMS.subsidy,
            eligible: kind === "home",
          },
        },
      ),
    [bill, kind],
  );

  return (
    <section id="savings" className="bg-[#eef8e8] py-16 sm:py-24">
      <div className="container-wide">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-navy">Solar calculator</p>
        <h2 className="mt-2 text-center font-display text-4xl text-navy sm:text-5xl">Calculate your savings</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
          An estimate from your bill — not a quotation. Subsidy and price are confirmed after a site survey.
        </p>

        <div className="mx-auto mt-10 max-w-3xl rounded-xl bg-white p-6 shadow-lg sm:p-10">
          <div className="flex justify-center gap-2">
            {(
              [
                ["home", "Home"],
                ["commercial", "Commercial"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                className={`rounded-md px-6 py-2 text-sm font-semibold ${
                  kind === value ? "bg-navy text-white" : "bg-mist text-navy"
                }`}
                onClick={() => setKind(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="mt-8 block text-sm font-medium" htmlFor="home-bill">
            Monthly electricity bill
          </label>
          <input
            id="home-bill"
            type="range"
            min={1500}
            max={25000}
            step={100}
            value={bill}
            onChange={(e) => setBill(Number(e.target.value))}
          />
          <p className="font-display text-3xl text-navy">₹{bill.toLocaleString("en-IN")}</p>
          <button className="btn-quote mt-6 w-full sm:w-auto" onClick={() => setShow(true)}>
            Calculate now
          </button>

          {show ? (
            <div className="mt-10">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-mist p-4">
                  <p className="text-xs text-muted">Ideal system size</p>
                  <p className="font-display text-2xl">{result.recommendedKwp} kWp</p>
                </div>
                <div className="rounded-xl bg-mist p-4">
                  <p className="text-xs text-muted">Estimated annual savings</p>
                  <p className="font-display text-2xl">{formatInr(result.annualSavings)}</p>
                </div>
                <div className="rounded-xl bg-mist p-4">
                  <p className="text-xs text-muted">Year-1 generation</p>
                  <p className="font-display text-2xl">{formatNumber(result.annualGenerationKwh)} units</p>
                </div>
                <div className="rounded-xl bg-mist p-4">
                  <p className="text-xs text-muted">Roof space (est.)</p>
                  <p className="font-display text-2xl">{result.roofAreaSqm} m²</p>
                </div>
              </div>
              <div className="mt-6 space-y-2 rounded-xl border border-navy/10 p-5 text-sm">
                <div className="flex justify-between">
                  <span>Estimated project cost</span>
                  <span className="font-semibold">{formatInr(result.systemCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated subsidy (if eligible)</span>
                  <span>− {formatInr(result.estimatedSubsidy)}</span>
                </div>
                <div className="flex justify-between font-semibold text-navy">
                  <span>Indicative net investment</span>
                  <span>{formatInr(result.netInvestment)}</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted">Taxes, net metering and site work are extra. Figures use the same engine as the full calculator.</p>
              <Link href="/book-consultation" className="btn-quote mt-6 inline-flex">
                Connect with us for a site quote
              </Link>
            </div>
          ) : null}
        </div>
        <p className="mt-6 text-center">
          <Link href="/solar-calculator" className="text-sm font-semibold text-navy underline">
            Open the full savings calculator →
          </Link>
        </p>
      </div>
    </section>
  );
}
