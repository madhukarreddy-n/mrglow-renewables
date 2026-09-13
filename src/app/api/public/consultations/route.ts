import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceSupabase } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail, consultationCustomerEmail, consultationSalesEmail } from "@/lib/email/send";
import { BRAND } from "@/lib/brand";

const schema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().regex(/^[0-9]{10}$/),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().max(80).optional(),
  address: z.string().max(200).optional(),
  site_type: z.enum(["home", "commercial", "industrial"]).optional(),
  monthly_bill_inr: z.number().positive().optional(),
  estimated_system_kwp: z.number().positive().optional(),
  estimated_annual_savings_inr: z.number().optional(),
  source: z.enum(["calculator", "consultation", "manual"]).optional(),
  company: z.string().optional(),
  message: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (!rateLimit(`consult:${ip}`, 8, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try later." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      city: parsed.data.city || null,
      address: parsed.data.address || null,
      site_type: parsed.data.site_type || "home",
      monthly_bill_inr: parsed.data.monthly_bill_inr ?? null,
      estimated_system_kwp: parsed.data.estimated_system_kwp ?? null,
      estimated_annual_savings_inr: parsed.data.estimated_annual_savings_inr ?? null,
      source: parsed.data.source || "consultation",
      status: "submitted",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error(error);
    return NextResponse.json({ error: "Could not save your request." }, { status: 500 });
  }

  await supabase.from("status_history").insert({
    lead_id: data.id,
    from_status: null,
    to_status: "submitted",
    note: parsed.data.message || "Public consultation form",
  });

  const customer = consultationCustomerEmail(parsed.data.name);
  if (parsed.data.email) {
    await sendEmail({ to: parsed.data.email, ...customer });
  }
  const salesTo = process.env.SALES_NOTIFICATION_EMAIL || BRAND.email;
  const sales = consultationSalesEmail({
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email,
    source: parsed.data.source || "consultation",
    id: data.id,
  });
  await sendEmail({ to: salesTo, ...sales });

  return NextResponse.json({ ok: true, id: data.id });
}
