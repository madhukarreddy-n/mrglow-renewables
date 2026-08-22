import nodemailer from "nodemailer";

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function transport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

export async function sendEmail(message: EmailMessage) {
  const tx = transport();
  if (!tx) {
    console.info("[email:skipped]", message.subject, "->", message.to);
    return { skipped: true };
  }
  await tx.sendMail({
    from: process.env.SMTP_FROM || "Mr.GLOW RENEWABLES <mrglowrenewables@gmail.com>",
    ...message,
  });
  return { skipped: false };
}
