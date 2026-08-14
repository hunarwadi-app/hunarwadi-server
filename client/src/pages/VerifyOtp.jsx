import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";

export default function VerifyOtp() {
  const { state } = useLocation();
  const email = state?.email;
  const devOtp = state?.devOtp;
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [digits, setDigits] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  if (!email) {
    navigate("/login");
    return null;
  }

  const handleChange = (idx, val) => {
    val = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = digits.join("");
    if (otp.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.verifyOtp(email, otp);
      setUser(res.user);
      setLoading(false);
      if (!res.user.name) navigate("/location-permission");
      else navigate("/home");
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  const handleResend = async () => {
    const res = await api.sendOtp(email);
    navigate("/verify-otp", { state: { email, devOtp: res.dev_otp }, replace: true });
  };

  return (
    <div className="screen" style={{ paddingTop: 60 }}>
      <h1 className="display" style={{ fontSize: 26, marginBottom: 8 }}>Verify your email</h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 24 }}>
        Enter the 6-digit code sent to {email}
      </p>

      {devOtp && (
        <div className="dev-note">
          <strong>Dev mode:</strong> no real email-sending service is connected yet, so here's your OTP for testing: <strong>{devOtp}</strong>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            className="input"
            style={{ textAlign: "center", padding: "14px 0", borderRadius: 12 }}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            maxLength={1}
            inputMode="numeric"
          />
        ))}
      </div>

      {error && <p style={{ color: "var(--clay-dark)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>Didn't get the code?</span>
        <span onClick={handleResend} style={{ fontSize: 13, color: "var(--clay)", fontWeight: 600, cursor: "pointer" }}>
          Resend OTP
        </span>
      </div>

      <button className="btn btn-primary" onClick={handleVerify} disabled={loading}>
        {loading ? "Verifying..." : "Verify & Continue"}
      </button>
    </div>
  );
}
