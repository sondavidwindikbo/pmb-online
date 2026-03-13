// import api from "./axios";

// // ─── Ambil semua pengumuman (public) ──────────────────────────────────────────
// export const getPengumuman = async (params = {}) => {
//   // params: { kategori, page, limit }
//   const res = await api.get("/pengumuman", { params });
//   return res.data.data;
// };

// // ─── Ambil detail satu pengumuman ─────────────────────────────────────────────
// export const getPengumumanDetail = async (id) => {
//   const res = await api.get(`/pengumuman/${id}`);
//   return res.data.data;
// };

// // ─── Cek status kelulusan milik user yg login ─────────────────────────────────
// export const getStatusKelulusan = async () => {
//   const res = await api.get("/pengumuman/kelulusan/my");
//   return res.data.data;
// };
// src/api/pengumumanApi.js
import api from "./axios";

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — tidak perlu login
// Controller: getAllPengumuman (GET /api/pengumuman)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ambil daftar pengumuman publik.
 * Dipakai di: Home.jsx, halaman Pengumuman publik
 *
 * Params yang didukung backend:
 *   - kategori   : 'info' | 'penting' | 'jadwal' | 'kelulusan'
 *   - is_active  : true | false | 'all'
 *   - page       : number
 *   - limit      : number
 *   - search     : string
 *
 * Response: res.data.data → array pengumuman
 *
 * @param {Object} params
 * @returns {Promise<Array>}
 */
export const getPengumuman = async (params = {}) => {
  const res = await api.get("/pengumuman", { params });
  return res.data.data;          // array langsung
};

/**
 * Ambil pengumuman publik TERBARU untuk ditampilkan di Home.
 * Default: 3 pengumuman aktif terbaru.
 *
 * @param {number} limit  jumlah item (default 3)
 * @returns {Promise<Array>}
 */
export const getPengumumanTerbaru = async (limit = 3) => {
  const res = await api.get("/pengumuman", {
    params: { is_active: true, limit },
  });
  return res.data.data || [];
};

/**
 * Ambil semua pengumuman dengan pagination (untuk halaman daftar).
 *
 * @param {{ kategori?, page?, limit?, search? }} params
 * @returns {Promise<{ data: Array, pagination: Object }>}
 */
export const getPengumumanWithPagination = async (params = {}) => {
  const res = await api.get("/pengumuman", { params });
  return {
    data: res.data.data || [],
    pagination: res.data.pagination || {},
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — detail satu pengumuman
// Controller: getPengumumanById (GET /api/pengumuman/:id)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ambil detail satu pengumuman berdasarkan ID.
 *
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export const getPengumumanDetail = async (id) => {
  const res = await api.get(`/pengumuman/${id}`);
  return res.data.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE (Pendaftar) — status kelulusan
// Controller: getMyKelulusan (GET /api/pengumuman/kelulusan/my)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cek status kelulusan milik user yang sedang login.
 * Dipakai di: CekKelulusan.jsx
 *
 * Response shape:
 *   {
 *     pendaftar   : { id, nama_lengkap, no_pendaftaran },
 *     pendaftaran : [...],  // berisi prodi jika accepted
 *     pengumuman  : Object | null,
 *     status      : 'DITERIMA' | 'BELUM ADA HASIL'
 *   }
 *
 * @returns {Promise<Object>}
 */
export const getStatusKelulusan = async () => {
  const res = await api.get("/pengumuman/kelulusan/my");
  return res.data.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE (Admin) — CRUD pengumuman
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ambil semua pengumuman untuk admin (tanpa filter tanggal publish).
 * Controller: getAllPengumuman dengan is_active='all'
 *
 * @param {Object} params
 * @returns {Promise<{ data: Array, pagination: Object }>}
 */
export const getAllPengumumanAdmin = async (params = {}) => {
  const res = await api.get("/pengumuman", {
    params: { is_active: "all", ...params },
  });
  return {
    data: res.data.data || [],
    pagination: res.data.pagination || {},
  };
};

/**
 * Buat pengumuman baru.
 * Controller: createPengumuman (POST /api/pengumuman)
 *
 * @param {FormData} formData  — gunakan FormData jika ada file attachment
 * @returns {Promise<Object>}
 */
export const createPengumuman = async (formData) => {
  const res = await api.post("/pengumuman", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/**
 * Update pengumuman.
 * Controller: updatePengumuman (PUT /api/pengumuman/:id)
 *
 * @param {number|string} id
 * @param {FormData|Object} data
 * @returns {Promise<Object>}
 */
export const updatePengumuman = async (id, data) => {
  const isFormData = data instanceof FormData;
  const res = await api.put(`/pengumuman/${id}`, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return res.data;
};

/**
 * Hapus pengumuman.
 * Controller: deletePengumuman (DELETE /api/pengumuman/:id)
 *
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export const deletePengumuman = async (id) => {
  const res = await api.delete(`/pengumuman/${id}`);
  return res.data;
};

/**
 * Toggle aktif/nonaktif pengumuman.
 * Controller: togglePengumuman (PATCH /api/pengumuman/:id/toggle)
 *
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export const togglePengumuman = async (id) => {
  const res = await api.patch(`/pengumuman/${id}/toggle`);
  return res.data;
};

/**
 * Ambil statistik pengumuman (untuk AdminDashboard).
 * Controller: getPengumumanStats (GET /api/pengumuman/stats/summary)
 *
 * @returns {Promise<{ summary: Object, recent: Array }>}
 */
export const getPengumumanStats = async () => {
  const res = await api.get("/pengumuman/stats/summary");
  return res.data.data;
};