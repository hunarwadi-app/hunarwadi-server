import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import BottomNav from "../components/BottomNav";
import ProductCard from "../components/ProductCard";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) api.getWishlist(user.id).then(setItems);
  }, [user]);

  return (
    <>
      <div className="screen">
        <h1 className="display" style={{ fontSize: 24, marginBottom: 20 }}>Wishlist</h1>
        {items.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 34, marginBottom: 8 }}>❤️</div>
            Nothing saved yet. Tap the heart on a product to save it here.
          </div>
        ) : (
          <div className="product-grid">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}
