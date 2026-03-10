// src/pages/admin/AdminBerkas.jsx
// Halaman khusus verifikasi berkas — list semua berkas dari semua pendaftar

import { useState, useEffect, useCallback } from "react";
import {
  Search, RefreshCw, CheckCircle, XCircle,
  AlertCircle, Loader, Eye, Download, FileText,
  ChevronLeft, ChevronRight, Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminLayout, Skeleton } from "./AdminDashboard";
import { getAllPendaftaran, getBerkasByPendaftaran, verifyBerkas, downloadBerkas } from "../../api/adminApi";

// ── Backend tidak punya endpoint GET /berkas semua, jadi kita:
// 1. GET /api/pendaftaran (semua, filter submitted ke atas)
// 2. Untuk setiap pendaftaran, GET /api/berkas/pendaftaran/:id
// Atau: load berkas per-pendaftar saat di-expand ──────────────────────────────

const STATUS_BERKAS = [
  { value: "",         label: "Semua Status" },
  { value: "pending",  label: "Menunggu Review" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
];

const STATUS_PENDAFTARAN_FILTER = [
  { value: "submitted", label: "Disubmit" },
  { value: "verified",  label: "Terverifikasi" },
  { value: "rejected",  label: "Ditolak" },
  { value: "",          label: "Semua" },
];

const berkasStatusCfg = {
  approved: { label: "Disetujui", color: "#059669", bg: "#d1fae5" },
  pending:  { label: "Menunggu",  color: "#d97706", bg: "#fef3c7" },
  rejected: { label: "Ditolak",   color: "#dc2626", bg: "#fee2e2" },
};

// ── Modal konfirmasi ──────────────────────────────────────────────────────────
function Modal({ title, onConfirm, onCancel, loading, actionLabel, actionColor, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 999, padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "28px 30px",
        width: "100%", maxWidth: 440,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <div style={{ fontWeight: 800, fontSize: 17, color: "#0f172a", marginBottom: 12 }}>
          {title}
        </div>
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

// ── Row berkas per pendaftar ──────────────────────────────────────────────────
function PendaftarBerkasRow({ pendaftar, onVerifBerkas, successIds }) {
  const navigate = useNavigate();
  const [berkas, setBerkas]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [expanded, setExpanded]   = useState(false);
  const [loaded, setLoaded]       = useState(false);

  const loadBerkas = async () => {
    if (loaded) { setExpanded(!expanded); return; }
    setLoading(true);
    try {
      // GET /api/berkas/pendaftaran/:id
      const data = await getBerkasByPendaftaran(pendaftar.id);
      setBerkas(Array.isArray(data) ? data : []);
      setLoaded(true);
      setExpanded(true);
    } catch {
      setBerkas([]);
      setLoaded(true);
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch jika ada verifikasi berhasil
  useEffect(() => {
    if (successIds.length > 0 && loaded) {
      getBerkasByPendaftaran(pendaftar.id)
        .then(data => setBerkas(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [successIds]);

  const pendingCount  = berkas.filter(b => b.status_verifikasi === "pending").length;
  const approvedCount = berkas.filter(b => b.status_verifikasi === "approved").length;
  const rejectedCount = berkas.filter(b => b.status_verifikasi === "rejected").length;

  return (
    <div style={{
      border: "1px solid #f1f5f9", borderRadius: 14,
      overflow: "hidden", marginBottom: 10,
      background: "#fff",
    }}>
      {/* Header row — klik untuk expand */}
      <div
        onClick={loadBerkas}
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 0.8fr",
          padding: "14px 18px", alignItems: "center",
          cursor: "pointer", fontSize: 13,
          background: expanded ? "#f8fafc" : "#fff",
          transition: "background 0.15s",
        }}
      >
        {/* Nama */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
            background: "#eef2ff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#6366f1",
          }}>
            {(pendaftar.nama_lengkap || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#1e293b" }}>{pendaftar.nama_lengkap}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
              {pendaftar.no_pendaftaran || `#${pendaftar.id}`}
            </div>
          </div>
        </div>

        {/* Prodi */}
        <div>
          <div style={{ fontWeight: 500, color: "#334155", fontSize: 12 }}>{pendaftar.nama_prodi}</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{pendaftar.jalur_masuk}</div>
        </div>

        {/* Total berkas */}
        <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 13 }}>
          {loaded ? `${berkas.length} berkas` : "— berkas"}
        </div>

        {/* Pending */}
        <div>
          {loaded && pendingCount > 0 ? (
            <span style={{
              background: "#fef3c7", color: "#d97706",
              fontSize: 12, fontWeight: 700,
              padding: "3px 10px", borderRadius: 20,
            }}>
              {pendingCount} menunggu
            </span>
          ) : loaded ? (
            <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>
          ) : null}
        </div>

        {/* Approved */}
        <div>
          {loaded && approvedCount > 0 ? (
            <span style={{
              background: "#d1fae5", color: "#059669",
              fontSize: 12, fontWeight: 700,
              padding: "3px 10px", borderRadius: 20,
            }}>
              {approvedCount} ok
            </span>
          ) : null}
        </div>

        {/* Rejected */}
        <div>
          {loaded && rejectedCount > 0 ? (
            <span style={{
              background: "#fee2e2", color: "#dc2626",
              fontSize: 12, fontWeight: 700,
              padding: "3px 10px", borderRadius: 20,
            }}>
              {rejectedCount} ditolak
            </span>
          ) : null}
        </div>

        {/* Toggle + detail */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {loading && <Loader size={14} color="#6366f1" style={{ animation: "spin 0.8s linear infinite" }} />}
          <button
            onClick={e => { e.stopPropagation(); navigate(`/admin/pendaftaran/${pendaftar.id}`); }}
            style={{
              background: "#eef2ff", color: "#6366f1", border: "none",
              borderRadius: 7, padding: "5px 10px", fontSize: 11,
              fontWeight: 600, cursor: "pointer",
            }}>
            <Eye size={13} />
          </button>
          <span style={{ color: "#94a3b8", fontSize: 18, userSelect: "none" }}>
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {/* Expanded berkas list */}
      {expanded && (
        <div style={{
          borderTop: "1px solid #f1f5f9",
          padding: "14px 18px",
          background: "#fafbfc",
        }}>
          {berkas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "12px 0", color: "#94a3b8", fontSize: 13 }}>
              Belum ada berkas diupload
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 10 }}>
              {berkas.map(b => {
                const cfg = berkasStatusCfg[b.status_verifikasi] || { label: "—", color: "#94a3b8", bg: "#f1f5f9" };
                return (
                  <div key={b.id} style={{
                    background: "#fff", border: "1px solid #f1f5f9",
                    borderRadius: 12, padding: "14px 16px",
                    display: "flex", flexDirection: "column", gap: 10,
                  }}>
                    {/* Info berkas */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>
                          {b.jenis_berkas}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                          {b.nama_file}
                          {b.file_size ? ` · ${(b.file_size / 1024).toFixed(0)} KB` : ""}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                          Upload: {b.uploaded_at
                            ? new Date(b.uploaded_at).toLocaleDateString("id-ID")
                            : "-"}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 11, padding: "3px 9px", borderRadius: 20,
                        background: cfg.bg, color: cfg.color, fontWeight: 700,
                        flexShrink: 0,
                      }}>{cfg.label}</span>
                    </div>

                    {/* Catatan jika ada */}
                    {b.catatan && (
                      <div style={{
                        background: "#fff7ed", border: "1px solid #fed7aa",
                        borderRadius: 8, padding: "7px 10px",
                        fontSize: 12, color: "#9a3412",
                      }}>
                        📝 {b.catatan}
                      </div>
                    )}

                    {/* Verified info */}
                    {b.verified_at && (
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        ✓ Diverifikasi: {new Date(b.verified_at).toLocaleDateString("id-ID")}
                      </div>
                    )}

                    {/* Tombol aksi */}
                    <div style={{ display: "flex", gap: 7 }}>
                      <button
                        onClick={() => downloadBerkas(b.id)}
                        style={{
                          flex: 1, background: "#f1f5f9", color: "#64748b",
                          border: "none", borderRadius: 8, padding: "7px",
                          fontSize: 12, fontWeight: 600, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                        }}>
                        <Download size={13} /> Lihat
                      </button>

                      {b.status_verifikasi !== "approved" && (
                        <button
                          onClick={() => onVerifBerkas(b.id, "approved", b.jenis_berkas, pendaftar.nama_lengkap)}
                          style={{
                            flex: 1, background: "#d1fae5", color: "#059669",
                            border: "none", borderRadius: 8, padding: "7px",
                            fontSize: 12, fontWeight: 700, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                          }}>
                          <CheckCircle size={13} /> Setujui
                        </button>
                      )}

                      {b.status_verifikasi !== "rejected" && (
                        <button
                          onClick={() => onVerifBerkas(b.id, "rejected", b.jenis_berkas, pendaftar.nama_lengkap)}
                          style={{
                            flex: 1, background: "#fee2e2", color: "#dc2626",
                            border: "none", borderRadius: 8, padding: "7px",
                            fontSize: 12, fontWeight: 700, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                          }}>
                          <XCircle size={13} /> Tolak
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminBerkas() {
  const [pendaftaran, setPendaftaran] = useState([]);
  const [pagination, setPagination]  = useState(null);
  const [loading, setLoading]        = useState(true);
  const [error, setError]            = useState("");
  const [successMsg, setSuccessMsg]  = useState("");
  const [successIds, setSuccessIds]  = useState([]);

  const [filters, setFilters] = useState({
    status: "submitted",  // default tampilkan yang sudah submit
    search: "",
    page: 1,
  });

  // Modal state
  const [modal, setModal]           = useState(null);
  // { berkasId, actionType: 'approved'|'rejected', jenisBerkas, namaPendaftar }
  const [catatan, setCatatan]       = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // GET /api/pendaftaran?status=submitted&search=&page=&limit=15
      // Backend mengembalikan pendaftaran dengan field nama_lengkap, nama_prodi, dll
      const res = await getAllPendaftaran({
        status:  filters.status,
        search:  filters.search,
        page:    filters.page,
        limit:   15,
      });
      setPendaftaran(res.data || []);
      setPagination(res.pagination);
    } catch {
      setError("Gagal memuat data pendaftaran.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val, page: 1 }));

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Handler tombol approve/tolak berkas dari child
  const handleVerifBerkas = (berkasId, actionType, jenisBerkas, namaPendaftar) => {
    setModal({ berkasId, actionType, jenisBerkas, namaPendaftar });
    setCatatan("");
  };

  const handleConfirmVerif = async () => {
    if (!modal) return;
    setActionLoading(true);
    try {
      // PUT /api/berkas/:id/verify  { status: 'approved'|'rejected', catatan }
      await verifyBerkas(modal.berkasId, modal.actionType, catatan);
      showSuccess(
        `Berkas "${modal.jenisBerkas}" milik ${modal.namaPendaftar} berhasil ` +
        `${modal.actionType === "approved" ? "disetujui" : "ditolak"}`
      );
      // Trigger re-fetch berkas di child row
      setSuccessIds(prev => [...prev, modal.berkasId]);
      setModal(null);
      setCatatan("");
    } catch (e) {
      alert(e.response?.data?.message || "Gagal memproses verifikasi.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout activePage="berkas">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Modal */}
      {modal && (
        <Modal
          title={modal.actionType === "approved" ? "✅ Setujui Berkas" : "❌ Tolak Berkas"}
          onConfirm={handleConfirmVerif}
          onCancel={() => { setModal(null); setCatatan(""); }}
          loading={actionLoading}
          actionLabel={modal.actionType === "approved" ? "Setujui" : "Tolak"}
          actionColor={modal.actionType === "approved" ? "#10b981" : "#ef4444"}
        >
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
            {modal.actionType === "approved" ? "Setujui" : "Tolak"} berkas{" "}
            <b>{modal.jenisBerkas}</b> milik <b>{modal.namaPendaftar}</b>?
          </p>
          <textarea
            value={catatan}
            onChange={e => setCatatan(e.target.value)}
            placeholder={
              modal.actionType === "rejected"
                ? "Alasan penolakan (wajib untuk ditolak)"
                : "Catatan (opsional)"
            }
            style={{
              width: "100%", padding: "10px 14px", fontSize: 13,
              border: `1.5px solid ${modal.actionType === "rejected" ? "#fca5a5" : "#e2e8f0"}`,
              borderRadius: 10, outline: "none", resize: "vertical", minHeight: 80,
              fontFamily: "inherit", boxSizing: "border-box",
            }}
          />
        </Modal>
      )}

      {/* Info banner */}
      <div style={{
        background: "linear-gradient(135deg,#eef2ff,#f5f3ff)",
        border: "1px solid #c7d2fe", borderRadius: 14,
        padding: "16px 20px", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 14,
        fontSize: 13,
      }}>
        <FileText size={20} color="#6366f1" />
        <div>
          <div style={{ fontWeight: 700, color: "#3730a3", marginBottom: 3 }}>
            Cara kerja halaman ini
          </div>
          <div style={{ color: "#64748b" }}>
            Klik baris pendaftar untuk melihat & memverifikasi berkas mereka.
            Berkas yang diupload akan muncul dengan tombol <b>Setujui</b> / <b>Tolak</b>.
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{
        background: "#fff", borderRadius: 14, padding: "14px 18px",
        marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap",
        alignItems: "center",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={15} color="#94a3b8" style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          }} />
          <input
            placeholder="Cari nama / no. pendaftaran / NIK..."
            value={filters.search}
            onChange={e => setFilter("search", e.target.value)}
            style={{
              width: "100%", padding: "9px 12px 9px 34px", fontSize: 13,
              border: "1.5px solid #e2e8f0", borderRadius: 10,
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Status pendaftaran filter */}
        <div style={{ display: "flex", gap: 6 }}>
          {STATUS_PENDAFTARAN_FILTER.map(s => (
            <button key={s.value}
              onClick={() => setFilter("status", s.value)}
              style={{
                padding: "8px 14px", fontSize: 12.5, fontWeight: 600,
                border: `1.5px solid ${filters.status === s.value ? "#6366f1" : "#e2e8f0"}`,
                borderRadius: 10, cursor: "pointer",
                background: filters.status === s.value ? "#eef2ff" : "#fff",
                color: filters.status === s.value ? "#6366f1" : "#64748b",
                transition: "all 0.15s",
              }}>
              {s.label}
            </button>
          ))}
        </div>

        <button onClick={fetchData} style={{
          background: "#6366f1", color: "#fff", border: "none",
          borderRadius: 10, padding: "9px 18px", fontSize: 13,
          fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <RefreshCw size={14} /> Refresh
        </button>

        {/* Success msg */}
        {successMsg && (
          <div style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 8, padding: "8px 14px",
            fontSize: 12.5, color: "#15803d", fontWeight: 600,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <CheckCircle size={14} /> {successMsg}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: "#fee2e2", border: "1px solid #fca5a5",
          borderRadius: 10, padding: "12px 16px", marginBottom: 16,
          fontSize: 13, color: "#dc2626",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <AlertCircle size={15} /> {error}
          <button onClick={fetchData} style={{
            marginLeft: "auto", background: "#dc2626", color: "#fff",
            border: "none", borderRadius: 7, padding: "5px 12px",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>Coba Lagi</button>
        </div>
      )}

      {/* Header tabel */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 0.8fr",
        padding: "11px 18px", marginBottom: 8,
        fontSize: 11, fontWeight: 700, color: "#94a3b8",
        textTransform: "uppercase", letterSpacing: "0.05em",
      }}>
        <span>Pendaftar</span>
        <span>Program Studi</span>
        <span>Total Berkas</span>
        <span>Menunggu</span>
        <span>Disetujui</span>
        <span>Ditolak</span>
        <span>Aksi</span>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...Array(8)].map((_, i) => <Skeleton key={i} h={62} radius={14} />)}
        </div>
      ) : pendaftaran.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: 16, padding: "50px 20px",
          textAlign: "center", color: "#94a3b8",
          border: "1px solid #f1f5f9",
        }}>
          <FileText size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
            Tidak ada pendaftar ditemukan
          </div>
          <div style={{ fontSize: 13 }}>
            Coba ubah filter atau refresh halaman
          </div>
        </div>
      ) : (
        <>
          {pendaftaran.map(p => (
            <PendaftarBerkasRow
              key={p.id}
              pendaftar={p}
              onVerifBerkas={handleVerifBerkas}
              successIds={successIds}
            />
          ))}
        </>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: 20, fontSize: 13,
        }}>
          <span style={{ color: "#64748b" }}>
            Menampilkan {((pagination.page - 1) * 15) + 1}–
            {Math.min(pagination.page * 15, pagination.total)} dari {pagination.total} pendaftar
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              disabled={pagination.page <= 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              style={{
                background: pagination.page <= 1 ? "#f1f5f9" : "#6366f1",
                color: pagination.page <= 1 ? "#94a3b8" : "#fff",
                border: "none", borderRadius: 8, padding: "8px 16px",
                fontSize: 13, fontWeight: 600,
                cursor: pagination.page <= 1 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}>
              <ChevronLeft size={15} /> Prev
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              style={{
                background: pagination.page >= pagination.totalPages ? "#f1f5f9" : "#6366f1",
                color: pagination.page >= pagination.totalPages ? "#94a3b8" : "#fff",
                border: "none", borderRadius: 8, padding: "8px 16px",
                fontSize: 13, fontWeight: 600,
                cursor: pagination.page >= pagination.totalPages ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}>
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}