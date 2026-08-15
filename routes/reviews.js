import express from "express";
import { nanoid } from "nanoid";
import db from "../db.js";

const router = express.Router();

// ============================================================
// REVIEWS & RATINGS
// ============================================================
// This is the "Trust" system described in the business blueprint
// (Chapter 8) — a buyer can rate a product/artist after dealing with
// them, and that rating shows up on the Product page and the Artist's
// profile so future buyers can trust the artist before chatting.
//
// DESIGN DECISIONS (for future-you or anyone else reading this later):
// - One review PER buyer PER product. If the same buyer reviews the
//   same product again, we UPDATE their existing review instead of
//   creating a duplicate — this matches how Amazon/Flipkart etc. work,
//   and also naturally prevents one buyer spamming many fake reviews
//   on the same product (a concern raised in Chapter 8 of the plan).
// - A seller can never review their own product.
// - Right now, ANY logged-in buyer can leave a review — there's no
//   check yet that a real purchase/deal happened first. When payments
//   are added later (Chapter 4/7), this should be tightened to "only
//   buyers who completed a deal with this seller can review", so fake
//   reviews from people who never actually bought anything are blocked.
// ============================================================

function findUser(id) {
  return db.data.users.find((u) => u.id === id);
}

function average(numbers) {
  if (numbers.length === 0) return null;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return Math.round((sum / numbers.length) * 10) / 10; // round to 1 decimal
}

// Submit (or update) a review for a product
router.post("/reviews", async (req, res) => {
  const { product_id, buyer_id, rating, comment } = req.body;

  if (!product_id || !buyer_id || !rating) {
    return res.status(400).json({ error: "product_id, buyer_id and rating are required" });
  }
  const ratingNum = Number(rating);
  if (ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: "rating must be between 1 and 5" });
  }

  const product = db.data.products.find((p) => p.id === product_id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  if (product.seller_id === buyer_id) {
    return res.status(400).json({ error: "You can't review your own product" });
  }

  const existing = db.data.reviews.find(
    (r) => r.product_id === product_id && r.buyer_id === buyer_id
  );

  if (existing) {
    existing.rating = ratingNum;
    existing.comment = comment ?? existing.comment;
    existing.created_at = new Date().toISOString();
  } else {
    db.data.reviews.push({
      id: nanoid(),
      product_id,
      buyer_id,
      rating: ratingNum,
      comment: comment || "",
      created_at: new Date().toISOString(),
    });
  }

  await db.write();
  res.json({ success: true });
});

// Get all reviews for one product, plus its average rating
router.get("/products/:id/reviews", (req, res) => {
  const rows = db.data.reviews
    .filter((r) => r.product_id === req.params.id)
    .map((r) => {
      const buyer = findUser(r.buyer_id) || {};
      return { ...r, buyer_name: buyer.name || "Anonymous Buyer" };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({
    reviews: rows,
    average: average(rows.map((r) => r.rating)),
    count: rows.length,
  });
});

// Get a seller's overall rating, averaged across ALL of their products
router.get("/sellers/:id/rating", (req, res) => {
  const sellerId = req.params.id;
  const theirProductIds = db.data.products
    .filter((p) => p.seller_id === sellerId)
    .map((p) => p.id);

  const rows = db.data.reviews.filter((r) => theirProductIds.includes(r.product_id));

  res.json({
    average: average(rows.map((r) => r.rating)),
    count: rows.length,
  });
});

export default router;
