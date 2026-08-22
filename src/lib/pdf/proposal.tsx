import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#002d56" },
  brand: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  lime: { color: "#8cc63f" },
  h: { fontSize: 12, marginTop: 14, marginBottom: 6, fontFamily: "Helvetica-Bold" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  card: { border: "1 solid #d9e2ec", padding: 8, marginBottom: 6 },
  muted: { color: "#5c6b7a", fontSize: 8, marginTop: 10, lineHeight: 1.4 },
  th: { flex: 1, fontFamily: "Helvetica-Bold", fontSize: 8 },
  td: { flex: 1, fontSize: 8 },
  img: { width: 240, height: 160, marginBottom: 8, marginRight: 8 },
  imgRow: { flexDirection: "row", flexWrap: "wrap" },
});

export type ProposalPdfProps = {
  brand: string;
  quotationNumber: string;
  date: string;
  phone: string;
  email: string;
  website: string;
  lead: {
    leadNumber: string;
    name: string;
    phone: string;
    email?: string | null;
    state?: string | null;
    pincode?: string | null;
    category: string;
    message?: string | null;
  };
  survey?: {
    surveyNumber: string;
    address?: string | null;
    propertyType?: string | null;
    roofType?: string | null;
    roofArea?: string | null;
    availableArea?: string | null;
    orientation?: string | null;
    shading?: string | null;
    phase?: string | null;
    currentLoad?: string | null;
    sanctionedLoad?: string | null;
    recommendedCapacityKwp?: string | null;
    structureType?: string | null;
    notes?: string | null;
  } | null;
  items: { description: string; quantity: string; unit: string; unitPrice: string; amount: string }[];
  totals: { gross: string; subsidy: string; discount: string; net: string; capacity: string };
  images: { src: string; caption?: string | null }[];
  warranty?: string | null;
  terms?: string | null;
};

export function ProposalPdf(props: ProposalPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>
          {props.brand} <Text style={styles.lime}>Solar Proposal</Text>
        </Text>
        <View style={styles.row}>
          <Text>{props.quotationNumber}</Text>
          <Text>{props.date}</Text>
        </View>

        <Text style={styles.h}>Customer lead profile</Text>
        <View style={styles.card}>
          <Text>{props.lead.name} · {props.lead.leadNumber}</Text>
          <Text>{props.lead.phone}{props.lead.email ? ` · ${props.lead.email}` : ""}</Text>
          <Text>
            {props.lead.category}
            {props.lead.state ? ` · ${props.lead.state}` : ""}
            {props.lead.pincode ? ` · ${props.lead.pincode}` : ""}
          </Text>
          {props.lead.message ? <Text>Notes: {props.lead.message}</Text> : null}
        </View>

        {props.survey ? (
          <>
            <Text style={styles.h}>Site survey</Text>
            <View style={styles.card}>
              <Text>{props.survey.surveyNumber}</Text>
              {props.survey.address ? <Text>Address: {props.survey.address}</Text> : null}
              <Text>
                Roof: {props.survey.roofType || "—"} · Area: {props.survey.roofArea || "—"} · Usable: {props.survey.availableArea || "—"}
              </Text>
              <Text>
                Orientation: {props.survey.orientation || "—"} · Shading: {props.survey.shading || "—"} · Phase: {props.survey.phase || "—"}
              </Text>
              <Text>
                Load: {props.survey.currentLoad || "—"} · Sanctioned: {props.survey.sanctionedLoad || "—"} · Structure: {props.survey.structureType || "—"}
              </Text>
              <Text>Recommended capacity: {props.survey.recommendedCapacityKwp || "—"} kWp</Text>
              {props.survey.notes ? <Text>Survey notes: {props.survey.notes}</Text> : null}
            </View>
          </>
        ) : null}

        <Text style={styles.h}>Products & pricing</Text>
        <View style={[styles.row, { marginBottom: 4 }]}>
          <Text style={styles.th}>Item</Text>
          <Text style={styles.th}>Qty</Text>
          <Text style={styles.th}>Rate</Text>
          <Text style={styles.th}>Amount</Text>
        </View>
        {props.items.map((it, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.td}>{it.description}</Text>
            <Text style={styles.td}>{it.quantity} {it.unit}</Text>
            <Text style={styles.td}>₹{it.unitPrice}</Text>
            <Text style={styles.td}>₹{it.amount}</Text>
          </View>
        ))}
        <View style={[styles.card, { marginTop: 8 }]}>
          <Text>System capacity: {props.totals.capacity} kWp</Text>
          <Text>Gross: ₹{props.totals.gross}</Text>
          <Text>Estimated subsidy: ₹{props.totals.subsidy}</Text>
          <Text>Discount: ₹{props.totals.discount}</Text>
          <Text>Net investment: ₹{props.totals.net}</Text>
        </View>
        {props.warranty ? <Text>Warranty: {props.warranty}</Text> : null}
        {props.terms ? <Text>Terms: {props.terms}</Text> : null}
        <Text style={styles.muted}>
          Figures are based on the customer lead profile, site survey and selected products recorded in CRM. Final supply and installation depend on site conditions, DISCOM approvals and applicable policy.
        </Text>
        <Text style={styles.h}>Contact</Text>
        <Text>{props.phone} · {props.email} · {props.website}</Text>
      </Page>
      {props.images.length > 0 ? (
        <Page size="A4" style={styles.page}>
          <Text style={styles.h}>Solar design</Text>
          <Text style={styles.muted}>Layouts selected for this proposal from the customer lead design gallery.</Text>
          <View style={styles.imgRow}>
            {props.images.map((img, i) => (
              <View key={i} wrap={false}>
                {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image */}
                <Image src={img.src} style={styles.img} />
                {img.caption ? <Text style={{ fontSize: 8, marginBottom: 10 }}>{img.caption}</Text> : null}
              </View>
            ))}
          </View>
        </Page>
      ) : null}
    </Document>
  );
}
