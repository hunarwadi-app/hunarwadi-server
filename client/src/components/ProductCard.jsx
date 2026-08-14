import { useNavigate } from "react-router-dom";

const CATEGORY_EMOJI = {
  Jewellery: "💍",
  Painting: "🎨",
  Pottery: "🏺",
  "Wood Art": "🪵",
  "Home Decor": "🏡",
  Fashion: "👗",
};

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="thumb">
        {product.photo ? (
          <img src={product.photo} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          CATEGORY_EMOJI[product.category] || "🖼️"
        )}
      </div>
      <div className="info">
        <div className="title">{product.title}</div>
        <div className="price">₹{product.price}</div>
        {product.avg_rating != null && (
          <div style={{ fontSize: 11.5, color: "var(--mustard)", fontWeight: 600, marginTop: 2 }}>
            ★ {product.avg_rating} ({product.review_count})
          </div>
        )}
        {product.distance_km != null && (
          <div className="distance-tag" style={{ marginTop: 6 }}>
            📍 {product.distance_km.toFixed(1)} km away
          </div>
        )}
      </div>
    </div>
  );
}
