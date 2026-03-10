import api from "./axios";

export const login = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  localStorage.setItem("token", res.data.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.data.user));
  return res.data.data;
};

export const register = async (payload) => {
  // Backend terima: { email, password, nama_lengkap }  ← bukan nama
  const res = await api.post("/auth/register", {
    email:        payload.email,
    password:     payload.password,
    nama_lengkap: payload.nama_lengkap, // frontend pakai "nama", backend pakai "nama_lengkap"
  });
  return res.data.data;
};

// GET /api/auth/me
export const getProfile = async () => {
  const res = await api.get("/auth/me");
  return res.data.data;
};

// PUT /api/auth/update-password — field: oldPassword, newPassword
export const updatePassword = async (oldPassword, newPassword) => {
  const res = await api.put("/auth/update-password", { oldPassword, newPassword });
  return res.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
};