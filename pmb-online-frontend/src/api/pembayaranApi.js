import api from "./axios";

// Get pembayaran berdasarkan pendaftaran_id
export const getMyPembayaran = async (pendaftaranId) => {
  const res = await api.get(`/pembayaran/pendaftaran/${pendaftaranId}`);
  return res.data.data; // bisa null jika belum ada
};

// Buat kode pembayaran baru
export const createPembayaran = async (payload) => {
  // payload: { pendaftaran_id, metode_pembayaran, bank, nomor_rekening }
  const res = await api.post("/pembayaran", payload);
  return res.data.data;
};

// Upload bukti pembayaran
export const uploadBuktiPembayaran = async (pembayaranId, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(`/pembayaran/${pembayaranId}/upload-bukti`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onUploadProgress) {
        onUploadProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
  return res.data.data;
};