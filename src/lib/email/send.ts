import { BRAND } from "@/lib/brand";

type EmailMessage = { to: string; subject: string; html: string; text?: string };

export async function sendEmail(message: EmailMessage) {
  const resend = process.env.RESEND_API_KEY;
  const brevo = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM || `${BRAND.brandName} <${BRAND.email}>`;

  if (resend) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resend}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
    if (!res.ok) {
      console.error("[email:resend]", await res.text());
      return { skipped: false, ok: false };
    }
    return { skipped: false, ok: true };
  }

  if (brevo) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevo,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: BRAND.email, name: BRAND.brandName },
        to: [{ email: message.to }],
        subject: message.subject,
        htmlContent: message.html,
        textContent: message.text,
      }),
    });
    if (!res.ok) {
      console.error("[email:brevo]", await res.text());
      return { skipped: false, ok: false };
    }
    return { skipped: false, ok: true };
  }

  console.info("[email:skipped]", message.subject, "->", message.to);
  return { skipped: true, ok: true };
}

export function consultationCustomerEmail(name: string) {
  return {
    subject: `We received your solar consultation request — ${BRAND.brandName}`,
    text: `Hi ${name},\n\nThank you for contacting ${BRAND.legalName}. A specialist will follow up on WhatsApp or phone (${BRAND.phone}).\n\n${BRAND.location}\n${BRAND.website}`,
    html: `<p>Hi ${name},</p><p>Thank you for contacting <strong>${BRAND.legalName}</strong>. A specialist will follow up on WhatsApp or phone (${BRAND.phone}).</p><p>${BRAND.location}<br/>${BRAND.website}</p>`,
  };
}

export function consultationSalesEmail(payload: {
  name: string;
  phone: string;
  email?: string | null;
  source: string;
  id: string;
}) {
  return {
    subject: `New lead (${payload.source}): ${payload.name}`,
    text: `${payload.name}\n${payload.phone}\n${payload.email || "no email"}\nSource: ${payload.source}\nLead id: ${payload.id}`,
    html: `<p><strong>${payload.name}</strong></p><p>${payload.phone}<br/>${payload.email || "no email"}</p><p>Source: ${payload.source}<br/>Lead: ${payload.id}</p>`,
  };
}

export function proposalSharedEmail(opts: { name: string; url: string }) {
  return {
    subject: `Your solar proposal from ${BRAND.brandName}`,
    text: `Hi ${opts.name},\n\nYour solar proposal is ready:\n${opts.url}\n\n${BRAND.legalName}\n${BRAND.phone}`,
    html: `<p>Hi ${opts.name},</p><p>Your solar proposal is ready: <a href="${opts.url}">${opts.url}</a></p><p>${BRAND.legalName}<br/>${BRAND.phone}</p>`,
  };
}
