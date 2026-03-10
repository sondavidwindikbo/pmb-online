import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail, Lock, Eye, EyeOff, User, Phone,
  AlertCircle, CheckCircle, Loader, BookOpen
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    nama: "", email: "", no_hp: "", password: "", konfirmasi: "",
  });
  const [errors, setErrors]     = useState({});
  const [showPw, setShowPw]     = useState({ password: false, konfirmasi: false });
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess]   = useState(false);

  // ── Validasi ──────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {};
    if (!form.nama.trim())                          err.nama       = "Nama lengkap wajib diisi";
    if (!form.email.trim())                         err.email      = "Email wajib diisi";
    else if (!form.email.includes("@"))             err.email      = "Format email tidak valid";
    if (!form.no_hp.trim())                         err.no_hp      = "No. HP wajib diisi";
    else if (form.no_hp.length < 10)                err.no_hp      = "No. HP minimal 10 digit";
    if (!form.password)                             err.password   = "Password wajib diisi";
    else if (form.password.length < 8)              err.password   = "Password minimal 8 karakter";
    if (!form.konfirmasi)                           err.konfirmasi = "Konfirmasi password wajib diisi";
    else if (form.password !== form.konfirmasi)     err.konfirmasi = "Password tidak cocok";
    return err;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => { const n = {...prev}; delete n[name]; return n; });
    if (apiError) setApiError("");
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) { setErrors(err); return; }

    setLoading(true);
    setApiError("");
    try {
      await register({
        nama_lengkap:     form.nama,
        email:    form.email,
        no_hp:    form.no_hp,
        password: form.password,
      });
      setSuccess(true);
    } catch (error) {
      const msg = error.response?.data?.message || "Registrasi gagal, coba lagi.";
      // Handle email sudah terdaftar
      if (msg.toLowerCase().includes("email")) {
        setErrors({ email: "Email sudah terdaftar, gunakan email lain." });
      } else {
        setApiError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Password strength ─────────────────────────────────────────────────────
  const getStrength = (pw) => {
    if (!pw) return null;
    const strong = pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);
    const medium = pw.length >= 8;
    return strong ? "kuat" : medium ? "sedang" : "lemah";
  };
  const strengthCfg = {
    lemah:  { w: "33%",  color: "#ef4444", label: "Lemah" },
    sedang: { w: "66%",  color: "#f59e0b", label: "Sedang" },
    kuat:   { w: "100%", color: "#10b981", label: "Kuat" },
  };
  const strength = getStrength(form.password);

  // ── Success Screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 8px 32px rgba(16,185,129,0.4)",
          }}>
            <CheckCircle size={36} color="#fff" strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", marginBottom: 10 }}>
            Akun Berhasil Dibuat! 🎉
          </h2>
          <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 28, lineHeight: 1.7 }}>
            Selamat datang, <strong style={{ color: "#f1f5f9" }}>{form.nama}</strong>!<br />
            Akun Anda sudah aktif. Silakan login untuk memulai pendaftaran.
          </p>
          <button onClick={() => navigate("/login")} style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff", border: "none", borderRadius: 12,
            padding: "13px 32px", fontSize: 14, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 4px 18px rgba(99,102,241,0.45)",
          }}>
            Masuk Sekarang →
          </button>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  const inputStyle = (fieldName) => ({
    width: "100%", padding: "11px 14px 11px 38px",
    fontSize: 13.5, boxSizing: "border-box",
    background: "rgba(255,255,255,0.07)",
    border: `1.5px solid ${errors[fieldName] ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.12)"}`,
    borderRadius: 10, outline: "none", color: "#f1f5f9",
    transition: "border-color 0.2s",
  });

  const iconStyle = {
    position: "absolute", left: 13, top: "50%",
    transform: "translateY(-50%)", pointerEvents: "none",
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
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #475569; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 30px #1e293b inset !important; -webkit-text-fill-color: #f1f5f9 !important; }
      `}</style>

      {/* Decorative */}
      <div style={{ position: "fixed", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(99,102,241,0.1)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(139,92,246,0.08)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, margin: "0 auto 14px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 32px rgba(99,102,241,0.45)",
          }}>
            <BookOpen size={26} color="#fff" />
          </div>
          <div style={{ color: "#f8fafc", fontWeight: 800, fontSize: 20 }}>PMB ONLINE</div>
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
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", marginBottom: 6 }}>Buat Akun</h1>
          <p style={{ fontSize: 13.5, color: "#94a3b8", marginBottom: 28 }}>
            Daftar untuk memulai proses PMB
          </p>

          {/* API Error */}
          {apiError && (
            <div style={{
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10, padding: "12px 16px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 10,
              fontSize: 13, color: "#fca5a5",
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Nama */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: 7 }}>Nama Lengkap</label>
              <div style={{ position: "relative" }}>
                <User size={15} color="#64748b" style={iconStyle} />
                <input name="nama" value={form.nama} onChange={onChange}
                  placeholder="Nama sesuai KTP" autoComplete="name"
                  style={inputStyle("nama")}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.7)"}
                  onBlur={e => e.target.style.borderColor = errors.nama ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.12)"} />
              </div>
              {errors.nama && <div style={{ fontSize: 11.5, color: "#fca5a5", marginTop: 5, display: "flex", gap: 4 }}><AlertCircle size={12} style={{ marginTop: 1 }} />{errors.nama}</div>}
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: 7 }}>Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} color="#64748b" style={iconStyle} />
                <input name="email" type="email" value={form.email} onChange={onChange}
                  placeholder="email@example.com" autoComplete="email"
                  style={inputStyle("email")}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.7)"}
                  onBlur={e => e.target.style.borderColor = errors.email ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.12)"} />
              </div>
              {errors.email && <div style={{ fontSize: 11.5, color: "#fca5a5", marginTop: 5, display: "flex", gap: 4 }}><AlertCircle size={12} style={{ marginTop: 1 }} />{errors.email}</div>}
            </div>

            {/* No HP */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: 7 }}>No. HP / WhatsApp</label>
              <div style={{ position: "relative" }}>
                <Phone size={15} color="#64748b" style={iconStyle} />
                <input name="no_hp" value={form.no_hp} onChange={onChange}
                  placeholder="08xxxxxxxxxx" autoComplete="tel"
                  style={inputStyle("no_hp")}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.7)"}
                  onBlur={e => e.target.style.borderColor = errors.no_hp ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.12)"} />
              </div>
              {errors.no_hp && <div style={{ fontSize: 11.5, color: "#fca5a5", marginTop: 5, display: "flex", gap: 4 }}><AlertCircle size={12} style={{ marginTop: 1 }} />{errors.no_hp}</div>}
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: 7 }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} color="#64748b" style={iconStyle} />
                <input name="password" type={showPw.password ? "text" : "password"}
                  value={form.password} onChange={onChange}
                  placeholder="Minimal 8 karakter" autoComplete="new-password"
                  style={{ ...inputStyle("password"), paddingRight: 40 }}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.7)"}
                  onBlur={e => e.target.style.borderColor = errors.password ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.12)"} />
                <button type="button" onClick={() => setShowPw(p => ({ ...p, password: !p.password }))} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex",
                }}>
                  {showPw.password ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength indicator */}
              {form.password && strength && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 99, height: 4, overflow: "hidden" }}>
                    <div style={{ width: strengthCfg[strength].w, height: "100%", background: strengthCfg[strength].color, borderRadius: 99, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 11, color: strengthCfg[strength].color, fontWeight: 600 }}>
                    Kekuatan: {strengthCfg[strength].label}
                  </span>
                </div>
              )}
              {errors.password && <div style={{ fontSize: 11.5, color: "#fca5a5", marginTop: 5, display: "flex", gap: 4 }}><AlertCircle size={12} style={{ marginTop: 1 }} />{errors.password}</div>}
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: 7 }}>Konfirmasi Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} color="#64748b" style={iconStyle} />
                <input name="konfirmasi" type={showPw.konfirmasi ? "text" : "password"}
                  value={form.konfirmasi} onChange={onChange}
                  placeholder="Ulangi password" autoComplete="new-password"
                  style={{ ...inputStyle("konfirmasi"), paddingRight: 40 }}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.7)"}
                  onBlur={e => e.target.style.borderColor = errors.konfirmasi ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.12)"} />
                <button type="button" onClick={() => setShowPw(p => ({ ...p, konfirmasi: !p.konfirmasi }))} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex",
                }}>
                  {showPw.konfirmasi ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Match indicator */}
              {form.konfirmasi && form.password && (
                <div style={{ fontSize: 11, marginTop: 5, display: "flex", gap: 4, alignItems: "center",
                  color: form.password === form.konfirmasi ? "#4ade80" : "#fca5a5" }}>
                  {form.password === form.konfirmasi
                    ? <><CheckCircle size={12} /> Password cocok</>
                    : <><AlertCircle size={12} /> Password tidak cocok</>}
                </div>
              )}
              {errors.konfirmasi && <div style={{ fontSize: 11.5, color: "#fca5a5", marginTop: 5, display: "flex", gap: 4 }}><AlertCircle size={12} style={{ marginTop: 1 }} />{errors.konfirmasi}</div>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              marginTop: 6,
              background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", border: "none", borderRadius: 12,
              padding: "13px", fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: loading ? "none" : "0 4px 18px rgba(99,102,241,0.45)",
              transition: "all 0.2s",
            }}>
              {loading
                ? <><Loader size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Membuat akun...</>
                : "Buat Akun"}
            </button>

          </form>

          {/* Login link */}
          <div style={{ textAlign: "center", marginTop: 24, fontSize: 13.5, color: "#94a3b8" }}>
            Sudah punya akun?{" "}
            <Link to="/login" style={{ color: "#a5b4fc", fontWeight: 700, textDecoration: "none" }}>
              Masuk di sini
            </Link>
          </div>
        </div>

        {/* Back */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link to="/" style={{ fontSize: 13, color: "#64748b", textDecoration: "none" }}>
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}