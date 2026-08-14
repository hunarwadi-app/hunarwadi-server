import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="screen" style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh", textAlign: "center" }}>
      
      <img src={logo} alt="HUNARWADI logo" style={{ width: 80, height: 80, marginBottom: 12, objectFit: "contain" }} />

      <h1 className="display" style={{ fontSize: 38, marginBottom: 6 }}>HUNARWADI</h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 40 }}>Handmade by Neighbours, Not by Warehouses.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 48, textAlign: "left" }}>
        <div className="card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 22 }}>📍</span>
          <span>Discover artists near you</span>
        </div>
        <div className="card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 22 }}>💬</span>
          <span>Chat directly with the artist</span>
        </div>
        <div className="card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 22 }}>🤝</span>
          <span>Shop without any middleman</span>
        </div>
      </div>

      <button className="btn btn-primary" onClick={() => navigate("/login")}>
        Get Started
      </button>
    </div>
  );
}
