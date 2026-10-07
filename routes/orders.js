import express from "express";
import { nanoid } from "nanoid";
import db from "../db.js";
import { checkToken } from "./middleware/auth.js";

const router = express.Router();

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

// Create a new order (buyer confirms a deal)
router.post("/orders", checkToken, async (req, res) => {
  const { product_id, chat_id } = req.body;
  const buyer_id = req.userId;

  if (!product_id) {
    return res.status(400).json({ error: "product_id is required" });
  }

  const product = findProduct(product_id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const seller_id = product.seller_id;

  if (buyer_id === seller_id) {
    return res.status(400).json({ error: "Buyer and seller can't be the same person" });
  }

  let finalPrice = product.price;

  if (chat_id) {
    const chat = db.data.chats?.find((c) => c.id === chat_id);
    if (chat) {
      const messages = db.data.chat_messages?.filter((m) => m.chat_id === chat_id) || [];
      const acceptedOffer = [...messages].reverse().find(
        (m) => m.message_type === "offer" && m.offer_status === "accepted"
      );
      if (acceptedOffer && acceptedOffer.offer_price) {
        finalPrice = Number(acceptedOffer.offer_price);
      }
    }
  }

  const order = {
    id: nanoid(),
    buyer_id,
    seller_id,
    product_id,
    chat_id: chat_id || null,
    price: finalPrice,
    status: "confirmed",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!db.data.orders) db.data.orders = [];
  db.data.orders.push(order);
  await db.write();
  res.json(order);
});

// Get all orders for the logged-in user
router.get("/orders", checkToken, (req, res) => {
  const user_id = req.userId;

  const rows = (db.data.orders || [])
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

// Get a single order
router.get("/orders/:id", checkToken, (req, res) => {
  const o = (db.data.orders || []).find((x) => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: "Not found" });
  if (o.buyer_id !== req.userId && o.seller_id !== req.userId) {
    return res.status(403).json({ error: "Not your order" });
  }
  const product = findProduct(o.product_id) || {};
  res.json({ ...o, product_title: product.title, product_photo: product.photo });
});

// Get the order tied to a specific chat
router.get("/chats/:chatId/order", checkToken, (req, res) => {
  const o = (db.data.orders || []).find((x) => x.chat_id === req.params.chatId);
  if (!o) return res.json(null);
  if (o.buyer_id !== req.userId && o.seller_id !== req.userId) {
    return res.status(403).json({ error: "Not your order" });
  }
  const product = findProduct(o.product_id) || {};
  res.json({ ...o, product_title: product.title, product_photo: product.photo });
});

// Update order status or cancel
router.put("/orders/:id/status", checkToken, async (req, res) => {
  const { status } = req.body;
  const actor_id = req.userId;
  const order = (db.data.orders || []).find((x) => x.id === req.params.id);
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
