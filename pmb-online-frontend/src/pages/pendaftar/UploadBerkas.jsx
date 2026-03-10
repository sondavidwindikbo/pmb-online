import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload, CheckCircle, Clock, XCircle,
  AlertCircle, Download, Trash2, Loader, RefreshCw
} from "lucide-react";
import { DashboardLayout } from "./Dashboard";
import { getMyBerkas, uploadBerkas, deleteBerkas, downloadBerkas } from "../../api/berkasApi";
import { getMyPendaftaran } from "../../api/pendaftaranApi";

// Daftar berkas wajib yang harus diupload
const BERKAS_WAJIB = [
  { key: "ktp",            label: "Kartu Tanda Penduduk (KTP)" },
  { key: "ijazah",         label: "Ijazah / SKHUN" },
  { key: "foto",           label: "Foto 3x4 Terbaru" },
  { key: "nilai_rapor",    label: "Nilai Rapor" },
  { key: "surat_lulus",    label: "Surat Keterangan Lulus" },
];

const statusConfig = {
  approved: { label: "Terverifikasi", color: "#10b981", bg: "#d1fae5", icon: CheckCircle },
  pending:  { label: "Menunggu",      color: "#f59e0b", bg: "#fef3c7", icon: Clock },
  rejected: { label: "Ditolak",       color: "#ef4444", bg: "#fee2e2", icon: XCircle },
};

export default function UploadBerkas() {
  const navigate = useNavigate();

  const [pendaftaranId, setPendaftaranId] = useState(null);
  const [berkasData, setBerkasData]       = useState([]); // data dari backend
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");

  // State per berkas: { [jenis_berkas]: { file, uploading, progress, error } }
  const [uploadState, setUploadState] = useState({});

  // ── Fetch pendaftaran_id + berkas ─────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Ambil pendaftaran dulu untuk dapat pendaftaran_id
      const pendaftaran = await getMyPendaftaran();
      if (!pendaftaran) {
        setError("Anda belum memiliki pendaftaran. Silakan isi form pendaftaran terlebih dahulu.");
        setLoading(false);
        return;
      }

      setPendaftaranId(pendaftaran.id);

      // Ambil berkas berdasarkan pendaftaran_id
      const berkas = await getMyBerkas(pendaftaran.id);
      setBerkasData(Array.isArray(berkas) ? berkas : []);
    } catch (err) {
      setError("Gagal memuat data berkas. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Helper: cari berkas uploaded berdasarkan jenis ────────────────────────
  const getBerkasUploaded = (jenisKey) => {
    return berkasData.find(b =>
      b.jenis_berkas?.toLowerCase().replace(/\s+/g, "_") === jenisKey ||
      b.jenis_berkas === jenisKey
    );
  };

  // ── Handle pilih file ─────────────────────────────────────────────────────
  const handleFileSelect = (jenisKey, file) => {
    setUploadState(prev => ({
      ...prev,
      [jenisKey]: { ...prev[jenisKey], file, error: "" }
    }));
  };

  // ── Handle upload ─────────────────────────────────────────────────────────
  const handleUpload = async (jenisKey, jenisLabel) => {
    const fileToUpload = uploadState[jenisKey]?.file;
    if (!fileToUpload || !pendaftaranId) return;

    setUploadState(prev => ({
      ...prev,
      [jenisKey]: { ...prev[jenisKey], uploading: true, progress: 0, error: "" }
    }));

    try {
      await uploadBerkas(
        pendaftaranId,
        jenisLabel, // kirim label sebagai jenis_berkas ke backend
        fileToUpload,
        (progress) => {
          setUploadState(prev => ({
            ...prev,
            [jenisKey]: { ...prev[jenisKey], progress }
          }));
        }
      );

      // Refresh data berkas dari backend
      const updated = await getMyBerkas(pendaftaranId);
      setBerkasData(Array.isArray(updated) ? updated : []);

      // Reset state upload untuk berkas ini
      setUploadState(prev => ({
        ...prev,
        [jenisKey]: { file: null, uploading: false, progress: 0, error: "",successMsg: "✅ Upload berhasil! Menunggu verifikasi admin." }
      }));
    } catch (err) {
      const msg = err.response?.data?.message || "Upload gagal, coba lagi.";
      setUploadState(prev => ({
        ...prev,
        [jenisKey]: { ...prev[jenisKey], uploading: false, error: msg }
      }));
    }
  };

  // ── Handle delete ─────────────────────────────────────────────────────────
  const handleDelete = async (berkasId, jenisKey) => {
    if (!window.confirm("Yakin ingin menghapus berkas ini?")) return;
    try {
      await deleteBerkas(berkasId);
      setBerkasData(prev => prev.filter(b => b.id !== berkasId));
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus berkas.");
    }
  };

  // ── Hitung progress keseluruhan ───────────────────────────────────────────
  const approved = berkasData.filter(b => b.status_verifikasi === "approved").length;
  const total    = BERKAS_WAJIB.length;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout activePage="berkas">
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
          <Loader size={32} style={{ animation: "spin 0.8s linear infinite", marginBottom: 12 }} />
          <div style={{ fontSize: 14 }}>Memuat data berkas...</div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </DashboardLayout>
    );
  }

  // ── Error / Belum daftar ──────────────────────────────────────────────────
  if (error) {
    return (
      <DashboardLayout activePage="berkas">
        <div style={{
          background: "#fff", borderRadius: 16, padding: "40px",
          textAlign: "center", border: "1px solid #fee2e2",
        }}>
          <AlertCircle size={36} color="#ef4444" style={{ marginBottom: 12 }} />
          <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>
            {error}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
            <button onClick={fetchData} style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
              border: "none", borderRadius: 8, padding: "10px 20px",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <RefreshCw size={14} /> Coba Lagi
            </button>
            {error.includes("pendaftaran") && (
              <button onClick={() => navigate("/pendaftar/form-pendaftaran")} style={{
                background: "#f1f5f9", color: "#64748b", border: "none",
                borderRadius: 8, padding: "10px 20px",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>
                Isi Form Pendaftaran
              </button>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePage="berkas">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Upload Berkas</h2>
        <p style={{ fontSize: 13.5, color: "#64748b" }}>
          Upload semua berkas yang diperlukan. Pastikan file jelas dan terbaca.
        </p>
      </div>

      {/* Progress bar */}
      <div style={{
        background: "#fff", borderRadius: 16, padding: "20px 24px",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
        marginBottom: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>
            Kelengkapan Berkas
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: "#6366f1" }}>
            {approved}/{total} terverifikasi
          </span>
        </div>
        <div style={{ background: "#f1f5f9", borderRadius: 99, height: 8, overflow: "hidden" }}>
          <div style={{
            width: `${(approved / total) * 100}%`, height: "100%",
            background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
            borderRadius: 99, transition: "width 0.5s",
          }} />
        </div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
          {approved === total
            ? "✅ Semua berkas sudah terverifikasi!"
            : `${total - berkasData.length} berkas belum diupload · ${berkasData.filter(b => b.status_verifikasi === "pending").length} menunggu verifikasi`}
        </div>
      </div>

      {/* Daftar berkas */}
      <div style={{ display: "grid", gap: 14 }}>
        {BERKAS_WAJIB.map(({ key, label }) => {
          const uploaded   = getBerkasUploaded(key);
          const status     = uploaded?.status_verifikasi;
          const cfg        = statusConfig[status] || null;
          const uState     = uploadState[key] || {};
          const isUploading = uState.uploading;
          const hasFile    = !!uState.file;

          return (
            <div key={key} style={{
              background: "#fff", borderRadius: 14, padding: "20px 22px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
            }}>
              {/* Row atas: icon + info + status */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: cfg ? cfg.bg : "#f1f5f9",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {cfg
                    ? <cfg.icon size={20} color={cfg.color} strokeWidth={2} />
                    : <AlertCircle size={20} color="#94a3b8" strokeWidth={2} />
                  }
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{label}</div>

                  {/* Catatan jika ditolak */}
                  {status === "rejected" && uploaded?.catatan && (
                    <div style={{
                      fontSize: 12, color: "#ef4444", marginTop: 5,
                      background: "#fee2e2", padding: "4px 10px",
                      borderRadius: 8, display: "inline-block",
                    }}>
                      ⚠️ {uploaded.catatan}
                    </div>
                  )}

                  {uploaded && (
                    <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 3 }}>
                      {uploaded.nama_file} · {uploaded.uploaded_at
                        ? new Date(uploaded.uploaded_at).toLocaleDateString("id-ID")
                        : ""}
                    </div>
                  )}
                </div>

                {/* Status badge + aksi */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {cfg ? (
                    <span style={{
                      fontSize: 12, padding: "4px 12px", borderRadius: 20,
                      background: cfg.bg, color: cfg.color, fontWeight: 600,
                    }}>{cfg.label}</span>
                  ) : (
                    <span style={{
                      fontSize: 12, padding: "4px 12px", borderRadius: 20,
                      background: "#f1f5f9", color: "#94a3b8", fontWeight: 600,
                    }}>Belum Upload</span>
                  )}

                  {/* Tombol download jika sudah ada file */}
                  {uploaded && (
                    <button
                      onClick={() => downloadBerkas(uploaded.id)}
                      title="Download berkas"
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: "#f1f5f9", border: "none",
                        cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Download size={14} color="#64748b" />
                    </button>
                  )}

                  {/* Tombol delete jika status bukan approved */}
                  {uploaded && status !== "approved" && (
                    <button
                      onClick={() => handleDelete(uploaded.id, key)}
                      title="Hapus berkas"
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: "#fee2e2", border: "none",
                        cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  )}
                </div>
              </div>

              {/* Upload area (tampil jika belum approved) */}
              {status !== "approved" && (
                <div style={{
                  marginTop: 14, paddingTop: 14,
                  borderTop: "1px dashed #e2e8f0",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  {/* File picker */}
                  <label style={{
                    flex: 1, background: "#f8fafc",
                    border: `2px dashed ${hasFile ? "#6366f1" : "#c7d2fe"}`,
                    borderRadius: 10, padding: "10px 16px", cursor: "pointer",
                    fontSize: 12.5,
                    color: hasFile ? "#6366f1" : "#94a3b8",
                    display: "flex", alignItems: "center", gap: 8,
                    fontWeight: hasFile ? 600 : 400,
                    transition: "all 0.2s",
                  }}>
                    <Upload size={14} color={hasFile ? "#6366f1" : "#94a3b8"} />
                    {hasFile ? uState.file.name : `Pilih file (JPG, PNG, PDF · Maks. 5MB)`}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      style={{ display: "none" }}
                      onChange={(e) => e.target.files[0] && handleFileSelect(key, e.target.files[0])}
                    />
                  </label>

                  {/* Tombol upload */}
                  <button
                    onClick={() => handleUpload(key, label)}
                    disabled={!hasFile || isUploading}
                    style={{
                      background: hasFile && !isUploading
                        ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                        : "#e2e8f0",
                      color: hasFile && !isUploading ? "#fff" : "#94a3b8",
                      border: "none", borderRadius: 10,
                      padding: "10px 18px", fontSize: 13, fontWeight: 600,
                      cursor: hasFile && !isUploading ? "pointer" : "not-allowed",
                      whiteSpace: "nowrap",
                      display: "flex", alignItems: "center", gap: 6,
                      transition: "all 0.2s",
                    }}
                  >
                    {isUploading
                      ? <><Loader size={14} style={{ animation: "spin 0.8s linear infinite" }} /> {uState.progress}%</>
                      : status ? "Upload Ulang" : "Upload"
                    }
                  </button>
                </div>
              )}

              {/* Progress bar upload */}
              {isUploading && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ background: "#f1f5f9", borderRadius: 99, height: 4, overflow: "hidden" }}>
                    <div style={{
                      width: `${uState.progress}%`, height: "100%",
                      background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                      borderRadius: 99, transition: "width 0.2s",
                    }} />
                  </div>
                </div>
              )}

              {/* Error upload */}
              {uState.error && (
                <div style={{
                  marginTop: 10, fontSize: 12, color: "#ef4444",
                  display: "flex", gap: 6, alignItems: "center",
                }}>
                  <AlertCircle size={13} /> {uState.error}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div style={{
        marginTop: 20, background: "#eff6ff", border: "1px solid #bfdbfe",
        borderRadius: 12, padding: "14px 18px", fontSize: 13, color: "#2563eb",
      }}>
        💡 <strong>Tips:</strong> Format diterima: JPG, PNG, PDF · Maks. 5MB per file.
        Pastikan dokumen terbaca dengan jelas dan tidak buram.
      </div>
    </DashboardLayout>
  );
}