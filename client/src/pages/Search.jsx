import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import BottomNav from "../components/BottomNav";
import ProductCard from "../components/ProductCard";

export default function Search() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [results, setResults] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (q) runSearch(q);
  }, []);

  const runSearch = async (term) => {
    const p = { q: term };
    if (user?.latitude) {
      p.lat = user.latitude;
      p.lng = user.longitude;
    }
    const data = await api.getProducts(p);
    setResults(data);
  };

  return (
    <>
      <div className="screen">
        <div className="top-bar">
          <span className="back" onClick={() => navigate(-1)}>←</span>
          <input
            className="input"
            autoFocus
            value={q}
            placeholder="Search handmade products..."
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch(q)}
          />
        </div>
        {results.length === 0 ? (
          <div className="empty-state">Search for jewellery, paintings, pottery, and more from local artists.</div>
        ) : (
          <div className="product-grid">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}
