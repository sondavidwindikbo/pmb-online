// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   CreditCard, Upload, CheckCircle, Clock,
//   XCircle, AlertCircle, Copy, Loader, RefreshCw
// } from "lucide-react";
// import { DashboardLayout } from "./Dashboard";
// import { getMyPembayaran, createPembayaran, uploadBuktiPembayaran } from "../../api/pembayaranApi";
// import { getMyPendaftaran } from "../../api/pendaftaranApi";

// // Info rekening tujuan (sesuaikan dengan data kampus Anda)
// const REKENING_KAMPUS = [
//   { bank: "BNI",     noRek: "1234567890",   atasNama: "USNP" },
//   { bank: "BRI",     noRek: "0987654321",   atasNama: "USNP" },
//   { bank: "Mandiri", noRek: "1357924680",   atasNama: "USNP" },
// ];

// const METODE_LIST = ["transfer_bank", "virtual_account"];

// const statusConfig = {
//   pending: {
//     label: "Menunggu Pembayaran",
//     color: "#f59e0b", bg: "#fef3c7",
//     icon: Clock,
//     desc: "Silakan transfer ke rekening kampus dan upload bukti pembayaran.",
//   },
//   paid: {
//     label: "Menunggu Verifikasi",
//     color: "#3b82f6", bg: "#dbeafe",
//     icon: Clock,
//     desc: "Bukti pembayaran sudah diterima. Menunggu verifikasi admin.",
//   },
//   failed: {
//     label: "Pembayaran Ditolak",
//     color: "#ef4444", bg: "#fee2e2",
//     icon: XCircle,
//     desc: "Pembayaran ditolak oleh admin. Silakan hubungi admin atau upload ulang bukti.",
//   },
// };

// // Komponen copy ke clipboard
// function CopyButton({ text }) {
//   const [copied, setCopied] = useState(false);
//   const handleCopy = () => {
//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };
//   return (
//     <button onClick={handleCopy} title="Salin" style={{
//       background: copied ? "#d1fae5" : "#f1f5f9",
//       border: "none", borderRadius: 6, padding: "4px 10px",
//       cursor: "pointer", fontSize: 11.5,
//       color: copied ? "#059669" : "#64748b",
//       display: "flex", alignItems: "center", gap: 4,
//       transition: "all 0.2s",
//     }}>
//       <Copy size={12} />
//       {copied ? "Tersalin!" : "Salin"}
//     </button>
//   );
// }

// export default function Pembayaran() {
//   const navigate = useNavigate();

//   const [pendaftaran, setPendaftaran]   = useState(null);
//   const [pembayaran, setPembayaran]     = useState(null);
//   const [loading, setLoading]           = useState(true);
//   const [error, setError]               = useState("");

//   // State form buat kode pembayaran
//   const [showForm, setShowForm]         = useState(false);
//   const [formPay, setFormPay]           = useState({
//     metode_pembayaran: "transfer_bank",
//     bank: "BNI",
//     nomor_rekening: "",
//   });
//   const [creatingPay, setCreatingPay]   = useState(false);
//   const [createError, setCreateError]   = useState("");

//   // State upload bukti
//   const [buktFile, setBuktiFile]        = useState(null);
//   const [uploading, setUploading]       = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [uploadError, setUploadError]   = useState("");
//   const [uploadSuccess, setUploadSuccess] = useState(false);

//   // ── Fetch data ─────────────────────────────────────────────────────────────
//   const fetchData = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const dataPendaftaran = await getMyPendaftaran();
//       if (!dataPendaftaran) {
//         setError("Anda belum memiliki pendaftaran. Silakan isi form pendaftaran terlebih dahulu.");
//         setLoading(false);
//         return;
//       }
//       setPendaftaran(dataPendaftaran);

//       // Get pembayaran berdasarkan pendaftaran_id
//       const dataPembayaran = await getMyPembayaran(dataPendaftaran.id);
//       setPembayaran(dataPembayaran);
//     } catch {
//       setError("Gagal memuat data pembayaran. Periksa koneksi Anda.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchData(); }, []);

//   // ── Buat kode pembayaran ───────────────────────────────────────────────────
//   const handleCreatePembayaran = async () => {
//     if (!formPay.bank) { setCreateError("Pilih bank terlebih dahulu."); return; }
//     setCreatingPay(true);
//     setCreateError("");
//     try {
//       const result = await createPembayaran({
//         pendaftaran_id:    pendaftaran.id,
//         metode_pembayaran: formPay.metode_pembayaran,
//         bank:              formPay.bank,
//         nomor_rekening:    formPay.nomor_rekening,
//       });
//       setPembayaran(result);
//       setShowForm(false);
//     } catch (err) {
//       setCreateError(err.response?.data?.message || "Gagal membuat kode pembayaran.");
//     } finally {
//       setCreatingPay(false);
//     }
//   };

//   // ── Upload bukti ───────────────────────────────────────────────────────────
//   const handleUploadBukti = async () => {
//     if (!buktFile || !pembayaran) return;
//     setUploading(true);
//     setUploadProgress(0);
//     setUploadError("");
//     setUploadSuccess(false);
//     try {
//       const result = await uploadBuktiPembayaran(
//         pembayaran.id,
//         buktFile,
//         (p) => setUploadProgress(p)
//       );
//       setPembayaran(result);
//       setBuktiFile(null);
//       setUploadSuccess(true);
//       setTimeout(() => setUploadSuccess(false), 4000);
//     } catch (err) {
//       setUploadError(err.response?.data?.message || "Upload gagal, coba lagi.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   // ── Cek expired ───────────────────────────────────────────────────────────
//   const isExpired = pembayaran?.expired_at && new Date() > new Date(pembayaran.expired_at);

//   // ── Loading ───────────────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <DashboardLayout activePage="pembayaran">
//         <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
//           <Loader size={32} style={{ animation: "spin 0.8s linear infinite", marginBottom: 12 }} />
//           <div style={{ fontSize: 14 }}>Memuat data pembayaran...</div>
//           <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   // ── Error ─────────────────────────────────────────────────────────────────
//   if (error) {
//     return (
//       <DashboardLayout activePage="pembayaran">
//         <div style={{
//           background: "#fff", borderRadius: 16, padding: "40px",
//           textAlign: "center", border: "1px solid #fee2e2",
//         }}>
//           <AlertCircle size={36} color="#ef4444" style={{ marginBottom: 12 }} />
//           <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>{error}</div>
//           <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
//             <button onClick={fetchData} style={{
//               background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
//               border: "none", borderRadius: 8, padding: "10px 20px",
//               fontSize: 13, fontWeight: 600, cursor: "pointer",
//               display: "flex", alignItems: "center", gap: 6,
//             }}>
//               <RefreshCw size={14} /> Coba Lagi
//             </button>
//             {error.includes("pendaftaran") && (
//               <button onClick={() => navigate("/pendaftar/form-pendaftaran")} style={{
//                 background: "#f1f5f9", color: "#64748b", border: "none",
//                 borderRadius: 8, padding: "10px 20px",
//                 fontSize: 13, fontWeight: 600, cursor: "pointer",
//               }}>
//                 Isi Form Pendaftaran
//               </button>
//             )}
//           </div>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   const statusInfo = pembayaran ? statusConfig[pembayaran.status_pembayaran] : null;
//   const StatusIcon = statusInfo?.icon || CreditCard;

//   return (
//     <DashboardLayout activePage="pembayaran">
//       <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

//       {/* Header */}
//       <div style={{ marginBottom: 24 }}>
//         <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Pembayaran</h2>
//         <p style={{ fontSize: 13.5, color: "#64748b" }}>
//           Lakukan pembayaran biaya pendaftaran dan upload bukti transfer.
//         </p>
//       </div>

//       {/* Upload success alert */}
//       {uploadSuccess && (
//         <div style={{
//           background: "#f0fdf4", border: "1px solid #bbf7d0",
//           borderRadius: 10, padding: "12px 16px", marginBottom: 20,
//           display: "flex", alignItems: "center", gap: 10,
//           fontSize: 13, color: "#15803d", fontWeight: 500,
//         }}>
//           <CheckCircle size={16} /> Bukti pembayaran berhasil diupload! Menunggu verifikasi admin.
//         </div>
//       )}

//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>

//         {/* ── Panel Kiri: Status & Kode Pembayaran ── */}
//         <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

//           {/* Status Card */}
//           <div style={{
//             background: "#fff", borderRadius: 16, padding: "24px",
//             boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
//           }}>
//             <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 18 }}>
//               Status Pembayaran
//             </div>

//             {!pembayaran ? (
//               // Belum ada pembayaran
//               <div style={{ textAlign: "center", padding: "20px 0" }}>
//                 <div style={{
//                   width: 60, height: 60, borderRadius: "50%",
//                   background: "#f1f5f9", margin: "0 auto 16px",
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                 }}>
//                   <CreditCard size={28} color="#94a3b8" />
//                 </div>
//                 <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
//                   Belum Ada Pembayaran
//                 </div>
//                 <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
//                   Klik tombol di bawah untuk membuat kode pembayaran.
//                 </div>
//                 <button onClick={() => setShowForm(true)} style={{
//                   background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
//                   border: "none", borderRadius: 10, padding: "11px 24px",
//                   fontSize: 13.5, fontWeight: 700, cursor: "pointer",
//                   boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
//                 }}>
//                   Buat Kode Pembayaran
//                 </button>
//               </div>
//             ) : (
//               <>
//                 {/* Status badge */}
//                 <div style={{
//                   display: "flex", alignItems: "center", gap: 12,
//                   background: statusInfo?.bg || "#f1f5f9",
//                   borderRadius: 12, padding: "14px 16px", marginBottom: 16,
//                 }}>
//                   <StatusIcon size={22} color={statusInfo?.color || "#94a3b8"} />
//                   <div>
//                     <div style={{ fontWeight: 700, color: statusInfo?.color, fontSize: 14 }}>
//                       {statusInfo?.label || pembayaran.status_pembayaran}
//                     </div>
//                     <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
//                       {statusInfo?.desc}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Detail pembayaran */}
//                 {[
//                   ["Kode Pembayaran", pembayaran.kode_pembayaran, true],
//                   ["Jumlah",          pembayaran.jumlah ? `Rp ${Number(pembayaran.jumlah).toLocaleString("id")}` : "-", false],
//                   ["Metode",          pembayaran.metode_pembayaran?.replace("_", " ") || "-", false],
//                   ["Bank",            pembayaran.bank || "-", false],
//                   ["Expired",         pembayaran.expired_at
//                     ? new Date(pembayaran.expired_at).toLocaleString("id-ID")
//                     : "-", false],
//                 ].map(([label, value, canCopy]) => (
//                   <div key={label} style={{
//                     display: "flex", justifyContent: "space-between", alignItems: "center",
//                     padding: "9px 0", borderBottom: "1px solid #f8fafc",
//                     fontSize: 13,
//                   }}>
//                     <span style={{ color: "#94a3b8", fontWeight: 500 }}>{label}</span>
//                     <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                       <span style={{ fontWeight: 600, color: "#1e293b" }}>{value}</span>
//                       {canCopy && value !== "-" && <CopyButton text={value} />}
//                     </div>
//                   </div>
//                 ))}

//                 {/* Expired warning */}
//                 {isExpired && pembayaran.status_pembayaran !== "paid" && (
//                   <div style={{
//                     marginTop: 12, background: "#fee2e2", border: "1px solid #fca5a5",
//                     borderRadius: 8, padding: "10px 14px",
//                     fontSize: 12.5, color: "#dc2626",
//                     display: "flex", alignItems: "center", gap: 8,
//                   }}>
//                     <AlertCircle size={14} />
//                     Kode pembayaran sudah expired. Buat kode baru.
//                   </div>
//                 )}

//                 {/* Buat ulang kode jika expired atau failed */}
//                 {(isExpired || pembayaran.status_pembayaran === "failed") && (
//                   <button onClick={() => setShowForm(true)} style={{
//                     marginTop: 14, width: "100%",
//                     background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
//                     border: "none", borderRadius: 10, padding: "11px",
//                     fontSize: 13.5, fontWeight: 700, cursor: "pointer",
//                   }}>
//                     Buat Kode Pembayaran Baru
//                   </button>
//                 )}
//               </>
//             )}
//           </div>

//           {/* Form buat kode pembayaran */}
//           {showForm && (
//             <div style={{
//               background: "#fff", borderRadius: 16, padding: "22px 24px",
//               boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #e0e7ff",
//             }}>
//               <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 16 }}>
//                 Buat Kode Pembayaran
//               </div>

//               {createError && (
//                 <div style={{
//                   background: "#fee2e2", border: "1px solid #fca5a5",
//                   borderRadius: 8, padding: "10px 14px", marginBottom: 14,
//                   fontSize: 13, color: "#dc2626", display: "flex", gap: 8,
//                 }}>
//                   <AlertCircle size={15} style={{ flexShrink: 0 }} /> {createError}
//                 </div>
//               )}

//               {/* Metode */}
//               <div style={{ marginBottom: 14 }}>
//                 <label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
//                   Metode Pembayaran
//                 </label>
//                 <select value={formPay.metode_pembayaran}
//                   onChange={e => setFormPay(p => ({ ...p, metode_pembayaran: e.target.value }))}
//                   style={{
//                     width: "100%", padding: "10px 14px", fontSize: 13.5,
//                     border: "1.5px solid #e2e8f0", borderRadius: 10,
//                     outline: "none", background: "#fff",
//                   }}>
//                   <option value="transfer_bank">Transfer Bank</option>
//                   <option value="virtual_account">Virtual Account</option>
//                 </select>
//               </div>

//               {/* Bank */}
//               <div style={{ marginBottom: 14 }}>
//                 <label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
//                   Bank
//                 </label>
//                 <select value={formPay.bank}
//                   onChange={e => setFormPay(p => ({ ...p, bank: e.target.value }))}
//                   style={{
//                     width: "100%", padding: "10px 14px", fontSize: 13.5,
//                     border: "1.5px solid #e2e8f0", borderRadius: 10,
//                     outline: "none", background: "#fff",
//                   }}>
//                   {REKENING_KAMPUS.map(r => (
//                     <option key={r.bank} value={r.bank}>{r.bank}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* No rekening pengirim (opsional) */}
//               <div style={{ marginBottom: 18 }}>
//                 <label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
//                   No. Rekening Pengirim <span style={{ color: "#94a3b8", fontWeight: 400 }}>(opsional)</span>
//                 </label>
//                 <input value={formPay.nomor_rekening}
//                   onChange={e => setFormPay(p => ({ ...p, nomor_rekening: e.target.value }))}
//                   placeholder="No. rekening Anda"
//                   style={{
//                     width: "100%", padding: "10px 14px", fontSize: 13.5,
//                     border: "1.5px solid #e2e8f0", borderRadius: 10,
//                     outline: "none", background: "#fff", boxSizing: "border-box",
//                   }}
//                 />
//               </div>

//               <div style={{ display: "flex", gap: 10 }}>
//                 <button onClick={handleCreatePembayaran} disabled={creatingPay} style={{
//                   flex: 1,
//                   background: creatingPay ? "#e2e8f0" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
//                   color: creatingPay ? "#94a3b8" : "#fff",
//                   border: "none", borderRadius: 10, padding: "11px",
//                   fontSize: 13.5, fontWeight: 700,
//                   cursor: creatingPay ? "not-allowed" : "pointer",
//                   display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
//                 }}>
//                   {creatingPay
//                     ? <><Loader size={15} style={{ animation: "spin 0.8s linear infinite" }} /> Membuat...</>
//                     : "Buat Kode"}
//                 </button>
//                 <button onClick={() => { setShowForm(false); setCreateError(""); }} style={{
//                   background: "#f1f5f9", color: "#64748b", border: "none",
//                   borderRadius: 10, padding: "11px 18px",
//                   fontSize: 13.5, fontWeight: 600, cursor: "pointer",
//                 }}>
//                   Batal
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* ── Panel Kanan: Rekening & Upload Bukti ── */}
//         <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

//           {/* Info rekening kampus */}
//           <div style={{
//             background: "#fff", borderRadius: 16, padding: "22px 24px",
//             boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
//           }}>
//             <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 16 }}>
//               Rekening Tujuan
//             </div>
//             {REKENING_KAMPUS.map((r, i) => (
//               <div key={r.bank} style={{
//                 padding: "12px 0",
//                 borderBottom: i < REKENING_KAMPUS.length - 1 ? "1px solid #f1f5f9" : "none",
//               }}>
//                 <div style={{
//                   display: "flex", justifyContent: "space-between", alignItems: "center",
//                   marginBottom: 4,
//                 }}>
//                   <span style={{
//                     fontWeight: 700, fontSize: 13.5, color: "#1e293b",
//                     background: "#f1f5f9", padding: "3px 10px", borderRadius: 6,
//                   }}>{r.bank}</span>
//                   <CopyButton text={r.noRek} />
//                 </div>
//                 <div style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", letterSpacing: "0.04em" }}>
//                   {r.noRek}
//                 </div>
//                 <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>a.n. {r.atasNama}</div>
//               </div>
//             ))}

//             {/* Nominal */}
//             {pembayaran?.jumlah && (
//               <div style={{
//                 marginTop: 14, background: "#eff6ff", border: "1px solid #bfdbfe",
//                 borderRadius: 10, padding: "12px 16px",
//                 display: "flex", justifyContent: "space-between", alignItems: "center",
//               }}>
//                 <span style={{ fontSize: 13, color: "#2563eb", fontWeight: 600 }}>Total Transfer</span>
//                 <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                   <span style={{ fontSize: 18, fontWeight: 800, color: "#1e293b" }}>
//                     Rp {Number(pembayaran.jumlah).toLocaleString("id")}
//                   </span>
//                   <CopyButton text={String(pembayaran.jumlah)} />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Upload bukti pembayaran */}
//           {pembayaran && pembayaran.status_pembayaran !== "paid" && !isExpired && (
//             <div style={{
//               background: "#fff", borderRadius: 16, padding: "22px 24px",
//               boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
//             }}>
//               <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 6 }}>
//                 Upload Bukti Pembayaran
//               </div>
//               <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
//                 Upload screenshot atau foto struk transfer Anda.
//               </div>

//               {/* File picker */}
//               <label style={{
//                 display: "flex", flexDirection: "column", alignItems: "center",
//                 justifyContent: "center", gap: 8,
//                 border: `2px dashed ${buktFile ? "#6366f1" : "#c7d2fe"}`,
//                 borderRadius: 12, padding: "24px 16px",
//                 background: buktFile ? "#eef2ff" : "#f8fafc",
//                 cursor: "pointer", marginBottom: 14, transition: "all 0.2s",
//               }}>
//                 <Upload size={24} color={buktFile ? "#6366f1" : "#94a3b8"} />
//                 <div style={{
//                   fontSize: 13, fontWeight: buktFile ? 600 : 400,
//                   color: buktFile ? "#6366f1" : "#94a3b8", textAlign: "center",
//                 }}>
//                   {buktFile ? buktFile.name : "Klik untuk pilih file bukti pembayaran"}
//                 </div>
//                 {!buktFile && (
//                   <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
//                     JPG, PNG, PDF · Maks. 5MB
//                   </div>
//                 )}
//                 <input type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }}
//                   onChange={e => e.target.files[0] && setBuktiFile(e.target.files[0])} />
//               </label>

//               {/* Progress bar */}
//               {uploading && (
//                 <div style={{ marginBottom: 14 }}>
//                   <div style={{ background: "#f1f5f9", borderRadius: 99, height: 6, overflow: "hidden" }}>
//                     <div style={{
//                       width: `${uploadProgress}%`, height: "100%",
//                       background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
//                       borderRadius: 99, transition: "width 0.2s",
//                     }} />
//                   </div>
//                   <div style={{ fontSize: 12, color: "#6366f1", marginTop: 6, textAlign: "right" }}>
//                     {uploadProgress}%
//                   </div>
//                 </div>
//               )}

//               {/* Error upload */}
//               {uploadError && (
//                 <div style={{
//                   background: "#fee2e2", border: "1px solid #fca5a5",
//                   borderRadius: 8, padding: "10px 14px", marginBottom: 12,
//                   fontSize: 13, color: "#dc2626",
//                   display: "flex", gap: 8, alignItems: "center",
//                 }}>
//                   <AlertCircle size={14} /> {uploadError}
//                 </div>
//               )}

//               {/* Tombol upload */}
//               <button onClick={handleUploadBukti} disabled={!buktFile || uploading} style={{
//                 width: "100%",
//                 background: buktFile && !uploading
//                   ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#e2e8f0",
//                 color: buktFile && !uploading ? "#fff" : "#94a3b8",
//                 border: "none", borderRadius: 10, padding: "12px",
//                 fontSize: 13.5, fontWeight: 700,
//                 cursor: buktFile && !uploading ? "pointer" : "not-allowed",
//                 display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
//                 transition: "all 0.2s",
//               }}>
//                 {uploading
//                   ? <><Loader size={15} style={{ animation: "spin 0.8s linear infinite" }} /> Mengupload...</>
//                   : <><Upload size={15} /> Upload Bukti Pembayaran</>
//                 }
//               </button>
//             </div>
//           )}

//           {/* Status sudah paid */}
//           {pembayaran?.status_pembayaran === "paid" && (
//             <div style={{
//               background: "#f0fdf4", border: "1px solid #bbf7d0",
//               borderRadius: 16, padding: "22px 24px",
//               textAlign: "center",
//             }}>
//               <CheckCircle size={36} color="#10b981" style={{ marginBottom: 12 }} />
//               <div style={{ fontWeight: 700, fontSize: 15, color: "#065f46", marginBottom: 6 }}>
//                 Bukti Pembayaran Diterima
//               </div>
//               <div style={{ fontSize: 13, color: "#059669" }}>
//                 Pembayaran Anda sedang dalam proses verifikasi oleh admin.
//               </div>
//               {pembayaran.tanggal_bayar && (
//                 <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
//                   Dibayar: {new Date(pembayaran.tanggal_bayar).toLocaleString("id-ID")}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Info */}
//           <div style={{
//             background: "#eff6ff", border: "1px solid #bfdbfe",
//             borderRadius: 12, padding: "14px 18px", fontSize: 13, color: "#2563eb",
//           }}>
//             💡 <strong>Penting:</strong> Kode pembayaran berlaku 24 jam.
//             Transfer sesuai nominal yang tertera, lalu upload bukti pembayaran.
//           </div>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }
// src/pages/pendaftar/Pembayaran.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard, Upload, CheckCircle, Clock,
  XCircle, AlertCircle, Copy, Loader, RefreshCw, ShieldCheck
} from "lucide-react";
import { DashboardLayout } from "./Dashboard";
import { getMyPembayaran, createPembayaran, uploadBuktiPembayaran } from "../../api/pembayaranApi";
import { getMyPendaftaran } from "../../api/pendaftaranApi";

const REKENING_KAMPUS = [
  { bank: "BNI",     noRek: "1234567890", atasNama: "USNP" },
  { bank: "BRI",     noRek: "0987654321", atasNama: "USNP" },
  { bank: "Mandiri", noRek: "1357924680", atasNama: "USNP" },
];

// ── FIX: tambah kondisi verified (sudah diverifikasi admin) ──────────────────
// Backend: status_pembayaran tetap 'paid' setelah admin verifikasi,
// bedanya ada field verified_at yang terisi.
// Jadi kita deteksi dari verified_at, bukan status baru.

const getStatusInfo = (pembayaran) => {
  if (!pembayaran) return null;

  const { status_pembayaran, verified_at } = pembayaran;

  // Sudah diverifikasi admin (paid + verified_at terisi)
  if (status_pembayaran === "paid" && verified_at) {
    return {
      key: "verified",
      label: "Pembayaran Terverifikasi ✓",
      color: "#059669",
      bg: "#d1fae5",
      icon: ShieldCheck,
      desc: "Pembayaran Anda telah diverifikasi oleh admin. Pendaftaran sedang diproses.",
    };
  }

  // Sudah upload bukti, menunggu verifikasi admin
  if (status_pembayaran === "paid" && !verified_at) {
    return {
      key: "paid",
      label: "Menunggu Verifikasi Admin",
      color: "#3b82f6",
      bg: "#dbeafe",
      icon: Clock,
      desc: "Bukti pembayaran sudah diterima. Menunggu verifikasi admin.",
    };
  }

  // Belum bayar
  if (status_pembayaran === "pending") {
    return {
      key: "pending",
      label: "Menunggu Pembayaran",
      color: "#f59e0b",
      bg: "#fef3c7",
      icon: Clock,
      desc: "Silakan transfer ke rekening kampus dan upload bukti pembayaran.",
    };
  }

  // Ditolak
  if (status_pembayaran === "failed") {
    return {
      key: "failed",
      label: "Pembayaran Ditolak",
      color: "#ef4444",
      bg: "#fee2e2",
      icon: XCircle,
      desc: "Pembayaran ditolak oleh admin. Silakan hubungi admin atau upload ulang bukti.",
    };
  }

  return {
    key: status_pembayaran,
    label: status_pembayaran,
    color: "#94a3b8",
    bg: "#f1f5f9",
    icon: CreditCard,
    desc: "",
  };
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} style={{
      background: copied ? "#d1fae5" : "#f1f5f9",
      border: "none", borderRadius: 6, padding: "4px 10px",
      cursor: "pointer", fontSize: 11.5,
      color: copied ? "#059669" : "#64748b",
      display: "flex", alignItems: "center", gap: 4,
      transition: "all 0.2s",
    }}>
      <Copy size={12} />
      {copied ? "Tersalin!" : "Salin"}
    </button>
  );
}

export default function Pembayaran() {
  const navigate = useNavigate();

  const [pendaftaran, setPendaftaran] = useState(null);
  const [pembayaran, setPembayaran]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  const [showForm, setShowForm]       = useState(false);
  const [formPay, setFormPay]         = useState({
    metode_pembayaran: "transfer_bank",
    bank: "BNI",
    nomor_rekening: "",
  });
  const [creatingPay, setCreatingPay] = useState(false);
  const [createError, setCreateError] = useState("");

  const [buktiFile, setBuktiFile]           = useState(null);
  const [uploading, setUploading]           = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError]       = useState("");
  const [uploadSuccess, setUploadSuccess]   = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const dataPendaftaran = await getMyPendaftaran();
      if (!dataPendaftaran) {
        setError("Anda belum memiliki pendaftaran. Silakan isi form pendaftaran terlebih dahulu.");
        setLoading(false);
        return;
      }
      setPendaftaran(dataPendaftaran);
      const dataPembayaran = await getMyPembayaran(dataPendaftaran.id);
      setPembayaran(dataPembayaran);
    } catch {
      setError("Gagal memuat data pembayaran. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreatePembayaran = async () => {
    if (!formPay.bank) { setCreateError("Pilih bank terlebih dahulu."); return; }
    setCreatingPay(true);
    setCreateError("");
    try {
      const result = await createPembayaran({
        pendaftaran_id:    pendaftaran.id,
        metode_pembayaran: formPay.metode_pembayaran,
        bank:              formPay.bank,
        nomor_rekening:    formPay.nomor_rekening,
      });
      setPembayaran(result);
      setShowForm(false);
    } catch (err) {
      setCreateError(err.response?.data?.message || "Gagal membuat kode pembayaran.");
    } finally {
      setCreatingPay(false);
    }
  };

  const handleUploadBukti = async () => {
    if (!buktiFile || !pembayaran) return;
    setUploading(true);
    setUploadProgress(0);
    setUploadError("");
    setUploadSuccess(false);
    try {
      const result = await uploadBuktiPembayaran(
        pembayaran.id,
        buktiFile,
        (p) => setUploadProgress(p)
      );
      setPembayaran(result);
      setBuktiFile(null);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err) {
      setUploadError(err.response?.data?.message || "Upload gagal, coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  // ── FIX: cek expired hanya jika status masih pending ─────────────────────
  const isExpired = pembayaran?.expired_at
    && pembayaran.status_pembayaran === "pending"
    && new Date() > new Date(pembayaran.expired_at);

  // ── FIX: tombol "Buat Kode Baru" hanya muncul jika expired atau failed ───
  // TIDAK muncul jika sudah paid (meski belum verified)
  const showBuatKodeBaru = isExpired || pembayaran?.status_pembayaran === "failed";

  // ── FIX: upload bukti hanya muncul jika pending dan belum expired ─────────
  const showUpload = pembayaran
    && pembayaran.status_pembayaran === "pending"
    && !isExpired;

  const statusInfo = getStatusInfo(pembayaran);
  const StatusIcon = statusInfo?.icon || CreditCard;

  if (loading) {
    return (
      <DashboardLayout activePage="pembayaran">
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
          <Loader size={32} style={{ animation: "spin 0.8s linear infinite", marginBottom: 12 }} />
          <div style={{ fontSize: 14 }}>Memuat data pembayaran...</div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout activePage="pembayaran">
        <div style={{
          background: "#fff", borderRadius: 16, padding: "40px",
          textAlign: "center", border: "1px solid #fee2e2",
        }}>
          <AlertCircle size={36} color="#ef4444" style={{ marginBottom: 12 }} />
          <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>{error}</div>
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
    <DashboardLayout activePage="pembayaran">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Pembayaran</h2>
        <p style={{ fontSize: 13.5, color: "#64748b" }}>
          Lakukan pembayaran biaya pendaftaran dan upload bukti transfer.
        </p>
      </div>

      {uploadSuccess && (
        <div style={{
          background: "#f0fdf4", border: "1px solid #bbf7d0",
          borderRadius: 10, padding: "12px 16px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 10,
          fontSize: 13, color: "#15803d", fontWeight: 500,
        }}>
          <CheckCircle size={16} /> Bukti pembayaran berhasil diupload! Menunggu verifikasi admin.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>

        {/* Panel Kiri */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Status Card */}
          <div style={{
            background: "#fff", borderRadius: 16, padding: "24px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 18 }}>
              Status Pembayaran
            </div>

            {!pembayaran ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{
                  width: 60, height: 60, borderRadius: "50%",
                  background: "#f1f5f9", margin: "0 auto 16px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <CreditCard size={28} color="#94a3b8" />
                </div>
                <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                  Belum Ada Pembayaran
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
                  Klik tombol di bawah untuk membuat kode pembayaran.
                </div>
                <button onClick={() => setShowForm(true)} style={{
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
                  border: "none", borderRadius: 10, padding: "11px 24px",
                  fontSize: 13.5, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                }}>
                  Buat Kode Pembayaran
                </button>
              </div>
            ) : (
              <>
                {/* Status badge */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: statusInfo?.bg || "#f1f5f9",
                  borderRadius: 12, padding: "14px 16px", marginBottom: 16,
                }}>
                  <StatusIcon size={22} color={statusInfo?.color || "#94a3b8"} />
                  <div>
                    <div style={{ fontWeight: 700, color: statusInfo?.color, fontSize: 14 }}>
                      {statusInfo?.label}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      {statusInfo?.desc}
                    </div>
                  </div>
                </div>

                {/* Detail */}
                {[
                  ["Kode Pembayaran", pembayaran.kode_pembayaran, true],
                  ["Jumlah", pembayaran.jumlah
                    ? `Rp ${Number(pembayaran.jumlah).toLocaleString("id")}` : "-", false],
                  ["Metode", pembayaran.metode_pembayaran?.replace("_", " ") || "-", false],
                  ["Bank", pembayaran.bank || "-", false],
                  ["Tanggal Bayar", pembayaran.tanggal_bayar
                    ? new Date(pembayaran.tanggal_bayar).toLocaleString("id-ID") : "-", false],
                  // ── FIX: tampilkan tanggal verifikasi jika sudah verified ──
                  ...(pembayaran.verified_at ? [
                    ["Diverifikasi", new Date(pembayaran.verified_at).toLocaleString("id-ID"), false]
                  ] : [
                    ["Expired", pembayaran.expired_at
                      ? new Date(pembayaran.expired_at).toLocaleString("id-ID") : "-", false]
                  ]),
                ].map(([label, value, canCopy]) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "9px 0", borderBottom: "1px solid #f8fafc", fontSize: 13,
                  }}>
                    <span style={{ color: "#94a3b8", fontWeight: 500 }}>{label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, color: "#1e293b" }}>{value}</span>
                      {canCopy && value !== "-" && <CopyButton text={value} />}
                    </div>
                  </div>
                ))}

                {/* Catatan admin jika ditolak */}
                {pembayaran.status_pembayaran === "failed" && pembayaran.catatan && (
                  <div style={{
                    marginTop: 12, background: "#fff7ed",
                    border: "1px solid #fed7aa", borderRadius: 8,
                    padding: "10px 14px", fontSize: 12.5, color: "#9a3412",
                  }}>
                    <b>Catatan Admin:</b> {pembayaran.catatan}
                  </div>
                )}

                {/* Expired warning */}
                {isExpired && (
                  <div style={{
                    marginTop: 12, background: "#fee2e2", border: "1px solid #fca5a5",
                    borderRadius: 8, padding: "10px 14px",
                    fontSize: 12.5, color: "#dc2626",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <AlertCircle size={14} />
                    Kode pembayaran sudah expired. Buat kode baru.
                  </div>
                )}

                {/* ── FIX: tombol buat kode baru HANYA jika expired atau failed ── */}
                {showBuatKodeBaru && (
                  <button onClick={() => setShowForm(true)} style={{
                    marginTop: 14, width: "100%",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
                    border: "none", borderRadius: 10, padding: "11px",
                    fontSize: 13.5, fontWeight: 700, cursor: "pointer",
                  }}>
                    Buat Kode Pembayaran Baru
                  </button>
                )}
              </>
            )}
          </div>

          {/* Form buat kode */}
          {showForm && (
            <div style={{
              background: "#fff", borderRadius: 16, padding: "22px 24px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #e0e7ff",
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 16 }}>
                Buat Kode Pembayaran
              </div>

              {createError && (
                <div style={{
                  background: "#fee2e2", border: "1px solid #fca5a5",
                  borderRadius: 8, padding: "10px 14px", marginBottom: 14,
                  fontSize: 13, color: "#dc2626", display: "flex", gap: 8,
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} /> {createError}
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  Metode Pembayaran
                </label>
                <select value={formPay.metode_pembayaran}
                  onChange={e => setFormPay(p => ({ ...p, metode_pembayaran: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 14px", fontSize: 13.5,
                    border: "1.5px solid #e2e8f0", borderRadius: 10,
                    outline: "none", background: "#fff",
                  }}>
                  <option value="transfer_bank">Transfer Bank</option>
                  <option value="virtual_account">Virtual Account</option>
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  Bank
                </label>
                <select value={formPay.bank}
                  onChange={e => setFormPay(p => ({ ...p, bank: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 14px", fontSize: 13.5,
                    border: "1.5px solid #e2e8f0", borderRadius: 10,
                    outline: "none", background: "#fff",
                  }}>
                  {REKENING_KAMPUS.map(r => (
                    <option key={r.bank} value={r.bank}>{r.bank}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  No. Rekening Pengirim <span style={{ color: "#94a3b8", fontWeight: 400 }}>(opsional)</span>
                </label>
                <input value={formPay.nomor_rekening}
                  onChange={e => setFormPay(p => ({ ...p, nomor_rekening: e.target.value }))}
                  placeholder="No. rekening Anda"
                  style={{
                    width: "100%", padding: "10px 14px", fontSize: 13.5,
                    border: "1.5px solid #e2e8f0", borderRadius: 10,
                    outline: "none", background: "#fff", boxSizing: "border-box",
                  }} />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleCreatePembayaran} disabled={creatingPay} style={{
                  flex: 1,
                  background: creatingPay ? "#e2e8f0" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color: creatingPay ? "#94a3b8" : "#fff",
                  border: "none", borderRadius: 10, padding: "11px",
                  fontSize: 13.5, fontWeight: 700,
                  cursor: creatingPay ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  {creatingPay
                    ? <><Loader size={15} style={{ animation: "spin 0.8s linear infinite" }} /> Membuat...</>
                    : "Buat Kode"}
                </button>
                <button onClick={() => { setShowForm(false); setCreateError(""); }} style={{
                  background: "#f1f5f9", color: "#64748b", border: "none",
                  borderRadius: 10, padding: "11px 18px",
                  fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                }}>
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Panel Kanan */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Rekening tujuan */}
          <div style={{
            background: "#fff", borderRadius: 16, padding: "22px 24px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 16 }}>
              Rekening Tujuan
            </div>
            {REKENING_KAMPUS.map((r, i) => (
              <div key={r.bank} style={{
                padding: "12px 0",
                borderBottom: i < REKENING_KAMPUS.length - 1 ? "1px solid #f1f5f9" : "none",
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: 4,
                }}>
                  <span style={{
                    fontWeight: 700, fontSize: 13.5, color: "#1e293b",
                    background: "#f1f5f9", padding: "3px 10px", borderRadius: 6,
                  }}>{r.bank}</span>
                  <CopyButton text={r.noRek} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", letterSpacing: "0.04em" }}>
                  {r.noRek}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>a.n. {r.atasNama}</div>
              </div>
            ))}

            {pembayaran?.jumlah && (
              <div style={{
                marginTop: 14, background: "#eff6ff", border: "1px solid #bfdbfe",
                borderRadius: 10, padding: "12px 16px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 13, color: "#2563eb", fontWeight: 600 }}>Total Transfer</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#1e293b" }}>
                    Rp {Number(pembayaran.jumlah).toLocaleString("id")}
                  </span>
                  <CopyButton text={String(pembayaran.jumlah)} />
                </div>
              </div>
            )}
          </div>

          {/* ── FIX: Upload bukti HANYA jika status pending dan belum expired ── */}
          {showUpload && (
            <div style={{
              background: "#fff", borderRadius: 16, padding: "22px 24px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 6 }}>
                Upload Bukti Pembayaran
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
                Upload screenshot atau foto struk transfer Anda.
              </div>

              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 8,
                border: `2px dashed ${buktiFile ? "#6366f1" : "#c7d2fe"}`,
                borderRadius: 12, padding: "24px 16px",
                background: buktiFile ? "#eef2ff" : "#f8fafc",
                cursor: "pointer", marginBottom: 14, transition: "all 0.2s",
              }}>
                <Upload size={24} color={buktiFile ? "#6366f1" : "#94a3b8"} />
                <div style={{
                  fontSize: 13, fontWeight: buktiFile ? 600 : 400,
                  color: buktiFile ? "#6366f1" : "#94a3b8", textAlign: "center",
                }}>
                  {buktiFile ? buktiFile.name : "Klik untuk pilih file bukti pembayaran"}
                </div>
                {!buktiFile && (
                  <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
                    JPG, PNG, PDF · Maks. 5MB
                  </div>
                )}
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }}
                  onChange={e => e.target.files[0] && setBuktiFile(e.target.files[0])} />
              </label>

              {uploading && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ background: "#f1f5f9", borderRadius: 99, height: 6, overflow: "hidden" }}>
                    <div style={{
                      width: `${uploadProgress}%`, height: "100%",
                      background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                      borderRadius: 99, transition: "width 0.2s",
                    }} />
                  </div>
                  <div style={{ fontSize: 12, color: "#6366f1", marginTop: 6, textAlign: "right" }}>
                    {uploadProgress}%
                  </div>
                </div>
              )}

              {uploadError && (
                <div style={{
                  background: "#fee2e2", border: "1px solid #fca5a5",
                  borderRadius: 8, padding: "10px 14px", marginBottom: 12,
                  fontSize: 13, color: "#dc2626",
                  display: "flex", gap: 8, alignItems: "center",
                }}>
                  <AlertCircle size={14} /> {uploadError}
                </div>
              )}

              <button onClick={handleUploadBukti} disabled={!buktiFile || uploading} style={{
                width: "100%",
                background: buktiFile && !uploading
                  ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#e2e8f0",
                color: buktiFile && !uploading ? "#fff" : "#94a3b8",
                border: "none", borderRadius: 10, padding: "12px",
                fontSize: 13.5, fontWeight: 700,
                cursor: buktiFile && !uploading ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s",
              }}>
                {uploading
                  ? <><Loader size={15} style={{ animation: "spin 0.8s linear infinite" }} /> Mengupload...</>
                  : <><Upload size={15} /> Upload Bukti Pembayaran</>}
              </button>
            </div>
          )}

          {/* ── FIX: Status paid menunggu verifikasi ── */}
          {pembayaran?.status_pembayaran === "paid" && !pembayaran.verified_at && (
            <div style={{
              background: "#eff6ff", border: "1px solid #bfdbfe",
              borderRadius: 16, padding: "22px 24px", textAlign: "center",
            }}>
              <Clock size={36} color="#3b82f6" style={{ marginBottom: 12 }} />
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1e40af", marginBottom: 6 }}>
                Menunggu Verifikasi Admin
              </div>
              <div style={{ fontSize: 13, color: "#3b82f6" }}>
                Bukti pembayaran Anda sudah diterima dan sedang ditinjau oleh admin.
              </div>
              {pembayaran.tanggal_bayar && (
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
                  Dibayar: {new Date(pembayaran.tanggal_bayar).toLocaleString("id-ID")}
                </div>
              )}
            </div>
          )}

          {/* ── FIX: Status sudah terverifikasi admin ── */}
          {pembayaran?.status_pembayaran === "paid" && pembayaran.verified_at && (
            <div style={{
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: 16, padding: "22px 24px", textAlign: "center",
            }}>
              <ShieldCheck size={40} color="#10b981" style={{ marginBottom: 12 }} />
              <div style={{ fontWeight: 800, fontSize: 16, color: "#065f46", marginBottom: 6 }}>
                Pembayaran Terverifikasi ✓
              </div>
              <div style={{ fontSize: 13, color: "#059669", marginBottom: 8 }}>
                Pembayaran Anda telah dikonfirmasi oleh admin.
              </div>
              <div style={{
                display: "flex", justifyContent: "center", gap: 20,
                fontSize: 12, color: "#94a3b8",
              }}>
                {pembayaran.tanggal_bayar && (
                  <span>Dibayar: {new Date(pembayaran.tanggal_bayar).toLocaleDateString("id-ID")}</span>
                )}
                <span>Diverifikasi: {new Date(pembayaran.verified_at).toLocaleDateString("id-ID")}</span>
              </div>
            </div>
          )}

          {/* Info */}
          {(!pembayaran || pembayaran.status_pembayaran === "pending") && (
            <div style={{
              background: "#eff6ff", border: "1px solid #bfdbfe",
              borderRadius: 12, padding: "14px 18px", fontSize: 13, color: "#2563eb",
            }}>
              💡 <strong>Penting:</strong> Kode pembayaran berlaku 24 jam.
              Transfer sesuai nominal yang tertera, lalu upload bukti pembayaran.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}