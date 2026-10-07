import express from "express";
import { v2 as cloudinary } from "cloudinary";
import rateLimit from "express-rate-limit";
import { checkToken } from "./middleware/auth.js";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // max 10 uploads per minute per user
  keyGenerator: (req) => req.userId || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
  message: { error: "Too many upload requests, please try again later" },
});

// GET /api/upload/signature
router.get("/upload/signature", checkToken, uploadLimiter, (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = "hunarwadi_products";

  const paramsToSign = {
    timestamp,
    folder,
    allowed_formats: "jpg,png,webp",
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    signature,
    timestamp,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    folder,
    allowed_formats: "jpg,png,webp",
  });
});

export default router;
