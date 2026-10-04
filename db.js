import dns from 'dns';
dns.setServers(['8.8.8.8','1.1.1.1']);
import mongoose from "mongoose";

const defaultData = {
  users: [],
  products: [],
  chats: [],
  messages: [],
  wishlist: [],
  reviews: [],
  orders: [],
  otps: [],
  reports: [],
};

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI nahi mila (.env ya Render env check karein)");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI, { dbName: "hunarwadi" });
console.log("MongoDB se judd gaya OK");

const Store = mongoose.model(
  "Store",
  new mongoose.Schema(
    { _id: String, items: mongoose.Schema.Types.Mixed },
    { collection: "store", minimize: false }
  )
);

const data = {};
const snapshot = {};

for (const key of Object.keys(defaultData)) {
  const doc = await Store.findById(key).lean();
  if (doc) {
    data[key] = doc.items || [];
  } else {
    data[key] = [];
    await Store.create({ _id: key, items: [] });
    console.log(`Naya database record bana: ${key}`);
  }
  snapshot[key] = JSON.stringify(data[key]);
}

let queue = Promise.resolve();

const db = {
  data,
  write() {
    const run = queue.then(async () => {
      for (const key of Object.keys(defaultData)) {
        const current = db.data[key] ?? [];
        const str = JSON.stringify(current);
        if (str !== snapshot[key]) {
          await Store.updateOne(
            { _id: key },
            { $set: { items: current } },
            { upsert: true }
          );
          snapshot[key] = str;
        }
      }
    });
    queue = run.catch(() => {});
    return run;
  },
};

export default db;

