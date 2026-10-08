import express from "express";
import { nanoid } from "nanoid";
import { Resend } from "resend";
import db from "../db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Hunarwadi <noreply@hunarwadi.in>";

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const REVIEW_EMAIL = (process.env.REVIEW_EMAIL || "").trim().toLowerCase();
const REVIEW_OTP = (process.env.REVIEW_OTP || "").trim();
const sendLog = new Map();
const failLog = new Map();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

router.post("/send-otp", async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Valid email address required" });
  }

  if (REVIEW_EMAIL && REVIEW_OTP && email === REVIEW_EMAIL) return res.json({ success: true });
  const nowMs = Date.now();
  const recent = (sendLog.get(email) || []).filter((ts) => nowMs - ts < 60 * 60 * 1000);
  if (recent.length && nowMs - recent[recent.length - 1] < 60 * 1000) return res.status(429).json({ error: "Please wait a minute before requesting another OTP." });
  if (recent.length >= 5) return res.status(429).json({ error: "Too many OTP requests. Try again in an hour." });
  recent.push(nowMs);
  sendLog.set(email, recent);
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
  const otp = String(req.body.otp || "").trim();
  const lock = failLog.get(email);
  if (lock && lock.until && Date.now() < lock.until) return res.status(429).json({ error: "Too many wrong attempts. Try again in 15 minutes." });

  const row = db.data.otps.find((o) => o.email === email);
  const isReviewer = REVIEW_EMAIL && REVIEW_OTP && email === REVIEW_EMAIL && otp === REVIEW_OTP;
  if (!isReviewer && (!row || row.otp !== otp || Date.now() > row.expires_at)) {
    const f = failLog.get(email) || { count: 0, until: 0 };
    f.count += 1;
    if (f.count >= 5) { f.until = Date.now() + 15 * 60 * 1000; f.count = 0; }
    failLog.set(email, f);
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

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  failLog.delete(email);
  res.json({ success: true, user, token });
});

export default router;