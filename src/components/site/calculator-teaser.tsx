"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export function CalculatorTeaser() {
  const [bill, setBill] = useState(5000);
  const demo = useMemo(() => {
    const kwp = bill / 1200;
    const annual = bill * 0.4 * 12;
    return {
      kwp: Math.max(1, kwp).toFixed(2),
      annual: Math.round(annual),
      life: Math.round(annual * 25),
    };
  }, [bill]);

  return (
    <section className="relative z-10 -mt-10 px-4">
      <div className="container-wide card p-6 sm:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-lime">What could solar save you?</p>
        <h2 className="mt-2 font-display text-3xl">A first look — labelled example</h2>
        <p className="mt-2 text-sm text-muted">
          These figures are illustrative demo values until you run the full calculator with your details.
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
            <p className="text-xs text-muted">Estimated solar system (example)</p>
            <p className="font-display text-2xl">{demo.kwp} kWp</p>
          </div>
          <div className="rounded-2xl bg-mist p-4">
            <p className="text-xs text-muted">Estimated annual savings (example)</p>
            <p className="font-display text-2xl">₹{demo.annual.toLocaleString("en-IN")}</p>
          </div>
          <div className="rounded-2xl bg-mist p-4">
            <p className="text-xs text-muted">Estimated lifetime savings (example)</p>
            <p className="font-display text-2xl">₹{(demo.life / 100000).toFixed(2)} L</p>
          </div>
        </div>
        <Link href="/solar-calculator" className="btn-primary mt-8">
          Calculate My Savings
        </Link>
      </div>
    </section>
  );
}
