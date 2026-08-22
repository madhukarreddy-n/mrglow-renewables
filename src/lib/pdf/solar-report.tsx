import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { CalculatorInput, CalculatorResult, CalculatorParameters, CALCULATOR_DISCLAIMER, SUBSIDY_DISCLAIMER, FINANCIAL_DISCLAIMER } from "@/lib/calculator/engine";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#0b1f3a" },
  brand: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#0b1f3a" },
  glow: { color: "#7cb342" },
  h: { fontSize: 14, marginTop: 16, marginBottom: 8, fontFamily: "Helvetica-Bold" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  card: { border: "1 solid #d9e2ec", padding: 10, marginBottom: 8, borderRadius: 4 },
  muted: { color: "#5b6b7c", fontSize: 8, marginTop: 12, lineHeight: 1.4 },
  label: { color: "#5b6b7c" },
});

export function SolarReportPdf(props: {
  brand: string;
  reportId: string;
  date: string;
  phone: string;
  email: string;
  website: string;
  input: CalculatorInput;
  result: CalculatorResult;
  params: CalculatorParameters;
}) {
  const { result, input, params } = props;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>
          {props.brand} <Text style={styles.glow}>Solar Savings Report</Text>
        </Text>
        <View style={styles.row}>
          <Text>Report ID: {props.reportId}</Text>
          <Text>{props.date}</Text>
        </View>
        <Text style={styles.h}>Recommended plant</Text>
        <View style={styles.card}>
          <Text>Recommended size: {result.recommendedKwp} kWp</Text>
          <Text>Panels (est.): {result.panelCount} × {params.panelWattage} W</Text>
          <Text>Roof area (est.): {result.roofAreaSqm} sq.m</Text>
          <Text>Daily generation (est.): {result.dailyGenerationKwh} kWh</Text>
        </View>
        <Text style={styles.h}>Inputs</Text>
        <View style={styles.card}>
          <Text>State: {input.stateCode} · Category: {input.category} · Subsidy: {input.subsidyType}</Text>
          <Text>Mode: {input.mode} · Unit cost: ₹{input.unitCost}/kWh</Text>
          {input.monthlyBill != null ? <Text>Monthly bill: ₹{input.monthlyBill}</Text> : null}
          {input.monthlyUnits != null ? <Text>Monthly units: {input.monthlyUnits} kWh</Text> : null}
        </View>
        <Text style={styles.h}>Generation & savings (estimated)</Text>
        <View style={styles.card}>
          <Text>Monthly generation: {result.monthlyGenerationKwh} kWh</Text>
          <Text>Annual generation: {result.annualGenerationKwh} kWh</Text>
          <Text>Lifetime generation: {result.lifetimeGenerationKwh} kWh</Text>
          <Text>Monthly savings: ₹{result.monthlySavings}</Text>
          <Text>Annual savings: ₹{result.annualSavings}</Text>
          <Text>Lifetime savings: ₹{result.lifetimeSavings}</Text>
        </View>
        <Text style={styles.h}>Investment (estimated)</Text>
        <View style={styles.card}>
          <Text>System cost: ₹{result.systemCost}</Text>
          <Text>Estimated subsidy: − ₹{result.estimatedSubsidy}</Text>
          <Text>Net investment: ₹{result.netInvestment}</Text>
          <Text>Simple payback: {result.paybackYears ?? "—"} years</Text>
          <Text>Annual ROI: {result.annualRoiPct ?? "—"}%</Text>
        </View>
        <Text style={styles.h}>Environmental impact (estimated)</Text>
        <View style={styles.card}>
          <Text>CO₂ mitigated: {result.co2TonsLifetime} t over {params.projectLifetime} years</Text>
          <Text>Trees equivalent: {result.treesEquivalent}</Text>
        </View>
        <Text style={styles.muted}>{SUBSIDY_DISCLAIMER}</Text>
        <Text style={styles.muted}>{CALCULATOR_DISCLAIMER}</Text>
        <Text style={styles.muted}>{FINANCIAL_DISCLAIMER}</Text>
        <Text style={styles.h}>Book a free consultation</Text>
        <Text>{props.phone} · {props.email} · {props.website}</Text>
      </Page>
    </Document>
  );
}
