import type { SupabaseClient } from "@supabase/supabase-js";

async function listAll(service: SupabaseClient, bucket: string, prefix: string) {
  const names: string[] = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await service.storage.from(bucket).list(prefix, { limit: 100, offset });
    if (error || !data?.length) break;
    for (const item of data) {
      if (item.name) names.push(item.name);
    }
    if (data.length < 100) break;
    offset += 100;
  }
  return names;
}

export async function removeStorageFolder(service: SupabaseClient, bucket: string, prefix: string) {
  const names = await listAll(service, bucket, prefix);
  if (!names.length) return;
  const paths = names.map((name) => `${prefix.replace(/\/$/, "")}/${name}`);
  await service.storage.from(bucket).remove(paths);
}

export function proposalPdfStoragePath(leadId: string, proposalId: string) {
  return `${leadId}/${proposalId}.pdf`;
}

/** Keep one PDF per proposal; drop dated copies and leftover files in the lead folder. */
export async function overwriteProposalPdf(
  service: SupabaseClient,
  leadId: string,
  proposalId: string,
  bytes: Buffer | Uint8Array,
  keepProposalIds: string[],
) {
  const path = proposalPdfStoragePath(leadId, proposalId);
  const { error } = await service.storage.from("proposal-pdfs").upload(path, bytes, {
    contentType: "application/pdf",
    upsert: true,
  });
  const keep = new Set(keepProposalIds.map((id) => `${id}.pdf`));
  const names = await listAll(service, "proposal-pdfs", leadId);
  const extra = names.filter((name) => !keep.has(name)).map((name) => `${leadId}/${name}`);
  if (extra.length) await service.storage.from("proposal-pdfs").remove(extra);
  return { path, error };
}

export async function removeLeadStorage(service: SupabaseClient, leadId: string, proposalIds: string[]) {
  await removeStorageFolder(service, "proposal-pdfs", leadId);
  for (const proposalId of proposalIds) {
    await removeStorageFolder(service, "proposal-photos", proposalId);
  }
}
