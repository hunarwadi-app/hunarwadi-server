import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!agreed) {
      setError("Please confirm that you are 18 or older and accept the Terms and Privacy Policy.");
      return;
    }
    setLoading(true);
    try {
      await api.sendOtp(email);
      setLoading(false);
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="screen" style={{ paddingTop: 60 }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--clay)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 24 }}>
        ✉️
      </div>
      <h1 className="display" style={{ fontSize: 28, marginBottom: 8 }}>Welcome to HUNARWADI</h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 28 }}>Enter your email to continue.</p>

      <form onSubmit={handleSendOtp}>
        <div className="field">
          <label className="field-label">Email Address</label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 8 }}>
            We'll send you a 6-digit OTP to verify.
          </p>
        </div>

        <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, marginTop: 16, marginBottom: 8 }}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 3 }} />
          <span>I am 18 or older and I agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.</span>
        </label>
        {error && <p style={{ color: "var(--clay-dark)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <button className="btn btn-primary" disabled={loading} style={{ marginTop: 24 }}>
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>

      <p style={{ fontSize: 11.5, color: "var(--ink-soft)", textAlign: "center", marginTop: 20 }}>
        Need help? Write to hunarwadi99@gmail.com
      </p>
    </div>
  );
}
