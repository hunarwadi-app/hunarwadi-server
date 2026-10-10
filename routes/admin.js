import express from "express";
import db from "../db.js";
import { checkToken } from "./middleware/auth.js";

const router = express.Router();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

function isAdmin(req) {
  const me = (db.data.users || []).find((u) => u.id === req.userId);
  return !!(ADMIN_EMAIL && me && String(me.email || "").toLowerCase() === ADMIN_EMAIL);
}

router.get("/admin/reports", checkToken, (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Not allowed" });
  const byProduct = {};
  for (const r of db.data.reports || []) {
    (byProduct[r.product_id] = byProduct[r.product_id] || []).push(r);
  }
  const rows = Object.entries(byProduct)
    .map(([pid, list]) => {
      const p = (db.data.products || []).find((x) => x.id === pid);
      const seller = p ? (db.data.users || []).find((u) => u.id === p.seller_id) : null;
      return {
        product_id: pid,
        title: p ? p.title : "(deleted)",
        photo: p ? p.photo : null,
        status: p ? p.status : "deleted",
        seller_name: seller ? seller.name : null,
        count: list.length,
        reasons: list.map((r) => r.reason),
        last_reported: list.reduce((a, r) => (r.created_at > a ? r.created_at : a), ""),
      };
    })
    .sort((a, b) => (a.last_reported < b.last_reported ? 1 : -1));
  res.json(rows);
});

router.post("/admin/products/:id/status", checkToken, async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Not allowed" });
  const { status } = req.body;
  if (!["active", "removed"].includes(status)) return res.status(400).json({ error: "Invalid status" });
  const p = (db.data.products || []).find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Not found" });
  p.status = status;
  if (status === "active") db.data.reports = (db.data.reports || []).filter((r) => r.product_id !== p.id);
  await db.write();
  res.json({ success: true });
});

export default router;