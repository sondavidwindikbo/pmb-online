import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // cek token saat pertama load
  const navigate              = useNavigate();

  // ── Saat app pertama dibuka, cek apakah token masih valid ──────────────────
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setLoading(false); return; }

      try {
        // Verifikasi token ke backend
        const profile = await authApi.getProfile();
        setUser(profile);
      } catch {
        // Token tidak valid / expired → bersihkan
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    setUser(data.user);

    // Arahkan berdasarkan role
    if (data.user.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/pendaftar/dashboard");
    }
    return data;
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const register = async (payload) => {
    const data = await authApi.register(payload);
    return data;
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    authApi.logout();
    setUser(null);
    navigate("/login");
  };

  // ── Update user di context (setelah edit profil) ───────────────────────────
  const updateUser = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
    localStorage.setItem("user", JSON.stringify({ ...user, ...newData }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
};