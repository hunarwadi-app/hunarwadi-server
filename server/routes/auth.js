import express from "express";
import { nanoid } from "nanoid";
import db from "../db.js";

const router = express.Router();

// ============================================================
// AUTH ROUTES — Email + OTP login
// ============================================================
// Why email instead of mobile OTP right now:
// Mobile OTP in India needs TRAI's DLT registration (one-time cost +
// per-SMS cost) before you can legally send SMS. Email OTP works with a
// free email-sending service instead, so there's no cost to get started.
//
// FUTURE UPGRADE PATH (when the budget allows):
// Add a sibling route here like POST /send-otp-mobile that uses an SMS
// provider (e.g. MSG91) once DLT registration is done, and let the
// Login screen offer "Continue with Mobile" as a second option. The
// verify-otp logic below can stay almost the same — it just needs to
// look up a user by "mobile" instead of "email".
// ============================================================

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}

// Step 1: person enters their email, we generate and "send" an OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Valid email address required" });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expires_at = Date.now() + 5 * 60 * 1000; // valid for 5 minutes

  const existing = db.data.otps.find((o) => o.email === email);
  if (existing) {
    existing.otp = otp;
    existing.expires_at = expires_at;
  } else {
    db.data.otps.push({ email, otp, expires_at });
  }
  await db.write();

  // TODO (before real launch): replace this console.log + dev_otp with an
  // actual call to an email provider like Resend or Brevo (both have free
  // tiers). Until then, the OTP is printed here and returned in the
  // response so the app is fully testable without spending anything.
  console.log(`[DEV] OTP for ${email}: ${otp}`);

  res.json({ success: true, dev_otp: otp });
});

// Step 2: person enters the OTP, we verify it and log them in (or sign them up)
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const record = db.data.otps.find((o) => o.email === email);
  const isExpired = record && Date.now() > record.expires_at;

  if (!record || record.otp !== otp || isExpired) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  // OTP used successfully — remove it so it can't be reused
  db.data.otps = db.data.otps.filter((o) => o.email !== email);

  let user = db.data.users.find((u) => u.email === email);
  if (!user) {
    // First time this email has logged in — create a new account
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
