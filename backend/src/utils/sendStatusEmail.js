const transporter = require("../config/mailer");

const ORG_NAME = "Chandpur Allumni Association- Jahangirnagar University";
const SENDER = `"${ORG_NAME}" <${process.env.EMAIL_USER}>`;

function buildHtml(fullName, status) {
  const isApproved = status === "approved";
  const accentColor = isApproved ? "#16a34a" : "#dc2626";
  const headingText = isApproved
    ? "Your account has been approved! 🎉"
    : "Update on your account application";
  const bodyText = isApproved
    ? `We're excited to welcome you to <strong>${ORG_NAME}</strong>! Your membership account is now active and ready to use. You can log in and access all member features right away.`
    : `Thank you for applying to <strong>${ORG_NAME}</strong>. After careful review, we were unable to approve your account at this time. If you believe this is an error or would like more information, please reach out to us directly.`;
  const ctaText = isApproved ? "Log In Now" : "Contact Us";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headingText}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:560px;background:#ffffff;border-radius:12px;
                 overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

          <!-- Header bar -->
          <tr>
            <td style="background:${accentColor};padding:32px 40px;">
              <p style="margin:0;font-size:13px;font-weight:600;
                color:rgba(255,255,255,0.8);letter-spacing:0.08em;
                text-transform:uppercase;">${ORG_NAME}</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">
                ${headingText}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#111827;font-weight:600;">
                Dear ${fullName},
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7;">
                ${bodyText}
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background:${accentColor};">
                    <a href="#" style="display:inline-block;padding:12px 28px;
                      font-size:14px;font-weight:700;color:#ffffff;
                      text-decoration:none;letter-spacing:0.03em;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:#e5e7eb;"></div>
            </td>
          </tr>

          <!-- Footer -->
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

async function sendStatusEmail(user, status) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("[Email] EMAIL_USER or EMAIL_PASS not set — skipping notification.");
    return;
  }

  const subject =
    status === "approved"
      ? `Your ${ORG_NAME} account has been approved`
      : `Update on your ${ORG_NAME} account application`;

  await transporter.sendMail({
    from: SENDER,
    to: user.email,
    subject,
    html: buildHtml(user.fullName || "Member", status),
  });
}

module.exports = sendStatusEmail;
