import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Admin() {
  const [rows, setRows] = useState(null);
  const [denied, setDenied] = useState(false);
  const navigate = useNavigate();
  const load = () => api.adminReports().then(setRows).catch(() => setDenied(true));
  useEffect(() => { load(); }, []);
  const act = async (id, status) => {
    if (!window.confirm(status === "removed" ? "Remove this product?" : "Restore this product and clear its reports?")) return;
    try { await api.adminSetStatus(id, status); } catch (e) { alert(e.message); }
    load();
  };
  const btn = { padding: "6px 12px", fontSize: 13, width: "auto" };
  return (
    <div className="screen">
      <div className="top-bar">
        <span className="back" onClick={() => navigate(-1)}>{"\u2190"}</span>
        <span style={{ fontWeight: 600 }}>Reports (admin)</span>
      </div>
      {denied ? (
        <p>Not allowed.</p>
      ) : rows === null ? (
        <p>Loading...</p>
      ) : rows.length === 0 ? (
        <p style={{ color: "var(--ink-soft)" }}>No reports.</p>
      ) : (
        rows.map((r) => (
          <div key={r.product_id} className="card" style={{ padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
              {r.photo ? <img src={r.photo} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }} /> : null}
              <div>
                <div style={{ fontWeight: 600 }}>{r.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>Seller: {r.seller_name || "-"} | Status: {r.status} | Reports: {r.count}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>Reasons: {r.reasons.join(", ")}</div>
            <div style={{ display: "flex", gap: 8 }}>
              {r.status !== "active" && r.status !== "deleted" ? <button className="btn btn-outline" style={btn} onClick={() => act(r.product_id, "active")}>Restore</button> : null}
              {r.status !== "removed" && r.status !== "deleted" ? <button className="btn btn-outline" style={btn} onClick={() => act(r.product_id, "removed")}>Remove</button> : null}
            </div>
          </div>
        ))
      )}
    </div>
  );
}