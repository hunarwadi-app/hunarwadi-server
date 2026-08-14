import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import BottomNav from "../components/BottomNav";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

        {(user?.role === "seller" || user?.role === "both") && (
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
          {["Edit Profile", "Language", "Notifications", "Privacy Settings"].map((label, i) => (
            <div key={label} style={{ padding: "14px 16px", borderBottom: i < 3 ? "1px solid var(--border)" : "none", display: "flex", justifyContent: "space-between" }}>
              <span>{label}</span>
              <span style={{ color: "var(--ink-soft)" }}>→</span>
            </div>
          ))}
        </div>

        <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
      </div>
      <BottomNav />
    </>
  );
}
