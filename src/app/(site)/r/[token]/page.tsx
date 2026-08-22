import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { CalculatorInput, CalculatorParameters, CalculatorResult } from "@/lib/calculator/engine";
import Link from "next/link";
import { formatInr } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function ReportSharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const report = await prisma.calculatorReport.findUnique({ where: { shareToken: token } });
  if (!report) notFound();
  const result = report.results as CalculatorResult;
  const settings = await getSettings();
  return (
    <section className="section">
      <div className="container-wide max-w-2xl">
        <p className="text-xs uppercase text-lime">{settings.brandName}</p>
        <h1 className="font-display text-4xl">Solar savings report</h1>
        <p className="mt-2 text-muted">{report.reportNumber}</p>
        <div className="card mt-8 p-8">
          <p className="text-sm">Recommended size</p>
          <p className="font-display text-4xl">{result.recommendedKwp} kWp</p>
          <p className="mt-4">Annual savings (est.) {formatInr(result.annualSavings)}</p>
          <p>Net investment (est.) {formatInr(result.netInvestment)}</p>
        </div>
        <div className="mt-6 flex gap-3">
          <a className="btn-primary" href={`/api/calculator/report/${token}/pdf`}>Download PDF</a>
          <Link className="btn-outline" href="/book-consultation">Book consultation</Link>
        </div>
      </div>
    </section>
  );
}
