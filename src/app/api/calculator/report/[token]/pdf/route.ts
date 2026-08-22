import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { SolarReportPdf } from "@/lib/pdf/solar-report";
import { CalculatorInput, CalculatorParameters, CalculatorResult } from "@/lib/calculator/engine";
import React from "react";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const report = await prisma.calculatorReport.findUnique({ where: { shareToken: token } });
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
  const settings = await getSettings();
  const pdf = await renderToBuffer(
    React.createElement(SolarReportPdf, {
      brand: settings.brandName,
      reportId: report.reportNumber,
      date: report.createdAt.toLocaleDateString("en-IN"),
      phone: settings.phone,
      email: settings.email,
      website: settings.website,
      input: report.inputData as CalculatorInput,
      result: report.results as CalculatorResult,
      params: report.calculationParameters as CalculatorParameters,
    }) as never,
  );
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${report.reportNumber}.pdf"`,
    },
  });
}
