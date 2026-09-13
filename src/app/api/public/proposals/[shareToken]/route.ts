import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> },
) {
  const { shareToken } = await params;
  const supabase = createServiceSupabase();
  const { data: proposal, error } = await supabase
    .from("proposals")
    .select("*")
    .eq("share_token", shareToken)
    .not("shared_at", "is", null)
    .maybeSingle();

  if (error || !proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const { data: lead } = await supabase
    .from("leads")
    .select("name, city, site_type")
    .eq("id", proposal.lead_id)
    .single();

  const { data: photos } = await supabase
    .from("proposal_photos")
    .select("id, storage_path, caption")
    .eq("proposal_id", proposal.id)
    .order("uploaded_at", { ascending: true });

  const signed = [];
  for (const photo of photos || []) {
    const { data: signedUrl } = await supabase.storage
      .from("proposal-photos")
      .createSignedUrl(photo.storage_path, 60 * 60);
    signed.push({
      id: photo.id,
      caption: photo.caption,
      url: signedUrl?.signedUrl || null,
    });
  }

  return NextResponse.json({
    proposal: {
      id: proposal.id,
      system_size_kwp: proposal.system_size_kwp,
      price_inr: proposal.price_inr,
      components: proposal.components,
      shared_at: proposal.shared_at,
      estimate_number: proposal.estimate_number,
    },
    lead,
    photos: signed,
  });
}
