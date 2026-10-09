import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import db from "./db.js";
import authRouter from "./routes/auth.js";
import reviewsRouter from "./routes/reviews.js";
import uploadRouter from "./routes/upload.js";
import ordersRouter from "./routes/orders.js";
import accountRouter from "./routes/account.js";
import { checkToken } from "./routes/middleware/auth.js";

const app = express();

app.set("trust proxy", 1);

app.use(cors());
app.use(express.json({ limit: "1mb" }));
const stripCoords = (v) => {
  if (Array.isArray(v)) return v.map(stripCoords);
  if (v && typeof v === "object") {
    const o = {};
    for (const k of Object.keys(v)) { if (k === "seller_lat" || k === "seller_lng") continue; o[k] = stripCoords(v[k]); }
    return o;
  }
  return v;
};
app.use((req, res, next) => { const orig = res.json.bind(res); res.json = (b) => orig(stripCoords(b)); next(); });

const CLOUDINARY_PREFIX = "https://res.cloudinary.com/scipmep8/";

app.use("/api/auth", authRouter);
app.use("/api", reviewsRouter);
app.use("/api", uploadRouter);
app.use("/api", ordersRouter);
app.use("/api", accountRouter);

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
  const ratings = (db.data.reviews || []).filter((r) => r.product_id === productId).map((r) => r.rating);
  if (ratings.length === 0) return { avg_rating: null, review_count: 0 };
  const avg = Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
  return { avg_rating: avg, review_count: ratings.length };
}

app.get("/api/users/:id", checkToken, (req, res) => {
  if (req.params.id !== req.userId) {
    const o = findUser(req.params.id);
    if (!o) return res.status(404).json({ error: "Not found" });
    return res.json({ id: o.id, name: o.name, city: o.city, role: o.role, is_verified: o.is_verified, profile_photo: o.profile_photo, created_at: o.created_at });
  }
  const user = findUser(req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(req.userId === user.id ? user : { ...user, email: undefined });
});

app.put("/api/users/:id", checkToken, async (req, res) => {
  if (req.params.id !== req.userId) return res.status(403).json({ error: "Not allowed" });
  const user = findUser(req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  const { name, city, latitude, longitude, role, profile_photo } = req.body;
  const badStr = (v, max) => v !== undefined && (typeof v !== "string" || v.length > max);
  if (badStr(name, 60) || badStr(city, 60) || badStr(role, 20)) return res.status(400).json({ error: "Invalid name, city or role" });
  const badNum = (v, lim) => v !== undefined && v !== null && !(Number.isFinite(Number(v)) && Math.abs(Number(v)) <= lim);
  if (badNum(latitude, 90) || badNum(longitude, 180)) return res.status(400).json({ error: "Invalid location" });
  if (profile_photo !== undefined && profile_photo !== null && profile_photo !== "" && (typeof profile_photo !== "string" || !profile_photo.startsWith(CLOUDINARY_PREFIX))) return res.status(400).json({ error: "Invalid profile photo" });
  if (name !== undefined) user.name = name;
  if (city !== undefined) user.city = city;
  if (latitude !== undefined) user.latitude = latitude;
  if (longitude !== undefined) user.longitude = longitude;
  if (role !== undefined) user.role = role;
  if (profile_photo !== undefined) user.profile_photo = profile_photo;
  await db.write();
  res.json(req.userId === user.id ? user : { ...user, email: undefined });
});

app.get("/api/products", (req, res) => {
  const { lat, lng, category, q } = req.query;

  let rows = (db.data.products || [])
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
  const p = (db.data.products || []).find((x) => x.id === req.params.id);
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

app.post("/api/products", checkToken, async (req, res) => {
  const { title, description, price, is_negotiable, category, photo, photos } = req.body;
  const seller_id = req.userId;
  if (!seller_id || !title) {
    return res.status(400).json({ error: "seller_id and title are required" });
  }

  const okUrl = (u) => typeof u === "string" && u.startsWith(CLOUDINARY_PREFIX);
  if (photos !== undefined && (!Array.isArray(photos) || photos.length > 5 || !photos.every(okUrl))) {
    return res.status(400).json({ error: "Invalid photos list (max 5 Cloudinary URLs)." });
  }
  if (photo && !okUrl(photo)) {
    return res.status(400).json({ error: "Invalid photo URL. Must be hosted on Cloudinary." });
  }

  const product = {
    id: nanoid(),
    seller_id,
    title,
    description: description || "",
    price: price || 0,
    is_negotiable: is_negotiable ? 1 : 0,
    category: category || "",
    photo: (Array.isArray(photos) && photos.length ? photos[0] : photo) || null,
    photos: Array.isArray(photos) ? photos : (photo ? [photo] : []),
    status: "active",
    created_at: new Date().toISOString(),
  };
  if (!db.data.products) db.data.products = [];
  db.data.products.push(product);
  await db.write();
  res.json(product);
});

app.put("/api/products/:id", checkToken, async (req, res) => {
  const p = (db.data.products || []).find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Not found" });
  if (p.seller_id !== req.userId) return res.status(403).json({ error: "Not your product" });
  const { title, description, price, status, category, photo, photos } = req.body;

  if (photo !== undefined && photo !== null && photo !== "") {
    if (typeof photo !== "string" || !photo.startsWith(CLOUDINARY_PREFIX)) {
      return res.status(400).json({ error: "Invalid photo URL. Must be hosted on Cloudinary." });
    }
    p.photo = photo;
  }

  if (photos !== undefined) {
    if (!Array.isArray(photos) || photos.length > 5 || !photos.every((u) => typeof u === "string" && u.startsWith(CLOUDINARY_PREFIX))) {
      return res.status(400).json({ error: "Invalid photos list (max 5 Cloudinary URLs)." });
    }
    p.photos = photos;
    if (photos[0]) p.photo = photos[0];
  }
  if (title !== undefined) p.title = title;
  if (description !== undefined) p.description = description;
  if (price !== undefined) p.price = price;
  if (status !== undefined) p.status = status;
  if (category !== undefined) p.category = category;

  await db.write();
  res.json(p);
});

app.delete("/api/products/:id", checkToken, async (req, res) => {
  const found = (db.data.products || []).find((x) => x.id === req.params.id);
  if (!found) return res.status(404).json({ error: "Not found" });
  if (found.seller_id !== req.userId) return res.status(403).json({ error: "Not your product" });
  db.data.products = (db.data.products || []).filter((x) => x.id !== req.params.id);
  await db.write();
  res.json({ success: true });
});

app.get("/api/sellers/:id/products", (req, res) => {
  const rows = (db.data.products || [])
    .filter((p) => p.seller_id === req.params.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(rows);
});

app.get("/api/sellers/:id/stats", checkToken, (req, res) => {
  if (req.params.id !== req.userId) return res.status(403).json({ error: "Not allowed" });
  const sellerId = req.params.id;
  const products = (db.data.products || []).filter((p) => p.seller_id === sellerId);
  const chats = (db.data.chats || []).filter((c) => c.seller_id === sellerId).length;
  const orders = (db.data.orders || []).filter((o) => o.seller_id === sellerId);
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

app.get("/api/chats", checkToken, (req, res) => {
  const user_id = req.userId;
  const rows = (db.data.chats || [])
    .filter((c) => c.buyer_id === user_id || c.seller_id === user_id)
    .map((c) => {
      const product = (db.data.products || []).find((p) => p.id === c.product_id);
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

app.post("/api/chats", checkToken, async (req, res) => {
  const buyer_id = req.userId;
  const { seller_id, product_id } = req.body;
  if (!seller_id || typeof seller_id !== "string") return res.status(400).json({ error: "seller_id required" });
  if (seller_id === buyer_id) return res.status(400).json({ error: "You cannot chat with yourself" });
  const sellerUser = findUser(seller_id);
  if (!sellerUser) return res.status(404).json({ error: "Seller not found" });
  const buyerUser = findUser(buyer_id);
  if ((sellerUser.blocked_users || []).includes(buyer_id) || ((buyerUser && buyerUser.blocked_users) || []).includes(seller_id)) return res.status(403).json({ error: "You cannot chat with this user" });
  if (product_id) {
    const prodForChat = (db.data.products || []).find((x) => x.id === product_id);
    if (!prodForChat || prodForChat.seller_id !== seller_id) return res.status(400).json({ error: "Invalid product for this seller" });
  }
  if (!db.data.chats) db.data.chats = [];
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

app.get("/api/chats/:id", checkToken, (req, res) => {
  const chat = (db.data.chats || []).find((c) => c.id === req.params.id);
  if (!chat) return res.status(404).json({ error: "Not found" });
  if (chat.buyer_id !== req.userId && chat.seller_id !== req.userId) return res.status(403).json({ error: "Not allowed" });
  res.json(chat);
});

app.get("/api/chats/:id/messages", checkToken, (req, res) => {
  const chat = (db.data.chats || []).find((c) => c.id === req.params.id);
  if (!chat || (chat.buyer_id !== req.userId && chat.seller_id !== req.userId)) return res.status(403).json({ error: "Not allowed" });
  const rows = (db.data.messages || [])
    .filter((m) => m.chat_id === req.params.id)
    .sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
  res.json(rows);
});

app.post("/api/chats/:id/messages", checkToken, async (req, res) => {
  const chat = (db.data.chats || []).find((c) => c.id === req.params.id);
  if (!chat || (chat.buyer_id !== req.userId && chat.seller_id !== req.userId)) return res.status(403).json({ error: "Not allowed" });
  const sender_id = req.userId;
  const otherId = chat.buyer_id === sender_id ? chat.seller_id : chat.buyer_id;
  const meUser = findUser(sender_id);
  const otherUser = findUser(otherId);
  if (((meUser && meUser.blocked_users) || []).includes(otherId) || ((otherUser && otherUser.blocked_users) || []).includes(sender_id)) return res.status(403).json({ error: "You cannot message this user" });
  const { content, message_type, offer_price } = req.body;
  if (message_type !== undefined && !["text", "offer"].includes(message_type)) return res.status(400).json({ error: "Invalid message type" });
  if (message_type === "offer") {
    const op = Number(offer_price);
    const prod = (db.data.products || []).find((x) => x.id === chat.product_id);
    if (!Number.isFinite(op) || op <= 0) return res.status(400).json({ error: "Invalid offer price" });
    if (!prod || !prod.is_negotiable) return res.status(400).json({ error: "This product is not negotiable" });
  }
  if ((message_type || "text") === "text" && !(typeof content === "string" && content.trim())) return res.status(400).json({ error: "Message is empty" });
  const msg = {
    id: nanoid(),
    chat_id: req.params.id,
    sender_id,
    content: typeof content === "string" && content.trim() ? content.trim().slice(0, 1000) : null,
    message_type: message_type || "text",
    offer_price: message_type === "offer" ? Number(offer_price) : null,
    offer_status: message_type === "offer" ? "pending" : null,
    sent_at: new Date().toISOString(),
    read_status: 0,
  };
  if (!db.data.messages) db.data.messages = [];
  db.data.messages.push(msg);
  await db.write();
  res.json(msg);
});

app.put("/api/messages/:id/offer-status", checkToken, async (req, res) => {
  const msg = (db.data.messages || []).find((m) => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: "Not found" });
  const mchat = (db.data.chats || []).find((c) => c.id === msg.chat_id);
  if (!mchat || (mchat.buyer_id !== req.userId && mchat.seller_id !== req.userId)) return res.status(403).json({ error: "Not allowed" });
  const newStatus = req.body.offer_status;
  if (msg.message_type !== "offer") return res.status(400).json({ error: "Not an offer" });
  if (msg.sender_id === req.userId) return res.status(403).json({ error: "Cannot respond to your own offer" });
  if (msg.offer_status !== "pending") return res.status(400).json({ error: "Offer already decided" });
  if (!["accepted", "rejected"].includes(newStatus)) return res.status(400).json({ error: "Invalid status" });
  msg.offer_status = newStatus;
  await db.write();
  res.json(msg);
});

app.get("/api/wishlist", checkToken, (req, res) => {
  const user_id = req.userId;
  const rows = (db.data.wishlist || [])
    .filter((w) => w.user_id === user_id)
    .map((w) => {
      const product = (db.data.products || []).find((p) => p.id === w.product_id);
      return product ? { ...product, wishlist_id: w.id } : null;
    })
    .filter(Boolean);
  res.json(rows);
});

app.post("/api/wishlist", checkToken, async (req, res) => {
  const user_id = req.userId;
  const { product_id } = req.body;
  if (!db.data.wishlist) db.data.wishlist = [];
  const exists = db.data.wishlist.find(
    (w) => w.user_id === user_id && w.product_id === product_id
  );
  if (!exists) {
    db.data.wishlist.push({ id: nanoid(), user_id, product_id, created_at: new Date().toISOString() });
    await db.write();
  }
  res.json({ success: true });
});

app.delete("/api/wishlist", checkToken, async (req, res) => {
  const user_id = req.userId;
  const { product_id } = req.body;
  db.data.wishlist = (db.data.wishlist || []).filter(
    (w) => !(w.user_id === user_id && w.product_id === product_id)
  );
  await db.write();
  res.json({ success: true });
});

app.post("/api/reports", checkToken, async (req, res) => {
  const { product_id, reason } = req.body;
  const product = (db.data.products || []).find((p) => p.id === product_id);
  if (!product) return res.status(404).json({ error: "Not found" });
  if (product.seller_id === req.userId) return res.status(400).json({ error: "You cannot report your own product" });
  if (!db.data.reports) db.data.reports = [];
  const already = db.data.reports.find((r) => r.product_id === product_id && r.reporter_id === req.userId);
  if (!already) {
    db.data.reports.push({
      id: nanoid(),
      product_id,
      reporter_id: req.userId,
      reason: String(reason || "other").slice(0, 100),
      created_at: new Date().toISOString(),
    });
    const count = db.data.reports.filter((r) => r.product_id === product_id).length;
    if (count >= 3 && product.status === "active") product.status = "under_review";
    await db.write();
  }
  res.json({ success: true });
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`HUNARWADI server running on http://localhost:${PORT}`);
});
