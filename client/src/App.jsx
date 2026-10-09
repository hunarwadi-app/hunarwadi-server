import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import "./styles.css";

import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import LocationPermission from "./pages/LocationPermission";
import ProfileSetup from "./pages/ProfileSetup";
import Home from "./pages/Home";
import Search from "./pages/Search";
import ProductDetail from "./pages/ProductDetail";
import ArtistProfile from "./pages/ArtistProfile";
import ChatList from "./pages/ChatList";
import Chat from "./pages/Chat";
import Wishlist from "./pages/Wishlist";
import AddProduct from "./pages/AddProduct";
import MyProducts from "./pages/MyProducts";
import SellerDashboard from "./pages/SellerDashboard";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Blocked from "./pages/Blocked";
import { Terms, Privacy, DeleteAccountInfo } from "./pages/Legal";

function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function RootScreen() {
  const { user } = useAuth();
  if (user) return <Navigate to="/home" replace />;
  return <Welcome />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootScreen />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/location-permission" element={<Protected><LocationPermission /></Protected>} />
      <Route path="/profile-setup" element={<Protected><ProfileSetup /></Protected>} />
      <Route path="/home" element={<Protected><Home /></Protected>} />
      <Route path="/search" element={<Protected><Search /></Protected>} />
      <Route path="/product/:id" element={<Protected><ProductDetail /></Protected>} />
      <Route path="/artist/:id" element={<Protected><ArtistProfile /></Protected>} />
      <Route path="/chats" element={<Protected><ChatList /></Protected>} />
      <Route path="/chat/:id" element={<Protected><Chat /></Protected>} />
      <Route path="/wishlist" element={<Protected><Wishlist /></Protected>} />
      <Route path="/add-product" element={<Protected><AddProduct /></Protected>} />
      <Route path="/my-products" element={<Protected><MyProducts /></Protected>} />
      <Route path="/seller-dashboard" element={<Protected><SellerDashboard /></Protected>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />
      <Route path="/orders" element={<Protected><Orders /></Protected>} />
      <Route path="/blocked" element={<Protected><Blocked /></Protected>} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/delete-account" element={<DeleteAccountInfo />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}