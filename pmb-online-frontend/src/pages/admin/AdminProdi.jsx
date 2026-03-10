// src/pages/admin/AdminProdi.jsx
import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, AlertCircle, Loader, RefreshCw, CheckCircle } from "lucide-react";
import { AdminLayout, Skeleton } from "./AdminDashboard";
import { getAllProdiAdmin, createProdi, updateProdi, deleteProdi } from "../../api/adminApi";

const JENJANG = ["D3", "D4", "S1", "S2", "S3"];

function FormProdi({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial || {
    kode_prodi: "", nama_prodi: "", fakultas: "",
    jenjang: "S1", kuota: "", biaya_pendaftaran: "", deskripsi: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.kode_prodi?.trim()) e.kode_prodi = "Kode prodi wajib diisi";
    if (!form.nama_prodi?.trim()) e.nama_prodi = "Nama prodi wajib diisi";
    if (!form.fakultas?.trim())   e.fakultas   = "Fakultas wajib diisi";
    if (!form.jenjang)            e.jenjang    = "Pilih jenjang";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave({
      ...form,
      kuota: parseInt(form.kuota) || 0,
      biaya_pendaftaran: parseInt(form.biaya_pendaftaran) || 0,
    });
  };

  const inputStyle = (err) => ({
    width: "100%", padding: "10px 14px", fontSize: 13.5,
    border: `1.5px solid ${err ? "#fca5a5" : "#e2e8f0"}`, borderRadius: 10,
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  });

  const Field = ({ label, error, children }) => (
    <div>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      {children}
      {error && (
        <div style={{ fontSize: 11.5, color: "#ef4444", marginTop: 4, display: "flex", gap: 4, alignItems: "center" }}>
          <AlertCircle size={12} /> {error}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
        <Field label="Kode Prodi *" error={errors.kode_prodi}>
          <input value={form.kode_prodi} onChange={e => setForm(p => ({ ...p, kode_prodi: e.target.value.toUpperCase() }))}
            placeholder="TI, SI, AK..." style={inputStyle(errors.kode_prodi)} disabled={!!initial} />
        </Field>
        <Field label="Nama Prodi *" error={errors.nama_prodi}>
          <input value={form.nama_prodi} onChange={e => setForm(p => ({ ...p, nama_prodi: e.target.value }))}
            placeholder="Teknik Informatika" style={inputStyle(errors.nama_prodi)} />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <Field label="Fakultas *" error={errors.fakultas}>
          <input value={form.fakultas} onChange={e => setForm(p => ({ ...p, fakultas: e.target.value }))}
            placeholder="Fakultas Teknik" style={inputStyle(errors.fakultas)} />
        </Field>
        <Field label="Jenjang *" error={errors.jenjang}>
          <select value={form.jenjang} onChange={e => setForm(p => ({ ...p, jenjang: e.target.value }))}
            style={{ ...inputStyle(errors.jenjang), cursor: "pointer" }}>
            {JENJANG.map(j => <option key={j} value={j}>{j}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Kuota">
          <input type="number" value={form.kuota} onChange={e => setForm(p => ({ ...p, kuota: e.target.value }))}
            placeholder="50" style={inputStyle()} />
        </Field>
        <Field label="Biaya Pendaftaran (Rp)">
          <input type="number" value={form.biaya_pendaftaran}
            onChange={e => setForm(p => ({ ...p, biaya_pendaftaran: e.target.value }))}
            placeholder="250000" style={inputStyle()} />
        </Field>
      </div>

      <Field label="Deskripsi">
        <textarea value={form.deskripsi} onChange={e => setForm(p => ({ ...p, deskripsi: e.target.value }))}
          placeholder="Deskripsi program studi..." rows={3}
          style={{ ...inputStyle(), resize: "vertical" }} />
      </Field>

      <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
        <button onClick={handleSubmit} disabled={loading} style={{
          flex: 1, background: loading ? "#e2e8f0" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
          color: loading ? "#94a3b8" : "#fff", border: "none",
          borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {loading
            ? <><Loader size={15} style={{ animation: "spin 0.8s linear infinite" }} /> Menyimpan...</>
            : "Simpan"}
        </button>
        <button onClick={onCancel} disabled={loading} style={{
          flex: 1, background: "#f1f5f9", color: "#64748b", border: "none",
          borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}>Batal</button>
      </div>
    </div>
  );
}

export default function AdminProdi() {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // GET /api/prodi?is_active=all&limit=50
      const res = await getAllProdiAdmin({ search, limit: 50 });
      setData(res.data || []);
    } catch {
      setError("Gagal memuat data prodi.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleCreate = async (form) => {
    setFormLoading(true);
    try {
      // POST /api/prodi  { kode_prodi, nama_prodi, fakultas, jenjang, kuota, biaya_pendaftaran, deskripsi }
      await createProdi(form);
      showSuccess("Program studi berhasil ditambahkan!");
      setShowForm(false);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || "Gagal menambah prodi.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (form) => {
    setFormLoading(true);
    try {
      // PUT /api/prodi/:id
      await updateProdi(editItem.id, form);
      showSuccess("Program studi berhasil diupdate!");
      setEditItem(null);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || "Gagal update prodi.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      // PUT /api/prodi/:id  { is_active: !current }
      await updateProdi(item.id, { is_active: !item.is_active });
      fetchData();
    } catch {
      alert("Gagal mengubah status.");
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      // DELETE /api/prodi/:id
      await deleteProdi(deleteId);
      showSuccess("Program studi berhasil dihapus!");
      setDeleteId(null);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || "Gagal menghapus. Mungkin masih ada pendaftar.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AdminLayout activePage="prodi">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Delete modal */}
      {deleteId && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
        }}>
          <div style={{
            background: "#fff", borderRadius: 20, padding: "28px 30px",
            width: "100%", maxWidth: 380,
          }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: "#0f172a", marginBottom: 10 }}>
              Hapus Program Studi?
            </div>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
              Program studi ini akan dihapus permanen.
            </p>
            <p style={{ fontSize: 12.5, color: "#f59e0b", marginBottom: 20, fontWeight: 500 }}>
              ⚠️ Tidak bisa dihapus jika sudah ada pendaftar. Gunakan Nonaktifkan.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleDelete} disabled={deleteLoading} style={{
                flex: 1, background: deleteLoading ? "#e2e8f0" : "#ef4444",
                color: deleteLoading ? "#94a3b8" : "#fff", border: "none",
                borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}>{deleteLoading ? "Menghapus..." : "Hapus"}</button>
              <button onClick={() => setDeleteId(null)} style={{
                flex: 1, background: "#f1f5f9", color: "#64748b", border: "none",
                borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{
        background: "#fff", borderRadius: 14, padding: "14px 18px",
        marginBottom: 20, display: "flex", gap: 12, alignItems: "center",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
        flexWrap: "wrap",
      }}>
        <input placeholder="Cari nama / kode prodi..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 200, padding: "9px 14px", fontSize: 13,
            border: "1.5px solid #e2e8f0", borderRadius: 10, outline: "none",
          }} />
        <button onClick={fetchData} style={{
          background: "#f1f5f9", color: "#64748b", border: "none",
          borderRadius: 10, padding: "9px 16px", fontSize: 13,
          fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <RefreshCw size={14} /> Refresh
        </button>
        <button onClick={() => { setShowForm(true); setEditItem(null); }} style={{
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
          border: "none", borderRadius: 10, padding: "9px 18px",
          fontSize: 13, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
        }}>
          <Plus size={15} /> Tambah Prodi
        </button>
        {successMsg && (
          <span style={{ fontSize: 13, color: "#15803d", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle size={14} /> {successMsg}
          </span>
        )}
      </div>

      {/* Form */}
      {(showForm || editItem) && (
        <div style={{
          background: "#fff", borderRadius: 16, padding: "24px 26px",
          boxShadow: "0 4px 24px rgba(99,102,241,0.12)",
          border: "1px solid #c7d2fe", marginBottom: 20,
        }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 20 }}>
            {editItem ? "✏️ Edit Program Studi" : "➕ Tambah Program Studi"}
          </div>
          <FormProdi
            initial={editItem}
            onSave={editItem ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditItem(null); }}
            loading={formLoading}
          />
        </div>
      )}

      {error && (
        <div style={{
          background: "#fee2e2", border: "1px solid #fca5a5",
          borderRadius: 10, padding: "12px 16px", marginBottom: 16,
          fontSize: 13, color: "#dc2626",
        }}>{error}</div>
      )}

      {/* Table */}
      <div style={{
        background: "#fff", borderRadius: 16,
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
        overflow: "hidden",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "0.6fr 2fr 1.5fr 0.6fr 1fr 1fr 0.8fr 1fr",
          padding: "13px 20px", background: "#f8fafc",
          borderBottom: "1px solid #f1f5f9",
          fontSize: 12, fontWeight: 700, color: "#94a3b8",
          textTransform: "uppercase", letterSpacing: "0.04em",
        }}>
          <span>Kode</span>
          <span>Nama Prodi</span>
          <span>Fakultas</span>
          <span>Jenjang</span>
          <span>Kuota</span>
          <span>Biaya</span>
          <span>Status</span>
          <span>Aksi</span>
        </div>

        {loading ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(6)].map((_, i) => <Skeleton key={i} h={50} />)}
          </div>
        ) : data.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 14 }}>
            Belum ada program studi
          </div>
        ) : data.map((p, i) => (
          <div key={p.id} style={{
            display: "grid",
            gridTemplateColumns: "0.6fr 2fr 1.5fr 0.6fr 1fr 1fr 0.8fr 1fr",
            padding: "13px 20px", alignItems: "center",
            borderBottom: i < data.length - 1 ? "1px solid #f8fafc" : "none",
            fontSize: 13, background: i % 2 === 0 ? "#fff" : "#fafafa",
            opacity: p.is_active ? 1 : 0.65,
          }}>
            <span style={{
              fontFamily: "monospace", fontWeight: 700,
              color: "#6366f1", fontSize: 12,
            }}>{p.kode_prodi}</span>
            <div>
              <div style={{ fontWeight: 600, color: "#1e293b" }}>{p.nama_prodi}</div>
              {p.deskripsi && (
                <div style={{
                  fontSize: 11, color: "#94a3b8", marginTop: 1,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  maxWidth: 200,
                }}>{p.deskripsi}</div>
              )}
            </div>
            <span style={{ fontSize: 12, color: "#64748b" }}>{p.fakultas}</span>
            <span style={{
              fontSize: 12, fontWeight: 700, color: "#8b5cf6",
              background: "#ede9fe", padding: "2px 8px", borderRadius: 20, width: "fit-content",
            }}>{p.jenjang}</span>
            <span style={{ fontWeight: 600, color: "#1e293b" }}>
              {p.kuota || 0} kursi
            </span>
            <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 12 }}>
              Rp {Number(p.biaya_pendaftaran || 0).toLocaleString("id")}
            </span>
            <span style={{
              fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
              background: p.is_active ? "#d1fae5" : "#f1f5f9",
              color: p.is_active ? "#059669" : "#94a3b8",
              width: "fit-content",
            }}>{p.is_active ? "Aktif" : "Nonaktif"}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => handleToggleActive(p)} style={{
                background: p.is_active ? "#fef3c7" : "#f0fdf4",
                color: p.is_active ? "#d97706" : "#059669",
                border: "none", borderRadius: 7, padding: "5px 8px",
                fontSize: 11, fontWeight: 700, cursor: "pointer",
              }}>
                {p.is_active ? "Off" : "On"}
              </button>
              <button onClick={() => { setEditItem(p); setShowForm(false); }} style={{
                background: "#eef2ff", color: "#6366f1", border: "none",
                borderRadius: 7, padding: "5px 8px",
                fontSize: 11, fontWeight: 700, cursor: "pointer",
              }}>
                <Edit2 size={12} />
              </button>
              <button onClick={() => setDeleteId(p.id)} style={{
                background: "#fee2e2", color: "#dc2626", border: "none",
                borderRadius: 7, padding: "5px 8px",
                fontSize: 11, fontWeight: 700, cursor: "pointer",
              }}>
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}