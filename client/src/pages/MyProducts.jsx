import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import BottomNav from "../components/BottomNav";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    const p = await api.getSellerProducts(user.id);
    setProducts(p);
  };

  const markSold = async (id) => {
    await api.updateProduct(id, { status: "sold" });
    load();
  };

  const remove = async (id) => {
    if (confirm("Delete this product?")) {
      await api.deleteProduct(id);
      load();
    }
  };

  return (
    <>
      <div className="screen">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 className="display" style={{ fontSize: 24 }}>My Products</h1>
          <button className="btn btn-primary" style={{ width: "auto", padding: "10px 18px" }} onClick={() => navigate("/add-product")}>
            + Add
          </button>
        </div>

        {products.length === 0 ? (
          <div className="empty-state">You haven't listed any products yet.</div>
        ) : (
          products.map((p) => (
            <div key={p.id} className="card" style={{ padding: 14, marginBottom: 10, display: "flex", gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, background: "var(--sand-deep)", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {p.photo ? <img src={p.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🖼️"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>₹{p.price} · <span style={{ textTransform: "capitalize" }}>{p.status}</span></div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {p.status === "active" && (
                    <button className="btn btn-outline" style={{ width: "auto", padding: "6px 12px", fontSize: 12 }} onClick={() => markSold(p.id)}>Mark Sold</button>
                  )}
                  <button className="btn btn-ghost" style={{ width: "auto", padding: "6px 12px", fontSize: 12 }} onClick={() => remove(p.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <BottomNav />
    </>
  );
}
