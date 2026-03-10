import api from "./axios";

// ─── Ambil semua pengumuman (public) ──────────────────────────────────────────
export const getPengumuman = async (params = {}) => {
  // params: { kategori, page, limit }
  const res = await api.get("/pengumuman", { params });
  return res.data.data;
};

// ─── Ambil detail satu pengumuman ─────────────────────────────────────────────
export const getPengumumanDetail = async (id) => {
  const res = await api.get(`/pengumuman/${id}`);
  return res.data.data;
};

// ─── Cek status kelulusan milik user yg login ─────────────────────────────────
export const getStatusKelulusan = async () => {
  const res = await api.get("/pengumuman/kelulusan/my");
  return res.data.data;
};