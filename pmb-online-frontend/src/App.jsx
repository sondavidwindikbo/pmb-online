import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Pengumuman from './pages/public/Pengumuman';

// Pendaftar pages
import Dashboard from './pages/pendaftar/Dashboard';
import FormPendaftaran from './pages/pendaftar/FormPendaftaran';
import UploadBerkas from './pages/pendaftar/UploadBerkas';
import Pembayaran from './pages/pendaftar/Pembayaran';
import CekKelulusan from './pages/pendaftar/CekKelulusan';
import Profil from './pages/pendaftar/Profil';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPendaftaran, {
  AdminPendaftaranDetail,
} from './pages/admin/AdminPendaftaran';
import AdminPembayaran from './pages/admin/AdminPembayaran';
import AdminPengumuman from './pages/admin/AdminPengumuman';
import AdminProdi from './pages/admin/AdminProdi';
import AdminBerkas from './pages/admin/AdminBerkas';

// Admin pages (nanti dibuat)
// import AdminDashboard       from "./pages/admin/Dashboard";
// import ManagePendaftaran    from "./pages/admin/ManagePendaftaran";
// import ManageProdi          from "./pages/admin/ManageProdi";
// import ManagePengumuman     from "./pages/admin/ManagePengumuman";
// import VerifikasiPendaftaran from "./pages/admin/VerifikasiPendaftaran";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pengumuman" element={<Pengumuman />} />

        {/* ── Pendaftar Routes (harus login, role: pendaftar) ── */}
        <Route
          path="/pendaftar/dashboard"
          element={
            <ProtectedRoute requiredRole="pendaftar">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pendaftar/form-pendaftaran"
          element={
            <ProtectedRoute requiredRole="pendaftar">
              <FormPendaftaran />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pendaftar/upload-berkas"
          element={
            <ProtectedRoute requiredRole="pendaftar">
              <UploadBerkas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pendaftar/pembayaran"
          element={
            <ProtectedRoute requiredRole="pendaftar">
              <Pembayaran />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pendaftar/cek-kelulusan"
          element={
            <ProtectedRoute requiredRole="pendaftar">
              <CekKelulusan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pendaftar/profil"
          element={
            <ProtectedRoute requiredRole="pendaftar">
              <Profil />
            </ProtectedRoute>
          }
        />

        {/* ── Admin Routes (nanti uncomment setelah Admin Dashboard dibuat) ── */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/pendaftaran" element={<AdminPendaftaran />} />
        <Route
          path="/admin/pendaftaran/:id"
          element={<AdminPendaftaranDetail />}
        />
        <Route path="/admin/berkas" element={<AdminBerkas />} />
        <Route path="/admin/pembayaran" element={<AdminPembayaran />} />
        <Route path="/admin/pengumuman" element={<AdminPengumuman />} />
        <Route path="/admin/prodi" element={<AdminProdi />} />
        

        {/* ── 404 ── */}
        <Route
          path="*"
          element={
            <div
              style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                gap: 16,
              }}>
              <div style={{ fontSize: 72, fontWeight: 800, color: '#e2e8f0' }}>
                404
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#64748b' }}>
                Halaman tidak ditemukan
              </div>
              <a
                href="/"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: 10,
                  padding: '11px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                }}>
                Kembali ke Home
              </a>
            </div>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
