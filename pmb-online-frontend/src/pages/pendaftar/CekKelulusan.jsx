// src/pages/pendaftar/CekKelulusan.jsx
import { useState, useEffect } from "react";
import {
  Bell, ChevronRight, Award, Search,
  Loader, AlertCircle, RefreshCw, Clock,
  XCircle, CheckCircle, BookOpen
} from "lucide-react";
import { DashboardLayout } from "./Dashboard";
import api from "../../api/axios";

// ── Config kategori pengumuman ────────────────────────────────────────────────
const kategoriConfig = {
  penting:   { color: "#ef4444", bg: "#fee2e2",  label: "PENTING" },
  jadwal:    { color: "#8b5cf6", bg: "#ede9fe",  label: "JADWAL"  },
  info:      { color: "#3b82f6", bg: "#dbeafe",  label: "INFO"    },
  kelulusan: { color: "#10b981", bg: "#d1fae5",  label: "KELULUSAN" },
};

// ── Fetch pengumuman aktif ─────────────────────────────────────────────────────
// GET /api/pengumuman?is_active=true
const fetchPengumuman = async () => {
  const res = await api.get("/pengumuman", { params: { is_active: true, limit: 50 } });
  return res.data.data || [];
};

// ── Fetch status kelulusan pendaftar yang login ────────────────────────────────
// GET /api/pendaftaran/my  → ambil status_pendaftaran
const fetchStatusKelulusan = async () => {
  const res = await api.get("/pendaftaran/my");
  const arr = res.data.data || [];
  if (arr.length === 0) return null;
  const p = arr[0];
  return {
    status_pendaftaran: p.status_pendaftaran,
    nama_lengkap:       p.nama_lengkap,
    no_pendaftaran:     p.no_pendaftaran,
    nama_prodi:         p.nama_prodi,
    fakultas:           p.fakultas,
    jalur_masuk:        p.jalur_masuk,
    created_at:         p.created_at,
    tanggal_verifikasi: p.tanggal_verifikasi,
    catatan:            p.catatan,
  };
};

// ── Format tanggal ─────────────────────────────────────────────────────────────
const formatTanggal = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
};

// ── Kelulusan card config ──────────────────────────────────────────────────────
const getKelulusanConfig = (status) => {
  switch (status) {
    case "accepted":
      return {
        gradient: "linear-gradient(135deg, #10b981, #059669)",
        icon: Award,
        iconColor: "rgba(255,255,255,0.9)",
        judul: "🎉 Selamat! Anda DITERIMA",
        desc: "Anda dinyatakan DITERIMA di program studi",
        sub: "Silakan cek email dan lakukan registrasi ulang sesuai petunjuk.",
      };
    case "verified":
      return {
        gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        icon: Clock,
        iconColor: "rgba(255,255,255,0.85)",
        judul: "⏳ Sedang Diproses",
        desc: "Berkas dan pembayaran sudah diverifikasi. Menunggu pengumuman kelulusan dari panitia.",
        sub: "Pantau terus halaman ini untuk update terbaru.",
      };
    case "rejected":
      return {
        gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
        icon: XCircle,
        iconColor: "rgba(255,255,255,0.85)",
        judul: "Hasil Seleksi",
        desc: "Mohon maaf, Anda belum diterima pada periode ini.",
        sub: "Terima kasih telah mendaftar di USNP.",
      };
    default:
      // submitted, draft, dll
      return {
        gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
        icon: Bell,
        iconColor: "rgba(255,255,255,0.85)",
        judul: "⏳ Menunggu Verifikasi",
        desc: "Pendaftaran Anda sedang dalam proses verifikasi oleh admin.",
        sub: "Pastikan berkas dan pembayaran sudah lengkap.",
      };
  }
};

const getStatusLabel = (status) => {
  const map = {
    draft:     { label: "Draft",                color: "#94a3b8" },
    submitted: { label: "⏳ Menunggu Verifikasi", color: "#f59e0b" },
    verified:  { label: "✅ Sedang Diproses",     color: "#6366f1" },
    accepted:  { label: "🎉 Diterima",            color: "#10b981" },
    rejected:  { label: "❌ Tidak Diterima",      color: "#ef4444" },
  };
  return map[status] || { label: status, color: "#94a3b8" };
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CekKelulusan() {
  const [pengumuman, setPengumuman]     = useState([]);
  const [pendaftaran, setPendaftaran]   = useState(null);
  const [selected, setSelected]         = useState(null);
  const [search, setSearch]             = useState("");
  const [tab, setTab]                   = useState("pengumuman");

  const [loadingPengumuman, setLoadingPengumuman] = useState(true);
  const [loadingKelulusan, setLoadingKelulusan]   = useState(true);
  const [errorPengumuman, setErrorPengumuman]     = useState("");
  const [errorKelulusan, setErrorKelulusan]       = useState("");

  // Fetch pengumuman
  const loadPengumuman = async () => {
    setLoadingPengumuman(true);
    setErrorPengumuman("");
    try {
      const data = await fetchPengumuman();
      setPengumuman(data);
    } catch {
      setErrorPengumuman("Gagal memuat pengumuman.");
    } finally {
      setLoadingPengumuman(false);
    }
  };

  // Fetch status kelulusan
  const loadKelulusan = async () => {
    setLoadingKelulusan(true);
    setErrorKelulusan("");
    try {
      const data = await fetchStatusKelulusan();
      setPendaftaran(data);
    } catch {
      setErrorKelulusan("Gagal memuat status kelulusan.");
    } finally {
      setLoadingKelulusan(false);
    }
  };

  useEffect(() => {
    loadPengumuman();
    loadKelulusan();
  }, []);

  const filtered = pengumuman.filter(p =>
    p.judul?.toLowerCase().includes(search.toLowerCase()) ||
    p.isi?.toLowerCase().includes(search.toLowerCase())
  );

  // Hitung badge pengumuman kelulusan
  const jumlahKelulusan = pengumuman.filter(p => p.kategori === "kelulusan").length;

  const kelulusanCfg = getKelulusanConfig(pendaftaran?.status_pendaftaran);
  const KelulusanIcon = kelulusanCfg.icon;
  const statusLabel   = getStatusLabel(pendaftaran?.status_pendaftaran);

  return (
    <DashboardLayout activePage="pengumuman">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
          Pengumuman & Kelulusan
        </h2>
        <p style={{ fontSize: 13.5, color: "#64748b" }}>
          Informasi terbaru dari panitia PMB dan status kelulusan Anda.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 4, background: "#f1f5f9",
        borderRadius: 12, padding: 4, marginBottom: 24,
        width: "fit-content",
      }}>
        {[
          { id: "pengumuman", label: "📢 Pengumuman" },
          { id: "kelulusan",  label: "🎓 Status Kelulusan" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "9px 20px", borderRadius: 9, border: "none",
            background: tab === t.id ? "#fff" : "transparent",
            color: tab === t.id ? "#6366f1" : "#64748b",
            fontWeight: tab === t.id ? 700 : 500,
            fontSize: 13.5, cursor: "pointer",
            boxShadow: tab === t.id ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.18s",
            position: "relative",
          }}>
            {t.label}
            {/* Badge jumlah pengumuman kelulusan */}
            {t.id === "pengumuman" && jumlahKelulusan > 0 && (
              <span style={{
                position: "absolute", top: 4, right: 4,
                background: "#10b981", color: "#fff",
                fontSize: 9, fontWeight: 800,
                width: 16, height: 16, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{jumlahKelulusan}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Pengumuman ── */}
      {tab === "pengumuman" && (
        <div style={{ animation: "fadeIn 0.2s ease" }}>
          {/* Search + Refresh */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{
              flex: 1, background: "#fff", borderRadius: 12, padding: "10px 16px",
              border: "1px solid #e2e8f0",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <Search size={16} color="#94a3b8" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari pengumuman..."
                style={{
                  border: "none", outline: "none", flex: 1,
                  fontSize: 13.5, color: "#1e293b", background: "transparent",
                }} />
            </div>
            <button onClick={loadPengumuman} style={{
              background: "#f1f5f9", color: "#64748b", border: "none",
              borderRadius: 12, padding: "10px 16px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, fontSize: 13,
            }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* Error */}
          {errorPengumuman && (
            <div style={{
              background: "#fee2e2", border: "1px solid #fca5a5",
              borderRadius: 10, padding: "12px 16px", marginBottom: 16,
              fontSize: 13, color: "#dc2626", display: "flex", gap: 8, alignItems: "center",
            }}>
              <AlertCircle size={15} /> {errorPengumuman}
              <button onClick={loadPengumuman} style={{
                marginLeft: "auto", background: "#dc2626", color: "#fff",
                border: "none", borderRadius: 6, padding: "4px 10px",
                fontSize: 12, cursor: "pointer",
              }}>Coba Lagi</button>
            </div>
          )}

          {/* Loading */}
          {loadingPengumuman ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{
                  height: 80, background: "#f1f5f9", borderRadius: 14,
                  animation: "fadeIn 0.3s ease",
                }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "50px 0", color: "#94a3b8",
              background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9",
            }}>
              <Bell size={36} style={{ marginBottom: 10, opacity: 0.3 }} />
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                {search ? "Pengumuman tidak ditemukan" : "Belum ada pengumuman"}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map(p => {
                const k = kategoriConfig[p.kategori] || kategoriConfig.info;
                const isOpen = selected === p.id;
                return (
                  <div key={p.id} style={{
                    background: "#fff", borderRadius: 14,
                    boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
                    overflow: "hidden", transition: "box-shadow 0.2s",
                  }}>
                    <button onClick={() => setSelected(isOpen ? null : p.id)} style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 16,
                      padding: "18px 22px", background: "none", border: "none",
                      cursor: "pointer", textAlign: "left",
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: k.bg, display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Bell size={20} color={k.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", marginBottom: 5 }}>
                          {p.judul}
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: 10, padding: "2px 8px", borderRadius: 20,
                            background: k.bg, color: k.color, fontWeight: 700,
                          }}>{k.label}</span>
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>
                            {formatTanggal(p.tanggal_publish || p.created_at)}
                          </span>
                          {p.prioritas === "high" && (
                            <span style={{
                              fontSize: 10, padding: "2px 8px", borderRadius: 20,
                              background: "#fee2e2", color: "#dc2626", fontWeight: 700,
                            }}>🔴 PRIORITAS</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={18} color="#cbd5e1" style={{
                        transform: isOpen ? "rotate(90deg)" : "none",
                        transition: "transform 0.2s", flexShrink: 0,
                      }} />
                    </button>

                    {isOpen && (
                      <div style={{
                        padding: "14px 22px 18px 82px",
                        borderTop: "1px solid #f8fafc",
                        animation: "fadeIn 0.15s ease",
                      }}>
                        <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.8, margin: 0 }}>
                          {p.isi}
                        </p>
                        {p.tanggal_berakhir && (
                          <div style={{
                            marginTop: 12, fontSize: 12, color: "#f59e0b",
                            fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
                          }}>
                            <Clock size={13} />
                            Berlaku hingga: {formatTanggal(p.tanggal_berakhir)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Status Kelulusan ── */}
      {tab === "kelulusan" && (
        <div style={{ animation: "fadeIn 0.2s ease" }}>

          {/* Error */}
          {errorKelulusan && (
            <div style={{
              background: "#fee2e2", border: "1px solid #fca5a5",
              borderRadius: 10, padding: "12px 16px", marginBottom: 16,
              fontSize: 13, color: "#dc2626", display: "flex", gap: 8, alignItems: "center",
            }}>
              <AlertCircle size={15} /> {errorKelulusan}
              <button onClick={loadKelulusan} style={{
                marginLeft: "auto", background: "#dc2626", color: "#fff",
                border: "none", borderRadius: 6, padding: "4px 10px",
                fontSize: 12, cursor: "pointer",
              }}>Coba Lagi</button>
            </div>
          )}

          {loadingKelulusan ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
              <Loader size={28} style={{ animation: "spin 0.8s linear infinite", marginBottom: 12 }} />
              <div style={{ fontSize: 14 }}>Memuat status kelulusan...</div>
            </div>
          ) : !pendaftaran ? (
            <div style={{
              background: "#fff", borderRadius: 16, padding: "50px 32px",
              textAlign: "center", border: "1px solid #f1f5f9",
            }}>
              <BookOpen size={44} color="#94a3b8" style={{ marginBottom: 14, opacity: 0.5 }} />
              <div style={{ fontWeight: 700, fontSize: 16, color: "#1e293b", marginBottom: 8 }}>
                Belum Ada Pendaftaran
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>
                Anda belum memiliki data pendaftaran.
              </div>
            </div>
          ) : (
            <>
              {/* Banner status kelulusan */}
              <div style={{
                background: kelulusanCfg.gradient,
                borderRadius: 20, padding: "36px 32px", color: "#fff",
                textAlign: "center", marginBottom: 20,
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              }}>
                <KelulusanIcon
                  size={56} color={kelulusanCfg.iconColor}
                  style={{ marginBottom: 16 }}
                />
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                  {kelulusanCfg.judul}
                </div>
                <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 4 }}>
                  {kelulusanCfg.desc}
                </div>
                {pendaftaran.status_pendaftaran === "accepted" && (
                  <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>
                    {pendaftaran.nama_prodi}
                  </div>
                )}
                <div style={{ opacity: 0.75, fontSize: 13, marginTop: 12 }}>
                  {kelulusanCfg.sub}
                </div>
              </div>

              {/* Detail pendaftaran */}
              <div style={{
                background: "#fff", borderRadius: 16, padding: "24px 28px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
              }}>
                <div style={{
                  fontWeight: 700, fontSize: 15, color: "#0f172a",
                  marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
                }}>
                  📋 Detail Pendaftaran
                </div>
                {[
                  ["Nama Lengkap",    pendaftaran.nama_lengkap],
                  ["No. Pendaftaran", pendaftaran.no_pendaftaran],
                  ["Program Studi",   pendaftaran.nama_prodi],
                  ["Jalur Masuk",     pendaftaran.jalur_masuk],
                  ["Tanggal Daftar",  formatTanggal(pendaftaran.created_at)],
                  ["Status",          null], // render khusus
                ].map(([label, value]) => (
                  <div key={label} style={{
                    display: "flex", padding: "11px 0",
                    borderBottom: "1px solid #f8fafc", gap: 20,
                    alignItems: "center",
                  }}>
                    <span style={{
                      width: 160, fontSize: 13, color: "#94a3b8",
                      fontWeight: 500, flexShrink: 0,
                    }}>{label}</span>
                    {label === "Status" ? (
                      <span style={{
                        fontSize: 13.5, fontWeight: 700,
                        color: statusLabel.color,
                      }}>
                        {statusLabel.label}
                      </span>
                    ) : (
                      <span style={{ fontSize: 13.5, color: "#1e293b", fontWeight: 600 }}>
                        {value || "-"}
                      </span>
                    )}
                  </div>
                ))}

                {/* Tanggal verifikasi jika ada */}
                {pendaftaran.tanggal_verifikasi && (
                  <div style={{
                    display: "flex", padding: "11px 0",
                    borderBottom: "1px solid #f8fafc", gap: 20,
                    alignItems: "center",
                  }}>
                    <span style={{ width: 160, fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
                      Tgl. Verifikasi
                    </span>
                    <span style={{ fontSize: 13.5, color: "#1e293b", fontWeight: 600 }}>
                      {formatTanggal(pendaftaran.tanggal_verifikasi)}
                    </span>
                  </div>
                )}
              </div>

              {/* Info tambahan untuk yang diterima */}
              {pendaftaran.status_pendaftaran === "accepted" && (
                <div style={{
                  marginTop: 16, background: "#f0fdf4",
                  border: "1px solid #bbf7d0", borderRadius: 14,
                  padding: "20px 24px",
                }}>
                  <div style={{
                    fontWeight: 700, fontSize: 14, color: "#065f46", marginBottom: 10,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <CheckCircle size={18} color="#10b981" /> Langkah Selanjutnya
                  </div>
                  <div style={{ fontSize: 13, color: "#047857", lineHeight: 1.8 }}>
                    1. Cek email Anda untuk surat penerimaan resmi.<br />
                    2. Lakukan registrasi ulang sesuai jadwal yang ditentukan.<br />
                    3. Siapkan dokumen asli untuk proses verifikasi.<br />
                    4. Hubungi panitia PMB jika ada pertanyaan.
                  </div>
                </div>
              )}

              {/* Refresh button */}
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <button onClick={loadKelulusan} style={{
                  background: "#f1f5f9", color: "#64748b", border: "none",
                  borderRadius: 10, padding: "10px 20px", cursor: "pointer",
                  fontSize: 13, fontWeight: 600,
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}>
                  <RefreshCw size={14} /> Refresh Status
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}