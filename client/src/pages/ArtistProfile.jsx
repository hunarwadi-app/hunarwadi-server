import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import ProductCard from "../components/ProductCard";
import StarRating from "../components/StarRating";

export default function ArtistProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [rating, setRating] = useState({ average: null, count: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const u = await api.getUser(id);
      setSeller(u);
      const p = await api.getSellerProducts(id);
      setProducts(p.filter((x) => x.status === "active"));
      const r = await api.getSellerRating(id);
      setRating(r);
    })();
  }, [id]);

  if (!seller) return <div className="screen">Loading...</div>;

  return (
    <div className="screen">
      <div className="top-bar">
        <span className="back" onClick={() => navigate(-1)}>←</span>
      </div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div className="avatar" style={{ width: 76, height: 76, fontSize: 28, margin: "0 auto 12px" }}>
          {seller.name ? seller.name[0].toUpperCase() : "A"}
        </div>
        <h2 className="display" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
          {seller.name}
          {seller.is_verified ? <span className="seal">✓</span> : null}
        </h2>
        <p style={{ color: "var(--ink-soft)", marginBottom: 6 }}>{seller.city}</p>
        <StarRating rating={rating.average} count={rating.count} />
      </div>

      <h3 className="section-title">Products by {seller.name}</h3>
      {products.length === 0 ? (
        <div className="empty-state">No active products yet.</div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
