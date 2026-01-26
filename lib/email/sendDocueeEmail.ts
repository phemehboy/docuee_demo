import { generateEmailHtml } from "./templates/generateEmailHtml";
import { Resend } from "resend";

// Lazy singleton instance
let resend: Resend | null = null;

function getResend() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ RESEND_API_KEY is missing. Emails will not be sent.");
      return null;
    }
    resend = new Resend(apiKey);
    console.log("✅ Resend client initialized");
  }
  return resend;
}

export async function sendDocueeEmail({
  to,
  subject,
  title,
  body,
  buttonText,
  buttonUrl,
  secondaryButtonText,
  secondaryButtonUrl,
  note,
  theme = "blue",
  imageUrl,
}: {
  to: string;
  subject: string;
  title: string;
  body: string;
  buttonText?: string;
  buttonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  note?: string;
  theme?: "blue" | "red" | "green";
  imageUrl?: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.error("❌ Email not sent: RESEND_API_KEY missing.");
    return;
  }

  return await resend.emails.send({
    from: "Docuee <noreply@docuee.com>",
    to,
    subject,
    html: generateEmailHtml({
      title,
      body,
      buttonText,
      buttonUrl,
      secondaryButtonText,
      secondaryButtonUrl,
      note,
      theme,
      imageUrl,
    }),
    text: `${title}

${body.replace(/<br\s*\/?>/g, "\n")}

${buttonText && buttonUrl ? `${buttonText}: ${buttonUrl}\n` : ""}
${secondaryButtonText && secondaryButtonUrl ? `${secondaryButtonText}: ${secondaryButtonUrl}` : ""}
`,
  });
}
