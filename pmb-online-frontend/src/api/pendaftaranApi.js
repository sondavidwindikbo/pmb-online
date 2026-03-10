import api from "./axios";

export const createPendaftaran = async (payload) => {
  const res = await api.post("/pendaftaran", payload);
  return res.data.data;
};

export const getMyPendaftaran = async () => {
  const res = await api.get("/pendaftaran/my");
  // Backend return array, kita ambil yang pertama
  const data = res.data.data;
  return Array.isArray(data) ? data[0] || null : data;
};

export const updatePendaftaran = async (id, payload) => {
  const res = await api.put(`/pendaftaran/${id}`, payload);
  return res.data.data;
};

export const submitPendaftaran = async (id) => {
  const res = await api.post(`/pendaftaran/${id}/submit`);
  return res.data;
};

export const getProdiList = async () => {
  const res = await api.get("/prodi");
  return res.data.data;
};