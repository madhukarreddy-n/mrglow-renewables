export const LEAD_STATUSES = [
  "submitted",
  "contacted",
  "proposal_shared",
  "confirmed_install",
  "payment_done",
  "installation_in_progress",
  "installation_done",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_LABEL: Record<LeadStatus, string> = {
  submitted: "Submitted",
  contacted: "Contacted",
  proposal_shared: "Proposal shared",
  confirmed_install: "Install confirmed",
  payment_done: "Payment done",
  installation_in_progress: "Installation in progress",
  installation_done: "Installation done",
};

/** Forward-only workflow. */
const ALLOWED: Record<LeadStatus, LeadStatus[]> = {
  submitted: ["contacted"],
  contacted: ["proposal_shared"],
  proposal_shared: ["confirmed_install"],
  confirmed_install: ["payment_done"],
  payment_done: ["installation_in_progress"],
  installation_in_progress: ["installation_done"],
  installation_done: [],
};

export function canTransition(from: LeadStatus, to: LeadStatus) {
  return ALLOWED[from]?.includes(to) ?? false;
}

export function nextStatuses(from: LeadStatus) {
  return ALLOWED[from] ?? [];
}

export function isLeadStatus(value: string): value is LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}

/** Proposal generation starts after the customer has been contacted. */
export function canCreateProposal(status: LeadStatus) {
  return status !== "submitted";
}
