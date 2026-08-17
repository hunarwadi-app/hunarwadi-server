import express from "express";
import { nanoid } from "nanoid";
import { Resend } from "resend";
import db from "../db.js";

const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Hunarwadi <onboarding@resend.dev>";

const OTP_EXPIRY_MS = 5 * 60 * 1000;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

router.post("/send-otp", async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Valid email address required" });
  }

  const otp = generateOtp();
  const expires_at = Date.now() + OTP_EXPIRY_MS;

  const existing = db.data.otps.find((o) => o.email === email);
  if (existing) {
    existing.otp = otp;
    existing.expires_at = expires_at;
  } else {
    db.data.otps.push({ email, otp, expires_at });
  }
  await db.write();

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Your HUNARWADI login code",
      html: `<p>Your HUNARWADI OTP is: <strong>${otp}</strong></p><p>This code expires in 5 minutes.</p>`,
    });
  } catch (err) {
    console.error("Resend email send failed:", err);
    return res.status(500).json({ error: "Could not send OTP email. Please try again." });
  }

  res.json({ success: true });
});

router.post("/verify-otp", async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const { otp } = req.body;

  const row = db.data.otps.find((o) => o.email === email);
  if (!row || row.otp !== otp || Date.now() > row.expires_at) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }
  db.data.otps = db.data.otps.filter((o) => o.email !== email);

  let user = db.data.users.find((u) => u.email === email);
  if (!user) {
    user = {
      id: nanoid(),
      email,
      name: null,
      city: null,
      latitude: null,
      longitude: null,
      role: "buyer",
      is_verified: 1,
      profile_photo: null,
      created_at: new Date().toISOString(),
    };
    db.data.users.push(user);
  } else {
    user.is_verified = 1;
  }
  await db.write();

  res.json({ success: true, user });
});

export default router;