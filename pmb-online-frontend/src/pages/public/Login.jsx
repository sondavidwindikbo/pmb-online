import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader, BookOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [errors, setErrors]   = useState({});
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // ── Validasi lokal ────────────────────────────────────────────────────────
  const validate = () => {
    const err = {};
    if (!form.email.trim())              err.email    = "Email wajib diisi";
    else if (!form.email.includes("@")) err.email    = "Format email tidak valid";
    if (!form.password)                  err.password = "Password wajib diisi";
    return err;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name])  setErrors(prev => { const n = {...prev}; delete n[name]; return n; });
    if (apiError)      setApiError("");
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) { setErrors(err); return; }

    setLoading(true);
    setApiError("");
    try {
      await login(form.email, form.password);
      // Redirect ditangani oleh AuthContext sesuai role
    } catch (error) {
      const msg = error.response?.data?.message || "Email atau password salah.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Decorative circles */}
      <div style={{ position: "fixed", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(99,102,241,0.12)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(139,92,246,0.1)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, margin: "0 auto 14px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 32px rgba(99,102,241,0.45)",
          }}>
            <BookOpen size={26} color="#fff" />
          </div>
          <div style={{ color: "#f8fafc", fontWeight: 800, fontSize: 20, letterSpacing: "0.02em" }}>PMB ONLINE</div>
          <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>USNP 2024/2025</div>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20, padding: "36px 32px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", marginBottom: 6 }}>Masuk</h1>
          <p style={{ fontSize: 13.5, color: "#94a3b8", marginBottom: 28 }}>
            Masukkan email dan password Anda
          </p>

          {/* API Error */}
          {apiError && (
            <div style={{
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10, padding: "12px 16px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 10,
              fontSize: 13, color: "#fca5a5",
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Email */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: 7 }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={15} color="#64748b" style={{
                  position: "absolute", left: 13, top: "50%",
                  transform: "translateY(-50%)", pointerEvents: "none",
                }} />
                <input
                  name="email" type="email" value={form.email}
                  onChange={onChange} placeholder="email@example.com"
                  autoComplete="email"
                  style={{
                    width: "100%", padding: "11px 14px 11px 38px",
                    fontSize: 13.5, boxSizing: "border-box",
                    background: "rgba(255,255,255,0.07)",
                    border: `1.5px solid ${errors.email ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.12)"}`,
                    borderRadius: 10, outline: "none", color: "#f1f5f9",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.7)"}
                  onBlur={e => e.target.style.borderColor = errors.email ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.12)"}
                />
              </div>
              {errors.email && (
                <div style={{ fontSize: 11.5, color: "#fca5a5", marginTop: 5, display: "flex", gap: 4 }}>
                  <AlertCircle size={12} style={{ marginTop: 1 }} /> {errors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }}>Password</label>
                <Link to="/lupa-password" style={{ fontSize: 12.5, color: "#a5b4fc", textDecoration: "none" }}>
                  Lupa password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={15} color="#64748b" style={{
                  position: "absolute", left: 13, top: "50%",
                  transform: "translateY(-50%)", pointerEvents: "none",
                }} />
                <input
                  name="password" type={showPw ? "text" : "password"}
                  value={form.password} onChange={onChange}
                  placeholder="Masukkan password" autoComplete="current-password"
                  style={{
                    width: "100%", padding: "11px 40px 11px 38px",
                    fontSize: 13.5, boxSizing: "border-box",
                    background: "rgba(255,255,255,0.07)",
                    border: `1.5px solid ${errors.password ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.12)"}`,
                    borderRadius: 10, outline: "none", color: "#f1f5f9",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.7)"}
                  onBlur={e => e.target.style.borderColor = errors.password ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.12)"}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "#64748b", display: "flex",
                }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <div style={{ fontSize: 11.5, color: "#fca5a5", marginTop: 5, display: "flex", gap: 4 }}>
                  <AlertCircle size={12} style={{ marginTop: 1 }} /> {errors.password}
                </div>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              marginTop: 4,
              background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", border: "none", borderRadius: 12,
              padding: "13px", fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: loading ? "none" : "0 4px 18px rgba(99,102,241,0.45)",
              transition: "all 0.2s",
            }}>
              {loading ? <><Loader size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Masuk...</> : "Masuk"}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          </form>

          {/* Register link */}
          <div style={{ textAlign: "center", marginTop: 24, fontSize: 13.5, color: "#94a3b8" }}>
            Belum punya akun?{" "}
            <Link to="/register" style={{ color: "#a5b4fc", fontWeight: 700, textDecoration: "none" }}>
              Daftar sekarang
            </Link>
          </div>
        </div>

        {/* Back to home */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link to="/" style={{ fontSize: 13, color: "#64748b", textDecoration: "none" }}>
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}