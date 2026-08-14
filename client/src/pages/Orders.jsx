import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import BottomNav from "../components/BottomNav";

const STATUS_COLOR = {
  confirmed: "var(--teal)",
  preparing: "var(--mustard)",
  ready: "var(--clay)",
  delivered: "var(--teal)",
  cancelled: "var(--ink-soft)",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) api.getOrders(user.id).then(setOrders);
  }, [user]);

  return (
    <>
      <div className="screen">
        <h1 className="display" style={{ fontSize: 24, marginBottom: 20 }}>My Orders</h1>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 34, marginBottom: 8 }}>📦</div>
            No orders yet. Once you confirm a deal in chat, it'll show up here.
          </div>
        ) : (
          orders.map((o) => (
            <div
              key={o.id}
              className="card"
              style={{ padding: 14, marginBottom: 10, cursor: "pointer" }}
              onClick={() => o.chat_id && navigate(`/chat/${o.chat_id}`)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14.5 }}>{o.product_title}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
                    {o.my_role === "buyer" ? `Seller: ${o.seller_name}` : `Buyer: ${o.buyer_name}`}
                  </div>
                </div>
                <span className="chip" style={{ fontSize: 11, textTransform: "capitalize", background: "var(--sand-deep)" }}>
                  {o.my_role}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontFamily: "Fraunces, serif" }}>₹{o.price}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, textTransform: "capitalize", color: STATUS_COLOR[o.status] }}>
                  ● {o.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <BottomNav />
    </>
  );
}
