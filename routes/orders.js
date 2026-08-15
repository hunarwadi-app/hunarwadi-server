import express from "express";
import { nanoid } from "nanoid";
import db from "../db.js";

const router = express.Router();

// ============================================================
// ORDERS
// ============================================================
// This turns a chat/negotiation into a real, trackable order once
// both sides agree on a deal. It does NOT handle payment — as per
// the original business plan (Chapter 4), the MVP launches without
// an online payment gateway. Buyer and seller settle payment between
// themselves (cash/UPI), and this just tracks the STATUS of the deal
// so both people know what stage it's at.
//
// STATUS FLOW:
//   confirmed → preparing → ready → delivered
//   (or → cancelled, from confirmed/preparing/ready)
//
// - "confirmed"  : order just created, seller has agreed to make/sell it
// - "preparing"  : seller is making/packing the item
// - "ready"      : ready for pickup / handover
// - "delivered"  : buyer has received it (this is also what should
//                   eventually unlock the ability to leave a review,
//                   once that stricter rule from reviews.js is added)
// - "cancelled"  : either side cancelled before delivery
//
// Only the SELLER can move an order forward (confirmed → preparing →
// ready → delivered), since they're the one doing the physical work.
// Only the BUYER can mark it "cancelled" while it's still "confirmed"
// (once the seller starts "preparing", cancelling should go through
// a chat conversation instead, not a one-tap button — kept simple for now).
// ============================================================

function findUser(id) {
  return db.data.users.find((u) => u.id === id);
}
function findProduct(id) {
  return db.data.products.find((p) => p.id === id);
}

const NEXT_STATUS = {
  confirmed: "preparing",
  preparing: "ready",
  ready: "delivered",
};

// Create a new order (buyer or seller confirms a deal from chat)
router.post("/orders", async (req, res) => {
  const { buyer_id, seller_id, product_id, chat_id, price } = req.body;

  if (!buyer_id || !seller_id || !product_id) {
    return res.status(400).json({ error: "buyer_id, seller_id and product_id are required" });
  }
  if (buyer_id === seller_id) {
    return res.status(400).json({ error: "Buyer and seller can't be the same person" });
  }

  const product = findProduct(product_id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const order = {
    id: nanoid(),
    buyer_id,
    seller_id,
    product_id,
    chat_id: chat_id || null,
    price: price != null ? Number(price) : product.price,
    status: "confirmed",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.data.orders.push(order);
  await db.write();
  res.json(order);
});

// Get all orders for a user — as buyer AND as seller (role tells the frontend which)
router.get("/orders", (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "user_id is required" });

  const rows = db.data.orders
    .filter((o) => o.buyer_id === user_id || o.seller_id === user_id)
    .map((o) => {
      const product = findProduct(o.product_id) || {};
      const buyer = findUser(o.buyer_id) || {};
      const seller = findUser(o.seller_id) || {};
      return {
        ...o,
        product_title: product.title,
        product_photo: product.photo,
        buyer_name: buyer.name,
        seller_name: seller.name,
        my_role: o.buyer_id === user_id ? "buyer" : "seller",
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json(rows);
});

// Get a single order (used inside the Chat screen to show live status)
router.get("/orders/:id", (req, res) => {
  const o = db.data.orders.find((x) => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: "Not found" });
  const product = findProduct(o.product_id) || {};
  res.json({ ...o, product_title: product.title, product_photo: product.photo });
});

// Get the order tied to a specific chat, if one exists (also used by Chat screen)
router.get("/chats/:chatId/order", (req, res) => {
  const o = db.data.orders.find((x) => x.chat_id === req.params.chatId);
  if (!o) return res.json(null);
  const product = findProduct(o.product_id) || {};
  res.json({ ...o, product_title: product.title, product_photo: product.photo });
});

// Move an order forward to its next status, OR cancel it
router.put("/orders/:id/status", async (req, res) => {
  const { status, actor_id } = req.body;
  const order = db.data.orders.find((x) => x.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Not found" });

  if (status === "cancelled") {
    if (order.status !== "confirmed") {
      return res.status(400).json({ error: "Order can only be cancelled while still 'confirmed'" });
    }
    if (actor_id !== order.buyer_id) {
      return res.status(403).json({ error: "Only the buyer can cancel an order" });
    }
    order.status = "cancelled";
  } else {
    const expectedNext = NEXT_STATUS[order.status];
    if (!expectedNext || status !== expectedNext) {
      return res.status(400).json({ error: `Order must move from '${order.status}' to '${expectedNext}' next` });
    }
    if (actor_id !== order.seller_id) {
      return res.status(403).json({ error: "Only the seller can update order progress" });
    }
    order.status = status;
  }

  order.updated_at = new Date().toISOString();
  await db.write();
  res.json(order);
});

export default router;
