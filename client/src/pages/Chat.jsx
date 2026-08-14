import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";

const STATUS_LABELS = {
  confirmed: "Order Confirmed",
  preparing: "Being Prepared",
  ready: "Ready for Pickup/Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const NEXT_STATUS = {
  confirmed: { next: "preparing", label: "Mark as Preparing" },
  preparing: { next: "ready", label: "Mark as Ready" },
  ready: { next: "delivered", label: "Mark as Delivered" },
};

export default function Chat() {
  const { id } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [order, setOrder] = useState(null);
  const [text, setText] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const endRef = useRef(null);

  useEffect(() => {
    loadChatInfo();
    load();
    const interval = setInterval(load, 2500); // simple polling for near-real-time updates
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChatInfo = async () => {
    const c = await api.getChat(id);
    setChat(c);
    const o = await api.getChatOrder(id);
    setOrder(o);
  };

  const load = async () => {
    const msgs = await api.getMessages(id);
    setMessages(msgs);
    const o = await api.getChatOrder(id);
    setOrder(o);
  };

  const send = async () => {
    if (!text.trim()) return;
    await api.sendMessage(id, { sender_id: user.id, content: text, message_type: "text" });
    setText("");
    load();
  };

  const respondOffer = async (msgId, status) => {
    await api.setOfferStatus(msgId, status);
    load();
  };

  const confirmOrder = async () => {
    if (!chat) return;
    const newOrder = await api.createOrder({
      buyer_id: chat.buyer_id,
      seller_id: chat.seller_id,
      product_id: chat.product_id,
      chat_id: id,
    });
    setOrder(newOrder);
  };

  const advanceOrder = async () => {
    const next = NEXT_STATUS[order.status]?.next;
    if (!next) return;
    const updated = await api.updateOrderStatus(order.id, next, user.id);
    setOrder(updated);
  };

  const cancelOrder = async () => {
    const updated = await api.updateOrderStatus(order.id, "cancelled", user.id);
    setOrder(updated);
  };

  if (!chat) return <div className="screen">Loading...</div>;

  const isBuyer = chat.buyer_id === user.id;
  const isSeller = chat.seller_id === user.id;

  return (
    <div className="screen no-pad-bottom" style={{ display: "flex", flexDirection: "column", height: "100vh", paddingBottom: 0 }}>
      <div className="top-bar">
        <span className="back" onClick={() => navigate(-1)}>←</span>
        <span style={{ fontWeight: 600 }}>Chat</span>
      </div>

      {/* ---------- Order status card ---------- */}
      {chat.product_id && (
        <div className="card" style={{ padding: 14, marginBottom: 12 }}>
          {!order ? (
            isBuyer ? (
              <button className="btn btn-primary" onClick={confirmOrder}>
                📦 Confirm Order
              </button>
            ) : (
              <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>
                No order confirmed yet — waiting for buyer to confirm.
              </p>
            )
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span className="eyebrow">Order Status</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: order.status === "cancelled" ? "var(--clay-dark)" : "var(--teal)" }}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: order.status === "delivered" || order.status === "cancelled" ? 0 : 10 }}>
                Price: ₹{order.price}
              </div>
              {isSeller && NEXT_STATUS[order.status] && (
                <button className="btn btn-outline" style={{ padding: "8px 12px", fontSize: 13 }} onClick={advanceOrder}>
                  {NEXT_STATUS[order.status].label}
                </button>
              )}
              {isBuyer && order.status === "confirmed" && (
                <button className="btn btn-ghost" style={{ padding: "8px 12px", fontSize: 13 }} onClick={cancelOrder}>
                  Cancel Order
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", marginBottom: 12 }}>
        {messages.map((m) => {
          const mine = m.sender_id === user.id;
          if (m.message_type === "offer") {
            return (
              <div key={m.id} className={`offer-card ${mine ? "mine" : ""}`} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>OFFER</div>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "Fraunces, serif", marginBottom: 8 }}>
                  ₹{m.offer_price}
                </div>
                {m.offer_status === "pending" && !mine ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-primary" style={{ padding: "8px 12px", fontSize: 13 }} onClick={() => respondOffer(m.id, "accepted")}>Accept</button>
                    <button className="btn btn-outline" style={{ padding: "8px 12px", fontSize: 13 }} onClick={() => respondOffer(m.id, "rejected")}>Reject</button>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>
                    Status: {m.offer_status}
                  </div>
                )}
              </div>
            );
          }
          return (
            <div key={m.id} className={`chat-bubble ${mine ? "mine" : "theirs"}`}>
              {m.content}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div style={{ display: "flex", gap: 8, paddingBottom: 20 }}>
        <input
          className="input"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="btn btn-primary" style={{ width: "auto", padding: "0 20px" }} onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}
