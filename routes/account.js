import express from "express";
import db from "../db.js";
import { checkToken } from "./middleware/auth.js";

const router = express.Router();
const ACTIVE = ["confirmed", "preparing", "ready"];

router.delete("/account", checkToken, async (req, res) => {
  const uid = req.userId;
  const me = (db.data.users || []).find((u) => u.id === uid);
  if (!me) return res.status(404).json({ error: "Not found" });

  const myProductIds = (db.data.products || []).filter((p) => p.seller_id === uid).map((p) => p.id);
  const myChatIds = (db.data.chats || []).filter((c) => c.buyer_id === uid || c.seller_id === uid).map((c) => c.id);

  for (const o of db.data.orders || []) {
    if ((o.buyer_id === uid || o.seller_id === uid) && ACTIVE.includes(o.status)) {
      o.status = "cancelled";
      o.updated_at = new Date().toISOString();
    }
  }
  db.data.messages = (db.data.messages || []).filter((m) => !myChatIds.includes(m.chat_id));
  db.data.chats = (db.data.chats || []).filter((c) => !myChatIds.includes(c.id));
  db.data.wishlist = (db.data.wishlist || []).filter((w) => w.user_id !== uid && !myProductIds.includes(w.product_id));
  db.data.reviews = (db.data.reviews || []).filter((r) => r.buyer_id !== uid && !myProductIds.includes(r.product_id));
  db.data.reports = (db.data.reports || []).filter((r) => r.reporter_id !== uid && !myProductIds.includes(r.product_id));
  db.data.products = (db.data.products || []).filter((p) => p.seller_id !== uid);
  db.data.otps = (db.data.otps || []).filter((o) => o.email !== me.email);
  db.data.users = db.data.users.filter((u) => u.id !== uid);
  for (const u of db.data.users) {
    if (Array.isArray(u.blocked_users)) u.blocked_users = u.blocked_users.filter((x) => x !== uid);
  }
  await db.write();
  res.json({ success: true });
});

router.post("/users/:id/block", checkToken, async (req, res) => {
  const me = (db.data.users || []).find((u) => u.id === req.userId);
  const target = (db.data.users || []).find((u) => u.id === req.params.id);
  if (!me || !target) return res.status(404).json({ error: "Not found" });
  if (target.id === me.id) return res.status(400).json({ error: "You cannot block yourself" });
  me.blocked_users = Array.isArray(me.blocked_users) ? me.blocked_users : [];
  if (!me.blocked_users.includes(target.id)) me.blocked_users.push(target.id);
  await db.write();
  res.json({ success: true });
});

router.delete("/users/:id/block", checkToken, async (req, res) => {
  const me = (db.data.users || []).find((u) => u.id === req.userId);
  if (!me) return res.status(404).json({ error: "Not found" });
  me.blocked_users = (me.blocked_users || []).filter((x) => x !== req.params.id);
  await db.write();
  res.json({ success: true });
});

router.get("/blocked", checkToken, (req, res) => {
  const me = (db.data.users || []).find((u) => u.id === req.userId);
  const ids = (me && me.blocked_users) || [];
  res.json(ids.map((id) => {
    const u = db.data.users.find((x) => x.id === id);
    return { id, name: (u && u.name) || "User" };
  }));
});

export default router;