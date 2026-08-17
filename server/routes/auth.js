import express from "express";
import { nanoid } from "nanoid";
import { Resend } from "resend";
import db from "../db.js";

const router = express.Router();

// ============================================================
// RESEND EMAIL SERVICE
// ============================================================

const resend = new Resend(process.env.RESEND_API_KEY);

// Email address used for sending.
// For testing, Resend's onboarding address can be used.
// For production, set RESEND_FROM_EMAIL in Render to:
// no-reply@hunarwadi.in
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Hunarwadi <onboarding@resend.dev>";

// ============================================================
// AUTH ROUTES — Email + OTP login
// ============================================================

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}

// ============================================================
// STEP 1 — SEND OTP
// ============================================================

router.post("/send-otp", async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    // Validate email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Valid email address required",
      });
    }

    // Check API key
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing");

      return res.status(500).json({
        error: "Email service is not configured",
      });
    }

    // Generate 6-digit OTP
    const otp = String(
      Math.floor(100000 + Math.random() * 900000)
    );

    // OTP valid for 5 minutes
    const expires_at = Date.now() + 5 * 60 * 1000;

    // Save/update OTP in database
    const existing = db.data.otps.find(
      (o) => o.email === email
    );

    if (existing) {
      existing.otp = otp;
      existing.expires_at = expires_at;
    } else {
      db.data.otps.push({
        email,
        otp,
        expires_at,
      });
    }

    await db.write();

    // ========================================================
    // SEND REAL EMAIL USING RESEND
    // ========================================================

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "Your Hunarwadi Login OTP",

      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Hunarwadi OTP</title>
          </head>

          <body style="
            margin: 0;
            padding: 0;
            background: #f5f5f5;
            font-family: Arial, Helvetica, sans-serif;
          ">

            <div style="
              max-width: 500px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            ">

              <h1 style="
                text-align: center;
                color: #222222;
                margin-bottom: 10px;
              ">
                HUNARWADI
              </h1>

              <p style="
                text-align: center;
                color: #666666;
                font-size: 16px;
              ">
                Your login verification code
              </p>

              <div style="
                margin: 30px 0;
                text-align: center;
              ">

                <div style="
                  display: inline-block;
                  padding: 18px 30px;
                  background: #f1f1f1;
                  border-radius: 10px;
                  font-size: 34px;
                  font-weight: bold;
                  letter-spacing: 8px;
                  color: #111111;
                ">
                  ${otp}
                </div>

              </div>

              <p style="
                text-align: center;
                color: #555555;
                font-size: 14px;
              ">
                This OTP is valid for <strong>5 minutes</strong>.
              </p>

              <p style="
                text-align: center;
                color: #888888;
                font-size: 13px;
                margin-top: 30px;
              ">
                If you did not request this OTP, you can safely ignore
                this email.
              </p>

              <hr style="
                border: none;
                border-top: 1px solid #eeeeee;
                margin: 25px 0;
              " />

              <p style="
                text-align: center;
                color: #999999;
                font-size: 12px;
              ">
                © Hunarwadi
              </p>

            </div>

          </body>
        </html>
      `,
    });

    // Resend returned an error
    if (error) {
      console.error("Resend email error:", error);

      return res.status(500).json({
        error: "Unable to send OTP email",
      });
    }

    console.log(
      `OTP email sent successfully to ${email}. Email ID: ${data?.id || "unknown"}`
    );

    // IMPORTANT:
    // Do NOT send OTP back to frontend.
    return res.json({
      success: true,
      message: "OTP sent successfully to your email",
    });

  } catch (error) {
    console.error("SEND OTP ERROR:", error);

    return res.status(500).json({
      error: "Failed to send OTP",
    });
  }
});

// ============================================================
// STEP 2 — VERIFY OTP
// ============================================================

router.post("/verify-otp", async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    const otp = String(req.body?.otp || "").trim();

    // Basic validation
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Valid email address required",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        error: "Enter a valid 6-digit OTP",
      });
    }

    // Find OTP record
    const record = db.data.otps.find(
      (o) => o.email === email
    );

    // Check whether OTP exists
    if (!record) {
      return res.status(400).json({
        error: "Invalid or expired OTP",
      });
    }

    // Check expiry
    const isExpired = Date.now() > record.expires_at;

    // Check OTP
    if (record.otp !== otp || isExpired) {
      return res.status(400).json({
        error: "Invalid or expired OTP",
      });
    }

    // ========================================================
    // OTP VERIFIED — DELETE USED OTP
    // ========================================================

    db.data.otps = db.data.otps.filter(
      (o) => o.email !== email
    );

    // ========================================================
    // FIND OR CREATE USER
    // ========================================================

    let user = db.data.users.find(
      (u) => u.email === email
    );

    if (!user) {
      // First login — create account
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
      // Existing user — mark verified
      user.is_verified = 1;
    }

    await db.write();

    // ========================================================
    // LOGIN SUCCESS
    // ========================================================

    return res.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);

    return res.status(500).json({
      error: "Failed to verify OTP",
    });
  }
});

export default router;