/**
 * Brevo (formerly Sendinblue) Transactional Email Service
 * Sends branded automatic replies to candidates submitting reviews/contact inquiries.
 */

export interface AutoReplyPayload {
  name: string;
  email: string;
  subject?: string | undefined;
  message?: string | undefined;
}

export interface AutoReplyResult {
  success: boolean;
  messageId?: string | undefined;
  error?: string | undefined;
}

export async function sendBrevoAutoReply(payload: AutoReplyPayload): Promise<AutoReplyResult> {
  const apiKey = process.env["BREVO_API_KEY"] || "";
  const senderEmail = process.env["BREVO_SENDER_EMAIL"] || "itsa.pccoe@pccoepune.org";
  const senderName = process.env["BREVO_SENDER_NAME"] || "ITSA PCCoE";

  if (!apiKey) {
    console.warn("[Brevo] BREVO_API_KEY is not configured in environment.");
    return { success: false, error: "BREVO_API_KEY not configured" };
  }

  const { name, email, subject, message } = payload;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank you for reaching out to ITSA</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0d0f12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f2f3f5; }
    .wrapper { width: 100%; max-width: 600px; margin: 0 auto; padding: 32px 20px; }
    .card { background-color: #161a20; border: 1px solid #282f3c; padding: 36px 28px; }
    .eyebrow { font-family: monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #8892b0; margin-bottom: 12px; }
    .title { font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 16px 0; line-height: 1.3; }
    .accent { color: #8cf427; }
    .body-text { font-size: 15px; line-height: 1.6; color: #c3cad7; margin-bottom: 24px; }
    .quote-box { background-color: #101317; border-left: 3px solid #6366f1; padding: 14px 18px; margin-bottom: 24px; font-family: monospace; font-size: 13px; color: #a5b4fc; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; font-size: 13px; }
    .meta-table td { padding: 8px 0; border-bottom: 1px solid #222834; }
    .meta-label { color: #748096; width: 30%; font-family: monospace; }
    .meta-val { color: #e2e8f0; font-weight: 500; }
    .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #64748b; font-family: monospace; }
    .footer a { color: #8cf427; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="eyebrow">// Information Technology Students' Association</div>
      <h1 class="title">Thanks for reaching out, <span class="accent">${escapeHtml(name)}</span>.</h1>
      
      <p class="body-text">
        We have safely received your review and submission. Our team reviews incoming messages regularly and we usually respond within <strong>two working days</strong>.
      </p>

      ${
        subject
          ? `
      <div class="quote-box">
        <strong>Subject:</strong> ${escapeHtml(subject)}
        ${message ? `<br /><br /><em>&ldquo;${escapeHtml(message)}&rdquo;</em>` : ""}
      </div>
      `
          : ""
      }

      <table class="meta-table">
        <tr>
          <td class="meta-label">STATUS</td>
          <td class="meta-val"><span style="color: #8cf427;">● Received & Logged</span></td>
        </tr>
        <tr>
          <td class="meta-label">ORGANIZATION</td>
          <td class="meta-val">ITSA — PCCOE Pune</td>
        </tr>
        <tr>
          <td class="meta-label">CONTACT EMAIL</td>
          <td class="meta-val">itsa.pccoe@pccoepune.org</td>
        </tr>
      </table>

      <p class="body-text" style="margin-bottom: 0; font-size: 14px; color: #94a3b8;">
        Best regards,<br />
        <strong>ITSA Student Council & Core Team</strong><br />
        Pimpri Chinchwad College of Engineering, Pune
      </p>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} ITSA PCCoE. Sector 26, Pradhikaran, Nigdi, Pune 411044.<br />
      <a href="https://itsa-contact-restyle.vercel.app">itsa-contact-restyle.vercel.app</a>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    // 1. If key is a REST API key (starts with xkeysib-)
    if (apiKey.startsWith("xkeysib-")) {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email, name }],
          subject: `Thank you for reaching out, ${name}! | ITSA PCCOE`,
          htmlContent,
        }),
      });

      const data = (await response.json()) as { messageId?: string; message?: string; code?: string };

      if (!response.ok) {
        console.error("[Brevo REST Error]", data);
        return { success: false, error: data.message || `Brevo returned status ${response.status}` };
      }

      return { success: true, messageId: data.messageId };
    }

    // 2. Otherwise (e.g. starts with xsmtpsib-), use SMTP relay via Nodemailer
    const smtpLogin = process.env["BREVO_SMTP_LOGIN"] || senderEmail;
    const nodemailer = await import("nodemailer");

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      auth: {
        user: smtpLogin,
        pass: apiKey,
      },
    });

    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: `"${name}" <${email}>`,
      subject: `Thank you for reaching out, ${name}! | ITSA PCCOE`,
      html: htmlContent,
    });

    return { success: true, messageId: info.messageId };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Brevo Email Error]", errorMsg);
    return { success: false, error: errorMsg };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
