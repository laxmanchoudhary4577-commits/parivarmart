const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

// ⚙️ 4. Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔢 5. Send OTP API
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const [userCheck] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (userCheck.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const expiry = Date.now() + 5 * 60 * 1000; // 5 min

    // save OTP in DB
    await db.query(
      "UPDATE users SET otp=?, otp_expiry=? WHERE email=?",
      [otp, expiry, email]
    );

    console.log('--- Development OTP Log ---');
    console.log(`Email: ${email}`);
    console.log(`OTP:   ${otp}`);
    console.log('---------------------------');

    // send email
    await transporter.sendMail({
      from: `"Parivar Mart Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP - Parivar Mart",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; padding: 20px; text-align: center; border-radius: 10px; background: #f0fdf4;">
          <h2 style="color: #16a34a;">Password Reset OTP</h2>
          <p>Your verification code is:</p>
          <h1 style="letter-spacing: 5px; color: #15803d;">${otp}</h1>
          <p>Valid for 5 minutes only.</p>
          <hr style="border: 0.5px solid #dcfce7; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({ message: "Error sending OTP: " + err.message });
  }
});

// ✅ 6. Verify OTP API
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const [user] = await db.query(
      "SELECT * FROM users WHERE email=?",
      [email]
    );

    if (user.length === 0) return res.status(400).json({ message: "User not found" });

    if (user[0].otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (Date.now() > user[0].otp_expiry)
      return res.status(400).json({ message: "OTP expired" });

    res.json({ message: "OTP verified" });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Error verifying OTP: " + err.message });
  }
});

// 🔐 7. Reset Password API
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password=?, otp=NULL, otp_expiry=NULL WHERE email=?",
      [hashedPassword, email]
    );

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Error resetting password: " + err.message });
  }
});

module.exports = router;
