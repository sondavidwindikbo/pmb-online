// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Users, FileText, CreditCard, Bell, BookOpen,
  LogOut, Menu, ChevronRight, CheckCircle, Clock,
  XCircle, AlertCircle, TrendingUp, RefreshCw, Loader,
  ClipboardList, Settings
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAllPendaftaran } from "../../api/adminApi";
import { getAllPembayaran } from "../../api/adminApi";
import { getAllPengumumanAdmin } from "../../api/adminApi";
import { getProdiStats } from "../../api/adminApi";

// ── Warna tema admin ──────────────────────────────────────────────────────────
const ADMIN_COLOR = "#0f172a";
const ACCENT      = "#6366f1";

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard",   label: "Dashboard",     icon: Home,          path: "/admin/dashboard" },
  { id: "pendaftaran", label: "Pendaftaran",   icon: ClipboardList, path: "/admin/pendaftaran" },
  { id: "berkas",      label: "Verifikasi Berkas", icon: FileText,  path: "/admin/berkas" },
  { id: "pembayaran",  label: "Pembayaran",    icon: CreditCard,    path: "/admin/pembayaran" },
  { id: "pengumuman",  label: "Pengumuman",    icon: Bell,          path: "/admin/pengumuman" },
  { id: "prodi",       label: "Program Studi", icon: BookOpen,      path: "/admin/prodi" },
];

const PAGE_LABELS = {
  dashboard:   "Dashboard Admin",
  pendaftaran: "Manajemen Pendaftaran",
  berkas:      "Verifikasi Berkas",
  pembayaran:  "Manajemen Pembayaran",
  pengumuman:  "Kelola Pengumuman",
  prodi:       "Program Studi",
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ w = "100%", h = 16, radius = 8 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
    }} />
  );
}

// ── Admin Sidebar ─────────────────────────────────────────────────────────────
export function AdminSidebar({ active, collapsed, setCollapsed }) {
  const navigate   = useNavigate();
  const { logout } = useAuth();

  return (
    <aside style={{
      width: collapsed ? 68 : 240, minHeight: "100vh",
      background: "linear-gradient(180deg,#0f172a 0%,#1e293b 100%)",
      display: "flex", flexDirection: "column",
      transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
      position: "fixed", left: 0, top: 0, bottom: 0,
      zIndex: 100, boxShadow: "4px 0 24px rgba(0,0,0,0.18)",
      overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? "20px 16px" : "24px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", gap: 12, minHeight: 72,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: "linear-gradient(135deg,#ef4444,#dc2626)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 16px rgba(239,68,68,0.4)",
        }}>
          <Settings size={18} color="#fff" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ color: "#f8fafc", fontWeight: 700, fontSize: 13, letterSpacing: "0.04em" }}>
              ADMIN PANEL
            </div>
            <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>PMB Online USNP</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          marginLeft: "auto", background: "none", border: "none",
          color: "#64748b", cursor: "pointer", padding: 4, borderRadius: 6,
          display: "flex",
        }}>
          <Menu size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => navigate(path)} style={{
              width: "100%", display: "flex", alignItems: "center",
              gap: 12, padding: collapsed ? "11px 16px" : "11px 14px",
              borderRadius: 10, border: "none", cursor: "pointer",
              background: isActive ? "rgba(99,102,241,0.15)" : "transparent",
              color: isActive ? "#a5b4fc" : "#94a3b8",
              marginBottom: 2, transition: "all 0.18s",
              position: "relative",
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

// ── Admin Layout ──────────────────────────────────────────────────────────────
export function AdminLayout({ children, activePage }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const namaAdmin = user?.email || "Admin";
  const sidebarW  = collapsed ? 68 : 240;

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
      background: "#f8fafc", minHeight: "100vh",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <AdminSidebar active={activePage} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main style={{ marginLeft: sidebarW, transition: "margin-left 0.25s cubic-bezier(.4,0,.2,1)", minHeight: "100vh" }}>
        {/* Topbar */}
        <header style={{
          background: "#fff", borderBottom: "1px solid #f1f5f9",
          padding: "16px 32px", display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              {PAGE_LABELS[activePage] || activePage}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
              PMB Online USNP 2024/2025
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              background: "#fee2e2", color: "#dc2626",
              fontSize: 11, fontWeight: 700, padding: "3px 10px",
              borderRadius: 20, letterSpacing: "0.04em",
            }}>ADMIN</div>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg,#ef4444,#dc2626)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 14,
            }}>
              A
            </div>
          </div>
        </header>
        <div style={{ padding: "28px 32px" }}>
          <style>{`
            @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
            @keyframes spin{to{transform:rotate(360deg)}}
          `}</style>
          {children}
        </div>
      </main>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, Icon, loading, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "#fff", borderRadius: 16, padding: "20px 22px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
      display: "flex", alignItems: "flex-start", gap: 14,
      cursor: onClick ? "pointer" : "default",
      transition: "box-shadow 0.2s",
    }}
    onMouseOver={e => onClick && (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.10)")}
    onMouseOut={e => onClick && (e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.06)")}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        background: color + "18",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={22} color={color} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginBottom: 4 }}>{label}</div>
        {loading
          ? <Skeleton w="60%" h={24} />
          : <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{value ?? "-"}</div>
        }
        {sub && !loading && (
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{sub}</div>
        )}
      </div>
    </div>
  );
}

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats]   = useState(null);
  const [recent, setRecent] = useState([]);
  const [recentPembayaran, setRecentPembayaran] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [pendRes, bayarRes, prodiStatsRes] = await Promise.all([
        getAllPendaftaran({ limit: 5 }),
        getAllPembayaran({ limit: 5 }),
        getProdiStats(),
      ]);

      setStats({
        totalPendaftar:   pendRes.pagination?.total  || 0,
        totalPembayaran:  bayarRes.pagination?.total || 0,
        totalProdi:       prodiStatsRes?.summary?.total_prodi || 0,
        totalDiterima:    prodiStatsRes?.summary?.total_diterima || 0,
      });
      setRecent(pendRes.data || []);
      setRecentPembayaran(bayarRes.data || []);
    } catch {
      setError("Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const statusBadge = (status) => {
    const map = {
      draft:                 { label: "Draft",         color: "#94a3b8", bg: "#f1f5f9" },
      submitted:             { label: "Disubmit",      color: "#f59e0b", bg: "#fef3c7" },
      verified:              { label: "Terverifikasi", color: "#10b981", bg: "#d1fae5" },
      rejected:              { label: "Ditolak",       color: "#ef4444", bg: "#fee2e2" },
      accepted:              { label: "Diterima",      color: "#6366f1", bg: "#eef2ff" },
      verifikasi_berkas:     { label: "Verif. Berkas", color: "#8b5cf6", bg: "#ede9fe" },
      verifikasi_pembayaran: { label: "Verif. Bayar",  color: "#3b82f6", bg: "#dbeafe" },
    };
    const cfg = map[status] || { label: status, color: "#94a3b8", bg: "#f1f5f9" };
    return (
      <span style={{
        fontSize: 11, padding: "3px 9px", borderRadius: 20,
        background: cfg.bg, color: cfg.color, fontWeight: 700,
        whiteSpace: "nowrap",
      }}>{cfg.label}</span>
    );
  };

  const bayarBadge = (status) => {
    const map = {
      pending: { label: "Belum Bayar", color: "#f59e0b", bg: "#fef3c7" },
      paid:    { label: "Lunas",       color: "#10b981", bg: "#d1fae5" },
      failed:  { label: "Gagal",       color: "#ef4444", bg: "#fee2e2" },
    };
    const cfg = map[status] || { label: status || "-", color: "#94a3b8", bg: "#f1f5f9" };
    return (
      <span style={{
        fontSize: 11, padding: "3px 9px", borderRadius: 20,
        background: cfg.bg, color: cfg.color, fontWeight: 700,
      }}>{cfg.label}</span>
    );
  };

  return (
    <AdminLayout activePage="dashboard">

      {/* Error */}
      {error && (
        <div style={{
          background: "#fee2e2", border: "1px solid #fca5a5",
          borderRadius: 12, padding: "14px 18px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 10,
          fontSize: 13, color: "#dc2626",
        }}>
          <AlertCircle size={16} />
          {error}
          <button onClick={fetchData} style={{
            marginLeft: "auto", background: "#dc2626", color: "#fff",
            border: "none", borderRadius: 7, padding: "6px 14px",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <RefreshCw size={13} /> Coba Lagi
          </button>
        </div>
      )}

      {/* Welcome */}
      <div style={{
        background: "linear-gradient(135deg,#0f172a,#1e293b)",
        borderRadius: 20, padding: "24px 32px", marginBottom: 24, color: "#fff",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", right: -20, top: -20,
          width: 160, height: 160, borderRadius: "50%",
          background: "rgba(99,102,241,0.08)",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>
            Selamat datang, Admin 👋
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
            Panel Administrasi PMB
          </div>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            Kelola pendaftaran, berkas, pembayaran, dan pengumuman
          </div>
        </div>
        <button onClick={fetchData} style={{
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
          color: "#cbd5e1", borderRadius: 10, padding: "9px 18px",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6, position: "relative", zIndex: 1,
        }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard
          label="Total Pendaftar"
          value={stats?.totalPendaftar}
          sub="Semua status"
          color="#6366f1" Icon={Users} loading={loading}
          onClick={() => navigate("/admin/pendaftaran")}
        />
        <StatCard
          label="Total Pembayaran"
          value={stats?.totalPembayaran}
          sub="Semua transaksi"
          color="#10b981" Icon={CreditCard} loading={loading}
          onClick={() => navigate("/admin/pembayaran")}
        />
        <StatCard
          label="Program Studi"
          value={stats?.totalProdi}
          sub="Prodi aktif"
          color="#f59e0b" Icon={BookOpen} loading={loading}
          onClick={() => navigate("/admin/prodi")}
        />
        <StatCard
          label="Total Diterima"
          value={stats?.totalDiterima}
          sub="Status accepted"
          color="#8b5cf6" Icon={CheckCircle} loading={loading}
        />
      </div>

      {/* Shortcut actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Verifikasi Berkas", sub: "Review berkas pendaftar", color: "#6366f1", path: "/admin/berkas", icon: FileText },
          { label: "Verifikasi Pembayaran", sub: "Konfirmasi transfer masuk", color: "#10b981", path: "/admin/pembayaran", icon: CreditCard },
          { label: "Buat Pengumuman", sub: "Publikasi info & kelulusan", color: "#f59e0b", path: "/admin/pengumuman", icon: Bell },
        ].map(({ label, sub, color, path, icon: Icon }) => (
          <button key={label} onClick={() => navigate(path)} style={{
            background: "#fff", border: `1px solid ${color}30`,
            borderRadius: 14, padding: "16px 20px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 14,
            textAlign: "left", transition: "all 0.18s",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
          onMouseOver={e => e.currentTarget.style.boxShadow = `0 4px 20px ${color}25`}
          onMouseOut={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: color + "15",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a" }}>{label}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{sub}</div>
            </div>
            <ChevronRight size={16} color="#94a3b8" style={{ marginLeft: "auto" }} />
          </button>
        ))}
      </div>

      {/* Tabel recent */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Recent Pendaftaran */}
        <div style={{
          background: "#fff", borderRadius: 16, padding: "22px 24px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
              📋 Pendaftaran Terbaru
            </span>
            <button onClick={() => navigate("/admin/pendaftaran")} style={{
              background: "none", border: "none", color: "#6366f1",
              fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
            }}>
              Lihat semua <ChevronRight size={13} />
            </button>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[...Array(5)].map((_, i) => <Skeleton key={i} h={40} />)}
            </div>
          ) : recent.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: 13 }}>
              Belum ada pendaftaran
            </div>
          ) : (
            <div>
              {recent.map((p, i) => (
                <div key={p.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 0",
                  borderBottom: i < recent.length - 1 ? "1px solid #f8fafc" : "none",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/admin/pendaftaran/${p.id}`)}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    background: "#eef2ff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, color: "#6366f1",
                  }}>
                    {(p.nama_lengkap || "?").charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: "#1e293b",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {p.nama_lengkap}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                      {p.nama_prodi} · {p.jalur_masuk}
                    </div>
                  </div>
                  {statusBadge(p.status_pendaftaran)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Pembayaran */}
        <div style={{
          background: "#fff", borderRadius: 16, padding: "22px 24px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
              💳 Pembayaran Terbaru
            </span>
            <button onClick={() => navigate("/admin/pembayaran")} style={{
              background: "none", border: "none", color: "#6366f1",
              fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
            }}>
              Lihat semua <ChevronRight size={13} />
            </button>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[...Array(5)].map((_, i) => <Skeleton key={i} h={40} />)}
            </div>
          ) : recentPembayaran.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: 13 }}>
              Belum ada pembayaran
            </div>
          ) : (
            <div>
              {recentPembayaran.map((p, i) => (
                <div key={p.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 0",
                  borderBottom: i < recentPembayaran.length - 1 ? "1px solid #f8fafc" : "none",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: "#1e293b",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {p.nama_lengkap}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                      Rp {Number(p.jumlah || 0).toLocaleString("id")} · {p.metode_pembayaran?.replace("_"," ")}
                    </div>
                  </div>
                  {bayarBadge(p.status_pembayaran)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}