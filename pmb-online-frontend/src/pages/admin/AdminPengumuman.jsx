// src/pages/admin/AdminPengumuman.jsx
import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, AlertCircle, Loader, RefreshCw, CheckCircle } from "lucide-react";
import { AdminLayout, Skeleton } from "./AdminDashboard";
import {
  getAllPengumumanAdmin, createPengumuman,
  updatePengumuman, deletePengumuman, togglePengumuman,
} from "../../api/adminApi";

const KATEGORI = ["info", "penting", "jadwal", "kelulusan"];
const PRIORITAS = ["low", "medium", "high"];

const kategoriCfg = {
  info:      { color: "#3b82f6", bg: "#dbeafe" },
  penting:   { color: "#ef4444", bg: "#fee2e2" },
  jadwal:    { color: "#8b5cf6", bg: "#ede9fe" },
  kelulusan: { color: "#10b981", bg: "#d1fae5" },
};

function FormPengumuman({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial || {
    judul: "", isi: "", kategori: "info", prioritas: "medium",
    tanggal_publish: new Date().toISOString().slice(0, 16),
    tanggal_berakhir: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.judul?.trim()) e.judul = "Judul wajib diisi";
    if (!form.isi?.trim())   e.isi   = "Isi wajib diisi";
    if (!form.kategori)      e.kategori = "Pilih kategori";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave(form);
  };

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

  const inputStyle = (err) => ({
    width: "100%", padding: "10px 14px", fontSize: 13.5,
    border: `1.5px solid ${err ? "#fca5a5" : "#e2e8f0"}`, borderRadius: 10,
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Field label="Judul *" error={errors.judul}>
        <input value={form.judul} onChange={e => setForm(p => ({ ...p, judul: e.target.value }))}
          placeholder="Judul pengumuman" style={inputStyle(errors.judul)} />
      </Field>

      <Field label="Isi *" error={errors.isi}>
        <textarea value={form.isi} onChange={e => setForm(p => ({ ...p, isi: e.target.value }))}
          placeholder="Isi pengumuman..."
          rows={5}
          style={{ ...inputStyle(errors.isi), resize: "vertical" }} />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Kategori *" error={errors.kategori}>
          <select value={form.kategori} onChange={e => setForm(p => ({ ...p, kategori: e.target.value }))}
            style={{ ...inputStyle(errors.kategori), cursor: "pointer" }}>
            {KATEGORI.map(k => <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>)}
          </select>
        </Field>

        <Field label="Prioritas">
          <select value={form.prioritas} onChange={e => setForm(p => ({ ...p, prioritas: e.target.value }))}
            style={{ ...inputStyle(), cursor: "pointer" }}>
            {PRIORITAS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Tanggal Publish">
          <input type="datetime-local" value={form.tanggal_publish}
            onChange={e => setForm(p => ({ ...p, tanggal_publish: e.target.value }))}
            style={inputStyle()} />
        </Field>

        <Field label="Tanggal Berakhir (opsional)">
          <input type="date" value={form.tanggal_berakhir}
            onChange={e => setForm(p => ({ ...p, tanggal_berakhir: e.target.value }))}
            style={inputStyle()} />
        </Field>
      </div>

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

export default function AdminPengumuman() {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [filters, setFilters] = useState({ search: "", kategori: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // GET /api/pengumuman?is_active=all&limit=50
      const res = await getAllPengumumanAdmin({ ...filters, limit: 50 });
      setData(res.data || []);
    } catch {
      setError("Gagal memuat pengumuman.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleCreate = async (form) => {
    setFormLoading(true);
    try {
      // POST /api/pengumuman  { judul, isi, kategori, prioritas, tanggal_publish, tanggal_berakhir }
      await createPengumuman(form);
      showSuccess("Pengumuman berhasil dibuat!");
      setShowForm(false);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || "Gagal membuat pengumuman.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (form) => {
    setFormLoading(true);
    try {
      // PUT /api/pengumuman/:id
      await updatePengumuman(editItem.id, form);
      showSuccess("Pengumuman berhasil diupdate!");
      setEditItem(null);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || "Gagal update pengumuman.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      // DELETE /api/pengumuman/:id
      await deletePengumuman(deleteId);
      showSuccess("Pengumuman berhasil dihapus!");
      setDeleteId(null);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || "Gagal menghapus.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      // PATCH /api/pengumuman/:id/toggle
      await togglePengumuman(id);
      fetchData();
    } catch (e) {
      alert("Gagal mengubah status.");
    }
  };

  return (
    <AdminLayout activePage="pengumuman">
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
              Hapus Pengumuman?
            </div>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
              Pengumuman ini akan dihapus permanen.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleDelete} disabled={deleteLoading} style={{
                flex: 1, background: deleteLoading ? "#e2e8f0" : "#ef4444",
                color: deleteLoading ? "#94a3b8" : "#fff", border: "none",
                borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}>
                {deleteLoading ? "Menghapus..." : "Hapus"}
              </button>
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
        <input placeholder="Cari judul..." value={filters.search}
          onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
          style={{
            flex: 1, minWidth: 180, padding: "9px 14px", fontSize: 13,
            border: "1.5px solid #e2e8f0", borderRadius: 10, outline: "none",
          }} />
        <select value={filters.kategori}
          onChange={e => setFilters(p => ({ ...p, kategori: e.target.value }))}
          style={{
            padding: "9px 14px", fontSize: 13, border: "1.5px solid #e2e8f0",
            borderRadius: 10, outline: "none", background: "#fff", cursor: "pointer",
          }}>
          <option value="">Semua Kategori</option>
          {KATEGORI.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
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
          <Plus size={15} /> Buat Pengumuman
        </button>
        {successMsg && (
          <span style={{ fontSize: 13, color: "#15803d", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle size={14} /> {successMsg}
          </span>
        )}
      </div>

      {/* Form slide-in */}
      {(showForm || editItem) && (
        <div style={{
          background: "#fff", borderRadius: 16, padding: "24px 26px",
          boxShadow: "0 4px 24px rgba(99,102,241,0.12)",
          border: "1px solid #c7d2fe", marginBottom: 20,
        }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 20 }}>
            {editItem ? "✏️ Edit Pengumuman" : "➕ Buat Pengumuman Baru"}
          </div>
          <FormPengumuman
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

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...Array(5)].map((_, i) => <Skeleton key={i} h={90} />)}
        </div>
      ) : data.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: 16, padding: "40px",
          textAlign: "center", color: "#94a3b8", fontSize: 14,
          border: "1px solid #f1f5f9",
        }}>
          Belum ada pengumuman
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.map(p => {
            const kCfg = kategoriCfg[p.kategori] || { color: "#94a3b8", bg: "#f1f5f9" };
            return (
              <div key={p.id} style={{
                background: "#fff", borderRadius: 14, padding: "18px 20px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
                display: "flex", gap: 14, alignItems: "flex-start",
                opacity: p.is_active ? 1 : 0.6,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 20,
                      background: kCfg.bg, color: kCfg.color, fontWeight: 700,
                    }}>{(p.kategori || "").toUpperCase()}</span>
                    <span style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 20,
                      background: p.is_active ? "#d1fae5" : "#f1f5f9",
                      color: p.is_active ? "#059669" : "#94a3b8",
                      fontWeight: 600,
                    }}>{p.is_active ? "Aktif" : "Nonaktif"}</span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                      Prioritas: {p.prioritas}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: "#0f172a", marginBottom: 4 }}>
                    {p.judul}
                  </div>
                  <div style={{
                    fontSize: 13, color: "#64748b",
                    overflow: "hidden", textOverflow: "ellipsis",
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    marginBottom: 6,
                  }}>
                    {p.isi}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
                    Publish: {p.tanggal_publish
                      ? new Date(p.tanggal_publish).toLocaleString("id-ID")
                      : "-"}
                    {p.tanggal_berakhir && ` · Berakhir: ${new Date(p.tanggal_berakhir).toLocaleDateString("id-ID")}`}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, flexShrink: 0 }}>
                  <button onClick={() => handleToggle(p.id)} style={{
                    background: p.is_active ? "#fef3c7" : "#f0fdf4",
                    color: p.is_active ? "#d97706" : "#059669",
                    border: "none", borderRadius: 8, padding: "6px 10px",
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    {p.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {p.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button onClick={() => { setEditItem(p); setShowForm(false); }} style={{
                    background: "#eef2ff", color: "#6366f1", border: "none",
                    borderRadius: 8, padding: "6px 10px", fontSize: 11,
                    fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <Edit2 size={13} /> Edit
                  </button>
                  <button onClick={() => setDeleteId(p.id)} style={{
                    background: "#fee2e2", color: "#dc2626", border: "none",
                    borderRadius: 8, padding: "6px 10px", fontSize: 11,
                    fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <Trash2 size={13} /> Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}