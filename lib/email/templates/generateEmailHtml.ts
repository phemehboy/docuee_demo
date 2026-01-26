export function generateEmailHtml({
  title,
  body,
  buttonText,
  buttonUrl,
  secondaryButtonText,
  secondaryButtonUrl,
  note = "If you weren’t expecting this email, you can safely ignore it.",
  theme = "blue", // New
  imageUrl,
}: {
  title: string;
  body: string;
  buttonText?: string;
  buttonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  note?: string;
  theme?: "blue" | "red" | "green"; // New
  imageUrl?: string;
}) {
  const themeColors = {
    blue: {
      heading: "#1e40af",
      button: "#2563eb",
      outline: "#2563eb",
    },
    red: {
      heading: "#b91c1c",
      button: "#dc2626",
      outline: "#dc2626",
    },
    green: {
      heading: "#15803d",
      button: "#16a34a",
      outline: "#16a34a",
    },
  };

  const colors = themeColors[theme] || themeColors.blue;

  const buttonSection =
    buttonUrl && buttonText
      ? `
  <div style="text-align: center; margin: 24px 0;">
    <a href="${buttonUrl}" style="padding: 12px 24px; background-color: ${colors.button}; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
      ${buttonText}
    </a>
  </div>`
      : "";

  const secondaryButtonSection =
    secondaryButtonText && secondaryButtonUrl
      ? `
      <a href="${secondaryButtonUrl}" style="
        padding: 12px 24px;
        background-color: transparent;
        color: ${colors.outline};
        text-decoration: none;
        font-weight: bold;
        border-radius: 6px;
        border: 2px solid ${colors.outline};
        display: inline-block;
        margin: 8px;
      ">
        ${secondaryButtonText}
      </a>`
      : "";

  const logoSection = imageUrl
    ? `<div style="text-align:center; margin-bottom:20px;">
       <img src="${imageUrl}" alt="School Logo" style="max-width:100px; height:auto;" />
     </div>`
    : "";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; color: #333;">
    ${logoSection}
      <h2 style="color: ${colors.heading}; font-size: 24px;">${title}</h2>

      <p style="font-size: 16px; line-height: 1.6;">${body}</p>

       ${
         buttonSection || secondaryButtonSection
           ? `<div style="text-align: center; margin: 24px 0;">
              ${buttonSection}
              ${secondaryButtonSection}
            </div>`
           : ""
       }

      <p style="font-size: 14px; color: #6b7280;">${note}</p>

      <hr style="margin-top: 40px; border: none; border-top: 1px solid #e5e7eb;" />

      <p style="color: #6b7280; font-size: 12px; text-align: center;">
        This is an automated message from <strong>Docuee</strong>. Please do not reply to this email.
      </p>
    </div>
  `;
}
