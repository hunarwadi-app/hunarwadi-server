import { Link, useLocation } from "react-router-dom";

const items = [
  { to: "/home", icon: "🏠", label: "Home" },
  { to: "/search", icon: "🔍", label: "Search" },
  { to: "/chats", icon: "💬", label: "Chats" },
  { to: "/wishlist", icon: "❤️", label: "Wishlist" },
  { to: "/profile", icon: "👤", label: "Profile" },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`nav-item ${pathname === item.to ? "active" : ""}`}
        >
          <span className="icon">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
