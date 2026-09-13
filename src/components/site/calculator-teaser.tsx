"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { calculateSolarSavings, DEFAULT_CALCULATOR_PARAMS } from "@/lib/calculator/engine";
import { formatInr } from "@/lib/utils";

export function CalculatorTeaser() {
  const [bill, setBill] = useState(5000);
  const result = useMemo(
    () =>
      calculateSolarSavings(
        {
          mode: "BILL",
          monthlyBill: bill,
          stateCode: "TS",
          category: "RESIDENTIAL",
          subsidyType: "DCR",
          unitCost: 8,
        },
        DEFAULT_CALCULATOR_PARAMS,
      ),
    [bill],
  );

  return (
    <section className="relative z-10 -mt-10 px-4">
      <div className="container-wide card p-6 sm:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-lime">What could solar save you?</p>
        <h2 className="mt-2 font-display text-3xl">A first look — labelled estimate</h2>
        <p className="mt-2 text-sm text-muted">
          Figures use the same calculator engine as the full savings page. They are estimates, not a quotation.
        </p>
        <label className="mt-6 block text-sm font-medium" htmlFor="teaser-bill">
          Monthly electricity bill
        </label>
        <input
          id="teaser-bill"
          type="range"
          min={1500}
          max={25000}
          step={100}
          value={bill}
          onChange={(e) => setBill(Number(e.target.value))}
        />
        <p className="font-display text-2xl">₹{bill.toLocaleString("en-IN")}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-mist p-4">
            <p className="text-xs text-muted">Estimated solar system</p>
            <p className="font-display text-2xl">{result.recommendedKwp} kWp</p>
          </div>
          <div className="rounded-2xl bg-mist p-4">
            <p className="text-xs text-muted">Estimated annual savings</p>
            <p className="font-display text-2xl">{formatInr(result.annualSavings)}</p>
          </div>
          <div className="rounded-2xl bg-mist p-4">
            <p className="text-xs text-muted">Estimated lifetime savings</p>
            <p className="font-display text-2xl">{formatInr(result.lifetimeSavings, true)}</p>
          </div>
        </div>
        <Link href="/solar-calculator" className="btn-primary mt-8">
          Calculate My Savings
        </Link>
      </div>
    </section>
  );
}
