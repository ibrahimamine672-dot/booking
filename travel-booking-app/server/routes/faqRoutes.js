const router = require("express").Router();
const nodemailer = require("nodemailer");

// ================= NODEMAILER TRANSPORTER =================
const EMAIL_USER = process.env.EMAIL_USER || "mounadifibrahim1@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s/g, "") : "";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Verify transporter configuration at startup (catches bad credentials early)
transporter.verify((err) => {
  if (err) {
    console.error("❌ FAQ Nodemailer verification failed:", err.message);
  } else {
    console.log("✅ FAQ Nodemailer ready — can send contact emails from:", EMAIL_USER);
  }
});

// ================= POST /api/faq/ask =================
router.post("/ask", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required." });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const mailOptions = {
      from: `"TravelBook FAQ" <${EMAIL_USER}>`,
      to: "mounadifibrahim1@gmail.com",
      subject: `New FAQ / Support Question from ${name}`,
      html: `
        <div style="max-width:560px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#333;">
          <div style="background:#1e3a5f;padding:24px 24px 16px;border-radius:8px 8px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:20px;">TravelBook — New Support Request</h1>
          </div>
          <div style="border:1px solid #e0e0e0;border-top:0;padding:32px 24px;border-radius:0 0 8px 8px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;font-size:13px;color:#888;width:80px;vertical-align:top;">Name</td>
                <td style="padding:8px 0;font-size:14px;font-weight:600;color:#333;">${name}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:13px;color:#888;width:80px;vertical-align:top;">Email</td>
                <td style="padding:8px 0;font-size:14px;color:#1e3a5f;">
                  <a href="mailto:${email}" style="color:#1e3a5f;text-decoration:underline;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0 4px;font-size:13px;color:#888;width:80px;vertical-align:top;">Message</td>
                <td style="padding:8px 0 4px;font-size:14px;color:#333;line-height:1.6;white-space:pre-wrap;">${message}</td>
              </tr>
            </table>
            <hr style="margin:24px 0;border:none;border-top:1px solid #eee;" />
            <p style="margin:0;font-size:12px;color:#aaa;">
              Sent via the TravelBook FAQ / Contact form &middot; Reply directly to the visitor at <a href="mailto:${email}" style="color:#aaa;">${email}</a>
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Thank you! Your question has been submitted. We'll get back to you soon." });
  } catch (err) {
    console.error("❌ FAQ contact error:", err.message);
    res.status(500).json({ message: "Failed to send your question. Please try again later." });
  }
});

module.exports = router;
