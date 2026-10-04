import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("hunarwadi_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("hunarwadi_user", JSON.stringify(user));
    else localStorage.removeItem("hunarwadi_user");
  }, [user]);

  const setUserKeepToken = (u) => setUser((prev) => (u ? { ...u, token: u.token || prev?.token } : u));
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser: setUserKeepToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
