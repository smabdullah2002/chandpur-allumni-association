const transporter = require("../config/mailer");

const ORG_NAME = "Chandpur Allumni Association- Jahangirnagar University";
const SENDER = `"${ORG_NAME}" <${process.env.EMAIL_USER}>`;

function guard() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("[Email] EMAIL_USER or EMAIL_PASS not set — skipping.");
    return false;
  }
  return true;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function baseHtml({ accentColor, headerTitle, headerSub, bodyHtml, ctaText, ctaHref = "#" }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headerTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:560px;background:#ffffff;border-radius:12px;
                 overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:${accentColor};padding:32px 40px;">
              <p style="margin:0;font-size:13px;font-weight:600;
                color:rgba(255,255,255,0.8);letter-spacing:0.08em;
                text-transform:uppercase;">${ORG_NAME}</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">
                ${headerTitle}
              </h1>
              ${headerSub ? `<p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">${headerSub}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              ${bodyHtml}
              ${ctaText ? `
              <table cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td style="border-radius:8px;background:${accentColor};">
                    <a href="${ctaHref}" style="display:inline-block;padding:12px 28px;
                      font-size:14px;font-weight:700;color:#ffffff;
                      text-decoration:none;letter-spacing:0.03em;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:#e5e7eb;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;">
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                This is an automated message from ${ORG_NAME}. Please do not reply directly to this email.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#d1d5db;">
                &copy; ${new Date().getFullYear()} ${ORG_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Donation status notification ──────────────────────────────────────────

async function sendDonationStatusEmail(user, donation, status) {
  if (!guard()) return;

  const isApproved = status === "approved";
  const accentColor = isApproved ? "#16a34a" : "#dc2626";
  const amount = donation.amount ? `৳${Number(donation.amount).toLocaleString()}` : "";
  const category = donation.category || "Donation";

  const subject = isApproved
    ? `Your ${ORG_NAME} donation has been approved`
    : `Update on your ${ORG_NAME} donation`;

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;color:#111827;font-weight:600;">Dear ${user.fullName || "Member"},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
      ${isApproved
        ? `We are pleased to inform you that your donation of <strong>${amount}</strong> under <strong>${category}</strong> has been <strong style="color:${accentColor};">approved</strong>. Thank you for your generous contribution to ${ORG_NAME}.`
        : `Thank you for your donation of <strong>${amount}</strong> under <strong>${category}</strong>. After review, we were unable to approve this donation at this time. Please contact us if you have any questions.`
      }
    </p>
    <table style="border-collapse:collapse;width:100%;font-size:14px;color:#374151;">
      <tr style="background:#f9fafb;">
        <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600;">Category</td>
        <td style="padding:10px 14px;border:1px solid #e5e7eb;">${category}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600;">Amount</td>
        <td style="padding:10px 14px;border:1px solid #e5e7eb;">${amount}</td>
      </tr>
      <tr style="background:#f9fafb;">
        <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600;">Status</td>
        <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:700;color:${accentColor};">
          ${isApproved ? "Approved" : "Rejected"}
        </td>
      </tr>
    </table>`;

  await transporter.sendMail({
    from: SENDER,
    to: user.email,
    subject,
    html: baseHtml({
      accentColor,
      headerTitle: isApproved ? "Donation Approved!" : "Donation Update",
      headerSub: `${category} — ${amount}`,
      bodyHtml,
      ctaText: "View My Donations",
    }),
  });
}

// ── Broadcast: notice published ───────────────────────────────────────────

async function sendNoticePublishedEmail(recipients, notice) {
  if (!guard()) return;
  if (!recipients || recipients.length === 0) return;

  const accentColor = "#1d4ed8";
  const subject = `[${ORG_NAME}] New Notice: ${notice.title}`;

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;color:#111827;font-weight:600;">Dear Member,</p>
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
      A new notice has been published by <strong>${ORG_NAME}</strong>.
    </p>
    <div style="background:#eff6ff;border-left:4px solid #1d4ed8;padding:18px 20px;border-radius:0 8px 8px 0;margin-bottom:20px;">
      <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#1e3a8a;">${notice.title}</p>
      <p style="margin:0;font-size:14px;color:#1e40af;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">
        ${notice.category || "General"}
      </p>
    </div>
    <p style="margin:0;font-size:15px;color:#374151;line-height:1.7;">
      ${notice.content ? notice.content.substring(0, 300) + (notice.content.length > 300 ? "…" : "") : ""}
    </p>`;

  // Send to each recipient individually (blind — no CC/BCC leaking addresses)
  const tasks = recipients.map((user) =>
    transporter.sendMail({
      from: SENDER,
      to: user.email,
      subject,
      html: baseHtml({
        accentColor,
        headerTitle: "New Notice Published",
        bodyHtml,
        ctaText: "View on Website",
      }),
    }).catch((err) =>
      console.error(`[Email] Failed to send notice email to ${user.email}:`, err.message)
    )
  );

  await Promise.allSettled(tasks);
}

// ── Broadcast: event created ──────────────────────────────────────────────

async function sendEventCreatedEmail(recipients, event) {
  if (!guard()) return;
  if (!recipients || recipients.length === 0) return;

  const accentColor = "#7c3aed";
  const subject = `[${ORG_NAME}] Upcoming Event: ${event.title}`;

  const dateStr = event.date
    ? new Date(event.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;color:#111827;font-weight:600;">Dear Member,</p>
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
      <strong>${ORG_NAME}</strong> has announced a new upcoming event. We hope to see you there!
    </p>
    <div style="background:#f5f3ff;border-left:4px solid #7c3aed;padding:18px 20px;border-radius:0 8px 8px 0;margin-bottom:20px;">
      <p style="margin:0 0 8px;font-size:17px;font-weight:700;color:#4c1d95;">${event.title}</p>
      ${dateStr ? `<p style="margin:0 0 4px;font-size:14px;color:#5b21b6;"><strong>Date:</strong> ${dateStr}</p>` : ""}
      ${event.location ? `<p style="margin:0;font-size:14px;color:#5b21b6;"><strong>Location:</strong> ${event.location}</p>` : ""}
    </div>
    ${event.description ? `<p style="margin:0;font-size:15px;color:#374151;line-height:1.7;">
      ${event.description.substring(0, 300) + (event.description.length > 300 ? "…" : "")}
    </p>` : ""}`;

  const tasks = recipients.map((user) =>
    transporter.sendMail({
      from: SENDER,
      to: user.email,
      subject,
      html: baseHtml({
        accentColor,
        headerTitle: "New Event Announced",
        headerSub: dateStr,
        bodyHtml,
        ctaText: "View Event Details",
      }),
    }).catch((err) =>
      console.error(`[Email] Failed to send event email to ${user.email}:`, err.message)
    )
  );

  await Promise.allSettled(tasks);
}

module.exports = { sendDonationStatusEmail, sendNoticePublishedEmail, sendEventCreatedEmail };
