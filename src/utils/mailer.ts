import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.zoho.in",
  port: parseInt(process.env.SMTP_PORT ?? "465", 10),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM ?? "NabataraLife <connect@nabataralife.com>";

function otpEmailHtml(otp: string, heading: string, bodyText: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
      <h2 style="color:#1a1a2e;margin-bottom:8px;">${heading}</h2>
      <p style="color:#555;font-size:15px;line-height:1.6;">${bodyText}</p>
      <div style="margin:32px 0;text-align:center;">
        <span style="display:inline-block;letter-spacing:12px;font-size:36px;font-weight:bold;color:#c0392b;padding:16px 24px;background:#fdf2f2;border-radius:8px;">${otp}</span>
      </div>
      <p style="color:#888;font-size:13px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p style="color:#bbb;font-size:12px;">NabataraLife &mdash; Sacred &amp; Wellness Products</p>
    </div>
  `;
}

function ctaEmailHtml(heading: string, bodyText: string, ctaLabel: string, ctaUrl: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
      <h2 style="color:#1a1a2e;margin-bottom:8px;">${heading}</h2>
      <p style="color:#555;font-size:15px;line-height:1.6;">${bodyText}</p>
      <div style="margin:32px 0;text-align:center;">
        <a href="${ctaUrl}" style="display:inline-block;background:#c0392b;color:#fff;font-size:16px;font-weight:bold;padding:14px 32px;border-radius:8px;text-decoration:none;">${ctaLabel}</a>
      </div>
      <p style="color:#888;font-size:13px;">If the button doesn't work, copy this link: <a href="${ctaUrl}" style="color:#c0392b;">${ctaUrl}</a></p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p style="color:#bbb;font-size:12px;">NabataraLife &mdash; Sacred &amp; Wellness Products</p>
    </div>
  `;
}

export async function sendAdminInviteEmail(
  to: string,
  inviterName: string,
  inviteUrl: string
): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "You've been invited to manage NabataraLife",
    html: ctaEmailHtml(
      "You're Invited as an Admin",
      `<strong>${inviterName}</strong> has invited you to manage the NabataraLife store. Click the button below to accept your invitation. This link expires in <strong>48 hours</strong>.`,
      "Accept Invitation",
      inviteUrl
    ),
  });
}

export async function sendAdminWelcomeEmail(to: string): Promise<void> {
  const loginUrl = `${process.env.FRONTEND_URL ?? ""}/login`;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Your NabataraLife admin access is active",
    html: ctaEmailHtml(
      "Admin Access Granted",
      "You now have admin access to the NabataraLife dashboard. You can manage products, orders, content, and more.",
      "Go to Dashboard",
      loginUrl
    ),
  });
}

export async function sendOTPEmail(
  to: string,
  otp: string,
  purpose: "email_verification" | "password_reset"
): Promise<void> {
  const isVerification = purpose === "email_verification";

  const subject = isVerification
    ? "Verify your NabataraLife account"
    : "Reset your NabataraLife password";

  const heading = isVerification
    ? "Verify Your Email"
    : "Reset Your Password";

  const bodyText = isVerification
    ? "Thank you for signing up! Use the code below to verify your email address."
    : "We received a request to reset your password. Use the code below to proceed.";

  await transporter.sendMail({
    from: FROM,
    to,
    subject,
    html: otpEmailHtml(otp, heading, bodyText),
  });
}
