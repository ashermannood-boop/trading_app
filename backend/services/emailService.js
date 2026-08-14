import axios from "axios";

// ==============================
// VERIFY EMAIL TEMPLATE
// ==============================

const verifyTemplate = (name, otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title> Verify OTP</title>
<style>
  body { margin:0; padding:0; background:#f5f6fa; font-family: Arial, sans-serif; }
  .container { max-width:420px; margin:0 auto; background:#ffffff; border-radius:8px; padding:25px; color:#333; }
  h2 { margin:0; color:#2563eb; }
  p { margin:5px 0; color:#555; font-size:14px; line-height:1.5; }
  .otp { display:inline-block; background:#eaf2ff; color:#2563eb; font-size:28px; font-weight:bold; padding:15px 25px; border-radius:6px; letter-spacing:5px; margin:20px 0; }
  .footer { font-size:11px; color:#888; margin-top:20px; }
  @media screen and (max-width:480px) {
    .container { padding:15px; }
    .otp { font-size:24px; padding:12px 20px; letter-spacing:4px; }
    p { font-size:13px; }
  }
</style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <div class="container">
          <h2></h2>
          <p style="font-size:13px;">Secure Trading Platform</p>
          <hr style="border:none;height:1px;background:#e0e0e0;margin:15px 0;">
          <p>Hello <strong>${name}</strong>,</p>
          <p>Please verify your account using the OTP below:</p>
          <div class="otp">${otp}</div>
          <p>This code expires in 10 minutes.</p>
          <p class="footer">© ${new Date().getFullYear()} </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ==============================
// RESET PASSWORD TEMPLATE
// ==============================

const resetTemplate = (name, otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title> Reset OTP</title>
<style>
  body { margin:0; padding:0; background:#f5f6fa; font-family: Arial, sans-serif; }
  .container { max-width:420px; margin:0 auto; background:#ffffff; border-radius:8px; padding:25px; color:#333; }
  h2 { margin:0; color:#2563eb; }
  p { margin:5px 0; color:#555; font-size:14px; line-height:1.5; }
  .otp { display:inline-block; background:#eaf2ff; color:#2563eb; font-size:28px; font-weight:bold; padding:15px 25px; border-radius:6px; letter-spacing:5px; margin:20px 0; }
  .footer { font-size:11px; color:#888; margin-top:20px; }
  @media screen and (max-width:480px) {
    .container { padding:15px; }
    .otp { font-size:24px; padding:12px 20px; letter-spacing:4px; }
    p { font-size:13px; }
  }
</style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <div class="container">
          <h2></h2>
          <p style="font-size:13px;">Password Reset Request</p>
          <hr style="border:none;height:1px;background:#e0e0e0;margin:15px 0;">
          <p>Hello <strong>${name}</strong>,</p>
          <p>You requested a password reset. Use the OTP below:</p>
          <div class="otp">${otp}</div>
          <p>If you did not request this, ignore this email.</p>
          <p class="footer">Secure Trading Notifications • </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;


// ==============================
// GENERIC SEND FUNCTION
// ==============================

const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { 
          email: process.env.E_SENDER,
          name: ""
        },
        to: [{ email: to }],
        subject,
        htmlContent: html
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    return { success: true, data: response.data };

  } catch (error) {
    console.error("Email error:", error.response?.data || error.message);
    return { success: false };
  }
};

// ==============================
// EXPORT FUNCTIONS
// ==============================

export const sendVerifyOTP = (email, name, otp) => {
  return sendEmail({
    to: email,
    subject: "Verify Your  Account",
    html: verifyTemplate(name, otp)
  });
};

export const sendResetOTP = (email, name, otp) => {
  return sendEmail({
    to: email,
    subject: "Reset Your ZayTrade Password",
    html: resetTemplate(name, otp)
  });
};