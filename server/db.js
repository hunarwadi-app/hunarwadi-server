import { JSONFilePreset } from "lowdb/node";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const defaultData = {
  users: [],
  products: [],
  chats: [],
  messages: [],
  wishlist: [],
  reviews: [],
  orders: [],
  otps: [],
};

const db = await JSONFilePreset(path.join(__dirname, "hunarwadi.json"), defaultData);

export default db;
