import express from "express";
import { v2 as cloudinary } from "cloudinary";
import { checkToken } from "./middleware/auth.js";

const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/upload/signature
// Generates a time-bound signature for secure front-end uploading
router.get("/upload/signature", checkToken, (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "hunarwadi_products";

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      folder,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate upload signature" });
  }
});

export default router;