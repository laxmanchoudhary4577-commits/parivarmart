const express = require("express");
const router = express.Router();
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const userCheck = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const expiry = Date.now() + 5 * 60 * 1000;

    await db.query(
      "UPDATE users SET otp=$1, otp_expiry=$2 WHERE email=$3",
      [otp, expiry, email]
    );

    console.log('--- OTP Log ---');
    console.log(`Email: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log('----------------');

    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'Parivar Mart <onboarding@resend.dev>',
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
      } catch (emailErr) {
        console.log('Email send failed:', emailErr.message);
      }
    }

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({ message: "Error sending OTP: " + err.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await db.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) return res.status(400).json({ message: "User not found" });

    if (user.rows[0].otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (Date.now() > user.rows[0].otp_expiry)
      return res.status(400).json({ message: "OTP expired" });

    res.json({ message: "OTP verified" });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Error verifying OTP: " + err.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password=$1, otp=NULL, otp_expiry=NULL WHERE email=$2",
      [hashedPassword, email]
    );

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Error resetting password: " + err.message });
  }
});

module.exports = router;
