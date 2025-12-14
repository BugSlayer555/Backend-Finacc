import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory (one level up)
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Email templates (same as Netlify function)
const getConfirmationEmailHTML = (name) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Finacc Outsourcing</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #1E90FF 0%, #0066CC 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.02em;">Finacc Outsourcing</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #0a0a0a; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Thank You, ${name}!</h2>
              <p style="color: #6B6B6B; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We've received your message and truly appreciate you taking the time to reach out to us.
              </p>
              <p style="color: #6B6B6B; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Our team will review your inquiry and get back to you within <strong style="color: #1E90FF;">24 hours</strong>. If your matter is urgent, please feel free to call us at <a href="tel:+917011701023" style="color: #1E90FF; text-decoration: none;">+91 7011701023</a>.
              </p>
              <div style="background-color: #f9f9f9; border-left: 4px solid #1E90FF; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #0a0a0a; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">Free Trial Offer</p>
                <p style="color: #6B6B6B; font-size: 14px; line-height: 1.6; margin: 0;">
                  Book a 15-30 min discovery call for a complimentary trial of 8-10 hours job to test the water and give your firm wings of growth!
                </p>
              </div>
              <p style="color: #6B6B6B; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Best regards,<br>
                <strong style="color: #0a0a0a;">The Finacc Outsourcing Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #E9E9E9;">
              <p style="color: #6B6B6B; font-size: 12px; margin: 0 0 10px 0;">
                <strong style="color: #0a0a0a;">Contact Us</strong><br>
                Email: <a href="mailto:info@finaccoutsourcings.com" style="color: #1E90FF; text-decoration: none;">info@finaccoutsourcings.com</a><br>
                Phone: <a href="tel:+917011701023" style="color: #1E90FF; text-decoration: none;">+91 7011701023</a>
              </p>
              <p style="color: #6B6B6B; font-size: 12px; margin: 10px 0 0 0;">
                S140, Rajendra Place, Delhi, 110008, India
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getNotificationEmailHTML = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #1E90FF 0%, #0066CC 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">New Contact Form Submission</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Finacc Outsourcing</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #E9E9E9;">
                    <strong style="color: #0a0a0a; font-size: 14px; display: inline-block; width: 140px;">Name:</strong>
                    <span style="color: #6B6B6B; font-size: 14px;">${data.firstName} ${data.lastName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #E9E9E9;">
                    <strong style="color: #0a0a0a; font-size: 14px; display: inline-block; width: 140px;">Email:</strong>
                    <a href="mailto:${data.email}" style="color: #1E90FF; font-size: 14px; text-decoration: none;">${data.email}</a>
                  </td>
                </tr>
                ${data.phone ? `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #E9E9E9;">
                    <strong style="color: #0a0a0a; font-size: 14px; display: inline-block; width: 140px;">Phone:</strong>
                    <a href="tel:${data.phone}" style="color: #1E90FF; font-size: 14px; text-decoration: none;">${data.phone}</a>
                  </td>
                </tr>
                ` : ''}
                ${data.company ? `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #E9E9E9;">
                    <strong style="color: #0a0a0a; font-size: 14px; display: inline-block; width: 140px;">Company:</strong>
                    <span style="color: #6B6B6B; font-size: 14px;">${data.company}</span>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 12px 0;">
                    <strong style="color: #0a0a0a; font-size: 14px; display: block; margin-bottom: 8px;">Message:</strong>
                    <div style="color: #6B6B6B; font-size: 14px; line-height: 1.6; background-color: #f9f9f9; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${data.message}</div>
                  </td>
                </tr>
              </table>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E9E9E9;">
                <a href="mailto:${data.email}" style="display: inline-block; background-color: #1E90FF; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Reply to ${data.firstName}</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #E9E9E9;">
              <p style="color: #6B6B6B; font-size: 12px; margin: 0;">
                This email was sent from your contact form at Finacc Outsourcing
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

app.post("/api/send-email", async (req, res) => {
  try {
    const { firstName, lastName, email, company, phone, message, _honeypot } = req.body;

    // Honeypot check
    if (_honeypot) {
      return res.status(200).json({ success: true, message: "Message received" });
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get environment variables
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const recipientEmail = process.env.RECIPIENT_EMAIL;
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const fullName = `${firstName} ${lastName}`;
    const timestamp = new Date().toISOString();

    // Send confirmation email to user
    await transporter.sendMail({
      from: `"Finacc Outsourcing" <${smtpUser}>`,
      to: email,
      replyTo: smtpUser,
      subject: `Thank You for Contacting Finacc Outsourcing | ${timestamp}`,
      html: getConfirmationEmailHTML(firstName),
    });

    // Send notification email to you
    await transporter.sendMail({
      from: `"Finacc Contact Form" <${smtpUser}>`,
      to: recipientEmail,
      replyTo: email,
      subject: `New Contact: ${fullName} | ${timestamp}`,
      html: getNotificationEmailHTML({
        firstName,
        lastName,
        email,
        company,
        phone,
        message,
      }),
    });

    res.status(200).json({
      success: true,
      message: "Emails sent successfully",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      error: "Failed to send email",
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Email server running on http://localhost:${PORT}`);
  console.log(`📧 API endpoint: http://localhost:${PORT}/api/send-email`);
});


