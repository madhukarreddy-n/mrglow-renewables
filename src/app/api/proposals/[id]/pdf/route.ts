import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase/server";
import { requireEmployee } from "@/lib/supabase/auth";
import { unauthorized } from "@/lib/api";
import { parseProposalSnapshot } from "@/lib/bom";
import { generateProposalPdf, proposalPdfFileName } from "@/lib/proposal-pdf";
import { overwriteProposalPdf } from "@/lib/storage-cleanup";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireEmployee();
  } catch (e) {
    return unauthorized(e);
  }
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: proposal } = await supabase.from("proposals").select("*").eq("id", id).maybeSingle();
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: lead } = await supabase.from("leads").select("*").eq("id", proposal.lead_id).maybeSingle();
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const snapshot = parseProposalSnapshot(proposal.components);
  const service = createServiceSupabase();
  const { data: photoRows } = await supabase
    .from("proposal_photos")
    .select("storage_path, caption")
    .eq("proposal_id", id)
    .order("uploaded_at", { ascending: true });
  const photos: { bytes: Uint8Array; caption?: string | null }[] = [];
  for (const photo of photoRows || []) {
    const { data } = await service.storage.from("proposal-photos").download(photo.storage_path);
    if (!data) continue;
    photos.push({ bytes: new Uint8Array(await data.arrayBuffer()), caption: photo.caption });
  }

  const issuedAt = new Date();
  const bytes = await generateProposalPdf({
    estimateNumber: proposal.estimate_number || snapshot.estimate_number || proposal.id.slice(0, 8),
    systemSizeKwp: proposal.system_size_kwp,
    priceInr: Number(proposal.price_inr),
    notes: snapshot.notes,
    lines: snapshot.lines,
    issuedAt,
    photos,
    lead: {
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      city: lead.city,
      address: lead.address,
      site_type: lead.site_type,
    },
  });

  const filename = proposalPdfFileName(lead.name, issuedAt);
  const { data: siblings } = await supabase.from("proposals").select("id").eq("lead_id", proposal.lead_id);
  const { path, error: upErr } = await overwriteProposalPdf(
    service,
    proposal.lead_id,
    id,
    bytes,
    (siblings || []).map((row) => row.id),
  );
  if (!upErr) {
    await service.from("proposals").update({ pdf_storage_path: path }).eq("id", id);
  }

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${req.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline"}; filename="${filename}"`,
    },
  });
}
