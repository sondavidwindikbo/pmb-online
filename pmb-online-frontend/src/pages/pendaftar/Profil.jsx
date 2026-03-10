import { useState, useEffect } from "react";
import {
  User, Mail, Phone, MapPin, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, Save, KeyRound, Loader,
  Calendar, Hash, RefreshCw
} from "lucide-react";
import { DashboardLayout } from "./Dashboard";
import { useAuth } from "../../context/AuthContext";
import { getProfile, updatePassword } from "../../api/authApi";

// ─── Input component ──────────────────────────────────────────────────────────
function Input({ label, icon: Icon, error, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && (
        <label style={{
          fontSize: 12.5, fontWeight: 600, color: "#374151",
          display: "block", marginBottom: 6,
        }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {Icon && (
          <Icon size={15} color={focused ? "#6366f1" : "#94a3b8"} style={{
            position: "absolute", left: 13, top: "50%",
            transform: "translateY(-50%)", pointerEvents: "none",
          }} />
        )}
        <input
          {...props}
          onFocus={e => { setFocused(true); props.onFocus?.(e); }}
          onBlur={e => { setFocused(false); props.onBlur?.(e); }}
          style={{
            width: "100%", padding: "10px 14px",
            paddingLeft: Icon ? 36 : 14,
            fontSize: 13.5, boxSizing: "border-box",
            border: `1.5px solid ${error ? "#fca5a5" : focused ? "#6366f1" : "#e2e8f0"}`,
            borderRadius: 10, outline: "none",
            color: props.disabled ? "#94a3b8" : "#1e293b",
            background: props.disabled ? "#f8fafc" : "#fff",
            transition: "border-color 0.2s",
            ...props.style,
          }}
        />
      </div>
      {error && (
        <div style={{
          fontSize: 11.5, color: "#ef4444", marginTop: 5,
          display: "flex", gap: 4, alignItems: "center",
        }}>
          <AlertCircle size={12} /> {error}
        </div>
      )}
    </div>
  );
}

// ─── Alert component ──────────────────────────────────────────────────────────
function AlertBox({ type, children }) {
  const cfg = {
    success: { bg: "#f0fdf4", border: "#bbf7d0", color: "#15803d", Icon: CheckCircle },
    error:   { bg: "#fff5f5", border: "#fca5a5", color: "#dc2626", Icon: AlertCircle },
  }[type];
  return (
    <div style={{
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 10, padding: "12px 16px",
      display: "flex", alignItems: "center", gap: 10,
      fontSize: 13, color: cfg.color, fontWeight: 500, marginBottom: 20,
    }}>
      <cfg.Icon size={16} style={{ flexShrink: 0 }} />
      {children}
    </div>
  );
}

// ─── Info Row (read only) ─────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "11px 16px", borderRadius: 10, background: "#f8fafc",
      border: "1px solid #f1f5f9",
    }}>
      <Icon size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginBottom: 1 }}>{label}</div>
        <div style={{ fontSize: 13.5, color: "#1e293b", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || "-"}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 16, radius = 8 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
    }} />
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Profil() {
  const { user: authUser, updateUser } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [loadError, setLoadError]     = useState("");
  const [tab, setTab]                 = useState("profil");
  const [alert, setAlert]             = useState(null);

  // Password state — field sesuai backend: oldPassword, newPassword
  const [pw, setPw]           = useState({ lama: "", baru: "", konfirmasi: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [showPw, setShowPw]   = useState({ lama: false, baru: false, konfirmasi: false });
  const [savingPw, setSavingPw] = useState(false);

  // ── Fetch profile dari GET /api/auth/me ───────────────────────────────────
  const fetchProfile = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await getProfile();
      setProfileData(data);
    } catch {
      setLoadError("Gagal memuat profil. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  // ── Derived data dari response backend ───────────────────────────────────
  // Response: { id, email, role, created_at, pendaftar: { nama_lengkap, no_hp, alamat, ... } }
  const pendaftar  = profileData?.pendaftar || {};
  const namaUser   = pendaftar.nama_lengkap || authUser?.pendaftar?.nama_lengkap || "-";
  const email      = profileData?.email || authUser?.email || "-";
  const noPendaft  = pendaftar.no_pendaftaran || "-";
  const tglDaftar  = profileData?.created_at
    ? new Date(profileData.created_at).toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric"
      })
    : "-";

  // ── Validasi & simpan password ────────────────────────────────────────────
  const validatePw = () => {
    const err = {};
    if (!pw.lama)                        err.lama       = "Password lama wajib diisi";
    if (!pw.baru || pw.baru.length < 6)  err.baru       = "Password baru minimal 6 karakter";
    if (pw.baru !== pw.konfirmasi)       err.konfirmasi = "Konfirmasi password tidak cocok";
    return err;
  };

  const handleSavePassword = async () => {
    const err = validatePw();
    if (Object.keys(err).length > 0) { setPwErrors(err); return; }

    setSavingPw(true);
    setAlert(null);
    try {
      // Backend: { oldPassword, newPassword }
      await updatePassword(pw.lama, pw.baru);
      setPw({ lama: "", baru: "", konfirmasi: "" });
      setPwErrors({});
      setAlert({ type: "success", msg: "Password berhasil diubah!" });
      setTimeout(() => setAlert(null), 4000);
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal mengubah password.";
      // Jika password lama salah
      if (msg.toLowerCase().includes("lama") || msg.toLowerCase().includes("old")) {
        setPwErrors({ lama: "Password lama salah" });
      } else {
        setAlert({ type: "error", msg });
      }
    } finally {
      setSavingPw(false);
    }
  };

  // ── Password strength ─────────────────────────────────────────────────────
  const getStrength = (p) => {
    if (!p) return null;
    if (p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) return "kuat";
    if (p.length >= 6) return "sedang";
    return "lemah";
  };
  const strengthCfg = {
    lemah:  { w: "33%",  color: "#ef4444", label: "Lemah" },
    sedang: { w: "66%",  color: "#f59e0b", label: "Sedang" },
    kuat:   { w: "100%", color: "#10b981", label: "Kuat" },
  };

  // ── Render Loading ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout activePage="profil">
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        <div style={{ marginBottom: 24 }}>
          <Skeleton w="20%" h={22} />
          <div style={{ marginTop: 8 }}><Skeleton w="35%" h={14} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
          <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #f1f5f9" }}>
            <Skeleton w="100%" h={80} radius={0} />
            <div style={{ padding: "48px 24px 24px" }}>
              <Skeleton w={72} h={72} radius={36} />
              <div style={{ marginTop: 14 }}><Skeleton w="70%" h={18} /></div>
              <div style={{ marginTop: 8 }}><Skeleton w="50%" h={13} /></div>
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                {[...Array(3)].map((_, i) => <Skeleton key={i} h={14} />)}
              </div>
            </div>
          </div>
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px", border: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[...Array(5)].map((_, i) => <Skeleton key={i} h={44} />)}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Render Error ──────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <DashboardLayout activePage="profil">
        <div style={{
          background: "#fff", borderRadius: 16, padding: "40px",
          textAlign: "center", border: "1px solid #fee2e2",
        }}>
          <AlertCircle size={36} color="#ef4444" style={{ marginBottom: 12 }} />
          <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>Gagal memuat profil</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>{loadError}</div>
          <button onClick={fetchProfile} style={{
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
            border: "none", borderRadius: 8, padding: "9px 20px",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <RefreshCw size={14} /> Coba Lagi
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePage="profil">
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Profil Saya</h2>
        <p style={{ fontSize: 13.5, color: "#64748b" }}>Informasi akun dan keamanan Anda.</p>
      </div>

      {alert && <AlertBox type={alert.type}>{alert.msg}</AlertBox>}

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>

        {/* ── Kartu Kiri ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{
            background: "#fff", borderRadius: 20,
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
            overflow: "hidden",
          }}>
            {/* Banner gradient */}
            <div style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              height: 80,
            }} />

            <div style={{ padding: "0 24px 24px", marginTop: -40 }}>
              {/* Avatar */}
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "3px solid #fff",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                fontSize: 28, fontWeight: 800, color: "#fff",
                marginBottom: 14,
              }}>
                {namaUser.charAt(0).toUpperCase()}
              </div>

              <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 2 }}>
                {namaUser}
              </div>
              <div style={{ fontSize: 12.5, color: "#64748b", marginBottom: 16 }}>{email}</div>

              {/* Info singkat */}
              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { icon: Hash,     val: noPendaft || "Belum daftar",          label: "No. Pendaftaran" },
                  { icon: Phone,    val: pendaftar.no_hp || "-",                label: "No. HP" },
                  { icon: MapPin,   val: pendaftar.kabupaten
                      ? `${pendaftar.kabupaten}, ${pendaftar.provinsi || ""}`
                      : "-",                                                    label: "Kota" },
                ].map(({ icon: Icon, val, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Status aktif */}
              <div style={{
                marginTop: 16, background: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: 8, padding: "8px 12px",
                fontSize: 12, color: "#059669", fontWeight: 600, textAlign: "center",
              }}>
                ✅ Akun Aktif
              </div>
            </div>
          </div>

          {/* Info akun */}
          <div style={{
            background: "#fff", borderRadius: 14,
            padding: "16px 18px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
          }}>
            <div style={{
              fontWeight: 700, color: "#94a3b8", fontSize: 11,
              textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12,
            }}>
              Info Akun
            </div>
            {[
              { label: "Role",          val: profileData?.role === "pendaftar" ? "Calon Mahasiswa" : profileData?.role },
              { label: "Tanggal Daftar",val: tglDaftar },
              { label: "Status",        val: profileData?.is_active ? "Aktif" : "Tidak Aktif" },
            ].map(({ label, val }) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "7px 0", borderBottom: "1px solid #f8fafc",
                fontSize: 12.5,
              }}>
                <span style={{ color: "#94a3b8" }}>{label}</span>
                <span style={{ fontWeight: 600, color: "#1e293b" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Panel Kanan ── */}
        <div>
          {/* Tabs */}
          <div style={{
            display: "flex", gap: 4, background: "#f1f5f9",
            borderRadius: 12, padding: 4, marginBottom: 20, width: "fit-content",
          }}>
            {[
              { id: "profil",   label: "👤 Data Diri" },
              { id: "keamanan", label: "🔒 Keamanan" },
            ].map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setAlert(null); }} style={{
                padding: "9px 20px", borderRadius: 9, border: "none",
                background: tab === t.id ? "#fff" : "transparent",
                color: tab === t.id ? "#6366f1" : "#64748b",
                fontWeight: tab === t.id ? 700 : 500,
                fontSize: 13.5, cursor: "pointer",
                boxShadow: tab === t.id ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.18s",
              }}>{t.label}</button>
            ))}
          </div>

          {/* ── Tab: Data Diri (read only) ── */}
          {tab === "profil" && (
            <div style={{
              background: "#fff", borderRadius: 16, padding: "26px 28px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 6 }}>
                Informasi Pribadi
              </div>
              <div style={{
                fontSize: 12.5, color: "#94a3b8", marginBottom: 20,
                background: "#fffbeb", border: "1px solid #fde68a",
                borderRadius: 8, padding: "10px 14px",
              }}>
                ℹ️ Data pribadi diambil dari form pendaftaran. Untuk mengubah data, hubungi admin.
              </div>

              {/* Data dari tabel users */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 11.5, fontWeight: 700, color: "#6366f1",
                  textTransform: "uppercase", letterSpacing: "0.05em",
                  marginBottom: 12,
                }}>Data Akun</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <InfoRow icon={Mail}     label="Email"             value={email} />
                  <InfoRow icon={User}     label="Role"              value="Calon Mahasiswa" />
                  <InfoRow icon={Calendar} label="Bergabung Sejak"   value={tglDaftar} />
                </div>
              </div>

              {/* Data dari tabel pendaftar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 11.5, fontWeight: 700, color: "#6366f1",
                  textTransform: "uppercase", letterSpacing: "0.05em",
                  marginBottom: 12,
                }}>Data Pribadi</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <InfoRow icon={User}   label="Nama Lengkap"       value={pendaftar.nama_lengkap} />
                  <InfoRow icon={Hash}   label="NIK"                value={pendaftar.nik} />
                  <InfoRow icon={Phone}  label="No. HP"             value={pendaftar.no_hp} />
                  <InfoRow icon={User}   label="Jenis Kelamin"      value={pendaftar.jenis_kelamin} />
                  <InfoRow icon={User}   label="Agama"              value={pendaftar.agama} />
                  <InfoRow icon={Hash}   label="No. Pendaftaran"    value={pendaftar.no_pendaftaran} />
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: 11.5, fontWeight: 700, color: "#6366f1",
                  textTransform: "uppercase", letterSpacing: "0.05em",
                  marginBottom: 12,
                }}>Alamat</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <InfoRow icon={MapPin} label="Alamat Lengkap"     value={pendaftar.alamat} />
                  <InfoRow icon={MapPin} label="Kabupaten / Kota"   value={pendaftar.kabupaten} />
                  <InfoRow icon={MapPin} label="Provinsi"           value={pendaftar.provinsi} />
                  <InfoRow icon={Hash}   label="Kode Pos"           value={pendaftar.kode_pos} />
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Keamanan ── */}
          {tab === "keamanan" && (
            <div style={{
              background: "#fff", borderRadius: 16, padding: "26px 28px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "#eef2ff", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <KeyRound size={20} color="#6366f1" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Ubah Password</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>Minimal 6 karakter</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { key: "lama",       label: "Password Lama",            placeholder: "Password saat ini" },
                  { key: "baru",       label: "Password Baru",            placeholder: "Minimal 6 karakter" },
                  { key: "konfirmasi", label: "Konfirmasi Password Baru", placeholder: "Ulangi password baru" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label style={{
                      fontSize: 12.5, fontWeight: 600, color: "#374151",
                      display: "block", marginBottom: 6,
                    }}>
                      {label}
                    </label>
                    <div style={{ position: "relative" }}>
                      <Lock size={15} color="#94a3b8" style={{
                        position: "absolute", left: 13, top: "50%",
                        transform: "translateY(-50%)", pointerEvents: "none",
                      }} />
                      <input
                        type={showPw[key] ? "text" : "password"}
                        value={pw[key]}
                        placeholder={placeholder}
                        onChange={e => {
                          setPw(prev => ({ ...prev, [key]: e.target.value }));
                          if (pwErrors[key]) setPwErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
                        }}
                        style={{
                          width: "100%", padding: "10px 40px 10px 36px",
                          fontSize: 13.5, boxSizing: "border-box",
                          border: `1.5px solid ${pwErrors[key] ? "#fca5a5" : "#e2e8f0"}`,
                          borderRadius: 10, outline: "none", color: "#1e293b",
                          background: pwErrors[key] ? "#fff5f5" : "#fff",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={e => e.target.style.borderColor = "#6366f1"}
                        onBlur={e => e.target.style.borderColor = pwErrors[key] ? "#fca5a5" : "#e2e8f0"}
                      />
                      <button type="button"
                        onClick={() => setShowPw(prev => ({ ...prev, [key]: !prev[key] }))}
                        style={{
                          position: "absolute", right: 12, top: "50%",
                          transform: "translateY(-50%)",
                          background: "none", border: "none", cursor: "pointer",
                          display: "flex", color: "#94a3b8",
                        }}>
                        {showPw[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {pwErrors[key] && (
                      <div style={{
                        fontSize: 11.5, color: "#ef4444", marginTop: 5,
                        display: "flex", gap: 4, alignItems: "center",
                      }}>
                        <AlertCircle size={12} /> {pwErrors[key]}
                      </div>
                    )}
                  </div>
                ))}

                {/* Strength indicator */}
                {pw.baru && (() => {
                  const s = getStrength(pw.baru);
                  const c = strengthCfg[s];
                  return (
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Kekuatan password:</div>
                      <div style={{ background: "#f1f5f9", borderRadius: 99, height: 5, overflow: "hidden" }}>
                        <div style={{
                          width: c.w, height: "100%", background: c.color,
                          borderRadius: 99, transition: "width 0.3s",
                        }} />
                      </div>
                      <span style={{ fontSize: 11.5, color: c.color, fontWeight: 600 }}>{c.label}</span>
                    </div>
                  );
                })()}

                {/* Match indicator */}
                {pw.konfirmasi && pw.baru && (
                  <div style={{
                    fontSize: 12, display: "flex", gap: 6, alignItems: "center",
                    color: pw.baru === pw.konfirmasi ? "#10b981" : "#ef4444",
                  }}>
                    {pw.baru === pw.konfirmasi
                      ? <><CheckCircle size={13} /> Password cocok</>
                      : <><AlertCircle size={13} /> Password tidak cocok</>}
                  </div>
                )}

                {/* Tips */}
                <div style={{
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                  borderRadius: 10, padding: "12px 14px", fontSize: 12.5, color: "#64748b",
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Tips password kuat:</div>
                  {[
                    "Minimal 6 karakter (disarankan 8+)",
                    "Kombinasi huruf besar & kecil",
                    "Mengandung angka",
                    "Mengandung simbol (! @ # $)",
                  ].map(tip => (
                    <div key={tip} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                      <CheckCircle size={12} color="#10b981" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={handleSavePassword} disabled={savingPw} style={{
                marginTop: 22, width: "100%",
                background: savingPw ? "#e2e8f0" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: savingPw ? "#94a3b8" : "#fff",
                border: "none", borderRadius: 10,
                padding: "13px", fontSize: 14, fontWeight: 700,
                cursor: savingPw ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: savingPw ? "none" : "0 4px 14px rgba(99,102,241,0.35)",
                transition: "all 0.2s",
              }}>
                {savingPw
                  ? <><Loader size={15} style={{ animation: "spin 0.8s linear infinite" }} /> Menyimpan...</>
                  : <><KeyRound size={15} /> Ubah Password</>}
              </button>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}