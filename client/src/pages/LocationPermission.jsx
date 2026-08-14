import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function LocationPermission() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const handleAllow = () => {
    if (!navigator.geolocation) {
      navigate("/profile-setup");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUser({ ...user, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        navigate("/profile-setup");
      },
      () => navigate("/profile-setup")
    );
  };

  return (
    <div className="screen" style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh", textAlign: "center" }}>
      <div style={{ fontSize: 50, marginBottom: 20 }}>📍</div>
      <h2 className="display" style={{ fontSize: 22, marginBottom: 10 }}>
        Want to see artists near you?
      </h2>
      <p style={{ color: "var(--ink-soft)", marginBottom: 36 }}>
        HUNARWADI uses your location to show you the closest local artists first.
      </p>
      <button className="btn btn-primary" onClick={handleAllow} style={{ marginBottom: 12 }}>
        Allow
      </button>
      <button className="btn btn-ghost" onClick={() => navigate("/profile-setup")}>
        Not Now
      </button>
    </div>
  );
}
