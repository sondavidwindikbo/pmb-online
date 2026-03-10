// src/api/adminApi.js
// Semua API call untuk admin — disesuaikan 100% dengan backend

import api from "./axios";

// ── STATISTIK DASHBOARD ──────────────────────────────────────────────────────
// Tidak ada endpoint khusus stats di backend, kita query kombinasi

export const getAdminStats = async () => {
  const [pendaftaran, pembayaran, berkas, prodi] = await Promise.all([
    api.get("/pendaftaran?limit=1"),
    api.get("/pembayaran?limit=1"),
    api.get("/prodi/stats/summary"),
    api.get("/prodi?is_active=all&limit=100"),
  ]);
  return {
    pendaftaran: pendaftaran.data.pagination,
    pembayaran:  pembayaran.data.pagination,
    prodiStats:  prodi.data.data,
    prodiList:   pendaftaran.data.data,
  };
};

// ── PENDAFTARAN ───────────────────────────────────────────────────────────────
// GET /api/pendaftaran?status=&prodi_id=&jalur_masuk=&page=&limit=&search=
export const getAllPendaftaran = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.status)     query.set("status",     params.status);
  if (params.prodi_id)   query.set("prodi_id",   params.prodi_id);
  if (params.jalur_masuk)query.set("jalur_masuk",params.jalur_masuk);
  if (params.search)     query.set("search",     params.search);
  query.set("page",  params.page  || 1);
  query.set("limit", params.limit || 20);

  const res = await api.get(`/pendaftaran?${query}`);
  return res.data; // { success, data, pagination }
};

// GET /api/pendaftaran/:id  (detail lengkap + berkas + pembayaran)
export const getPendaftaranDetail = async (id) => {
  const res = await api.get(`/pendaftaran/${id}`);
  return res.data.data;
};

// PUT /api/pendaftaran/:id/verify  body: { status: 'verified'|'rejected', catatan }
export const verifyPendaftaran = async (id, status, catatan = "") => {
  const res = await api.put(`/pendaftaran/${id}/verify`, { status, catatan });
  return res.data;
};

// ── BERKAS ────────────────────────────────────────────────────────────────────
// GET /api/berkas/pendaftaran/:pendaftaran_id
export const getBerkasByPendaftaran = async (pendaftaranId) => {
  const res = await api.get(`/berkas/pendaftaran/${pendaftaranId}`);
  return res.data.data;
};

// PUT /api/berkas/:id/verify  body: { status: 'approved'|'rejected', catatan }
export const verifyBerkas = async (id, status, catatan = "") => {
  const res = await api.put(`/berkas/${id}/verify`, { status, catatan });
  return res.data;
};

// Download berkas
export const downloadBerkas = (id) => {
  window.open(
    `${import.meta.env.VITE_API_URL}/berkas/${id}/download`,
    "_blank"
  );
};

// ── PEMBAYARAN ────────────────────────────────────────────────────────────────
// GET /api/pembayaran?status=&page=&limit=
export const getAllPembayaran = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  query.set("page",  params.page  || 1);
  query.set("limit", params.limit || 20);

  const res = await api.get(`/pembayaran?${query}`);
  return res.data; // { success, data, pagination }
};

// GET /api/pembayaran/pendaftaran/:pendaftaran_id
export const getPembayaranByPendaftaran = async (pendaftaranId) => {
  const res = await api.get(`/pembayaran/pendaftaran/${pendaftaranId}`);
  return res.data.data;
};

// PUT /api/pembayaran/:id/verify  body: { status: 'paid'|'failed', catatan }
export const verifyPembayaran = async (id, status, catatan = "") => {
  const res = await api.put(`/pembayaran/${id}/verify`, { status, catatan });
  return res.data;
};

// ── PENGUMUMAN ────────────────────────────────────────────────────────────────
// GET /api/pengumuman?is_active=all&page=&limit=&search=&kategori=
export const getAllPengumumanAdmin = async (params = {}) => {
  const query = new URLSearchParams();
  query.set("is_active", "all");
  if (params.kategori) query.set("kategori", params.kategori);
  if (params.search)   query.set("search",   params.search);
  query.set("page",  params.page  || 1);
  query.set("limit", params.limit || 20);

  const res = await api.get(`/pengumuman?${query}`);
  return res.data; // { success, data, pagination }
};

// POST /api/pengumuman  body: { judul, isi, kategori, prioritas, tanggal_publish, tanggal_berakhir }
export const createPengumuman = async (payload) => {
  const res = await api.post("/pengumuman", payload);
  return res.data.data;
};

// PUT /api/pengumuman/:id
export const updatePengumuman = async (id, payload) => {
  const res = await api.put(`/pengumuman/${id}`, payload);
  return res.data.data;
};

// DELETE /api/pengumuman/:id
export const deletePengumuman = async (id) => {
  const res = await api.delete(`/pengumuman/${id}`);
  return res.data;
};

// PATCH /api/pengumuman/:id/toggle
export const togglePengumuman = async (id) => {
  const res = await api.patch(`/pengumuman/${id}/toggle`);
  return res.data;
};

// ── PRODI ─────────────────────────────────────────────────────────────────────
// GET /api/prodi?is_active=all&page=&limit=&search=
export const getAllProdiAdmin = async (params = {}) => {
  const query = new URLSearchParams();
  query.set("is_active", "all");
  if (params.search) query.set("search", params.search);
  query.set("page",  params.page  || 1);
  query.set("limit", params.limit || 50);

  const res = await api.get(`/prodi?${query}`);
  return res.data;
};

// GET /api/prodi/stats/summary
export const getProdiStats = async () => {
  const res = await api.get("/prodi/stats/summary");
  return res.data.data;
};

// POST /api/prodi  body: { kode_prodi, nama_prodi, fakultas, jenjang, kuota, biaya_pendaftaran, deskripsi }
export const createProdi = async (payload) => {
  const res = await api.post("/prodi", payload);
  return res.data.data;
};

// PUT /api/prodi/:id
export const updateProdi = async (id, payload) => {
  const res = await api.put(`/prodi/${id}`, payload);
  return res.data.data;
};

// DELETE /api/prodi/:id
export const deleteProdi = async (id) => {
  const res = await api.delete(`/prodi/${id}`);
  return res.data;
};