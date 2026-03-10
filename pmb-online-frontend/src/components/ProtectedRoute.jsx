import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── Loading Spinner ──────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f8fafc",
      flexDirection: "column", gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        border: "3px solid #e2e8f0",
        borderTop: "3px solid #6366f1",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontSize: 14, color: "#94a3b8" }}>Memuat...</div>
    </div>
  );
}

// ─── Protected Route ──────────────────────────────────────────────────────────
// requiredRole: "pendaftar" | "admin" | null (semua role boleh)
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  // Masih cek token
  if (loading) return <LoadingScreen />;

  // Belum login → ke halaman login
  if (!user) return <Navigate to="/login" replace />;

  // Sudah login tapi role tidak sesuai → redirect sesuai role
  if (requiredRole && user.role !== requiredRole) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/pendaftar/dashboard" replace />;
  }

  return children;
}