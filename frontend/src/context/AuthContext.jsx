import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);
const API = (import.meta.env.VITE_SOCKET_URL || "http://localhost:4000");

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem("fm_token"));
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setUser(d.user))
      .catch(() => { setToken(null); localStorage.removeItem("fm_token"); })
      .finally(() => setLoading(false));
  }, [token]);

  const loginAsGuest = useCallback(async (name) => {
    const r = await fetch(`${API}/api/auth/guest`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
    const d = await r.json();
    localStorage.setItem("fm_token", d.token);
    setToken(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const loginWithGoogle = useCallback(async ({ name, email, picture }) => {
    const r = await fetch(`${API}/api/auth/google`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, picture }),
    });
    if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
    const d = await r.json();
    localStorage.setItem("fm_token", d.token);
    setToken(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("fm_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, loginAsGuest, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
