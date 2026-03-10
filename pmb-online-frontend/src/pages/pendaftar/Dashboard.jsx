import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, FileText, Upload, CreditCard, Bell, LogOut,
  CheckCircle, Clock, AlertCircle, XCircle, ChevronRight,
  BookOpen, Menu, Eye, ClipboardList, User, RefreshCw
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getMyPendaftaran } from "../../api/pendaftaranApi";
import { getMyBerkas } from "../../api/berkasApi";
import { getMyPembayaran } from "../../api/pembayaranApi";
import { getPengumuman } from "../../api/pengumumanApi";

// ── Status config — step pakai >= jadi progress maju ─────────────────────────
const statusConfig = {
  draft: {
    label: "Menunggu Kelengkapan",
    color: "#f59e0b", icon: Clock, step: 1,
    next: { label: "Upload Berkas Sekarang →", path: "/pendaftar/upload-berkas", color: "#f59e0b" },
    desc: "Pendaftaran tersimpan. Silakan lengkapi berkas dan pembayaran.",
  },
  submitted: {
    label: "Menunggu Verifikasi",
    color: "#3b82f6", icon: Eye, step: 3,
    next: null,
    desc: "Data sudah disubmit. Menunggu verifikasi admin.",
  },
  verifikasi_berkas: {
    label: "Verifikasi Berkas",
    color: "#8b5cf6", icon: Eye, step: 2,
    next: { label: "Cek Status Berkas →", path: "/pendaftar/upload-berkas", color: "#8b5cf6" },
    desc: "Berkas sedang diperiksa oleh admin.",
  },
  verifikasi_pembayaran: {
    label: "Verifikasi Pembayaran",
    color: "#6366f1", icon: CreditCard, step: 3,
    next: { label: "Cek Status Pembayaran →", path: "/pendaftar/pembayaran", color: "#6366f1" },
    desc: "Pembayaran sedang diverifikasi oleh admin.",
  },
  diterima: {
    label: "Diterima ✓",
    color: "#10b981", icon: CheckCircle, step: 4,
    next: { label: "Lihat Pengumuman →", path: "/pendaftar/cek-kelulusan", color: "#10b981" },
    desc: "Selamat! Anda diterima di program studi pilihan.",
  },
  ditolak: {
    label: "Tidak Diterima",
    color: "#ef4444", icon: XCircle, step: -1,
    next: { label: "Lihat Pengumuman →", path: "/pendaftar/cek-kelulusan", color: "#ef4444" },
    desc: "Maaf, pendaftaran Anda tidak diterima.",
  },
};

const berkasStatusConfig = {
  approved: { label: "Terverifikasi", color: "#10b981", bg: "#d1fae5", icon: CheckCircle },
  pending:  { label: "Menunggu",      color: "#f59e0b", bg: "#fef3c7", icon: Clock },
  rejected: { label: "Ditolak",       color: "#ef4444", bg: "#fee2e2", icon: XCircle },
};

const kategoriConfig = {
  penting:   { color: "#ef4444", bg: "#fee2e2" },
  jadwal:    { color: "#8b5cf6", bg: "#ede9fe" },
  info:      { color: "#3b82f6", bg: "#dbeafe" },
  kelulusan: { color: "#10b981", bg: "#d1fae5" },
};

const pageLabels = {
  dashboard: "Dashboard", pendaftaran: "Form Pendaftaran",
  berkas: "Upload Berkas", pembayaran: "Pembayaran",
  pengumuman: "Pengumuman", profil: "Profil Saya",
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 16, radius = 8 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
    }} />
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar({ active, collapsed, setCollapsed }) {
  const navigate   = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { id: "dashboard",   label: "Dashboard",     icon: Home,          path: "/pendaftar/dashboard" },
    { id: "pendaftaran", label: "Pendaftaran",   icon: ClipboardList, path: "/pendaftar/form-pendaftaran" },
    { id: "berkas",      label: "Upload Berkas", icon: Upload,        path: "/pendaftar/upload-berkas" },
    { id: "pembayaran",  label: "Pembayaran",    icon: CreditCard,    path: "/pendaftar/pembayaran" },
    { id: "pengumuman",  label: "Pengumuman",    icon: Bell,          path: "/pendaftar/cek-kelulusan" },
    { id: "profil",      label: "Profil",        icon: User,          path: "/pendaftar/profil" },
  ];

  return (
    <aside style={{
      width: collapsed ? 68 : 240, minHeight: "100vh",
      background: "linear-gradient(180deg,#0f172a 0%,#1e293b 100%)",
      display: "flex", flexDirection: "column",
      transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
      position: "fixed", left: 0, top: 0, bottom: 0,
      zIndex: 100, boxShadow: "4px 0 24px rgba(0,0,0,0.18)", overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? "20px 16px" : "24px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", gap: 12, minHeight: 72,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 16px rgba(99,102,241,0.5)",
        }}>
          <BookOpen size={18} color="#fff" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ color: "#f8fafc", fontWeight: 700, fontSize: 13, letterSpacing: "0.04em" }}>PMB ONLINE</div>
            <div style={{ color: "#64748b", fontSize: 11, marginTop: 3 }}>USNP 2024/2025</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          marginLeft: "auto", background: "none", border: "none",
          color: "#64748b", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex",
        }}>
          <Menu size={16} />
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        {navItems.map(({ id, label, icon: Icon, path }) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => navigate(path)} style={{
              width: "100%", display: "flex", alignItems: "center",
              gap: 12, padding: collapsed ? "11px 16px" : "11px 14px",
              borderRadius: 10, border: "none", cursor: "pointer",
              background: isActive ? "rgba(99,102,241,0.15)" : "transparent",
              color: isActive ? "#a5b4fc" : "#94a3b8",
              marginBottom: 2, transition: "all 0.18s", position: "relative",
              justifyContent: collapsed ? "center" : "flex-start",
            }}>
              {isActive && (
                <span style={{
                  position: "absolute", left: 0, top: "20%", bottom: "20%",
                  width: 3, borderRadius: 4,
                  background: "linear-gradient(180deg,#6366f1,#8b5cf6)",
                }} />
              )}
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span style={{ fontSize: 13.5, fontWeight: isActive ? 600 : 400 }}>{label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <button onClick={logout} style={{
          width: "100%", display: "flex", alignItems: "center",
          gap: 12, padding: collapsed ? "11px 16px" : "11px 14px",
          borderRadius: 10, border: "none", cursor: "pointer",
          background: "transparent", color: "#ef4444",
          justifyContent: collapsed ? "center" : "flex-start", fontSize: 13.5,
        }}>
          <LogOut size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
export function DashboardLayout({ children, activePage }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const namaUser = user?.pendaftar?.nama_lengkap || user?.nama || user?.email || "Pengguna";
  const sidebarW = collapsed ? 68 : 240;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <Sidebar active={activePage} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main style={{ marginLeft: sidebarW, transition: "margin-left 0.25s cubic-bezier(.4,0,.2,1)", minHeight: "100vh" }}>
        {/* Topbar */}
        <header style={{
          background: "#fff", borderBottom: "1px solid #f1f5f9",
          padding: "16px 32px", display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              {pageLabels[activePage] || activePage}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>PMB Online USNP 2024/2025</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button style={{
              width: 38, height: 38, borderRadius: 10, background: "#f1f5f9",
              border: "none", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", position: "relative",
            }}>
              <Bell size={17} color="#64748b" />
              <span style={{
                position: "absolute", top: 8, right: 8, width: 8, height: 8,
                borderRadius: "50%", background: "#ef4444", border: "2px solid #fff",
              }} />
            </button>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}>
              {namaUser.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <div style={{ padding: "28px 32px" }}>{children}</div>
      </main>
    </div>
  );
}

// ── Progress Timeline — fixed: pakai >= ───────────────────────────────────────
function ProgressTimeline({ status, berkas = [], pembayaran = null }) {
  const steps = ["Pendaftaran", "Berkas", "Pembayaran", "Kelulusan"];
  
  // Hitung step dinamis untuk status "draft"
  let currentStep = statusConfig[status]?.step ?? 0;

if (status === "draft") {
  const berkasOk = berkas.filter(b => b.status_verifikasi === "approved").length;
  const sudahBayar = pembayaran?.status_pembayaran === "paid";

  if (sudahBayar && berkasOk >= 3) {
    currentStep = 4; // ✅ Semua selesai → Kelulusan (menunggu verifikasi admin)
  } else if (sudahBayar || berkasOk >= 3) {
    currentStep = 3; // Salah satu selesai → Pembayaran
  } else if (berkasOk > 0) {
    currentStep = 2; // Ada berkas → Berkas
  } else {
    currentStep = 1; // Baru mulai
  }
}

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const done    = currentStep > stepNum;
        const active  = currentStep === stepNum;
        const reached = currentStep >= stepNum;
        const color   = reached ? "#6366f1" : "#e2e8f0";
        const textColor = reached ? "#6366f1" : "#94a3b8";

        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: done ? "#6366f1" : active ? "#fff" : "#f1f5f9",
                border: `2px solid ${color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: active ? "0 0 0 4px rgba(99,102,241,0.15)" : "none",
                transition: "all 0.3s",
              }}>
                {done
                  ? <CheckCircle size={18} color="#fff" strokeWidth={2.5} />
                  : active
                    ? <span style={{ fontSize: 13, fontWeight: 800, color: "#6366f1" }}>{stepNum}</span>
                    : <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>{stepNum}</span>
                }
              </div>
              <span style={{
                fontSize: 11.5, fontWeight: active ? 700 : 500,
                color: textColor, whiteSpace: "nowrap",
              }}>
                {label}
              </span>
              {active && (
                <span style={{
                  fontSize: 10, color: "#6366f1", fontWeight: 600,
                  background: "#eef2ff", padding: "1px 7px", borderRadius: 99,
                }}>Sekarang</span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: "0 6px", marginBottom: 32,
                background: done ? "#6366f1" : "#e2e8f0",
                borderRadius: 2, transition: "background 0.4s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Next Step Banner ──────────────────────────────────────────────────────────
function NextStepBanner({ pendaftaran, pembayaran, berkas }) {
  const navigate = useNavigate();
  const status   = pendaftaran?.status_pendaftaran;
  const cfg      = statusConfig[status];

  // Tentukan langkah berikutnya secara dinamis
  let banner = null;

  if (status === "draft") {
    const berkasApproved = berkas.filter(b => b.status_verifikasi === "approved").length;
    const sudahBayar     = pembayaran?.status_pembayaran === "paid";

    if (!sudahBayar && berkasApproved < 3) {
      // Belum berkas & belum bayar — prioritas berkas dulu
      banner = {
        bg: "#fffbeb", border: "#fde68a", textColor: "#92400e",
        subColor: "#b45309", btnColor: "#f59e0b",
        title: "Langkah 2: Upload Berkas",
        sub: `Upload minimal 3 berkas wajib (KTP, Ijazah, Foto). Sudah: ${berkasApproved}/3`,
        btnLabel: "Upload Berkas →",
        path: "/pendaftar/upload-berkas",
      };
    } else if (!sudahBayar) {
      // Berkas cukup, belum bayar
      banner = {
        bg: "#eff6ff", border: "#bfdbfe", textColor: "#1e40af",
        subColor: "#3b82f6", btnColor: "#3b82f6",
        title: "Langkah 3: Lakukan Pembayaran",
        sub: "Berkas sudah lengkap. Selesaikan pembayaran untuk melanjutkan.",
        btnLabel: "Bayar Sekarang →",
        path: "/pendaftar/pembayaran",
      };
    } else {
      // Semua selesai, tinggal tunggu admin
      banner = {
        bg: "#f0fdf4", border: "#bbf7d0", textColor: "#065f46",
        subColor: "#059669", btnColor: "#10b981",
        title: "Menunggu Verifikasi Admin",
        sub: "Berkas dan pembayaran sudah lengkap. Admin akan memverifikasi data Anda.",
        btnLabel: "Lihat Status →",
        path: "/pendaftar/dashboard",
      };
    }
  } else if (cfg?.next) {
    banner = {
      bg: cfg.color + "12", border: cfg.color + "40",
      textColor: cfg.color, subColor: cfg.color + "cc",
      btnColor: cfg.color,
      title: cfg.label,
      sub: cfg.desc,
      btnLabel: cfg.next.label,
      path: cfg.next.path,
    };
  }

  if (!banner) return null;

  return (
    <div style={{
      background: banner.bg, border: `1px solid ${banner.border}`,
      borderRadius: 14, padding: "16px 20px", marginBottom: 24,
      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
    }}>
      <div>
        <div style={{ fontWeight: 700, color: banner.textColor, fontSize: 14, marginBottom: 4 }}>
          {banner.title}
        </div>
        <div style={{ fontSize: 13, color: banner.subColor }}>{banner.sub}</div>
      </div>
      <button onClick={() => navigate(banner.path)} style={{
        background: banner.btnColor, color: "#fff", border: "none",
        borderRadius: 9, padding: "10px 20px", fontSize: 13, fontWeight: 700,
        cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
        boxShadow: `0 4px 12px ${banner.btnColor}40`,
      }}>
        {banner.btnLabel}
      </button>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const namaUser = user?.pendaftar?.nama_lengkap || user?.nama || user?.email || "Pengguna";

  const [pendaftaran, setPendaftaran]   = useState(null);
  const [berkas, setBerkas]             = useState([]);
  const [pembayaran, setPembayaran]     = useState(null);
  const [pengumuman, setPengumuman]     = useState([]);
  const [loadingMain, setLoadingMain]   = useState(true);
  const [loadingPengumuman, setLoadingPengumuman] = useState(true);
  const [errorMain, setErrorMain]       = useState("");

  const fetchMain = async () => {
    setLoadingMain(true);
    setErrorMain("");
    try {
      // Ambil pendaftaran dulu
      const dataPendaftaran = await getMyPendaftaran().catch(() => null);
      setPendaftaran(dataPendaftaran);

      // Ambil berkas & pembayaran pakai pendaftaran_id
      if (dataPendaftaran?.id) {
        const [dataBerkas, dataPembayaran] = await Promise.all([
          getMyBerkas(dataPendaftaran.id).catch(() => []),
          getMyPembayaran(dataPendaftaran.id).catch(() => null),
        ]);
        setBerkas(Array.isArray(dataBerkas) ? dataBerkas : []);
        setPembayaran(dataPembayaran);
      }
    } catch {
      setErrorMain("Gagal memuat data dashboard.");
    } finally {
      setLoadingMain(false);
    }
  };

  const fetchPengumuman = async () => {
    setLoadingPengumuman(true);
    try {
      const data = await getPengumuman({ limit: 3 });
      setPengumuman(Array.isArray(data) ? data : (data?.pengumuman || []));
    } catch {
      setPengumuman([]);
    } finally {
      setLoadingPengumuman(false);
    }
  };

  useEffect(() => {
    fetchMain();
    fetchPengumuman();
  }, []);

  const statusInfo  = statusConfig[pendaftaran?.status_pendaftaran] || statusConfig.draft;
  const StatusIcon  = statusInfo.icon;
  const berkasOk    = berkas.filter(b => b.status_verifikasi === "approved").length;
  const berkasTotal = berkas.length;

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loadingMain) {
    return (
      <DashboardLayout activePage="dashboard">
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        <div style={{ background: "#e0e7ff", borderRadius: 20, padding: "28px 32px", marginBottom: 24 }}>
          <Skeleton w="30%" h={13} />
          <div style={{ marginTop: 10 }}><Skeleton w="50%" h={24} /></div>
          <div style={{ marginTop: 8 }}><Skeleton w="40%" h={12} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1px solid #f1f5f9" }}>
              <Skeleton w={44} h={44} radius={12} />
              <div style={{ marginTop: 12 }}><Skeleton w="50%" h={12} /></div>
              <div style={{ marginTop: 8 }}><Skeleton w="70%" h={20} /></div>
            </div>
          ))}
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: "24px 28px", border: "1px solid #f1f5f9" }}>
          <Skeleton w="30%" h={16} />
          <div style={{ marginTop: 20 }}><Skeleton h={36} /></div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (errorMain) {
    return (
      <DashboardLayout activePage="dashboard">
        <div style={{ background: "#fff", borderRadius: 16, padding: "40px", textAlign: "center", border: "1px solid #fee2e2" }}>
          <AlertCircle size={36} color="#ef4444" style={{ marginBottom: 12 }} />
          <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>Gagal memuat data</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>{errorMain}</div>
          <button onClick={fetchMain} style={{
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
    <DashboardLayout activePage="dashboard">
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Welcome Banner */}
      <div style={{
        background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 60%,#a78bfa 100%)",
        borderRadius: 20, padding: "28px 32px", marginBottom: 24,
        color: "#fff", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", right: -30, top: -30,
          width: 180, height: 180, borderRadius: "50%",
          background: "rgba(255,255,255,0.07)",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Selamat datang kembali 👋</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{namaUser}</div>
          <div style={{ fontSize: 12.5, opacity: 0.75 }}>
            {pendaftaran?.no_pendaftaran
              ? <>No. Pendaftaran: <b>{pendaftaran.no_pendaftaran}</b></>
              : pendaftaran
                ? <>Status: <b>{statusInfo.label}</b></>
                : "Belum ada pendaftaran — mulai sekarang!"}
          </div>
        </div>
      </div>

      {/* Next Step Banner — panduan langkah selanjutnya */}
      {pendaftaran && (
        <NextStepBanner
          pendaftaran={pendaftaran}
          pembayaran={pembayaran}
          berkas={berkas}
        />
      )}

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 16, marginBottom: 24 }}>
        {[
          {
            label: "Status Pendaftaran",
            value: pendaftaran ? statusInfo.label : "Belum Daftar",
            color: pendaftaran ? statusInfo.color : "#94a3b8",
            Icon: pendaftaran ? StatusIcon : FileText,
          },
          {
            label: "Berkas",
            value: berkasTotal > 0 ? `${berkasOk}/${berkasTotal}` : "0/0",
            sub: berkasOk > 0 ? `${berkasOk} terverifikasi` : "belum ada berkas",
            color: berkasOk === berkasTotal && berkasTotal > 0 ? "#10b981" : "#f59e0b",
            Icon: FileText,
          },
          {
            label: "Program Studi",
            value: pendaftaran?.nama_prodi || pendaftaran?.prodi?.nama_prodi || "-",
            sub: pendaftaran?.jalur_masuk || "",
            color: "#6366f1", Icon: BookOpen,
          },
          {
            label: "Pembayaran",
            value: !pembayaran ? "Belum Ada"
              : pembayaran.status_pembayaran === "paid" ? "Lunas"
              : pembayaran.status_pembayaran === "pending" ? "Belum Dibayar"
              : "Gagal",
            sub: pembayaran?.jumlah
              ? `Rp ${Number(pembayaran.jumlah).toLocaleString("id")}`
              : undefined,
            color: pembayaran?.status_pembayaran === "paid" ? "#10b981"
              : pembayaran?.status_pembayaran === "pending" ? "#f59e0b"
              : "#94a3b8",
            Icon: CreditCard,
          },
        ].map(({ label, value, sub, color, Icon }) => (
          <div key={label} style={{
            background: "#fff", borderRadius: 16, padding: "20px 22px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
            display: "flex", alignItems: "flex-start", gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: color + "18",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={20} color={color} strokeWidth={2} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.3, wordBreak: "break-word" }}>
                {value}
              </div>
              {sub && <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>{sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Timeline */}
      {pendaftaran ? (
        <div style={{
          background: "#fff", borderRadius: 16, padding: "24px 32px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.06)", marginBottom: 24,
          border: "1px solid #f1f5f9",
        }}>
          <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 24, fontSize: 15 }}>
            📋 Progres Pendaftaran
          </div>
          <ProgressTimeline status={pendaftaran.status_pendaftaran}
  berkas={berkas}
  pembayaran={pembayaran} />
        </div>
      ) : (
        <div style={{
          background: "#fff", borderRadius: 16, padding: "32px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px dashed #c7d2fe",
          textAlign: "center", marginBottom: 24,
        }}>
          <ClipboardList size={40} color="#a5b4fc" style={{ marginBottom: 12 }} />
          <div style={{ fontWeight: 700, fontSize: 16, color: "#1e293b", marginBottom: 6 }}>
            Anda belum melakukan pendaftaran
          </div>
          <div style={{ fontSize: 13.5, color: "#64748b", marginBottom: 20 }}>
            Mulai proses pendaftaran sekarang untuk melanjutkan ke tahap berikutnya.
          </div>
          <button onClick={() => navigate("/pendaftar/form-pendaftaran")} style={{
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
            border: "none", borderRadius: 10, padding: "12px 28px",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
          }}>
            Mulai Pendaftaran →
          </button>
        </div>
      )}

      {/* Berkas & Pengumuman */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Status Berkas */}
        <div style={{
          background: "#fff", borderRadius: 16, padding: "22px 24px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>📁 Status Berkas</span>
            <button onClick={() => navigate("/pendaftar/upload-berkas")} style={{
              background: "none", border: "none", color: "#6366f1",
              fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
            }}>Lihat semua <ChevronRight size={13} /></button>
          </div>
          {berkas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: 13 }}>
              Belum ada berkas diupload
            </div>
          ) : berkas.slice(0, 4).map((b, i) => {
            const cfg = berkasStatusConfig[b.status_verifikasi] || {
              label: "Belum Upload", color: "#94a3b8", bg: "#f1f5f9", icon: AlertCircle,
            };
            const BIcon = cfg.icon;
            return (
              <div key={b.id || i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 0",
                borderBottom: i < Math.min(berkas.length, 4) - 1 ? "1px solid #f8fafc" : "none",
              }}>
                <BIcon size={14} color={cfg.color} strokeWidth={2} />
                <span style={{ flex: 1, fontSize: 12.5, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {b.jenis_berkas || "Berkas"}
                </span>
                <span style={{
                  fontSize: 11, padding: "2px 8px", borderRadius: 20,
                  background: cfg.bg, color: cfg.color, fontWeight: 600, flexShrink: 0,
                }}>{cfg.label}</span>
              </div>
            );
          })}
        </div>

        {/* Pengumuman */}
        <div style={{
          background: "#fff", borderRadius: 16, padding: "22px 24px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>📢 Pengumuman</span>
            <button onClick={() => navigate("/pendaftar/cek-kelulusan")} style={{
              background: "none", border: "none", color: "#6366f1",
              fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
            }}>Lihat semua <ChevronRight size={13} /></button>
          </div>
          {loadingPengumuman ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[...Array(3)].map((_, i) => <Skeleton key={i} h={14} />)}
            </div>
          ) : pengumuman.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: 13 }}>
              Belum ada pengumuman
            </div>
          ) : pengumuman.map((p, i) => {
            const k = kategoriConfig[p.kategori] || kategoriConfig.info;
            return (
              <div key={p.id} style={{
                padding: "10px 0",
                borderBottom: i < pengumuman.length - 1 ? "1px solid #f8fafc" : "none",
              }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{
                    fontSize: 10, padding: "2px 7px", borderRadius: 20,
                    background: k.bg, color: k.color, fontWeight: 700,
                    flexShrink: 0, marginTop: 2,
                  }}>{(p.kategori || "info").toUpperCase()}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: "#334155", fontWeight: 500, lineHeight: 1.4 }}>
                      {p.judul}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                      {p.tanggal_publish
                        ? new Date(p.tanggal_publish).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                        : ""}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}