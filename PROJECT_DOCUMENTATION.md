# HUNARWADI — पूरे Project की Complete Documentation

यह document इसलिए बनाया गया है ताकि कोई भी इंसान — या कोई भी AI tool — इसे पढ़कर पूरी तरह समझ जाए कि यह project क्या है, कैसे काम करता है, और हर file के अंदर क्या है। अगर आप इसे किसी और AI (ChatGPT, Gemini, या किसी और Claude session) को दिखाएं, तो यह उन्हें पूरा context दे देगा।

---

## 1. यह Project क्या है (एक लाइन में)

**HUNARWADI** एक Hyperlocal Artist & Creator Marketplace है — यानी एक ऐसा app जहाँ handmade सामान बनाने वाले local artists (जैसे jewellery makers, painters, potters) अपने आसपास रहने वाले customers से सीधे जुड़ सकते हैं, बिना किसी बिचौलिये (middleman) के। इसका core idea यह है कि customer को सबसे पहले उसके सबसे नज़दीक के artist दिखें (जैसे 5 km के अंदर वाले पहले, फिर धीरे-धीरे radius बढ़े 10, 20, 50, 100 km तक)।

---

## 2. Project दो हिस्सों में बंटा है — क्यों?

```
Browser (यूज़र देखता है)  ⇄  Backend Server (डेटा संभालता है)  ⇄  Database (JSON file)
        client/                      server/
```

आधुनिक apps लगभग हमेशा दो हिस्सों में बनते हैं:

- **Frontend (client folder)** — यह वो हिस्सा है जो असल में स्क्रीन पर दिखता है: बटन, screens, रंग, design। यह browser में चलता है।
- **Backend (server folder)** — यह "पर्दे के पीछे" काम करने वाला हिस्सा है: login करना, डेटा save करना, डेटा ढूंढना, hisाब लगाना (जैसे distance calculate करना)। यह आपके computer पर एक अलग process के रूप में चलता है।

यह दोनों आपस में **API** के ज़रिए बात करते हैं — API का मतलब है एक तय किया हुआ तरीका जिससे frontend, backend से डेटा माँगता है (जैसे "मुझे सारे products दिखाओ") और backend जवाब में डेटा भेजता है।

**सोचने का आसान तरीका:** Frontend एक वेटर है (ग्राहक से बात करता है), Backend रसोई है (असली काम वहाँ होता है), और Database वो जगह है जहाँ सामान (राशन) रखा है।

---

## 3. पूरा Folder Structure (नक्शा)

```
kalavad-app/
│
├── README.md                    ← Project कैसे चलाएं, इसकी जानकारी
│
├── server/                      ← BACKEND (रसोई)
│   ├── index.js                 ← Main file — app शुरू करती है, ज़्यादातर routes यहीं हैं
│   ├── db.js                    ← Database से जुड़ने का रास्ता
│   ├── hunarwadi.json             ← असली Database (यह सिर्फ तभी दिखेगी जब app एक बार चल चुकी हो)
│   ├── package.json             ← किन-किन libraries की ज़रूरत है, उसकी list
│   ├── package-lock.json        ← Exact versions लॉक करने वाली file (automatic बनती है)
│   └── routes/                  ← अलग-अलग features के अलग-अलग "sub-files"
│       ├── auth.js              ← सिर्फ Email + OTP Login का code
│       └── reviews.js           ← सिर्फ Reviews & Ratings का code
│
└── client/                      ← FRONTEND (वेटर)
    ├── index.html                ← सबसे पहली HTML file (यहीं से पूरा app शुरू होता है)
    ├── package.json              ← Frontend को किन libraries की ज़रूरत है
    ├── vite.config.js            ← Vite (जो tool app को चलाता/बनाता है) की settings
    └── src/
        ├── main.jsx               ← App की सबसे पहली line, यहीं से सब शुरू होता है
        ├── App.jsx                ← बताता है कौन सी screen कब दिखे (routing/नक्शा)
        ├── api.js                 ← Backend से बात करने के सारे तरीके यहाँ इकट्ठे हैं
        ├── AuthContext.jsx        ← याद रखता है कि अभी कौन login है (पूरे app में)
        ├── styles.css             ← सारा design (रंग, फॉन्ट, spacing) यहीं है
        │
        ├── components/            ← छोटे reusable टुकड़े, जो कई screens में दोहराए जाते हैं
        │   ├── BottomNav.jsx       ← नीचे वाला Home/Search/Chats/Wishlist/Profile bar
        │   ├── ProductCard.jsx     ← एक product का छोटा box (grid में दिखने वाला)
        │   └── StarRating.jsx      ← ⭐ rating दिखाने वाला छोटा टुकड़ा
        │
        └── pages/                 ← हर पूरी screen अपनी अलग file में
            ├── Welcome.jsx         ← सबसे पहली screen (3 slides + Get Started)
            ├── Login.jsx           ← Email डालने वाली screen
            ├── VerifyOtp.jsx       ← OTP डालने वाली screen
            ├── LocationPermission.jsx  ← Location allow करने वाली screen
            ├── ProfileSetup.jsx    ← नाम/city/role भरने वाली screen
            ├── Home.jsx            ← मुख्य screen (search, categories, products)
            ├── Search.jsx          ← अलग से search करने वाली screen
            ├── ProductDetail.jsx   ← एक product खोलने पर (सबसे बड़ी/detailed file)
            ├── ArtistProfile.jsx   ← किसी artist/seller की पूरी profile
            ├── ChatList.jsx        ← सारी chats की list
            ├── Chat.jsx            ← एक chat के अंदर (messages + offer)
            ├── Wishlist.jsx        ← Saved/❤️ किए हुए products
            ├── AddProduct.jsx      ← नया product डालने का 4-step form
            ├── MyProducts.jsx      ← Seller के अपने products (edit/delete)
            ├── SellerDashboard.jsx ← Seller के stats (total products, earnings वगैरह)
            └── Profile.jsx         ← अपनी profile + settings + logout
```

---

## 4. SERVER (Backend) — हर file अंदर क्या है

### 4.1 `server/package.json`
यह बताता है कि इस backend को चलाने के लिए किन बाहरी libraries (packages) की ज़रूरत है। जब आप `npm install` चलाते हैं, यह वही file पढ़कर सारी ज़रूरी चीज़ें डाउनलोड करता है। इसमें लिखा है:
- **express** — यह वो library है जो असल में server बनाती है (यानी "कोई मुझसे बात करे तो मैं जवाब दूँ" वाला काम)
- **cors** — Security वाली एक चीज़, यह frontend को backend से बात करने की इजाज़त देती है
- **lowdb** — हमारा database engine (JSON file वाला)
- **nanoid** — Random unique ID (जैसे product ID, user ID) बनाने के लिए
- **multer** — Photo/file upload संभालने के लिए (अभी पूरी तरह इस्तेमाल नहीं हो रहा, भविष्य के लिए रखा है)

### 4.2 `server/db.js`
यह file database को "शुरू" करती है। इसमें लिखा है कि database की shape (structure) कैसी होगी — शुरुआत में यह खाली रहेगा:
```js
{
  users: [],       // सारे users (buyers + sellers)
  products: [],    // सारे products
  chats: [],       // सारी chat conversations
  messages: [],    // हर chat के अंदर के messages
  wishlist: [],    // किसने कौन सा product save किया
  reviews: [],     // सारी reviews/ratings
  otps: [],        // अभी के pending OTPs (login के लिए)
}
```
यह सब कुछ एक file में लिख/पढ़ता रहता है — `server/hunarwadi.json`। जब भी कोई नया user बनता है, या कोई नया product डाला जाता है, यह सब इसी file में स्थायी रूप से save हो जाता है। App बंद करके फिर से खोलने पर भी यह डेटा वहीं रहता है।

### 4.3 `server/routes/auth.js` — Email Login का पूरा Logic

यह file 2 काम (routes/endpoints) provide करती है:

**a) `POST /api/auth/send-otp`** — जब कोई अपना email डालकर "Send OTP" दबाता है:
1. पहले check करता है कि email सही format में है या नहीं (जैसे `xyz@gmail.com` वाला pattern)
2. एक random 6-digit number (OTP) बनाता है
3. उसे database में उस email के साथ save करता है, साथ में एक "expiry time" (5 मिनट बाद यह OTP बेकार हो जाएगा)
4. **अभी असली email नहीं भेजी जाती** (क्योंकि कोई paid email service अभी connect नहीं है) — इसीलिए OTP सीधे जवाब (response) में वापस भेज दिया जाता है, ताकि आप screen पर देखकर test कर सकें। जब असली launch होगा, यहीं पर Resend/Brevo जैसी service का code जुड़ेगा जो असली email भेजेगी।

**b) `POST /api/auth/verify-otp`** — जब कोई OTP डालकर "Verify" दबाता है:
1. Database में check करता है कि यह OTP सही है और अभी तक expire नहीं हुआ
2. अगर सही है — check करता है कि यह email पहले से किसी user का है या नहीं
   - अगर **नया** email है → एक नया user account बना देता है (signup)
   - अगर **पुराना** email है → उसी user को login करा देता है
3. User की पूरी जानकारी (id, name, city वगैरह) वापस भेज देता है

### 4.4 `server/routes/reviews.js` — Reviews & Ratings का पूरा Logic

यह file 3 काम provide करती है:

**a) `POST /api/reviews`** — जब कोई buyer star rating + comment submit करता है:
1. Check करता है कि rating 1 से 5 के बीच है
2. Check करता है कि जो व्यक्ति review दे रहा है, वही उस product का seller तो नहीं है (seller अपने ही product को rate नहीं कर सकता)
3. अगर उस buyer ने पहले भी इसी product को review किया था — तो पुराना review **update** हो जाता है (नया अलग से नहीं बनता, ताकि एक ही व्यक्ति बार-बार fake reviews न दे सके)
4. नहीं तो एक नया review record बन जाता है

**b) `GET /api/products/:id/reviews`** — किसी एक product की सारी reviews और average rating निकालने के लिए। (यह सारी reviews की list, average rating, और कुल कितनी reviews हैं — तीनों एक साथ भेजता है)

**c) `GET /api/sellers/:id/rating`** — किसी seller के **सारे products मिलाकर** overall average rating निकालने के लिए (Artist Profile screen पर दिखता है)

### 4.5 `server/index.js` — Main File (बाकी सब कुछ यहीं है)

यह file सबसे पहले `auth.js` और `reviews.js` को import करके जोड़ती है:
```js
app.use("/api/auth", authRouter);      // सारे /api/auth/... वाले routes auth.js में जाएंगे
app.use("/api", reviewsRouter);        // /api/reviews, /api/products/:id/reviews वगैरह reviews.js में जाएंगे
```

इसके बाद इसी file में बाकी सारे features हैं:

- **Users** — किसी user की profile निकालना (`GET /api/users/:id`) या update करना (`PUT /api/users/:id`) — जैसे नाम, city, location, role (buyer/seller) सेव करना
- **Products** —
  - सारे products की list निकालना, साथ में **hyperlocal distance calculation**: अगर user का location पता है, तो हर product की distance निकाली जाती है (haversine formula नाम का एक गणितीय तरीका, जो धरती की गोलाई को ध्यान में रखते हुए दो जगहों के बीच की दूरी निकालता है)। फिर 5km, 10km, 20km, 50km, 100km — इस क्रम में देखा जाता है कि कहाँ पर्याप्त products मिल जाते हैं, वहीं रोक दिया जाता है (यह बिल्कुल वही logic है जो आपके Chapter 1 वाले business plan में लिखा था)
  - एक product की पूरी detail निकालना (साथ में उसकी rating भी जोड़ी जाती है)
  - नया product बनाना, existing को update करना (जैसे "sold" mark करना), या delete करना
  - किसी seller के सारे products निकालना
  - किसी seller के stats (कुल products, active, sold, कितनी chats) निकालना
- **Chats & Messages** —
  - किसी user की सारी chats की list
  - एक नई chat शुरू करना (या पहले से मौजूद हो तो वही वापस देना, ताकि एक ही buyer-seller-product combination की डुप्लीकेट chat न बने)
  - किसी chat के सारे messages निकालना
  - नया message भेजना — text वाला भी, offer (price negotiation) वाला भी
  - Offer को accept/reject करना
- **Wishlist** — किसी user की saved products की list, कोई नया product save करना, या हटाना

सबसे नीचे एक `haversineKm()` नाम का function है जो असल में distance निकालने का गणित करता है, और एक `productRating()` function है जो किसी product की average rating निकालता है।

---

## 5. CLIENT (Frontend) — हर file अंदर क्या है

### 5.1 Bunyaadi (Foundation) Files

**`client/index.html`** — यह सबसे पहली file है जो browser खोलता है। इसमें ज़्यादा कुछ नहीं है, बस title, फॉन्ट (Fraunces और Inter — जो हमने चुने थे craft/handmade वाली feeling के लिए), और एक खाली `<div id="root">` जहाँ पूरा React app अपने आप "inject" हो जाता है।

**`client/src/main.jsx`** — यह पहली JavaScript line है जो चलती है। यह सिर्फ इतना कहती है: "App.jsx वाले पूरे component को उस खाली div के अंदर रेंडर (render) कर दो।"

**`client/src/App.jsx`** — यह पूरे app का "नक्शा/GPS" है। इसमें हर screen का एक "पता" (route/URL path) लिखा है, जैसे:
```js
<Route path="/home" element={<Protected><Home /></Protected>} />
<Route path="/product/:id" element={<Protected><ProductDetail /></Protected>} />
```
`<Protected>` का मतलब है — यह screen सिर्फ तभी दिखेगी जब कोई login हो, नहीं तो सीधा Welcome screen पर भेज देगा।

**`client/src/api.js`** — यहाँ हर तरह के backend को data माँगने/भेजने के तरीके इकट्ठे हैं। जैसे:
```js
getProducts: (params) => ...   // सारे products लाना
sendOtp: (email) => ...        // OTP भेजना
submitReview: (data) => ...    // Review submit करना
```
हर page (screen) इसी file के ज़रिए backend से बात करता है — सीधे नहीं करता। इससे फायदा यह है कि अगर कभी backend का पता (URL) बदलना हो, तो सिर्फ इसी एक file में बदलाव करना पड़ेगा, हर page में नहीं।

**`client/src/AuthContext.jsx`** — यह "याद रखने" वाली जगह है कि अभी कौन login है। जब कोई login करता है, उसकी जानकारी यहाँ save हो जाती है (browser की `localStorage` में भी, ताकि page refresh होने पर भी login याद रहे)। कोई भी screen `useAuth()` बोलकर पूछ सकती है "अभी कौन login है?"

**`client/src/styles.css`** — पूरे app का रंग-रूप यहीं तय होता है:
- रंग (जैसे `--clay: #C1512B` जो हमारा मुख्य terracotta रंग है)
- फॉन्ट (`Fraunces` headings के लिए, `Inter` normal text के लिए)
- Buttons, cards, inputs — इन सबकी generic styling यहीं है, ताकि हर screen पर एक जैसा दिखे

### 5.2 Components (छोटे Reusable टुकड़े)

**`components/BottomNav.jsx`** — नीचे वाला Home/Search/Chats/Wishlist/Profile bar। यह हर main screen के नीचे दोहराया जाता है, इसीलिए एक अलग छोटी file में रखा गया ताकि 5 अलग-अलग जगह एक जैसा code कॉपी-पेस्ट न करना पड़े।

**`components/ProductCard.jsx`** — एक product का छोटा box, जो grid में दिखता है (photo, नाम, कीमत, rating, distance)। Home screen, Search, Wishlist, Artist Profile — सब जगह यही एक file इस्तेमाल होती है।

**`components/StarRating.jsx`** — ⭐⭐⭐⭐☆ जैसा rating दिखाने वाला छोटा टुकड़ा। यह भी 3 जगह (Product card, Product Detail, Artist Profile) दोहराया जाता है, इसीलिए अलग file।

### 5.3 Pages (हर पूरी Screen)

हर file नीचे एक जैसे pattern में काम करती है:
1. Page खुलते ही ज़रूरी data backend से मांगती है (`api.js` के ज़रिए)
2. उस data को screen पर दिखाती है
3. जब user कोई बटन दबाए (जैसे "Send OTP", "Save", "Chat Now") — फिर से backend को बताती है क्या करना है

| File | क्या करती है |
|---|---|
| `Welcome.jsx` | पहली screen — logo, tagline, 3 slides, "Get Started" बटन |
| `Login.jsx` | Email input लेती है, `sendOtp` बुलाती है, फिर OTP screen पर भेज देती है |
| `VerifyOtp.jsx` | 6 digit OTP input, `verifyOtp` बुलाती है। सही होने पर अगर नया user है तो Location Permission पर, नहीं तो सीधे Home पर भेजती है |
| `LocationPermission.jsx` | Browser से location माँगती है (GPS coordinates), फिर Profile Setup पर भेजती है |
| `ProfileSetup.jsx` | नाम, city, role (buyer/seller/both) लेकर backend में save करती है |
| `Home.jsx` | Search bar, categories, नज़दीकी products — यह मुख्य screen है, यहीं hyperlocal search का असली इस्तेमाल दिखता है |
| `Search.jsx` | अलग से खोजने के लिए, जब कोई खास चीज़ ढूंढनी हो |
| `ProductDetail.jsx` | सबसे बड़ी file — product की पूरी जानकारी, seller की जानकारी, Chat/Offer बटन, और अब Reviews section भी |
| `ArtistProfile.jsx` | एक artist की पूरी profile — नाम, city, overall rating, उनके सारे products |
| `ChatList.jsx` | सारी अलग-अलग chats की list |
| `Chat.jsx` | एक chat के अंदर के messages, text भेजना, offer भेजना/accept-reject करना |
| `Wishlist.jsx` | Saved products |
| `AddProduct.jsx` | 4 steps में नया product बनाना (Photo → Details → Category → Price) |
| `MyProducts.jsx` | Seller अपने products manage करता है (sold mark करना, delete करना) |
| `SellerDashboard.jsx` | Seller के आँकड़े (कितने products, कितनी sold, कितनी chats) |
| `Profile.jsx` | अपनी जानकारी, Seller Dashboard का शॉर्टकट, Logout |

---

## 6. एक पूरा उदाहरण — शुरू से आखिर तक (Review देने का उदाहरण)

यह समझना सबसे अच्छा तरीका है कि पूरा system कैसे मिलकर काम करता है:

1. User `ProductDetail.jsx` खोलता है → वह screen `api.getProductReviews(id)` बुलाती है
2. `api.js`, backend को request भेजता है: `GET http://localhost:4000/api/products/xyz123/reviews`
3. यह request `server/index.js` में होते हुए `server/routes/reviews.js` तक पहुँचती है (क्योंकि हमने `app.use("/api", reviewsRouter)` लिखा है)
4. `reviews.js` अंदर `db.data.reviews` से जुड़ी सारी reviews निकालता है, average निकालता है, वापस भेज देता है
5. `ProductDetail.jsx` को यह data मिलता है, वह उसे "⭐ 4.5 (12)" जैसा दिखा देती है

जब user "⭐ Rate this product" दबाकर rating देता है:
1. `ProductDetail.jsx`, `api.submitReview({...})` बुलाती है
2. यह `POST /api/reviews` request भेजता है, जो `reviews.js` में जाकर rating को database में save कर देता है
3. फिर screen अपने आप फिर से data मंगाकर नई rating दिखा देती है

---

## 7. महत्वपूर्ण Concepts जो समझना ज़रूरी है

- **API/Route** — एक तय किया गया "पता" (जैसे `/api/products`) जिस पर backend कोई खास काम करता है
- **Database (JSON file)** — सारा data यहाँ स्थायी रूप से रहता है, app बंद होने पर भी नहीं मिटता
- **Component (React)** — UI का कोई भी दोहराया जाने वाला टुकड़ा (जैसे ProductCard) जो कई जगह इस्तेमाल होता है
- **State** — किसी screen की "अभी की स्थिति" (जैसे OTP डिजिट्स क्या हैं, कौन सा product खुला है) — यह react के `useState` से manage होती है
- **Modular Structure** — बड़े code को छोटी-छोटी अलग-अलग files में तोड़ना (जैसे `auth.js`, `reviews.js` अलग रखना), ताकि आगे चलकरढूँढना और बदलना आसान रहे

---

इस document को आप किसी भी दूसरे AI tool को दे सकते हैं — यह उन्हें पूरा context दे देगा कि आपका project क्या है, कैसे बना है, और कहाँ क्या है।
