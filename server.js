import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// ✅ Render / Production safe env load
dotenv.config();

const app = express();

// ✅ Render dynamic port (VERY IMPORTANT)
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

/* ================= EMAIL TEMPLATES ================= */

const getConfirmationEmailHTML = (name) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Finacc Outsourcing</title>
</head>
<body style="margin:0;padding:0;font-family:Inter,Arial,sans-serif;background:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr><td align="center">
<table width="600" style="background:#ffffff;border-radius:12px;overflow:hidden;">
<tr>
<td style="background:#1E90FF;padding:40px;text-align:center;color:#fff;">
<h1>Finacc Outsourcing</h1>
</td>
</tr>
<tr>
<td style="padding:40px;">
<h2>Thank You, ${name}!</h2>
<p>We've received your message and will get back to you within <b>24 hours</b>.</p>
<p>
Email: info@finaccoutsourcings.com<br/>
Phone: +91 7011701023
</p>
</td>
</tr>
</table>
</td></tr>
</table>
</body>
</html>
`;

const getNotificationEmailHTML = (data) => `
<!DOCTYPE html>
<html>
<body style="font-family:Arial;background:#f5f5f5;padding:20px;">
<div style="max-width:600px;margin:auto;background:#fff;padding:30px;border-radius:8px;">
<h2>New Contact Form Submission</h2>
<p><b>Name:</b> ${data.firstName} ${data.lastName}</p>
<p><b>Email:</b> ${data.email}</p>
${data.phone ? `<p><b>Phone:</b> ${data.phone}</p>` : ""}
${data.company ? `<p><b>Company:</b> ${data.company}</p>` : ""}
<p><b>Message:</b></p>
<p>${data.message}</p>
</div>
</body>
</html>
`;

/* ================= API ================= */

app.post("/api/send-email", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      company,
      phone,
      message,
      _honeypot,
    } = req.body;

    // honeypot
    if (_honeypot) {
      return res.status(200).json({ success: true });
    }

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Render env vars
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const recipientEmail = process.env.RECIPIENT_EMAIL;

    // ✅ Debug (temporary – check Render logs)
    console.log("SMTP CHECK:", {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
    });

    // ✅ Correct SMTP transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: false, // port 587
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // confirmation email
    await transporter.sendMail({
      from: `"Finacc Outsourcing" <${smtpUser}>`,
      to: email,
      replyTo: smtpUser,
      subject: "Thank you for contacting Finacc Outsourcing",
      html: getConfirmationEmailHTML(firstName),
    });

    // admin notification
    await transporter.sendMail({
      from: `"Finacc Contact Form" <${smtpUser}>`,
      to: recipientEmail,
      replyTo: email,
      subject: `New Contact: ${firstName} ${lastName}`,
      html: getNotificationEmailHTML({
        firstName,
        lastName,
        email,
        company,
        phone,
        message,
      }),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({
      error: "Failed to send email",
      message: error.message,
    });
  }
});

/* ================= START SERVER ================= */

app.listen(PORT, () => {
  console.log(`🚀 Email server running on port ${PORT}`);
  console.log(`📧 API endpoint: /api/send-email`);
});
