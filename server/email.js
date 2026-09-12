import nodemailer from 'nodemailer';
import db from './db.js';
import crypto from 'crypto';
import 'dotenv/config';

let transporter = null;

// Initialize mailer
export async function getTransporter() {
  if (transporter) return transporter;
  // If SMTP env variables are provided, use them; otherwise use local test transport
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test account or simulated transport
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'windows',
    });
  }
  return transporter;
}

// Brand design tokens for emails (HTML email-safe styling matching ITSA)
const BRAND = {
  bg: '#f4f3ef',
  cardBg: '#ffffff',
  fg: '#1a1918',
  mutedFg: '#6c6b66',
  primary: '#2563eb',
  border: '#e2e0d8',
  fontMono: '"IBM Plex Mono", Courier, monospace',
  fontDisplay: '"Bricolage Grotesque", Helvetica, Arial, sans-serif',
};

export function renderBaseTemplate({ title, preheader, content, unsubscribeUrl, recipientId }) {
  const openTrackUrl = recipientId ? `http://localhost:3001/api/track/open?r=${recipientId}` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: ${BRAND.fg};">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${BRAND.bg};">
    <tr>
      <td align="center" style="padding: 40px 15px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: ${BRAND.cardBg}; border: 1px solid ${BRAND.border};">
          <!-- Top Header Strip -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid ${BRAND.border};">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="font-family: ${BRAND.fontDisplay}; font-size: 24px; font-weight: 800; letter-spacing: -0.04em; color: ${BRAND.fg};">
                      ITSA
                    </div>
                    <div style="font-family: ${BRAND.fontMono}; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: ${BRAND.mutedFg}; margin-top: 2px;">
                      PCCoE · Pune · Information Technology
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; font-family: ${BRAND.fontMono}; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; background: #e0f2fe; color: ${BRAND.primary}; border: 1px solid #bae6fd; padding: 4px 8px;">
                      DISPATCH
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: ${BRAND.bg}; border-top: 1px solid ${BRAND.border};">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-family: ${BRAND.fontMono}; font-size: 10px; color: ${BRAND.mutedFg}; line-height: 1.6;">
                    <strong style="color: ${BRAND.fg};">Information Technology Students' Association</strong><br>
                    Department of Information Technology, Pimpri Chinchwad College of Engineering (PCCoE), Pune.<br>
                    Queries: nirjar.patil25@pccoepune.org · +91 9730726966
                  </td>
                </tr>
                ${unsubscribeUrl ? `
                <tr>
                  <td style="padding-top: 16px; font-family: ${BRAND.fontMono}; font-size: 10px;">
                    <a href="${unsubscribeUrl}" style="color: ${BRAND.mutedFg}; text-decoration: underline;">
                      Unsubscribe from this newsletter
                    </a>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>
        </table>
        ${openTrackUrl ? `<img src="${openTrackUrl}" width="1" height="1" alt="" style="display:none;" />` : ''}
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// 1. Verification Email Template
export function createVerificationEmail({ email, token, siteUrl = 'http://localhost:5173' }) {
  const verifyUrl = `${siteUrl}/newsletter/verify?token=${token}`;

  const content = `
    <div style="font-family: ${BRAND.fontMono}; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: ${BRAND.primary}; margin-bottom: 8px;">
      LOG 00 — SUBSCRIPTION VERIFICATION
    </div>
    <h1 style="font-family: ${BRAND.fontDisplay}; font-size: 28px; font-weight: 800; line-height: 1.1; margin: 0 0 16px 0; color: ${BRAND.fg};">
      Confirm your subscription.
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: ${BRAND.mutedFg}; margin-bottom: 24px;">
      You requested to receive official ITSA dispatches, technical hackathon invitations, AI workshops, and upcoming department notices directly to <strong style="color: ${BRAND.fg};">${email}</strong>.
    </p>
    <div style="margin: 32px 0;">
      <a href="${verifyUrl}" style="display: inline-block; background-color: ${BRAND.fg}; color: #ffffff; padding: 14px 28px; font-family: ${BRAND.fontMono}; font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none; border: 1px solid ${BRAND.fg};">
        Confirm Subscription →
      </a>
    </div>
    <p style="font-family: ${BRAND.fontMono}; font-size: 11px; color: ${BRAND.mutedFg}; line-height: 1.5;">
      If the button above does not work, copy and paste this verification URL into your browser:<br>
      <a href="${verifyUrl}" style="color: ${BRAND.primary}; word-break: break-all;">${verifyUrl}</a>
    </p>
    <p style="font-family: ${BRAND.fontMono}; font-size: 10px; color: ${BRAND.mutedFg}; margin-top: 24px;">
      This verification link will remain active for 48 hours. If you did not make this request, you can safely disregard this email.
    </p>
  `;

  const html = renderBaseTemplate({
    title: 'Confirm your ITSA Newsletter Subscription',
    content,
  });

  return { subject: 'ITSA Dispatches — Confirm your subscription', html, verifyUrl };
}

// 2. Newsletter / Announcement Email Template
export function createNewsletterEmail({ subject, body, events = [], unsubscribeToken, recipientId, siteUrl = 'http://localhost:5173' }) {
  const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`;

  // Process markdown-like formatting for body paragraphs
  const formattedBody = body
    .split('\n\n')
    .map(p => `<p style="font-size: 15px; line-height: 1.65; color: ${BRAND.fg}; margin: 0 0 16px 0;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');

  // Event poster cards in email
  let eventsHtml = '';
  if (events && events.length > 0) {
    eventsHtml = `
      <div style="margin-top: 36px; padding-top: 24px; border-top: 1px solid ${BRAND.border};">
        <div style="font-family: ${BRAND.fontMono}; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: ${BRAND.primary}; margin-bottom: 16px;">
          FEATURED UPCOMING EVENTS
        </div>
        ${events.map((ev, idx) => {
          const clickTrackUrl = `http://localhost:3001/api/track/click?r=${recipientId}&url=${encodeURIComponent(`${siteUrl}/newsletter#${ev.slug || ev.id}`)}`;
          return `
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px; border: 1px solid ${BRAND.border}; background: #faf9f7;">
              <tr>
                <td style="padding: 16px 20px;">
                  <span style="font-family: ${BRAND.fontMono}; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: ${BRAND.primary};">
                    LOG 0${idx + 1} · ${ev.category}
                  </span>
                  <h3 style="font-family: ${BRAND.fontDisplay}; font-size: 18px; font-weight: 700; margin: 6px 0 8px 0; color: ${BRAND.fg};">
                    ${ev.title}
                  </h3>
                  <div style="font-family: ${BRAND.fontMono}; font-size: 11px; color: ${BRAND.mutedFg}; margin-bottom: 8px;">
                    📅 ${ev.formatted_date || ev.event_date} &nbsp;·&nbsp; 📍 ${ev.location}
                  </div>
                  <p style="font-size: 13px; line-height: 1.5; color: ${BRAND.mutedFg}; margin: 0 0 12px 0;">
                    ${ev.description}
                  </p>
                  <a href="${clickTrackUrl}" style="display: inline-block; font-family: ${BRAND.fontMono}; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; background: ${BRAND.fg}; color: #ffffff; padding: 8px 16px; text-decoration: none;">
                    View Details / Show Interest →
                  </a>
                </td>
              </tr>
            </table>
          `;
        }).join('')}
      </div>
    `;
  }

  const content = `
    <div style="font-family: ${BRAND.fontMono}; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: ${BRAND.primary}; margin-bottom: 8px;">
      OFFICIAL BULLETIN
    </div>
    <h1 style="font-family: ${BRAND.fontDisplay}; font-size: 26px; font-weight: 800; line-height: 1.15; margin: 0 0 20px 0; color: ${BRAND.fg};">
      ${subject}
    </h1>
    ${formattedBody}
    ${eventsHtml}
  `;

  const html = renderBaseTemplate({
    title: subject,
    content,
    unsubscribeUrl,
    recipientId
  });

  return { subject, html, unsubscribeUrl };
}

// 3. Unsubscribe Confirmation Email Template
export function createUnsubscribeEmail({ email, siteUrl = 'http://localhost:5173' }) {
  const resubscribeUrl = `${siteUrl}/newsletter`;

  const content = `
    <div style="font-family: ${BRAND.fontMono}; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #b91c1c; margin-bottom: 8px;">
      STATUS: UNSUBSCRIBED
    </div>
    <h1 style="font-family: ${BRAND.fontDisplay}; font-size: 26px; font-weight: 800; margin: 0 0 16px 0; color: ${BRAND.fg};">
      You've been unsubscribed.
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: ${BRAND.mutedFg}; margin-bottom: 24px;">
      <strong style="color: ${BRAND.fg};">${email}</strong> has been removed from our active distribution list. You will no longer receive periodic email dispatches from ITSA.
    </p>
    <div style="margin: 28px 0;">
      <a href="${resubscribeUrl}" style="display: inline-block; background-color: ${BRAND.fg}; color: #ffffff; padding: 12px 24px; font-family: ${BRAND.fontMono}; font-size: 10px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none;">
        Resubscribe Anytime →
      </a>
    </div>
  `;

  const html = renderBaseTemplate({
    title: 'Unsubscribed from ITSA Newsletter',
    content,
  });

  return { subject: 'ITSA Dispatches — Unsubscribe Confirmation', html };
}

// Dispatch email and store in Outbox table
export async function sendEmail({ to, subject, html, type = 'dispatch' }) {
  const mailer = await getTransporter();
  const mailId = 'mail-' + crypto.randomUUID();

  const fromAddress = process.env.SMTP_FROM || '"ITSA PCCoE" <itsapccoe26@gmail.com>';

  try {
    await mailer.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
      replyTo: 'noreply@pccoepune.org',
    });
  } catch (err) {
    console.warn('Mail send stream notice:', err.message);
  }

  // Persist to Supabase outbox table for instant UI inspection & simulation
  await db.saveOutboxEmail({
    id: mailId,
    to_email: to,
    subject,
    html_content: html,
    email_type: type
  });

  return { id: mailId, success: true };
}
