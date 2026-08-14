import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import StarRating from "../components/StarRating";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [reviews, setReviews] = useState({ reviews: [], average: null, count: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    const p = await api.getProduct(id);
    setProduct(p);
    const r = await api.getProductReviews(id);
    setReviews(r);
    if (user) {
      const wishlist = await api.getWishlist(user.id);
      setInWishlist(wishlist.some((w) => w.id === id));
    }
  };

  if (!product) return <div className="screen">Loading...</div>;

  const isOwnProduct = product.seller_id === user?.id;
  const myExistingReview = reviews.reviews.find((r) => r.buyer_id === user?.id);

  const toggleWishlist = async () => {
    if (inWishlist) {
      await api.removeWishlist(user.id, id);
    } else {
      await api.addWishlist(user.id, id);
    }
    setInWishlist(!inWishlist);
  };

  const startChat = async () => {
    const chat = await api.createChat({
      buyer_id: user.id,
      seller_id: product.seller_id,
      product_id: product.id,
    });
    navigate(`/chat/${chat.id}`);
  };

  const sendOffer = async () => {
    if (!offerAmount) return;
    const chat = await api.createChat({
      buyer_id: user.id,
      seller_id: product.seller_id,
      product_id: product.id,
    });
    await api.sendMessage(chat.id, {
      sender_id: user.id,
      message_type: "offer",
      offer_price: parseFloat(offerAmount),
      content: `Offer: ₹${offerAmount}`,
    });
    setShowOffer(false);
    navigate(`/chat/${chat.id}`);
  };

  const submitReview = async () => {
    await api.submitReview({
      product_id: id,
      buyer_id: user.id,
      rating: myRating,
      comment: myComment,
    });
    setShowReviewForm(false);
    setMyComment("");
    load();
  };

  return (
    <div className="screen no-pad-bottom" style={{ paddingTop: 20 }}>
      <div className="top-bar">
        <span className="back" onClick={() => navigate(-1)}>←</span>
      </div>

      <div className="card" style={{ aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60, marginBottom: 16, overflow: "hidden" }}>
        {product.photo ? (
          <img src={product.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          "🖼️"
        )}
      </div>

      <h1 className="display" style={{ fontSize: 22, marginBottom: 4 }}>{product.title}</h1>

      <div style={{ marginBottom: 8 }}>
        <StarRating rating={reviews.average} count={reviews.count} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "var(--clay-dark)", fontFamily: "Fraunces, serif" }}>
          ₹{product.price}
        </span>
        {product.is_negotiable ? <span className="chip">Negotiable</span> : null}
      </div>

      {product.distance_km != null && (
        <div className="distance-tag" style={{ marginBottom: 16 }}>📍 {product.distance_km.toFixed(1)} km away</div>
      )}

      <p style={{ color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 20 }}>{product.description}</p>

      <div className="card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}
        onClick={() => navigate(`/artist/${product.seller_id}`)}>
        <div className="avatar">{product.seller_name ? product.seller_name[0].toUpperCase() : "A"}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            {product.seller_name || "Artist"}
            {product.seller_verified ? <span className="seal">✓</span> : null}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{product.seller_city}</div>
        </div>
        <span>→</span>
      </div>

      {!isOwnProduct && (
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline" onClick={toggleWishlist}>
            {inWishlist ? "❤️ Saved" : "🤍 Save"}
          </button>
          <button className="btn btn-primary" onClick={startChat}>Chat Now</button>
        </div>
      )}
      {!isOwnProduct && product.is_negotiable ? (
        <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => setShowOffer(true)}>
          Make an Offer
        </button>
      ) : null}

      {/* ---------- Reviews & Ratings section ---------- */}
      <h2 className="section-title">Reviews {reviews.count > 0 ? `(${reviews.count})` : ""}</h2>

      {!isOwnProduct && (
        <button className="btn btn-outline" style={{ marginBottom: 16 }} onClick={() => setShowReviewForm(true)}>
          {myExistingReview ? "✏️ Edit your rating" : "⭐ Rate this product"}
        </button>
      )}

      {reviews.reviews.length === 0 ? (
        <p style={{ color: "var(--ink-soft)", fontSize: 13.5 }}>
          No reviews yet — be the first to share your experience.
        </p>
      ) : (
        reviews.reviews.map((r) => (
          <div key={r.id} className="card" style={{ padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontWeight: 600, fontSize: 13.5 }}>{r.buyer_name}</span>
              <StarRating rating={r.rating} size={12} />
            </div>
            {r.comment && <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: 0 }}>{r.comment}</p>}
          </div>
        ))
      )}

      {showOffer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", maxWidth: 480, margin: "0 auto" }}>
          <div className="card" style={{ width: "100%", padding: 24, borderRadius: "20px 20px 0 0" }}>
            <h3 style={{ marginBottom: 14 }}>Make an offer</h3>
            <input className="input" type="number" placeholder="Enter your price" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} style={{ marginBottom: 14 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setShowOffer(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={sendOffer}>Send Offer</button>
            </div>
          </div>
        </div>
      )}

      {showReviewForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", maxWidth: 480, margin: "0 auto" }}>
          <div className="card" style={{ width: "100%", padding: 24, borderRadius: "20px 20px 0 0" }}>
            <h3 style={{ marginBottom: 14 }}>Rate this product</h3>
            <div style={{ display: "flex", gap: 6, marginBottom: 16, fontSize: 30 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  onClick={() => setMyRating(n)}
                  style={{ cursor: "pointer", color: n <= myRating ? "var(--mustard)" : "#ddd" }}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              className="input"
              placeholder="Share your experience (optional)"
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              style={{ marginBottom: 14 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setShowReviewForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitReview}>Submit Rating</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
