import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import mongoose from "mongoose";
import fs from "fs";

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI missing (run: node --env-file=.env backup.mjs)");
  process.exit(1);
}
await mongoose.connect(process.env.MONGODB_URI, { dbName: "hunarwadi" });
const docs = await mongoose.connection.db.collection("store").find({}).toArray();
fs.mkdirSync("backups", { recursive: true });
const name = "backups/hunarwadi-" + new Date().toISOString().slice(0, 10) + ".json";
fs.writeFileSync(name, JSON.stringify(docs));
console.log("Saved " + name + " -> " + docs.map((d) => d._id + ": " + (Array.isArray(d.items) ? d.items.length : "?")).join(", "));
await mongoose.disconnect();
process.exit(0);