import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import BottomNav from "../components/BottomNav";
import ProductCard from "../components/ProductCard";

const CATEGORIES = ["All", "Jewellery", "Painting", "Pottery", "Wood Art", "Home Decor", "Fashion"];

export default function Home() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [category]);

  const load = async () => {
    setLoading(true);
    const params = {};
    if (user?.latitude) {
      params.lat = user.latitude;
      params.lng = user.longitude;
    }
    if (category !== "All") params.category = category;
    const data = await api.getProducts(params);
    setProducts(data);
    setLoading(false);
  };

  return (
    <>
      <div className="screen">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div className="eyebrow">Namaste{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</div>
            <h1 className="display" style={{ fontSize: 24 }}>{user?.city || "Discover artists"}</h1>
          </div>
          <div className="avatar" onClick={() => navigate("/profile")}>
            {user?.name ? user.name[0].toUpperCase() : "👤"}
          </div>
        </div>

        <input
          className="input"
          placeholder="Search handmade products..."
          style={{ marginBottom: 20 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate(`/search?q=${encodeURIComponent(e.target.value)}`);
          }}
        />

        <div className="chip-row">
          {CATEGORIES.map((c) => (
            <div key={c} className={`chip ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>
              {c}
            </div>
          ))}
        </div>

        {!user?.latitude && (
          <div className="dev-note">
            Location not set — showing all products. Allow location in your browser or set your city to see the closest artists first.
          </div>
        )}

        <h2 className="section-title">Nearby Products</h2>

        {loading ? (
          <p style={{ color: "var(--ink-soft)" }}>Loading...</p>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 34, marginBottom: 8 }}>🖼️</div>
            No products yet. Be the first artist to list one!
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}
