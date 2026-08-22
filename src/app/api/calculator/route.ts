import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { calculateSolarSavings, CalculatorInput } from "@/lib/calculator/engine";
import { resolveCalculatorParameters } from "@/lib/calculator/resolve";
import { scoreFromCalculator } from "@/lib/leads/score";
import { getSettings } from "@/lib/settings";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  mode: z.enum(["BILL", "UNITS"]),
  monthlyBill: z.number().min(500).max(500000).optional(),
  monthlyUnits: z.number().min(50).max(500000).optional(),
  stateCode: z.string().min(2).max(5),
  category: z.enum(["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL"]),
  subsidyType: z.enum(["DCR", "NON_DCR", "NONE"]),
  unitCost: z.number().min(2).max(20),
});

function reportNumber() {
  const n = Math.floor(Math.random() * 99999);
  return `RPT-${new Date().getFullYear()}-${String(n).padStart(5, "0")}`;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const ok = await rateLimit(`calc:${ip}`, 40, 10 * 60 * 1000).catch(() => true);
  if (!ok) return NextResponse.json({ error: "Too many calculations. Please wait." }, { status: 429 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your inputs." }, { status: 400 });
  }
  const input = parsed.data as CalculatorInput;
  if (input.mode === "BILL" && !input.monthlyBill) {
    return NextResponse.json({ error: "Enter monthly bill." }, { status: 400 });
  }
  if (input.mode === "UNITS" && !input.monthlyUnits) {
    return NextResponse.json({ error: "Enter monthly units." }, { status: 400 });
  }

  try {
    const params = await resolveCalculatorParameters(input);
    const result = calculateSolarSavings(input, params);
    const shareToken = crypto.randomUUID();
    const report = await prisma.calculatorReport.create({
      data: {
        reportNumber: reportNumber(),
        shareToken,
        inputData: input,
        calculationParameters: params,
        calculationVersion: params.version,
        results: result,
      },
    });
    const settings = await getSettings();
    return NextResponse.json({
      result,
      reportNumber: report.reportNumber,
      shareToken: report.shareToken,
      scoreHint: scoreFromCalculator(input, result),
      whatsapp: settings.whatsapp,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Calculator is temporarily unavailable." }, { status: 503 });
  }
}
