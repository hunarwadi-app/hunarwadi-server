import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import db from "./db.js";
import authRouter from "./routes/auth.js";
import reviewsRouter from "./routes/reviews.js";
import ordersRouter from "./routes/orders.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Email + OTP login lives in routes/auth.js — mounted under /api/auth
app.use("/api/auth", authRouter);
// Reviews & Ratings live in routes/reviews.js — mounted under /api
app.use("/api", reviewsRouter);
// Orders live in routes/orders.js — mounted under /api
app.use("/api", ordersRouter);

const PORT = process.env.PORT || 4000;

function haversineKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findUser(id) {
  return db.data.users.find((u) => u.id === id);
}

function productRating(productId) {
  const ratings = db.data.reviews.filter((r) => r.product_id === productId).map((r) => r.rating);
  if (ratings.length === 0) return { avg_rating: null, review_count: 0 };
  const avg = Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
  return { avg_rating: avg, review_count: ratings.length };
}

// NOTE: Currently using Email + OTP (no cost, no DLT registration needed).
// Mobile + OTP can be added later once SMS/DLT setup is done (see README).
// (The actual send-otp / verify-otp routes now live in routes/auth.js)

app.get("/api/users/:id", (req, res) => {
  const user = findUser(req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

app.put("/api/users/:id", async (req, res) => {
  const user = findUser(req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  const { name, city, latitude, longitude, role, profile_photo } = req.body;
  if (name !== undefined) user.name = name;
  if (city !== undefined) user.city = city;
  if (latitude !== undefined) user.latitude = latitude;
  if (longitude !== undefined) user.longitude = longitude;
  if (role !== undefined) user.role = role;
  if (profile_photo !== undefined) user.profile_photo = profile_photo;
  await db.write();
  res.json(user);
});

app.get("/api/products", (req, res) => {
  const { lat, lng, category, q } = req.query;

  let rows = db.data.products
    .filter((p) => p.status === "active")
    .map((p) => {
      const seller = findUser(p.seller_id) || {};
      return {
        ...p,
        seller_name: seller.name,
        seller_city: seller.city,
        seller_lat: seller.latitude,
        seller_lng: seller.longitude,
        seller_verified: seller.is_verified,
        ...productRating(p.id),
      };
    });

  if (category) rows = rows.filter((r) => r.category === category);
  if (q) {
    const term = q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(term) ||
        (r.description || "").toLowerCase().includes(term) ||
        (r.category || "").toLowerCase().includes(term)
    );
  }

  const userLat = lat ? parseFloat(lat) : null;
  const userLng = lng ? parseFloat(lng) : null;

  rows = rows.map((r) => ({
    ...r,
    distance_km:
      userLat != null ? haversineKm(userLat, userLng, r.seller_lat, r.seller_lng) : null,
  }));

  if (userLat != null) {
    const radii = [5, 10, 20, 50, 100];
    let filtered = [];
    for (const radius of radii) {
      filtered = rows.filter((r) => r.distance_km != null && r.distance_km <= radius);
      if (filtered.length > 0) break;
    }
    if (filtered.length === 0) filtered = rows;
    filtered.sort((a, b) => (a.distance_km ?? 1e9) - (b.distance_km ?? 1e9));
    return res.json(filtered);
  }

  res.json(rows);
});

app.get("/api/products/:id", (req, res) => {
  const p = db.data.products.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Not found" });
  const seller = findUser(p.seller_id) || {};
  res.json({
    ...p,
    seller_name: seller.name,
    seller_city: seller.city,
    seller_lat: seller.latitude,
    seller_lng: seller.longitude,
    seller_verified: seller.is_verified,
    ...productRating(p.id),
  });
});

app.post("/api/products", async (req, res) => {
  const { seller_id, title, description, price, is_negotiable, category, photo } = req.body;
  if (!seller_id || !title) {
    return res.status(400).json({ error: "seller_id and title are required" });
  }
  const product = {
    id: nanoid(),
    seller_id,
    title,
    description: description || "",
    price: price || 0,
    is_negotiable: is_negotiable ? 1 : 0,
    category: category || "",
    photo: photo || null,
    status: "active",
    created_at: new Date().toISOString(),
  };
  db.data.products.push(product);
  await db.write();
  res.json(product);
});

app.put("/api/products/:id", async (req, res) => {
  const p = db.data.products.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Not found" });
  const { title, description, price, status, category, photo } = req.body;
  if (title !== undefined) p.title = title;
  if (description !== undefined) p.description = description;
  if (price !== undefined) p.price = price;
  if (status !== undefined) p.status = status;
  if (category !== undefined) p.category = category;
  if (photo !== undefined) p.photo = photo;
  await db.write();
  res.json(p);
});

app.delete("/api/products/:id", async (req, res) => {
  db.data.products = db.data.products.filter((x) => x.id !== req.params.id);
  await db.write();
  res.json({ success: true });
});

app.get("/api/sellers/:id/products", (req, res) => {
  const rows = db.data.products
    .filter((p) => p.seller_id === req.params.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(rows);
});

app.get("/api/sellers/:id/stats", (req, res) => {
  const sellerId = req.params.id;
  const products = db.data.products.filter((p) => p.seller_id === sellerId);
  const chats = db.data.chats.filter((c) => c.seller_id === sellerId).length;
  const orders = db.data.orders.filter((o) => o.seller_id === sellerId);
  res.json({
    total_products: products.length,
    active_products: products.filter((p) => p.status === "active").length,
    sold_products: products.filter((p) => p.status === "sold").length,
    pending_products: products.filter((p) => p.status === "pending_approval").length,
    total_chats: chats,
    total_orders: orders.length,
    pending_orders: orders.filter((o) => ["confirmed", "preparing", "ready"].includes(o.status)).length,
  });
});

app.get("/api/chats", (req, res) => {
  const { user_id } = req.query;
  const rows = db.data.chats
    .filter((c) => c.buyer_id === user_id || c.seller_id === user_id)
    .map((c) => {
      const product = db.data.products.find((p) => p.id === c.product_id);
      const buyer = findUser(c.buyer_id) || {};
      const seller = findUser(c.seller_id) || {};
      return {
        ...c,
        product_title: product?.title,
        product_photo: product?.photo,
        buyer_name: buyer.name,
        seller_name: seller.name,
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(rows);
});

app.post("/api/chats", async (req, res) => {
  const { buyer_id, seller_id, product_id } = req.body;
  let chat = db.data.chats.find(
    (c) =>
      c.buyer_id === buyer_id &&
      c.seller_id === seller_id &&
      (c.product_id || null) === (product_id || null)
  );
  if (!chat) {
    chat = {
      id: nanoid(),
      buyer_id,
      seller_id,
      product_id: product_id || null,
      created_at: new Date().toISOString(),
    };
    db.data.chats.push(chat);
    await db.write();
  }
  res.json(chat);
});

app.get("/api/chats/:id", (req, res) => {
  const chat = db.data.chats.find((c) => c.id === req.params.id);
  if (!chat) return res.status(404).json({ error: "Not found" });
  res.json(chat);
});

app.get("/api/chats/:id/messages", (req, res) => {
  const rows = db.data.messages
    .filter((m) => m.chat_id === req.params.id)
    .sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
  res.json(rows);
});

app.post("/api/chats/:id/messages", async (req, res) => {
  const { sender_id, content, message_type, offer_price } = req.body;
  const msg = {
    id: nanoid(),
    chat_id: req.params.id,
    sender_id,
    content: content || null,
    message_type: message_type || "text",
    offer_price: offer_price || null,
    offer_status: message_type === "offer" ? "pending" : null,
    sent_at: new Date().toISOString(),
    read_status: 0,
  };
  db.data.messages.push(msg);
  await db.write();
  res.json(msg);
});

app.put("/api/messages/:id/offer-status", async (req, res) => {
  const msg = db.data.messages.find((m) => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: "Not found" });
  msg.offer_status = req.body.offer_status;
  await db.write();
  res.json(msg);
});

app.get("/api/wishlist", (req, res) => {
  const { user_id } = req.query;
  const rows = db.data.wishlist
    .filter((w) => w.user_id === user_id)
    .map((w) => {
      const product = db.data.products.find((p) => p.id === w.product_id);
      return product ? { ...product, wishlist_id: w.id } : null;
    })
    .filter(Boolean);
  res.json(rows);
});

app.post("/api/wishlist", async (req, res) => {
  const { user_id, product_id } = req.body;
  const exists = db.data.wishlist.find(
    (w) => w.user_id === user_id && w.product_id === product_id
  );
  if (!exists) {
    db.data.wishlist.push({ id: nanoid(), user_id, product_id, created_at: new Date().toISOString() });
    await db.write();
  }
  res.json({ success: true });
});

app.delete("/api/wishlist", async (req, res) => {
  const { user_id, product_id } = req.body;
  db.data.wishlist = db.data.wishlist.filter(
    (w) => !(w.user_id === user_id && w.product_id === product_id)
  );
  await db.write();
  res.json({ success: true });
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`HUNARWADI server running on http://localhost:${PORT}`);
});
