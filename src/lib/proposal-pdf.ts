import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument, PDFFont, PDFImage, PDFPage, StandardFonts, rgb, type RGB } from "pdf-lib";
import { BRAND } from "@/lib/brand";
import { BROCHURE } from "@/content/brochure";
import { SIMPLE_PATH } from "@/content/journey";
import { formatNumber } from "@/lib/utils";
import { lineAmounts, proposalTotals, type ProposalLine } from "@/lib/bom";

export type ProposalPdfPhoto = { bytes: Uint8Array; caption?: string | null };

type PdfInput = {
  estimateNumber: string;
  systemSizeKwp: number | null;
  priceInr: number;
  notes?: string;
  lines: ProposalLine[];
  issuedAt?: Date;
  photos?: ProposalPdfPhoto[];
  lead: {
    name: string;
    phone: string;
    email?: string | null;
    city?: string | null;
    address?: string | null;
    site_type?: string | null;
  };
};

const PAGE = { w: 595.28, h: 841.89 };
const navy = rgb(0.07, 0.16, 0.28);
const gold = rgb(0.75, 0.55, 0.18);
const muted = rgb(0.35, 0.38, 0.42);
const wash = rgb(0.96, 0.95, 0.91);
const white = rgb(1, 1, 1);

function pdfMoney(amount: number) {
  const digits = Math.abs(amount) >= 100 ? 0 : 2;
  return `Rs. ${formatNumber(amount, digits)}`;
}

function winAnsi(text: string) {
  return String(text ?? "")
    .replaceAll("₹", "Rs. ")
    .replaceAll("—", "-")
    .replaceAll("–", "-")
    .replaceAll("•", "-")
    .replaceAll("\u00a0", " ")
    .replace(/[^\x09\x0a\x0d\x20-\x7e\xa0-\xff]/g, "?")
    .replace(/\s+/g, " ")
    .trim();
}

function wrap(text: string, max: number) {
  const words = winAnsi(text).split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const next = cur ? `${cur} ${word}` : word;
    if (next.length > max) {
      if (cur) lines.push(cur);
      cur = word;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

function siteLabel(site?: string | null) {
  if (site === "home") return "Residential";
  if (site === "commercial") return "Commercial";
  if (site === "industrial") return "Industrial";
  return "Rooftop";
}

function formatIssueDate(d: Date) {
  return d.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function addDays(d: Date, days: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function twoDigitWords(n: number, a: string[], b: string[]) {
  if (n < 20) return a[n];
  return `${b[Math.floor(n / 10)]}${n % 10 ? ` ${a[n % 10]}` : ""}`.trim();
}

function amountInWordsInr(amount: number) {
  const num = Math.round(Math.abs(amount));
  if (!num) return "Indian Rupee Zero Only";
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const three = (n: number) => {
    const h = Math.floor(n / 100);
    const r = n % 100;
    return `${h ? `${a[h]} Hundred` : ""}${h && r ? " " : ""}${r ? twoDigitWords(r, a, b) : ""}`.trim();
  };
  const crore = Math.floor(num / 1e7);
  const lakh = Math.floor((num % 1e7) / 1e5);
  const thousand = Math.floor((num % 1e5) / 1e3);
  const rest = num % 1000;
  const parts: string[] = [];
  if (crore) parts.push(`${three(crore)} Crore`);
  if (lakh) parts.push(`${twoDigitWords(lakh, a, b)} Lakh`);
  if (thousand) parts.push(`${twoDigitWords(thousand, a, b)} Thousand`);
  if (rest) parts.push(three(rest));
  return `Indian Rupee ${parts.join(" ")} Only`;
}

function quoteGroups(lines: ProposalLine[]) {
  const plant: ProposalLine[] = [];
  const bos: ProposalLine[] = [];
  for (const line of lines) {
    const c = line.category.toLowerCase();
    if (c.includes("module") || c.includes("inverter")) plant.push(line);
    else bos.push(line);
  }
  const sum = (rows: ProposalLine[]) => rows.reduce((acc, row) => acc + lineAmounts(row).total, 0);
  return { plant, bos, plantTotal: sum(plant), bosTotal: sum(bos) };
}

async function embedLogo(doc: PDFDocument) {
  const bases = [path.join(process.cwd(), "public", "brand")];
  for (const dir of bases) {
    try {
      return await doc.embedPng(await readFile(path.join(dir, "logo-lockup.png")));
    } catch {
      /* try jpg */
    }
    try {
      return await doc.embedJpg(await readFile(path.join(dir, "logo-lockup.jpg")));
    } catch {
      /* next */
    }
  }
  return null;
}

async function embedPhoto(doc: PDFDocument, bytes: Uint8Array) {
  try {
    return await doc.embedJpg(bytes);
  } catch {
    try {
      return await doc.embedPng(bytes);
    } catch {
      return null;
    }
  }
}

type Book = {
  doc: PDFDocument;
  font: PDFFont;
  bold: PDFFont;
  pages: PDFPage[];
  logo: PDFImage | null;
};

function addPage(book: Book) {
  const page = book.doc.addPage([PAGE.w, PAGE.h]);
  book.pages.push(page);
  page.drawRectangle({ x: 0, y: PAGE.h - 8, width: PAGE.w, height: 8, color: navy });
  page.drawRectangle({ x: 0, y: 0, width: PAGE.w, height: 8, color: gold });
  return page;
}

function drawText(
  page: PDFPage,
  font: PDFFont,
  bold: PDFFont,
  text: string,
  x: number,
  y: number,
  size: number,
  opts?: { bold?: boolean; color?: RGB },
) {
  const safe = winAnsi(text);
  if (!safe) return;
  page.drawText(safe, {
    x,
    y,
    size,
    font: opts?.bold ? bold : font,
    color: opts?.color ?? navy,
  });
}

function stampChrome(book: Book, estimateNumber: string) {
  const total = book.pages.length;
  book.pages.forEach((page, i) => {
    drawText(page, book.font, book.bold, BRAND.legalName, 40, PAGE.h - 28, 8, { color: muted });
    drawText(page, book.font, book.bold, `${estimateNumber}   ${i + 1}/${total}`, 400, PAGE.h - 28, 8, {
      color: muted,
    });
    drawText(
      page,
      book.font,
      book.bold,
      `${BRAND.location}  |  ${BRAND.phone}  |  ${BRAND.email}  |  ${BRAND.website}`,
      40,
      18,
      7,
      { color: muted },
    );
  });
}

function drawParagraph(page: PDFPage, book: Book, text: string, x: number, y: number, widthChars: number, size = 9) {
  let cursor = y;
  for (const line of wrap(text, widthChars)) {
    drawText(page, book.font, book.bold, line, x, cursor, size, { color: muted });
    cursor -= size + 4;
  }
  return cursor;
}

export async function generateProposalPdf(input: PdfInput) {
  const issuedAt = input.issuedAt ?? new Date();
  const doc = await PDFDocument.create();
  doc.setTitle(`Proposal ${input.estimateNumber}`);
  doc.setAuthor(BRAND.legalName);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await embedLogo(doc);
  const book: Book = { doc, font, bold, pages: [], logo };
  const totals = proposalTotals(input.lines);
  const grand = input.priceInr || totals.total;
  const groups = quoteGroups(input.lines);
  const moduleLine = input.lines.find((l) => l.category.toLowerCase().includes("module"));
  const inverterLine = input.lines.find((l) => l.category.toLowerCase().includes("inverter"));
  const gstHalf = totals.gst / 2;

  drawCover(book, input, issuedAt);
  drawCompany(book);
  await drawPhotos(book, input.photos || []);
  drawQuotation(book, input, issuedAt, groups, totals, grand, gstHalf, moduleLine, inverterLine);
  drawBom(book, input, grand);
  drawTerms(book);
  drawThanks(book, input);

  stampChrome(book, input.estimateNumber);
  return Buffer.from(await doc.save());
}

function drawCover(book: Book, input: PdfInput, issuedAt: Date) {
  const page = addPage(book);
  if (book.logo) {
    const w = 180;
    const h = Math.min((book.logo.height / book.logo.width) * w, 52);
    page.drawImage(book.logo, { x: 40, y: 748 - h, width: w, height: h });
  }
  drawText(page, book.font, book.bold, BRAND.brandName, 40, 680, 11, { bold: true, color: gold });
  drawText(page, book.font, book.bold, `${siteLabel(input.lead.site_type)} Solar`, 40, 560, 16, { color: muted });
  drawText(page, book.font, book.bold, "PROPOSAL", 40, 510, 36, { bold: true });
  page.drawRectangle({ x: 40, y: 492, width: 120, height: 4, color: gold });
  drawText(page, book.font, book.bold, input.lead.name, 40, 450, 22, { bold: true });
  drawText(page, book.font, book.bold, input.lead.city || BRAND.location, 40, 422, 14, { color: muted });
  if (input.systemSizeKwp) {
    drawText(page, book.font, book.bold, `Indicative system size  ${input.systemSizeKwp} kWp`, 40, 392, 11);
  }

  page.drawRectangle({ x: 40, y: 80, width: 250, height: 210, color: wash });
  drawText(page, book.font, book.bold, "From", 52, 268, 8, { bold: true, color: gold });
  drawText(page, book.font, book.bold, BRAND.legalName, 52, 248, 10, { bold: true });
  drawText(page, book.font, book.bold, BRAND.location, 52, 232, 9, { color: muted });
  drawText(page, book.font, book.bold, `Phone / WhatsApp  ${BRAND.phone}`, 52, 214, 9);
  drawText(page, book.font, book.bold, BRAND.email, 52, 198, 9);
  drawText(page, book.font, book.bold, BRAND.website, 52, 182, 9);
  drawText(page, book.font, book.bold, BRAND.tagline, 52, 156, 8, { color: muted });
  drawText(page, book.font, book.bold, "This document is a proposal, not a tax invoice.", 52, 130, 8, { color: muted });

  page.drawRectangle({ x: 310, y: 80, width: 245, height: 210, color: navy });
  drawText(page, book.font, book.bold, "Lead", 326, 268, 8, { bold: true, color: gold });
  drawText(page, book.font, book.bold, `ID : ${input.estimateNumber}`, 326, 246, 11, { bold: true, color: white });
  drawText(page, book.font, book.bold, `Date : ${formatIssueDate(issuedAt)}`, 326, 226, 10, { color: white });
  drawText(page, book.font, book.bold, `Prepared for : ${input.lead.name}`, 326, 206, 10, { color: white });
  drawText(page, book.font, book.bold, `City : ${input.lead.city || "-"}`, 326, 186, 10, { color: white });
  if (input.lead.phone) {
    drawText(page, book.font, book.bold, `Customer : ${input.lead.phone}`, 326, 166, 10, { color: white });
  }
}

function drawCompany(book: Book) {
  const page = addPage(book);
  drawText(page, book.font, book.bold, "About the company", 40, 760, 18, { bold: true });
  page.drawRectangle({ x: 40, y: 746, width: 80, height: 3, color: gold });
  let y = drawParagraph(page, book, BRAND.about, 40, 720, 95, 10);
  y -= 16;
  drawText(page, book.font, book.bold, "Vision", 40, y, 12, { bold: true, color: gold });
  y -= 18;
  y = drawParagraph(page, book, BRAND.vision, 40, y, 95, 10);
  y -= 16;
  drawText(page, book.font, book.bold, "Mission", 40, y, 12, { bold: true, color: gold });
  y -= 18;
  y = drawParagraph(page, book, BRAND.mission, 40, y, 95, 10);
  y -= 22;
  drawText(page, book.font, book.bold, "How we work", 40, y, 12, { bold: true });
  y -= 20;
  SIMPLE_PATH.forEach((step) => {
    page.drawRectangle({ x: 40, y: y - 8, width: 22, height: 22, color: navy });
    drawText(page, book.font, book.bold, step.n, 47, y - 2, 10, { bold: true, color: white });
    drawText(page, book.font, book.bold, step.title, 72, y + 4, 10, { bold: true });
    drawText(page, book.font, book.bold, step.plain, 72, y - 10, 8, { color: muted });
    y -= 40;
  });
  y -= 8;
  drawText(page, book.font, book.bold, "What we deliver", 40, y, 12, { bold: true });
  y -= 18;
  BROCHURE.pillars.forEach((pillar) => {
    drawText(page, book.font, book.bold, pillar.title, 40, y, 9, { bold: true });
    y = drawParagraph(page, book, pillar.text, 140, y, 70, 8) - 8;
  });
}

async function drawPhotos(book: Book, photos: ProposalPdfPhoto[]) {
  const page = addPage(book);
  drawText(page, book.font, book.bold, "Product photos", 40, 760, 18, { bold: true });
  page.drawRectangle({ x: 40, y: 746, width: 80, height: 3, color: gold });
  drawText(
    page,
    book.font,
    book.bold,
    "Site and product photographs can be added after this proposal is shared.",
    40,
    728,
    9,
    { color: muted },
  );

  const slots = 4;
  const cellW = 240;
  const cellH = 250;
  const startY = 430;
  for (let i = 0; i < slots; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 40 + col * (cellW + 20);
    const y = startY - row * (cellH + 24);
    page.drawRectangle({ x, y, width: cellW, height: cellH, color: wash });
    const photo = photos[i];
    if (photo) {
      const img = await embedPhoto(book.doc, photo.bytes);
      if (img) {
        const scale = Math.min((cellW - 16) / img.width, (cellH - 36) / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        page.drawImage(img, { x: x + (cellW - w) / 2, y: y + 24, width: w, height: h });
        if (photo.caption) {
          drawText(page, book.font, book.bold, photo.caption.slice(0, 40), x + 10, y + 10, 8, { color: muted });
        }
      }
    } else {
      drawText(page, book.font, book.bold, "Photo placeholder", x + 16, y + cellH / 2, 10, { color: muted });
    }
  }
}

function drawQuotation(
  book: Book,
  input: PdfInput,
  issuedAt: Date,
  groups: ReturnType<typeof quoteGroups>,
  totals: { taxable: number; gst: number; total: number },
  grand: number,
  gstHalf: number,
  moduleLine?: ProposalLine,
  inverterLine?: ProposalLine,
) {
  const page = addPage(book);
  drawText(page, book.font, book.bold, "Quotation", 40, 760, 18, { bold: true });
  page.drawRectangle({ x: 40, y: 746, width: 80, height: 3, color: gold });

  drawText(page, book.font, book.bold, "From", 40, 720, 8, { bold: true, color: gold });
  drawText(page, book.font, book.bold, BRAND.legalName, 40, 704, 10, { bold: true });
  drawText(page, book.font, book.bold, BRAND.location, 40, 688, 9, { color: muted });
  drawText(page, book.font, book.bold, `${BRAND.phone}  |  ${BRAND.email}`, 40, 672, 8);

  drawText(page, book.font, book.bold, "Bill To", 320, 720, 8, { bold: true, color: gold });
  drawText(page, book.font, book.bold, input.lead.name, 320, 704, 10, { bold: true });
  drawText(page, book.font, book.bold, [input.lead.city, "India"].filter(Boolean).join(", "), 320, 688, 9, {
    color: muted,
  });
  if (input.lead.phone) {
    drawText(page, book.font, book.bold, `Mobile : ${input.lead.phone}`, 320, 672, 8);
  }

  drawText(page, book.font, book.bold, `Date: ${formatIssueDate(issuedAt)}`, 40, 644, 9);
  drawText(page, book.font, book.bold, `Valid until: ${formatIssueDate(addDays(issuedAt, 7))}`, 220, 644, 9);
  drawText(page, book.font, book.bold, `Estimate#: ${input.estimateNumber}`, 420, 644, 9, { bold: true });

  const headers = ["#", "Item & Description", "Qty", "CGST", "SGST", "Total"];
  const cols = [40, 62, 320, 370, 440, 500];
  let y = 612;
  headers.forEach((h, i) => drawText(page, book.font, book.bold, h, cols[i], y, 8, { bold: true, color: muted }));
  y -= 8;
  page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 0.6, color: gold });
  y -= 18;

  const plantTitle = `${siteLabel(input.lead.site_type)} solar rooftop plant`;
  const plantDetail = [
    input.systemSizeKwp ? `${input.systemSizeKwp} kWp` : null,
    moduleLine ? `Modules: ${moduleLine.make}` : null,
    inverterLine ? `Inverter: ${inverterLine.make}` : null,
  ]
    .filter(Boolean)
    .join("  |  ");

  const rows = [
    {
      n: "1",
      title: plantTitle,
      detail: plantDetail || "As specified in this proposal",
      qty: "1 Nos",
      total: groups.plantTotal || grand,
    },
    groups.bos.length
      ? {
          n: "2",
          title: "Balance of system (BOS)",
          detail: "Structure, protection, cables, earthing and installation extras as listed in the BOM",
          qty: "1 Set",
          total: groups.bosTotal,
        }
      : null,
  ].filter(Boolean) as { n: string; title: string; detail: string; qty: string; total: number }[];

  const shownTotal = rows.reduce((a, r) => a + r.total, 0) || grand;
  const cgst = gstHalf || 0;
  const perRowCgst = rows.length ? cgst / rows.length : 0;

  for (const row of rows) {
    drawText(page, book.font, book.bold, row.n, 40, y, 9, { bold: true });
    drawText(page, book.font, book.bold, row.title, 62, y, 9, { bold: true });
    drawText(page, book.font, book.bold, row.qty, 320, y, 8);
    drawText(page, book.font, book.bold, pdfMoney(perRowCgst), 370, y, 8);
    drawText(page, book.font, book.bold, pdfMoney(perRowCgst), 440, y, 8);
    drawText(page, book.font, book.bold, pdfMoney(row.total), 500, y, 8, { bold: true });
    y -= 14;
    y = drawParagraph(page, book, row.detail, 62, y, 48, 8) - 10;
  }

  y -= 8;
  for (const line of wrap(amountInWordsInr(grand), 88)) {
    drawText(page, book.font, book.bold, line, 40, y, 8, { color: muted });
    y -= 12;
  }

  y -= 8;
  drawText(page, book.font, book.bold, `Sub Total: ${pdfMoney(totals.taxable || shownTotal - totals.gst)}`, 360, y, 9);
  y -= 14;
  drawText(page, book.font, book.bold, `Tax (GST): ${pdfMoney(totals.gst)}`, 360, y, 9);
  y -= 16;
  drawText(page, book.font, book.bold, `Total: ${pdfMoney(grand)}`, 360, y, 12, { bold: true });

  y -= 36;
  drawText(page, book.font, book.bold, "Notes", 40, y, 10, { bold: true });
  y -= 16;
  const notes = [
    input.notes || "Subsidy, DISCOM charges and extra civil work are confirmed after site assessment. They are not deducted here unless already agreed in writing.",
    "Please refer the following pages for the bill of materials, terms and next steps.",
    "This quotation is valid for 7 days. Prices are in INR and include GST as listed.",
  ];
  for (const note of notes) {
    y = drawParagraph(page, book, note, 40, y, 95, 8) - 6;
  }
  y -= 20;
  drawText(page, book.font, book.bold, "Authorised signature", 40, y, 9, { bold: true });
  page.drawLine({ start: { x: 40, y: y - 36 }, end: { x: 220, y: y - 36 }, thickness: 0.6, color: muted });
  drawText(page, book.font, book.bold, BRAND.legalName, 40, y - 50, 8, { color: muted });
}

function drawBom(book: Book, input: PdfInput, grand: number) {
  let page = addPage(book);
  const heading = (p: PDFPage) => {
    drawText(p, book.font, book.bold, "Bill of materials", 40, 760, 18, { bold: true });
    p.drawRectangle({ x: 40, y: 746, width: 80, height: 3, color: gold });
    drawText(p, book.font, book.bold, "Terms & specification as selected for this proposal", 40, 728, 9, {
      color: muted,
    });
  };
  heading(page);
  const headers = ["Sr", "Item", "Qty", "Unit", "Brand"];
  const cols = [40, 70, 360, 420, 470];
  let y = 700;
  const paintHead = (p: PDFPage) => {
    headers.forEach((h, i) => drawText(p, book.font, book.bold, h, cols[i], y, 8, { bold: true, color: muted }));
    y -= 8;
    p.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 0.6, color: gold });
    y -= 14;
  };
  paintHead(page);

  input.lines.forEach((line, idx) => {
    if (y < 70) {
      page = addPage(book);
      y = 760;
      heading(page);
      y = 700;
      paintHead(page);
    }
    const item = wrap(`${line.category}: ${line.description}`, 50);
    drawText(page, book.font, book.bold, String(idx + 1), 40, y, 8);
    drawText(page, book.font, book.bold, item[0], 70, y, 8);
    drawText(page, book.font, book.bold, String(line.qty), 360, y, 8);
    drawText(page, book.font, book.bold, line.unit, 420, y, 8);
    drawText(page, book.font, book.bold, line.make, 470, y, 8);
    y -= 12;
    if (item[1]) {
      drawText(page, book.font, book.bold, item[1], 70, y, 8, { color: muted });
      y -= 12;
    }
  });
  y -= 16;
  drawText(page, book.font, book.bold, `Proposal total (incl. GST): ${pdfMoney(grand)}`, 40, y, 10, { bold: true });
}

function drawTerms(book: Book) {
  const page = addPage(book);
  drawText(page, book.font, book.bold, "Terms & next steps", 40, 760, 18, { bold: true });
  page.drawRectangle({ x: 40, y: 746, width: 80, height: 3, color: gold });
  const blocks = [
    [
      "General",
      "This proposal is for discussion after a site visit. Final design, cable lengths and structure depend on the roof or land. Dispatch and installation typically follow DISCOM process and a written order.",
    ],
    [
      "Warranty",
      "Module and inverter warranties are those published by the chosen manufacturer. Workmanship or AMC, if offered, will be confirmed in writing. Warranties do not cover damage from misuse, unauthorised alteration, or natural calamity.",
    ],
    [
      "Subsidy",
      "If a government subsidy applies, it is credited as per the scheme rules. Mr.GLOW RENEWABLES can help with documentation. We cannot compensate for delay or non-receipt of subsidy by the government.",
    ],
    [
      "Customer scope",
      "Safe rooftop access, a place to store material, water and power for installation, and documents needed for approvals. Any DISCOM electrical modification remains with the customer unless agreed otherwise.",
    ],
    [
      "Care of the plant",
      "Keep modules reasonably clean. Generation depends on weather, shading and upkeep. Remote monitoring, where included with the inverter, is configured at commissioning.",
    ],
    [
      "Payment & validity",
      "The payment schedule is confirmed on the order acknowledgement. This quotation is valid for 7 days from the date on the cover. It is not a tax invoice and does not include bank account details.",
    ],
  ];
  let y = 720;
  for (const [title, body] of blocks) {
    drawText(page, book.font, book.bold, title, 40, y, 11, { bold: true, color: gold });
    y -= 16;
    y = drawParagraph(page, book, body, 40, y, 95, 9) - 14;
  }
}

function drawThanks(book: Book, input: PdfInput) {
  const page = addPage(book);
  if (book.logo) {
    const w = 200;
    const h = Math.min((book.logo.height / book.logo.width) * w, 64);
    page.drawImage(book.logo, { x: (PAGE.w - w) / 2, y: 620, width: w, height: h });
  }
  drawText(page, book.font, book.bold, "Thank you", 40, 540, 32, { bold: true });
  page.drawRectangle({ x: 40, y: 522, width: 90, height: 4, color: gold });
  drawParagraph(
    page,
    book,
    `Thank you, ${input.lead.name}, for considering ${BRAND.brandName} for your solar plant. We will walk through this proposal, answer questions, and confirm the design after a site assessment.`,
    40,
    490,
    88,
    11,
  );
  drawText(page, book.font, book.bold, BRAND.tagline, 40, 400, 12, { bold: true, color: gold });

  page.drawRectangle({ x: 40, y: 140, width: 515, height: 200, color: navy });
  drawText(page, book.font, book.bold, BRAND.legalName, 60, 300, 14, { bold: true, color: white });
  drawText(page, book.font, book.bold, BRAND.location, 60, 278, 11, { color: white });
  drawText(page, book.font, book.bold, `Mobile  ${BRAND.phone}`, 60, 252, 11, { color: white });
  drawText(page, book.font, book.bold, `WhatsApp  ${BRAND.whatsapp}`, 60, 232, 11, { color: white });
  drawText(page, book.font, book.bold, `Email  ${BRAND.email}`, 60, 212, 11, { color: white });
  drawText(page, book.font, book.bold, `Web  ${BRAND.website}`, 60, 192, 11, { color: white });
  drawText(page, book.font, book.bold, "We look forward to powering a greener tomorrow with you.", 60, 164, 9, {
    color: gold,
  });
}

export function proposalPdfFileName(leadName: string, at = new Date()) {
  const safeName =
    leadName
      .normalize("NFKD")
      .replace(/[^\w]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 50) || "proposal";
  const stamp = at
    .toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" })
    .replace(" ", "_")
    .replace(/:/g, "-")
    .slice(0, 16);
  return `${safeName}_${stamp}.pdf`;
}
