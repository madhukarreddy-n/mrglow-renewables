export type SurveyImport = {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  pincode?: string;
  state?: string;
  propertyType?: string;
  roofType?: string;
  roofArea?: string;
  availableArea?: string;
  orientation?: string;
  shading?: string;
  electricityMeterDetails?: string;
  phase?: string;
  currentLoad?: string;
  sanctionedLoad?: string;
  recommendedCapacityKwp?: string;
  notes?: string;
  structureType?: string;
  buildingFloors?: string;
  roofHeight?: string;
};

const ALIASES: Record<keyof SurveyImport, string[]> = {
  name: ["customer name", "name", "client name"],
  phone: ["phone", "mobile", "whatsapp", "contact"],
  email: ["email"],
  address: ["address", "site address", "location"],
  pincode: ["pin", "pincode", "pin code", "zip"],
  state: ["state"],
  propertyType: ["property type", "building type", "category"],
  roofType: ["roof type", "roof"],
  roofArea: ["roof area", "roof area (sqm)", "total roof area"],
  availableArea: ["available area", "usable area", "shadow free area"],
  orientation: ["orientation", "azimuth"],
  shading: ["shading", "shadow"],
  electricityMeterDetails: ["meter", "meter number", "meter details"],
  phase: ["phase"],
  currentLoad: ["current load", "connected load"],
  sanctionedLoad: ["sanctioned load", "contract demand"],
  recommendedCapacityKwp: ["recommended kwp", "system size", "kwp", "capacity"],
  notes: ["notes", "remarks", "comments"],
  structureType: ["structure", "structure type", "mounting"],
  buildingFloors: ["floors", "no of floors", "storeys"],
  roofHeight: ["roof height", "height"],
};

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function mapSurveyRows(headers: string[], values: string[]): SurveyImport {
  const out: SurveyImport = {};
  headers.forEach((h, i) => {
    const key = Object.keys(ALIASES).find((k) =>
      ALIASES[k as keyof SurveyImport].includes(norm(h)),
    ) as keyof SurveyImport | undefined;
    if (key && values[i]) out[key] = String(values[i]).trim();
  });
  return out;
}

/** Two-column Field | Value layout also supported. */
export function mapFieldValuePairs(rows: string[][]): SurveyImport {
  const out: SurveyImport = {};
  for (const row of rows) {
    const [field, value] = row;
    if (!field || value == null || value === "") continue;
    const key = Object.keys(ALIASES).find((k) =>
      ALIASES[k as keyof SurveyImport].includes(norm(String(field))),
    ) as keyof SurveyImport | undefined;
    if (key) out[key] = String(value).trim();
  }
  return out;
}

export const SURVEY_TEMPLATE_HEADERS = [
  "Customer Name",
  "Phone",
  "Email",
  "Address",
  "PIN",
  "State",
  "Property Type",
  "Roof Type",
  "Roof Area",
  "Available Area",
  "Orientation",
  "Shading",
  "Meter Details",
  "Phase",
  "Current Load",
  "Sanctioned Load",
  "Recommended kWp",
  "Structure Type",
  "Floors",
  "Roof Height",
  "Notes",
];
