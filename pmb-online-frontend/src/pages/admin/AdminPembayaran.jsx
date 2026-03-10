// // src/pages/admin/AdminPembayaran.jsx
// import { useState, useEffect, useCallback } from "react";
// import { CheckCircle, XCircle, AlertCircle, Loader, RefreshCw, Eye } from "lucide-react";
// import { AdminLayout, Skeleton } from "./AdminDashboard";
// import { getAllPembayaran, verifyPembayaran } from "../../api/adminApi";

// function ModalVerif({ title, onConfirm, onCancel, loading, actionLabel, actionColor, children }) {
//   return (
//     <div style={{
//       position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
//       display: "flex", alignItems: "center", justifyContent: "center",
//       zIndex: 999, padding: 20,
//     }}>
//       <div style={{
//         background: "#fff", borderRadius: 20, padding: "28px 30px",
//         width: "100%", maxWidth: 440,
//         boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
//       }}>
//         <div style={{ fontWeight: 800, fontSize: 17, color: "#0f172a", marginBottom: 12 }}>{title}</div>
//         {children}
//         <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
//           <button onClick={onConfirm} disabled={loading} style={{
//             flex: 1, background: loading ? "#e2e8f0" : actionColor,
//             color: loading ? "#94a3b8" : "#fff", border: "none",
//             borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700,
//             cursor: loading ? "not-allowed" : "pointer",
//             display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
//           }}>
//             {loading
//               ? <><Loader size={15} style={{ animation: "spin 0.8s linear infinite" }} /> Memproses...</>
//               : actionLabel}
//           </button>
//           <button onClick={onCancel} disabled={loading} style={{
//             flex: 1, background: "#f1f5f9", color: "#64748b", border: "none",
//             borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer",
//           }}>Batal</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function AdminPembayaran() {
//   const [data, setData]       = useState([]);
//   const [pagination, setPagination] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError]     = useState("");
//   const [successMsg, setSuccessMsg] = useState("");

//   const [filters, setFilters] = useState({ status: "", page: 1 });
//   const [modal, setModal]     = useState(null);
//   const [catatan, setCatatan] = useState("");
//   const [actionLoading, setActionLoading] = useState(false);

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     setError("");
//     try {
//       // GET /api/pembayaran?status=&page=&limit=20
//       const res = await getAllPembayaran({ ...filters, limit: 20 });
//       setData(res.data || []);
//       setPagination(res.pagination);
//     } catch {
//       setError("Gagal memuat data pembayaran.");
//     } finally {
//       setLoading(false);
//     }
//   }, [filters]);

//   useEffect(() => { fetchData(); }, [fetchData]);

//   const handleVerif = async (status) => {
//     if (!modal) return;
//     setActionLoading(true);
//     try {
//       // PUT /api/pembayaran/:id/verify  { status: 'paid'|'failed', catatan }
//       await verifyPembayaran(modal.id, status, catatan);
//       setSuccessMsg(`Pembayaran berhasil ${status === "paid" ? "diverifikasi" : "ditolak"}`);
//       setModal(null);
//       setCatatan("");
//       fetchData();
//       setTimeout(() => setSuccessMsg(""), 4000);
//     } catch (e) {
//       alert(e.response?.data?.message || "Gagal.");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const statusBadge = (status) => {
//     const map = {
//       pending: { label: "Belum Bayar",  color: "#f59e0b", bg: "#fef3c7" },
//       paid:    { label: "Lunas",        color: "#10b981", bg: "#d1fae5" },
//       failed:  { label: "Ditolak",      color: "#ef4444", bg: "#fee2e2" },
//     };
//     const cfg = map[status] || { label: status || "-", color: "#94a3b8", bg: "#f1f5f9" };
//     return (
//       <span style={{
//         fontSize: 11, padding: "3px 10px", borderRadius: 20,
//         background: cfg.bg, color: cfg.color, fontWeight: 700,
//       }}>{cfg.label}</span>
//     );
//   };

//   return (
//     <AdminLayout activePage="pembayaran">
//       {modal?.type === "paid" && (
//         <ModalVerif
//           title="✅ Konfirmasi Pembayaran"
//           onConfirm={() => handleVerif("paid")}
//           onCancel={() => { setModal(null); setCatatan(""); }}
//           loading={actionLoading} actionLabel="Verifikasi Lunas" actionColor="#10b981"
//         >
//           <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
//             Konfirmasi pembayaran <b>{modal.nama}</b> sebesar <b>Rp {Number(modal.jumlah || 0).toLocaleString("id")}</b>?
//           </p>
//           <textarea value={catatan} onChange={e => setCatatan(e.target.value)}
//             placeholder="Catatan (opsional)" style={{
//               width: "100%", padding: "10px 14px", fontSize: 13,
//               border: "1.5px solid #e2e8f0", borderRadius: 10,
//               outline: "none", resize: "vertical", minHeight: 60,
//               fontFamily: "inherit", boxSizing: "border-box",
//             }} />
//         </ModalVerif>
//       )}

//       {modal?.type === "failed" && (
//         <ModalVerif
//           title="❌ Tolak Pembayaran"
//           onConfirm={() => handleVerif("failed")}
//           onCancel={() => { setModal(null); setCatatan(""); }}
//           loading={actionLoading} actionLabel="Tolak" actionColor="#ef4444"
//         >
//           <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
//             Tolak pembayaran <b>{modal.nama}</b>?
//           </p>
//           <textarea value={catatan} onChange={e => setCatatan(e.target.value)}
//             placeholder="Alasan penolakan (wajib)" style={{
//               width: "100%", padding: "10px 14px", fontSize: 13,
//               border: "1.5px solid #fca5a5", borderRadius: 10,
//               outline: "none", resize: "vertical", minHeight: 60,
//               fontFamily: "inherit", boxSizing: "border-box",
//             }} />
//         </ModalVerif>
//       )}

//       {/* Filter */}
//       <div style={{
//         background: "#fff", borderRadius: 14, padding: "14px 18px",
//         marginBottom: 20, display: "flex", gap: 12, alignItems: "center",
//         boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
//       }}>
//         <select value={filters.status}
//           onChange={e => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
//           style={{
//             padding: "9px 14px", fontSize: 13, border: "1.5px solid #e2e8f0",
//             borderRadius: 10, outline: "none", background: "#fff", cursor: "pointer",
//           }}>
//           <option value="">Semua Status</option>
//           <option value="pending">Belum Bayar</option>
//           <option value="paid">Lunas</option>
//           <option value="failed">Ditolak</option>
//         </select>
//         <button onClick={fetchData} style={{
//           background: "#6366f1", color: "#fff", border: "none",
//           borderRadius: 10, padding: "9px 18px", fontSize: 13,
//           fontWeight: 600, cursor: "pointer",
//           display: "flex", alignItems: "center", gap: 6,
//         }}>
//           <RefreshCw size={14} /> Refresh
//         </button>
//         {successMsg && (
//           <span style={{ fontSize: 13, color: "#15803d", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
//             <CheckCircle size={14} /> {successMsg}
//           </span>
//         )}
//       </div>

//       {error && (
//         <div style={{
//           background: "#fee2e2", border: "1px solid #fca5a5",
//           borderRadius: 10, padding: "12px 16px", marginBottom: 16,
//           fontSize: 13, color: "#dc2626",
//         }}>
//           {error}
//         </div>
//       )}

//       {/* Table */}
//       <div style={{
//         background: "#fff", borderRadius: 16,
//         boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
//         overflow: "hidden",
//       }}>
//         <div style={{
//           display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1.2fr",
//           padding: "13px 20px", background: "#f8fafc",
//           borderBottom: "1px solid #f1f5f9",
//           fontSize: 12, fontWeight: 700, color: "#94a3b8",
//           textTransform: "uppercase", letterSpacing: "0.04em",
//         }}>
//           <span>Pendaftar</span>
//           <span>Kode Pembayaran</span>
//           <span>Jumlah</span>
//           <span>Metode</span>
//           <span>Status</span>
//           <span>Aksi</span>
//         </div>

//         {loading ? (
//           <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
//             {[...Array(8)].map((_, i) => <Skeleton key={i} h={50} />)}
//           </div>
//         ) : data.length === 0 ? (
//           <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 14 }}>
//             Tidak ada data pembayaran
//           </div>
//         ) : data.map((p, i) => (
//           <div key={p.id} style={{
//             display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1.2fr",
//             padding: "13px 20px", alignItems: "center",
//             borderBottom: i < data.length - 1 ? "1px solid #f8fafc" : "none",
//             fontSize: 13, background: i % 2 === 0 ? "#fff" : "#fafafa",
//           }}>
//             <div>
//               <div style={{ fontWeight: 600, color: "#1e293b" }}>{p.nama_lengkap}</div>
//               <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{p.nama_prodi}</div>
//             </div>
//             <div style={{ fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>
//               {p.kode_pembayaran}
//             </div>
//             <div style={{ fontWeight: 700, color: "#1e293b" }}>
//               Rp {Number(p.jumlah || 0).toLocaleString("id")}
//             </div>
//             <div style={{ fontSize: 12, color: "#64748b", textTransform: "capitalize" }}>
//               {p.metode_pembayaran?.replace("_"," ")}
//             </div>
//             <div>{statusBadge(p.status_pembayaran)}</div>
//             <div style={{ display: "flex", gap: 6 }}>
//               {p.status_pembayaran === "paid" && !p.verified_at && (
//                 <>
//                   <button onClick={() => setModal({ type: "paid", id: p.id, nama: p.nama_lengkap, jumlah: p.jumlah })}
//                     style={{
//                       background: "#d1fae5", color: "#059669", border: "none",
//                       borderRadius: 7, padding: "5px 10px", fontSize: 11,
//                       fontWeight: 700, cursor: "pointer",
//                     }}>✓ Verif</button>
//                   <button onClick={() => setModal({ type: "failed", id: p.id, nama: p.nama_lengkap, jumlah: p.jumlah })}
//                     style={{
//                       background: "#fee2e2", color: "#dc2626", border: "none",
//                       borderRadius: 7, padding: "5px 10px", fontSize: 11,
//                       fontWeight: 700, cursor: "pointer",
//                     }}>✗ Tolak</button>
//                 </>
//               )}
//               {p.verified_at && (
//                 <span style={{ fontSize: 11, color: "#94a3b8" }}>
//                   ✓ {new Date(p.verified_at).toLocaleDateString("id-ID")}
//                 </span>
//               )}
//             </div>
//           </div>
//         ))}

//         {pagination && pagination.totalPages > 1 && (
//           <div style={{
//             display: "flex", justifyContent: "space-between", alignItems: "center",
//             padding: "14px 20px", borderTop: "1px solid #f1f5f9", fontSize: 13,
//           }}>
//             <span style={{ color: "#64748b" }}>
//               Total: {pagination.total} data
//             </span>
//             <div style={{ display: "flex", gap: 8 }}>
//               <button disabled={pagination.page <= 1}
//                 onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
//                 style={{
//                   background: pagination.page <= 1 ? "#f1f5f9" : "#6366f1",
//                   color: pagination.page <= 1 ? "#94a3b8" : "#fff",
//                   border: "none", borderRadius: 8, padding: "7px 14px",
//                   fontSize: 13, fontWeight: 600,
//                   cursor: pagination.page <= 1 ? "not-allowed" : "pointer",
//                 }}>← Prev</button>
//               <button disabled={pagination.page >= pagination.totalPages}
//                 onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
//                 style={{
//                   background: pagination.page >= pagination.totalPages ? "#f1f5f9" : "#6366f1",
//                   color: pagination.page >= pagination.totalPages ? "#94a3b8" : "#fff",
//                   border: "none", borderRadius: 8, padding: "7px 14px",
//                   fontSize: 13, fontWeight: 600,
//                   cursor: pagination.page >= pagination.totalPages ? "not-allowed" : "pointer",
//                 }}>Next →</button>
//             </div>
//           </div>
//         )}
//       </div>
//     </AdminLayout>
//   );
// }
// src/pages/admin/AdminPembayaran.jsx
import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle, XCircle, AlertCircle, Loader,
  RefreshCw, Eye, FileImage, X, ZoomIn, Download
} from "lucide-react";
import { AdminLayout, Skeleton } from "./AdminDashboard";
import { getAllPembayaran, verifyPembayaran } from "../../api/adminApi";

// ── URL base untuk akses file di server ──────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";

function getBuktiUrl(buktiPath) {
  if (!buktiPath) return null;
  if (buktiPath.startsWith("http")) return buktiPath;
  const clean = buktiPath.replace(/\\/g, "/");
  return `${API_BASE}/${clean}`;
}

// ── Modal preview bukti pembayaran ────────────────────────────────────────────
function ModalBukti({ buktiUrl, nama, onClose }) {
  const isPdf = buktiUrl?.toLowerCase().endsWith(".pdf");
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 20,
        width: "100%", maxWidth: 680,
        maxHeight: "90vh", overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: "0 25px 80px rgba(0,0,0,0.4)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 20px", borderBottom: "1px solid #f1f5f9",
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>
              📄 Bukti Pembayaran
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{nama}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <a href={buktiUrl} target="_blank" rel="noopener noreferrer" style={{
              background: "#eef2ff", color: "#6366f1",
              borderRadius: 8, padding: "7px 14px", fontSize: 12,
              fontWeight: 600, cursor: "pointer", textDecoration: "none",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <ZoomIn size={13} /> Buka Penuh
            </a>
            <a href={buktiUrl} download style={{
              background: "#f0fdf4", color: "#059669",
              borderRadius: 8, padding: "7px 14px", fontSize: 12,
              fontWeight: 600, cursor: "pointer", textDecoration: "none",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <Download size={13} /> Unduh
            </a>
            <button onClick={onClose} style={{
              background: "#f1f5f9", color: "#64748b", border: "none",
              borderRadius: 8, padding: "7px 10px", cursor: "pointer",
            }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1, overflow: "auto", background: "#f8fafc",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, minHeight: 300,
        }}>
          {isPdf ? (
            <iframe src={buktiUrl} style={{ width: "100%", height: 500, border: "none", borderRadius: 8 }}
              title="Bukti PDF" />
          ) : (
            <div style={{ textAlign: "center" }}>
              <img src={buktiUrl} alt="Bukti Pembayaran" style={{
                maxWidth: "100%", maxHeight: "65vh",
                borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                objectFit: "contain",
              }}
                onError={e => {
                  e.target.style.display = "none";
                  document.getElementById("bukti-error").style.display = "flex";
                }}
              />
              <div id="bukti-error" style={{
                display: "none", flexDirection: "column", alignItems: "center",
                gap: 12, color: "#94a3b8", padding: 40,
              }}>
                <FileImage size={48} style={{ opacity: 0.4 }} />
                <div style={{ fontSize: 13 }}>Gagal memuat gambar</div>
                <a href={buktiUrl} target="_blank" rel="noopener noreferrer"
                  style={{ color: "#6366f1", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                  Buka di tab baru →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Modal verifikasi ──────────────────────────────────────────────────────────
function ModalVerif({ title, onConfirm, onCancel, loading, actionLabel, actionColor, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 999, padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "28px 30px",
        width: "100%", maxWidth: 460,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <div style={{ fontWeight: 800, fontSize: 17, color: "#0f172a", marginBottom: 12 }}>{title}</div>
        {children}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onConfirm} disabled={loading} style={{
            flex: 1, background: loading ? "#e2e8f0" : actionColor,
            color: loading ? "#94a3b8" : "#fff", border: "none",
            borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {loading
              ? <><Loader size={15} style={{ animation: "spin 0.8s linear infinite" }} /> Memproses...</>
              : actionLabel}
          </button>
          <button onClick={onCancel} disabled={loading} style={{
            flex: 1, background: "#f1f5f9", color: "#64748b", border: "none",
            borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>Batal</button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminPembayaran() {
  const [data, setData]             = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [filters, setFilters]       = useState({ status: "", page: 1 });
  const [modal, setModal]           = useState(null);
  const [catatan, setCatatan]       = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [buktiModal, setBuktiModal] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await getAllPembayaran({ ...filters, limit: 20 });
      setData(res.data || []);
      setPagination(res.pagination);
    } catch { setError("Gagal memuat data pembayaran."); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleVerif = async (status) => {
    if (!modal) return;
    setActionLoading(true);
    try {
      await verifyPembayaran(modal.id, status, catatan);
      setSuccessMsg(`Pembayaran berhasil ${status === "paid" ? "diverifikasi ✓" : "ditolak"}`);
      setModal(null); setCatatan(""); fetchData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e) { alert(e.response?.data?.message || "Gagal."); }
    finally { setActionLoading(false); }
  };

  const statusBadge = (status, verifiedAt) => {
    if (status === "paid" && verifiedAt)
      return <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#d1fae5", color: "#059669", fontWeight: 700 }}>✓ Terverifikasi</span>;
    const map = {
      pending: { label: "Belum Upload",       color: "#f59e0b", bg: "#fef3c7" },
      paid:    { label: "Menunggu Verifikasi", color: "#3b82f6", bg: "#dbeafe" },
      failed:  { label: "Ditolak",             color: "#ef4444", bg: "#fee2e2" },
    };
    const cfg = map[status] || { label: status, color: "#94a3b8", bg: "#f1f5f9" };
    return <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: cfg.bg, color: cfg.color, fontWeight: 700 }}>{cfg.label}</span>;
  };

  return (
    <AdminLayout activePage="pembayaran">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {buktiModal && <ModalBukti buktiUrl={buktiModal.buktiUrl} nama={buktiModal.nama} onClose={() => setBuktiModal(null)} />}

      {modal?.type === "paid" && (
        <ModalVerif title="✅ Konfirmasi Pembayaran"
          onConfirm={() => handleVerif("paid")}
          onCancel={() => { setModal(null); setCatatan(""); }}
          loading={actionLoading} actionLabel="Verifikasi Lunas" actionColor="#10b981"
        >
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
            Konfirmasi pembayaran <b>{modal.nama}</b> sebesar <b>Rp {Number(modal.jumlah || 0).toLocaleString("id")}</b>?
          </p>
          {/* Preview thumbnail di modal konfirmasi */}
          {modal.buktiUrl && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 6 }}>Preview Bukti Transfer:</div>
              <div style={{ position: "relative", cursor: "pointer" }}
                onClick={() => setBuktiModal({ buktiUrl: modal.buktiUrl, nama: modal.nama })}>
                <img src={modal.buktiUrl} alt="Bukti" style={{
                  width: "100%", height: 160, objectFit: "cover",
                  borderRadius: 10, border: "2px solid #e0e7ff",
                }} />
                <div style={{
                  position: "absolute", inset: 0, background: "rgba(99,102,241,0.0)",
                  borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, color: "#6366f1", fontWeight: 600, gap: 6,
                  transition: "background 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.1)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0)"}
                >
                  <ZoomIn size={16} /> Klik untuk perbesar
                </div>
              </div>
            </div>
          )}
          <textarea value={catatan} onChange={e => setCatatan(e.target.value)}
            placeholder="Catatan (opsional)" style={{
              width: "100%", padding: "10px 14px", fontSize: 13,
              border: "1.5px solid #e2e8f0", borderRadius: 10,
              outline: "none", resize: "vertical", minHeight: 60,
              fontFamily: "inherit", boxSizing: "border-box",
            }} />
        </ModalVerif>
      )}

      {modal?.type === "failed" && (
        <ModalVerif title="❌ Tolak Pembayaran"
          onConfirm={() => handleVerif("failed")}
          onCancel={() => { setModal(null); setCatatan(""); }}
          loading={actionLoading} actionLabel="Tolak" actionColor="#ef4444"
        >
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
            Tolak pembayaran <b>{modal.nama}</b>? Pendaftar akan diminta upload ulang.
          </p>
          <textarea value={catatan} onChange={e => setCatatan(e.target.value)}
            placeholder="Alasan penolakan (wajib diisi)" style={{
              width: "100%", padding: "10px 14px", fontSize: 13,
              border: "1.5px solid #fca5a5", borderRadius: 10,
              outline: "none", resize: "vertical", minHeight: 80,
              fontFamily: "inherit", boxSizing: "border-box",
            }} />
        </ModalVerif>
      )}

      {/* Filter */}
      <div style={{
        background: "#fff", borderRadius: 14, padding: "14px 18px",
        marginBottom: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
      }}>
        <select value={filters.status}
          onChange={e => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
          style={{
            padding: "9px 14px", fontSize: 13, border: "1.5px solid #e2e8f0",
            borderRadius: 10, outline: "none", background: "#fff", cursor: "pointer",
          }}>
          <option value="">Semua Status</option>
          <option value="pending">Belum Upload</option>
          <option value="paid">Menunggu Verifikasi</option>
          <option value="failed">Ditolak</option>
        </select>
        <button onClick={fetchData} style={{
          background: "#6366f1", color: "#fff", border: "none",
          borderRadius: 10, padding: "9px 18px", fontSize: 13,
          fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
        }}>
          <RefreshCw size={14} /> Refresh
        </button>
        {successMsg && (
          <span style={{
            fontSize: 13, color: "#15803d", fontWeight: 600,
            display: "flex", alignItems: "center", gap: 6,
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            padding: "7px 14px", borderRadius: 8,
          }}>
            <CheckCircle size={14} /> {successMsg}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{
        background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12,
        padding: "11px 16px", marginBottom: 16,
        fontSize: 13, color: "#2563eb", display: "flex", alignItems: "center", gap: 10,
      }}>
        <Eye size={15} />
        <span>Klik <b>👁 Lihat Bukti</b> untuk melihat bukti transfer. Status <b>"Menunggu Verifikasi"</b> = pendaftar sudah upload bukti, perlu dicek admin.</span>
      </div>

      {error && (
        <div style={{
          background: "#fee2e2", border: "1px solid #fca5a5",
          borderRadius: 10, padding: "12px 16px", marginBottom: 16,
          fontSize: 13, color: "#dc2626", display: "flex", alignItems: "center", gap: 8,
        }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Tabel */}
      <div style={{
        background: "#fff", borderRadius: 16,
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
        overflow: "hidden",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1.3fr 1.1fr 1.8fr",
          padding: "12px 20px", background: "#f8fafc",
          borderBottom: "1px solid #f1f5f9",
          fontSize: 11, fontWeight: 700, color: "#94a3b8",
          textTransform: "uppercase", letterSpacing: "0.04em",
        }}>
          <span>Pendaftar</span>
          <span>Kode Pembayaran</span>
          <span>Jumlah</span>
          <span>Status</span>
          <span>Bukti</span>
          <span>Aksi Verifikasi</span>
        </div>

        {loading ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(5)].map((_, i) => <Skeleton key={i} h={56} />)}
          </div>
        ) : data.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "#94a3b8" }}>
            <FileImage size={40} style={{ marginBottom: 10, opacity: 0.3 }} />
            <div style={{ fontSize: 14 }}>Tidak ada data pembayaran</div>
          </div>
        ) : data.map((p, i) => {
          const buktiUrl   = getBuktiUrl(p.bukti_pembayaran);
          const isPaid     = p.status_pembayaran === "paid";
          const isVerified = isPaid && p.verified_at;
          const needsCheck = isPaid && !isVerified;

          return (
            <div key={p.id} style={{
              display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1.3fr 1.1fr 1.8fr",
              padding: "14px 20px", alignItems: "center",
              borderBottom: i < data.length - 1 ? "1px solid #f8fafc" : "none",
              fontSize: 13,
              // Highlight kuning untuk yang perlu dicek
              background: needsCheck ? "#fffbeb" : (i % 2 === 0 ? "#fff" : "#fafafa"),
            }}>
              {/* Pendaftar */}
              <div>
                <div style={{ fontWeight: 700, color: "#1e293b" }}>{p.nama_lengkap}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                  {p.nama_prodi}
                </div>
              </div>

              {/* Kode */}
              <div style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b" }}>
                {p.kode_pembayaran}
              </div>

              {/* Jumlah */}
              <div style={{ fontWeight: 700, color: "#1e293b" }}>
                Rp {Number(p.jumlah || 0).toLocaleString("id")}
              </div>

              {/* Status */}
              <div>
                {statusBadge(p.status_pembayaran, p.verified_at)}
                {needsCheck && (
                  <div style={{ fontSize: 10, color: "#d97706", marginTop: 3, fontWeight: 700 }}>
                    ⚠ Perlu diverifikasi
                  </div>
                )}
                {p.tanggal_bayar && (
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                    Upload: {new Date(p.tanggal_bayar).toLocaleDateString("id-ID")}
                  </div>
                )}
              </div>

              {/* Bukti */}
              <div>
                {buktiUrl ? (
                  <button onClick={() => setBuktiModal({ buktiUrl, nama: p.nama_lengkap })} style={{
                    background: "#eef2ff", color: "#6366f1",
                    border: "1.5px solid #c7d2fe",
                    borderRadius: 8, padding: "6px 10px", fontSize: 11,
                    fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <Eye size={12} /> Lihat
                  </button>
                ) : (
                  <span style={{ fontSize: 11, color: "#cbd5e1" }}>
                    Belum ada
                  </span>
                )}
              </div>

              {/* Aksi */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {needsCheck && (
                  <>
                    <button onClick={() => setModal({
                      type: "paid", id: p.id,
                      nama: p.nama_lengkap, jumlah: p.jumlah, buktiUrl,
                    })} style={{
                      background: "#d1fae5", color: "#059669", border: "none",
                      borderRadius: 7, padding: "6px 10px", fontSize: 11.5,
                      fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      <CheckCircle size={12} /> Terima
                    </button>
                    <button onClick={() => setModal({
                      type: "failed", id: p.id,
                      nama: p.nama_lengkap, jumlah: p.jumlah,
                    })} style={{
                      background: "#fee2e2", color: "#dc2626", border: "none",
                      borderRadius: 7, padding: "6px 10px", fontSize: 11.5,
                      fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      <XCircle size={12} /> Tolak
                    </button>
                  </>
                )}
                {isVerified && (
                  <span style={{ fontSize: 11, color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle size={12} />
                    {new Date(p.verified_at).toLocaleDateString("id-ID")}
                  </span>
                )}
                {p.status_pembayaran === "pending" && (
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Menunggu upload</span>
                )}
                {p.status_pembayaran === "failed" && (
                  <span style={{ fontSize: 11, color: "#ef4444" }}>Sudah ditolak</span>
                )}
              </div>
            </div>
          );
        })}

        {pagination && pagination.totalPages > 1 && (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 20px", borderTop: "1px solid #f1f5f9", fontSize: 13,
          }}>
            <span style={{ color: "#64748b" }}>Total: {pagination.total} data</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button disabled={pagination.page <= 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                style={{
                  background: pagination.page <= 1 ? "#f1f5f9" : "#6366f1",
                  color: pagination.page <= 1 ? "#94a3b8" : "#fff",
                  border: "none", borderRadius: 8, padding: "7px 14px",
                  fontSize: 13, fontWeight: 600,
                  cursor: pagination.page <= 1 ? "not-allowed" : "pointer",
                }}>← Prev</button>
              <button disabled={pagination.page >= pagination.totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                style={{
                  background: pagination.page >= pagination.totalPages ? "#f1f5f9" : "#6366f1",
                  color: pagination.page >= pagination.totalPages ? "#94a3b8" : "#fff",
                  border: "none", borderRadius: 8, padding: "7px 14px",
                  fontSize: 13, fontWeight: 600,
                  cursor: pagination.page >= pagination.totalPages ? "not-allowed" : "pointer",
                }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}