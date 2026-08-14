import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
      const res = await api.sendOtp(email);
      setLoading(false);
      // dev_otp shown only because no real email-sending service is connected yet
      navigate("/verify-otp", { state: { email, devOtp: res.dev_otp } });
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

        {error && <p style={{ color: "var(--clay-dark)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <button className="btn btn-primary" disabled={loading} style={{ marginTop: 24 }}>
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>

      <p style={{ fontSize: 11.5, color: "var(--ink-soft)", textAlign: "center", marginTop: 20 }}>
        By continuing you agree to our Terms & Privacy Policy.
      </p>
    </div>
  );
}
