import { formatInr } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import { createServiceSupabase } from "@/lib/supabase/server";
import { parseProposalSnapshot, lineAmounts } from "@/lib/bom";

export default async function PublicProposalPage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { shareToken } = await params;
  let proposal: {
    id: string;
    lead_id: string;
    system_size_kwp: number | null;
    price_inr: number;
    components: unknown;
    shared_at: string;
    estimate_number: string | null;
  } | null = null;
  let lead: { name: string; city: string | null; site_type: string | null } | null = null;
  const photos: { id: string; caption: string | null; url: string | null }[] = [];

  try {
    const supabase = createServiceSupabase();
    const { data } = await supabase
      .from("proposals")
      .select("*")
      .eq("share_token", shareToken)
      .not("shared_at", "is", null)
      .maybeSingle();
    proposal = data;
    if (proposal) {
      const { data: leadRow } = await supabase
        .from("leads")
        .select("name, city, site_type")
        .eq("id", proposal.lead_id)
        .single();
      lead = leadRow;
      const { data: photoRows } = await supabase
        .from("proposal_photos")
        .select("id, storage_path, caption")
        .eq("proposal_id", proposal.id);
      for (const photo of photoRows || []) {
        const { data: signedUrl } = await supabase.storage
          .from("proposal-photos")
          .createSignedUrl(photo.storage_path, 60 * 60);
        photos.push({ id: photo.id, caption: photo.caption, url: signedUrl?.signedUrl || null });
      }
    }
  } catch {
    proposal = null;
  }

  if (!proposal) {
    return (
      <section className="section">
        <div className="container-wide max-w-xl">
          <h1 className="font-display text-3xl">Proposal not available</h1>
          <p className="mt-3 text-muted">This link is invalid or the proposal has not been shared yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container-wide max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-lime">{BRAND.brandName}</p>
        <h1 className="mt-2 font-display text-4xl">{proposal.estimate_number || "Your solar proposal"}</h1>
        <p className="mt-2 text-muted">
          Prepared for {lead?.name || "you"}
          {lead?.city ? ` · ${lead.city}` : ""}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="card p-6">
            <p className="text-xs text-muted">System size</p>
            <p className="font-display text-3xl">{proposal.system_size_kwp ?? "—"} kWp</p>
          </div>
          <div className="card p-6">
            <p className="text-xs text-muted">Price</p>
            <p className="font-display text-3xl">{formatInr(Number(proposal.price_inr))}</p>
          </div>
        </div>
        <div className="card mt-6 overflow-x-auto p-6">
          <h2 className="font-display text-xl">Bill of materials</h2>
          {(() => {
            const snapshot = parseProposalSnapshot(proposal.components);
            if (!snapshot.lines.length) {
              return <pre className="mt-3 overflow-auto text-sm">{JSON.stringify(proposal.components, null, 2)}</pre>;
            }
            return (
              <table className="mt-4 w-full text-left text-sm">
                <thead>
                  <tr className="text-muted">
                    <th className="py-2">Item</th>
                    <th>Make</th>
                    <th>Qty</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.lines.map((line, i) => (
                    <tr key={i} className="border-t border-navy/10">
                      <td className="py-2">
                        {line.category}: {line.description}
                      </td>
                      <td>{line.make}</td>
                      <td>
                        {line.qty} {line.unit}
                      </td>
                      <td>{formatInr(lineAmounts(line).total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </div>
        {photos.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {photos.map((photo) =>
              photo.url ? (
                <figure key={photo.id} className="overflow-hidden rounded-3xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt={photo.caption || "Installation photo"} className="h-56 w-full object-cover" />
                  {photo.caption ? <figcaption className="mt-2 text-sm text-muted">{photo.caption}</figcaption> : null}
                </figure>
              ) : null,
            )}
          </div>
        ) : null}
        <p className="mt-8 text-xs text-muted">
          This summary is not a tax invoice. Confirm scope, subsidy and timeline with {BRAND.legalName} before payment.
        </p>
      </div>
    </section>
  );
}
