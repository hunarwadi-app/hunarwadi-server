# HUNARWADI — Working App (v1)

Yeh ek real, working full-stack app hai — mock screens nahi. Real database (JSON file), real backend (Node.js + Express), real frontend (React).

## Kaise chalayein (Terminal mein)

Aapko 2 terminal windows chahiye — ek backend ke liye, ek frontend ke liye.

### Terminal 1 — Backend
```
cd kalavad-app/server
npm install
npm start
```
Yeh `http://localhost:4000` par chalega. Terminal mein aapko dikhega: `HUNARWADI server running on http://localhost:4000`

### Terminal 2 — Frontend
```
cd kalavad-app/client
npm install
npm run dev
```
Yeh ek URL dega jaise `http://localhost:5173` — usko browser mein khol lijiye (mobile jaisa dikhega, chhota screen use karein ya browser ko resize kar lein).

**Zaroori:** Backend hamesha pehle chalu hona chahiye, tabhi frontend data dikhayega.

## Abhi kya-kya kaam karta hai (real, database-backed)

- Email se signup/login, OTP ke saath (OTP dev mode mein screen par hi dikhta hai, kyunki real email-sending service abhi connect nahi hai — Resend/Brevo jaisi free service jodni hogi taaki asli email jaaye)
- Mobile OTP abhi jaanbhoojkar nahi rakha — India mein Mobile OTP ke liye TRAI ka DLT registration (~₹7,000 one-time + per-SMS cost) chahiye hota hai. Jab app thoda established ho jaaye tab yeh future upgrade ke roop mein jod sakte hain.
- Profile setup (naam, city, location, buyer/seller/both)
- Product listing (photo upload, category, price, negotiable tag)
- Home screen par hyperlocal nearby search (5km → 10km → 20km → 50km → 100km expanding radius, jaisa Chapter 1 mein socha tha)
- Product detail, Artist profile
- **Reviews & Ratings** — koi bhi buyer (jo seller khud nahi hai) kisi product ko 1-5 star rating + comment de sakta hai. Average rating Product page, Product card, aur Artist Profile teeno jagah dikhta hai. Ek buyer ek product ko dobara review kare to purana review update ho jaata hai (duplicate/fake spam se bachne ke liye)
- Real-time-ish chat (har 2.5 second mein refresh hota hai) + price negotiation (offer bhejna, accept/reject)
- **Orders** — jab buyer chat mein deal se khush ho, wo "Confirm Order" dabata hai. Order phir 4 stages se guzarta hai: Confirmed → Preparing → Ready → Delivered. Sirf SELLER hi order aage badha sakta hai (kyunki wahi banane/pack karne ka kaam karta hai), aur sirf BUYER hi order cancel kar sakta hai (wo bhi sirf "Confirmed" stage tak). "My Orders" screen (Profile se ya Seller Dashboard se) mein dono, buyer aur seller, apne saare orders dekh sakte hain. Abhi payment iske andar nahi hai — jaisa business plan mein socha tha, MVP mein payment cash/UPI seedhe buyer-seller ke beech hoti hai, yeh feature sirf order ka STATUS track karta hai
- Wishlist
- Seller Dashboard (stats), My Products (edit status/delete)
- Sab data ek JSON file (`server/hunarwadi.json`) mein save hota hai — app band karke phir se kholne par bhi data rahega

## Server ka code structure (kaise organize hai)

```
server/
  index.js              ← main file: app setup, aur products/chats/wishlist jaisi baaki routes
  db.js                 ← database (JSON file) se connect karta hai
  routes/
    auth.js              ← sirf Email + OTP login yahan hai (alag file, taaki dhoondhna aasan ho)
    reviews.js            ← sirf Reviews & Ratings yahan hai
    orders.js              ← sirf Orders (order confirm karna, status aage badhana) yahan hai
```

Jab bhi koi naya bada feature (jaise Notifications, ya Payment) banega, usko bhi is tarah apni alag file `routes/` folder mein banayenge, taaki `index.js` bahut lamba na ho jaaye.

## Abhi kya nahi hai (aage banayenge)

- Real email-sending service (abhi OTP dev mode mein hai)
- Real-time push notifications
- Payment system (jaisa Chapter 4 mein bhi likha tha — MVP mein payment ke bina launch ho sakta hai)
- Admin panel / product approval
- AI features (Chapter 7, 10 wale)
- Fake review/fraud detection systems (Chapter 8) — abhi koi bhi buyer kabhi bhi review de sakta hai, real purchase verify nahi hota

## Tech Stack (jo actually use hua)

- Backend: Node.js + Express
- Database: JSON file (lowdb) — koi compiler/Python nahi chahiye, seedha kisi bhi computer par chal jaata hai. Future mein MongoDB ya PostgreSQL mein migrate kar sakte hain jab scale badhega
- Frontend: React (Vite)
- Photo upload: abhi browser mein hi base64 store hota hai (chhoti testing ke liye theek hai; production mein cloud storage — jaisa Chapter 4/6 mein socha tha — chahiye hoga)

Iske baad hum isi app par kaam karke isse aur behtar banayenge.
