import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    return nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: { user: "resend", pass: resendKey },
    });
  }

  return null;
}

const transporter = createTransport();

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!transporter) {
    console.warn("[Email] No email transport configured, skipping send to:", to);
    return { success: false, error: "Email transport not configured" };
  }

  const from = process.env.SMTP_FROM || "Assessment Center <noreply@localhost>";

  try {
    const info = await transporter.sendMail({ from, to, subject, html });
    return { success: true, id: info.messageId };
  } catch (error) {
    console.error("[Email] Send failed:", error);
    return { success: false, error: String(error) };
  }
}
