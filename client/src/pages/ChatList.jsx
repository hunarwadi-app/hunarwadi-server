import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import BottomNav from "../components/BottomNav";

export default function ChatList() {
  const [chats, setChats] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) api.getChats(user.id).then(setChats);
  }, [user]);

  return (
    <>
      <div className="screen">
        <h1 className="display" style={{ fontSize: 24, marginBottom: 20 }}>Chats</h1>
        {chats.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 34, marginBottom: 8 }}>💬</div>
            No conversations yet. Start chatting with an artist from a product page.
          </div>
        ) : (
          chats.map((c) => {
            const otherName = c.buyer_id === user.id ? c.seller_name : c.buyer_name;
            return (
              <div key={c.id} className="card" style={{ padding: 14, display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }} onClick={() => navigate(`/chat/${c.id}`)}>
                <div className="avatar">{otherName ? otherName[0].toUpperCase() : "?"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{otherName}</div>
                  {c.product_title && <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>About: {c.product_title}</div>}
                </div>
              </div>
            );
          })
        )}
      </div>
      <BottomNav />
    </>
  );
}
