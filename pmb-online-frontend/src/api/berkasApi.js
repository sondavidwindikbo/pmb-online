import api from "./axios";

// Get berkas berdasarkan pendaftaran_id
export const getMyBerkas = async (pendaftaranId) => {
  const res = await api.get(`/berkas/pendaftaran/${pendaftaranId}`);
  return res.data.data;
};

// Upload berkas - butuh pendaftaran_id + jenis_berkas + file
export const uploadBerkas = async (pendaftaranId, jenisBerkas, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("pendaftaran_id", pendaftaranId);
  formData.append("jenis_berkas", jenisBerkas);

  const res = await api.post("/berkas", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onUploadProgress) {
        onUploadProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
  return res.data.data;
};

// Hapus berkas
export const deleteBerkas = async (id) => {
  const res = await api.delete(`/berkas/${id}`);
  return res.data;
};

// Download berkas
export const downloadBerkas = (id) => {
  window.open(`${import.meta.env.VITE_API_URL}/berkas/${id}/download`, "_blank");
};