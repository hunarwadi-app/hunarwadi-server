import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Blocked() {
  const [list, setList] = useState(null);
  const navigate = useNavigate();
  const load = () => api.getBlocked().then(setList).catch(() => setList([]));
  useEffect(() => { load(); }, []);
  const unblock = async (id) => {
    try { await api.unblockUser(id); } catch (e) { alert("Could not unblock: " + e.message); }
    load();
  };
  return (
    <div className="screen">
      <div className="top-bar">
        <span className="back" onClick={() => navigate(-1)}>{"\u2190"}</span>
        <span style={{ fontWeight: 600 }}>Blocked users</span>
      </div>
      {list === null ? (
        <p>Loading...</p>
      ) : list.length === 0 ? (
        <p style={{ color: "var(--ink-soft)" }}>You have not blocked anyone.</p>
      ) : (
        list.map((u) => (
          <div key={u.id} className="card" style={{ padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{u.name}</span>
            <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 13, width: "auto" }} onClick={() => unblock(u.id)}>Unblock</button>
          </div>
        ))
      )}
    </div>
  );
}