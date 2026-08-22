import * as XLSX from "xlsx";
import { mapFieldValuePairs, mapSurveyRows, SurveyImport, SURVEY_TEMPLATE_HEADERS } from "./excel";

function sheetToImport(sheet: XLSX.WorkSheet): SurveyImport {
  const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  }) as string[][];
  const cleaned = rows
    .map((r) => r.map((c) => String(c ?? "").trim()))
    .filter((r) => r.some((c) => c));
  if (!cleaned.length) return {};
  const header = cleaned[0];
  const wide = header.length >= 4 && cleaned[1];
  if (wide) return mapSurveyRows(header, cleaned[1]);
  return mapFieldValuePairs(cleaned);
}

export function parseSurveyWorkbook(buffer: ArrayBuffer | Buffer): SurveyImport {
  const data = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const wb = XLSX.read(data, { type: "buffer" });
  const mapped: SurveyImport = {};
  for (const name of wb.SheetNames) {
    Object.assign(mapped, sheetToImport(wb.Sheets[name]));
  }
  return mapped;
}

export function surveyTemplateBuffer() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    SURVEY_TEMPLATE_HEADERS,
    [
      "Example Customer",
      "9912343142",
      "name@example.com",
      "Hyderabad",
      "500001",
      "TS",
      "Residential",
      "RCC",
      "80",
      "60",
      "South",
      "Low",
      "Meter 123",
      "3-phase",
      "5 kW",
      "8 kW",
      "5",
      "1 Meter Structure",
      "2",
      "12 m",
      "Access via staircase",
    ],
  ]);
  const pair = XLSX.utils.aoa_to_sheet([
    ["Field", "Value"],
    ["Customer Name", ""],
    ["Phone", ""],
    ["Address", ""],
    ["Roof Type", ""],
    ["Available Area", ""],
    ["Orientation", ""],
    ["Shading", ""],
    ["Phase", ""],
    ["Recommended kWp", ""],
    ["Notes", ""],
  ]);
  XLSX.utils.book_append_sheet(wb, ws, "Survey Row");
  XLSX.utils.book_append_sheet(wb, pair, "Field Value");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
