import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import BottomNav from "../components/BottomNav";

export default function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) api.getSellerStats(user.id).then(setStats);
  }, [user]);

  if (!stats) return <div className="screen">Loading...</div>;

  return (
    <>
      <div className="screen">
        <h1 className="display" style={{ fontSize: 24, marginBottom: 20 }}>Seller Dashboard</h1>
        <div className="stat-grid">
          <div className="stat-card"><div className="num">{stats.total_products}</div><div className="label">Total Products</div></div>
          <div className="stat-card"><div className="num">{stats.active_products}</div><div className="label">Active</div></div>
          <div className="stat-card"><div className="num">{stats.sold_products}</div><div className="label">Sold</div></div>
          <div className="stat-card"><div className="num">{stats.total_chats}</div><div className="label">Total Chats</div></div>
          <div className="stat-card"><div className="num">{stats.pending_orders}</div><div className="label">Pending Orders</div></div>
          <div className="stat-card"><div className="num">{stats.total_orders}</div><div className="label">Total Orders</div></div>
        </div>
        <button className="btn btn-outline" onClick={() => navigate("/orders")} style={{ marginBottom: 10 }}>
          📦 View Orders
        </button>
        <button className="btn btn-primary" onClick={() => navigate("/my-products")} style={{ marginBottom: 10 }}>
          Manage My Products
        </button>
        <button className="btn btn-outline" onClick={() => navigate("/add-product")}>
          + Add New Product
        </button>
      </div>
      <BottomNav />
    </>
  );
}
