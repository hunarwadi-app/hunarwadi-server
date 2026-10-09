import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { api } from "../api";
import BottomNav from "../components/BottomNav";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm("Delete your account permanently? Your products, chats and reviews will be removed. This cannot be undone.")) return;
    try {
      await api.deleteAccount();
      logout();
      navigate("/");
    } catch (e) {
      alert("Could not delete account: " + e.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <div className="screen">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="avatar" style={{ width: 72, height: 72, fontSize: 26, margin: "0 auto 10px" }}>
            {user?.name ? user.name[0].toUpperCase() : "?"}
          </div>
          <h2 className="display" style={{ fontSize: 20 }}>{user?.name}</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 13 }}>{user?.email} · {user?.city}</p>
        </div>

        <div className="card" style={{ padding: 14, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => navigate("/add-product")}>
          <span style={{ fontWeight: 600 }}>{"\u2795"} Add Product</span>
          <span>{"\u2192"}</span>
        </div>

        <div className="card" style={{ padding: 14, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => navigate("/my-products")}>
          <span style={{ fontWeight: 600 }}>{"\uD83D\uDECD\uFE0F"} My Products</span>
          <span>{"\u2192"}</span>
        </div>

        {(
          <div className="card" style={{ padding: 14, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => navigate("/seller-dashboard")}>
            <span style={{ fontWeight: 600 }}>🧵 Seller Dashboard</span>
            <span>→</span>
          </div>
        )}

        <div className="card" style={{ padding: 14, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => navigate("/orders")}>
          <span style={{ fontWeight: 600 }}>📦 My Orders</span>
          <span>→</span>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }} onClick={() => navigate("/blocked")}>Blocked users</div>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }} onClick={() => navigate("/terms")}>Terms of Service</div>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }} onClick={() => navigate("/privacy")}>Privacy Policy</div>
          <div style={{ padding: "14px 16px", color: "var(--clay-dark)", fontWeight: 600 }} onClick={handleDelete}>Delete Account</div>
        </div>

        <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
      </div>
      <BottomNav />
    </>
  );
}
