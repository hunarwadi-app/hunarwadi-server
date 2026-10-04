import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";

export default function ProfileSetup() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState("both");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const updated = await api.updateUser(user.id, {
      name,
      city,
      role,
      latitude: user.latitude,
      longitude: user.longitude,
    });
    setUser(updated);
    setLoading(false);
    navigate("/home");
  };

  return (
    <div className="screen" style={{ paddingTop: 50 }}>
      <h1 className="display" style={{ fontSize: 26, marginBottom: 6 }}>Tell us about you</h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 28 }}>Takes less than a minute.</p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="field-label">Your Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Vishnu Kumar" />
        </div>
        <div className="field">
          <label className="field-label">City</label>
          <input className="input" value={city} onChange={(e) => setCity(e.target.value)} required placeholder="e.g. Chandausi" />
        </div>

        <button className="btn btn-primary" disabled={loading} style={{ marginTop: 20 }}>
          {loading ? "Saving..." : "Continue to HUNARWADI"}
        </button>
      </form>
    </div>
  );
}
