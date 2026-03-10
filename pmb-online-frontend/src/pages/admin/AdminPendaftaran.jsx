// src/pages/admin/AdminPendaftaran.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  Calendar,
  Hash,
} from 'lucide-react';
import { AdminLayout, Skeleton } from './AdminDashboard';
import {
  getAllPendaftaran,
  getPendaftaranDetail,
  verifyPendaftaran,
  verifyBerkas,
  getBerkasByPendaftaran,
  getPembayaranByPendaftaran,
  downloadBerkas,
} from '../../api/adminApi';

// ── Status configs ─────────────────────────────────────────────────────────────
const STATUS_PENDAFTARAN = [
  { value: '', label: 'Semua Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Disubmit' },
  { value: 'verified', label: 'Terverifikasi' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'accepted', label: 'Diterima' },
];

const statusBadge = (status) => {
  const map = {
    draft: { label: 'Draft', color: '#94a3b8', bg: '#f1f5f9' },
    submitted: { label: 'Disubmit', color: '#f59e0b', bg: '#fef3c7' },
    verified: { label: 'Terverifikasi', color: '#10b981', bg: '#d1fae5' },
    rejected: { label: 'Ditolak', color: '#ef4444', bg: '#fee2e2' },
    accepted: { label: 'Diterima', color: '#6366f1', bg: '#eef2ff' },
  };
  const cfg = map[status] || { label: status, color: '#94a3b8', bg: '#f1f5f9' };
  return (
    <span
      style={{
        fontSize: 11,
        padding: '3px 10px',
        borderRadius: 20,
        background: cfg.bg,
        color: cfg.color,
        fontWeight: 700,
      }}>
      {cfg.label}
    </span>
  );
};

const berkasStatusBadge = (status) => {
  const map = {
    approved: { label: 'Disetujui', color: '#10b981', bg: '#d1fae5' },
    pending: { label: 'Menunggu', color: '#f59e0b', bg: '#fef3c7' },
    rejected: { label: 'Ditolak', color: '#ef4444', bg: '#fee2e2' },
  };
  const cfg = map[status] || {
    label: 'Belum',
    color: '#94a3b8',
    bg: '#f1f5f9',
  };
  return (
    <span
      style={{
        fontSize: 11,
        padding: '2px 8px',
        borderRadius: 20,
        background: cfg.bg,
        color: cfg.color,
        fontWeight: 600,
      }}>
      {cfg.label}
    </span>
  );
};

// ── Modal Verifikasi ───────────────────────────────────────────────────────────
function ModalVerifikasi({
  title,
  onConfirm,
  onCancel,
  loading,
  actionLabel,
  actionColor,
  children,
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: 20,
      }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: '28px 30px',
          width: '100%',
          maxWidth: 460,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: 17,
            color: '#0f172a',
            marginBottom: 12,
          }}>
          {title}
        </div>
        {children}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              background: loading ? '#e2e8f0' : actionColor,
              color: loading ? '#94a3b8' : '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}>
            {loading ? (
              <>
                <Loader
                  size={15}
                  style={{ animation: 'spin 0.8s linear infinite' }}
                />{' '}
                Memproses...
              </>
            ) : (
              actionLabel
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1,
              background: '#f1f5f9',
              color: '#64748b',
              border: 'none',
              borderRadius: 10,
              padding: '12px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Pendaftaran ────────────────────────────────────────────────────────
export function AdminPendaftaranDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [berkas, setBerkas] = useState([]);
  const [pembayaran, setPembayaran] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [modal, setModal] = useState(null);
  // { type: 'verif-pendaftaran'|'tolak-pendaftaran'|'approve-berkas'|'tolak-berkas'
  //   id, actionLoading, catatan }
  const [actionLoading, setActionLoading] = useState(false);
  const [catatan, setCatatan] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // GET /api/pendaftaran/:id — sudah include berkas & pembayaran
      const detail = await getPendaftaranDetail(id);
      setData(detail);
      setBerkas(detail.berkas || []);
      setPembayaran(detail.pembayaran || null);
    } catch {
      setError('Gagal memuat detail pendaftaran.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleVerifPendaftaran = async (status) => {
    setActionLoading(true);
    try {
      // PUT /api/pendaftaran/:id/verify  { status: 'verified'|'rejected'|'accepted', catatan }
      await verifyPendaftaran(id, status, catatan);
      const msgMap = {
        verified: '✅ Pendaftaran berhasil diverifikasi',
        accepted: '🎉 Pendaftar dinyatakan DITERIMA',
        rejected: '❌ Pendaftaran ditolak',
      };
      setSuccessMsg(msgMap[status] || 'Berhasil diproses');
      setModal(null);
      setCatatan('');
      fetchDetail();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal memproses.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifBerkas = async (berkasId, status) => {
    setActionLoading(true);
    try {
      // PUT /api/berkas/:id/verify  { status: 'approved'|'rejected', catatan }
      await verifyBerkas(berkasId, status, catatan);
      setSuccessMsg(
        `Berkas berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`
      );
      setModal(null);
      setCatatan('');
      fetchDetail();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal memproses.');
    } finally {
      setActionLoading(false);
    }
  };

  const InfoRow = ({ label, value }) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '9px 0',
        borderBottom: '1px solid #f8fafc',
        fontSize: 13,
      }}>
      <span style={{ color: '#94a3b8', fontWeight: 500 }}>{label}</span>
      <span
        style={{
          fontWeight: 600,
          color: '#1e293b',
          textAlign: 'right',
          maxWidth: '60%',
        }}>
        {value || '-'}
      </span>
    </div>
  );

  if (loading)
    return (
      <AdminLayout activePage="pendaftaran">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} h={80} />
          ))}
        </div>
      </AdminLayout>
    );

  if (error || !data)
    return (
      <AdminLayout activePage="pendaftaran">
        <div style={{ textAlign: 'center', padding: 40 }}>
          <AlertCircle size={36} color="#ef4444" style={{ marginBottom: 12 }} />
          <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
            {error || 'Data tidak ditemukan'}
          </div>
          <button
            onClick={() => navigate('/admin/pendaftaran')}
            style={{
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '9px 20px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
            ← Kembali
          </button>
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout activePage="pendaftaran">
      {/* Modals */}
      {modal?.type === 'verif-pendaftaran' && (
        <ModalVerifikasi
          title="✅ Verifikasi Pendaftaran"
          onConfirm={() => handleVerifPendaftaran('verified')}
          onCancel={() => {
            setModal(null);
            setCatatan('');
          }}
          loading={actionLoading}
          actionLabel="Verifikasi"
          actionColor="#10b981">
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
            Setujui pendaftaran <b>{data.nama_lengkap}</b>?
          </p>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Catatan (opsional)"
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: 13,
              border: '1.5px solid #e2e8f0',
              borderRadius: 10,
              outline: 'none',
              resize: 'vertical',
              minHeight: 80,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </ModalVerifikasi>
      )}

      {modal?.type === 'tolak-pendaftaran' && (
        <ModalVerifikasi
          title="❌ Tolak Pendaftaran"
          onConfirm={() => handleVerifPendaftaran('rejected')}
          onCancel={() => {
            setModal(null);
            setCatatan('');
          }}
          loading={actionLoading}
          actionLabel="Tolak"
          actionColor="#ef4444">
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
            Tolak pendaftaran <b>{data.nama_lengkap}</b>?
          </p>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Alasan penolakan (wajib)"
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: 13,
              border: '1.5px solid #fca5a5',
              borderRadius: 10,
              outline: 'none',
              resize: 'vertical',
              minHeight: 80,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </ModalVerifikasi>
      )}

      {modal?.type === 'accepted-pendaftaran' && (
        <ModalVerifikasi
          title="🎉 Nyatakan Pendaftar DITERIMA"
          onConfirm={() => handleVerifPendaftaran('accepted')}
          onCancel={() => {
            setModal(null);
            setCatatan('');
          }}
          loading={actionLoading}
          actionLabel="✓ Nyatakan Diterima"
          actionColor="linear-gradient(135deg,#6366f1,#8b5cf6)">
          <div
            style={{
              background: '#eef2ff',
              border: '1px solid #c7d2fe',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 14,
            }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: '#3730a3',
                marginBottom: 4,
              }}>
              🎓 Konfirmasi Penerimaan
            </div>
            <div style={{ fontSize: 13, color: '#4338ca' }}>
              Anda akan menyatakan <b>{data?.nama_lengkap}</b> sebagai pendaftar
              yang <b>DITERIMA</b> di <b>{data?.nama_prodi}</b>.
            </div>
          </div>
          <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 12 }}>
            ⚠️ Tindakan ini akan mengubah status menjadi <b>"Diterima"</b> dan
            pendaftar dapat melihat hasilnya di halaman Kelulusan.
          </div>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Catatan untuk pendaftar (opsional, misal: selamat bergabung...)"
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: 13,
              border: '1.5px solid #c7d2fe',
              borderRadius: 10,
              outline: 'none',
              resize: 'vertical',
              minHeight: 70,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              background: '#fafbff',
            }}
          />
        </ModalVerifikasi>
      )}
      {modal?.type === 'approve-berkas' && (
        <ModalVerifikasi
          title="✅ Setujui Berkas"
          onConfirm={() => handleVerifBerkas(modal.berkasId, 'approved')}
          onCancel={() => {
            setModal(null);
            setCatatan('');
          }}
          loading={actionLoading}
          actionLabel="Setujui"
          actionColor="#10b981">
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
            Setujui berkas <b>{modal.jenisBerkas}</b>?
          </p>
        </ModalVerifikasi>
      )}

      {modal?.type === 'tolak-berkas' && (
        <ModalVerifikasi
          title="❌ Tolak Berkas"
          onConfirm={() => handleVerifBerkas(modal.berkasId, 'rejected')}
          onCancel={() => {
            setModal(null);
            setCatatan('');
          }}
          loading={actionLoading}
          actionLabel="Tolak"
          actionColor="#ef4444">
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
            Tolak berkas <b>{modal.jenisBerkas}</b>?
          </p>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Alasan penolakan"
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: 13,
              border: '1.5px solid #fca5a5',
              borderRadius: 10,
              outline: 'none',
              resize: 'vertical',
              minHeight: 80,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </ModalVerifikasi>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 24,
        }}>
        <button
          onClick={() => navigate('/admin/pendaftaran')}
          style={{
            background: '#f1f5f9',
            border: 'none',
            borderRadius: 10,
            padding: '9px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: '#64748b',
          }}>
          <ChevronLeft size={16} /> Kembali
        </button>
        <div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: '#0f172a',
              margin: 0,
            }}>
            Detail Pendaftaran
          </h2>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
            {data.no_pendaftaran || `#${data.id}`}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {statusBadge(data.status_pendaftaran)}
        </div>
      </div>

      {/* Success alert */}
      {successMsg && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            color: '#15803d',
            fontWeight: 500,
          }}>
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Data Pribadi */}
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: '22px 24px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
            border: '1px solid #f1f5f9',
          }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: '#0f172a',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
            <User size={16} color="#6366f1" /> Data Pribadi
          </div>
          <InfoRow label="Nama Lengkap" value={data.nama_lengkap} />
          <InfoRow label="Email" value={data.email} />
          <InfoRow label="No. HP" value={data.no_hp} />
          <InfoRow label="NIK" value={data.nik} />
          <InfoRow label="Tempat Lahir" value={data.tempat_lahir} />
          <InfoRow
            label="Tanggal Lahir"
            value={
              data.tanggal_lahir
                ? new Date(data.tanggal_lahir).toLocaleDateString('id-ID')
                : '-'
            }
          />
          <InfoRow label="Jenis Kelamin" value={data.jenis_kelamin} />
          <InfoRow label="Agama" value={data.agama} />
          <InfoRow label="Alamat" value={data.alamat} />
          <InfoRow label="Kab/Kota" value={data.kabupaten} />
          <InfoRow label="Provinsi" value={data.provinsi} />
        </div>

        {/* Data Pendaftaran & Orang Tua */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: '22px 24px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              border: '1px solid #f1f5f9',
            }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: '#0f172a',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
              <FileText size={16} color="#6366f1" /> Data Pendaftaran
            </div>
            <InfoRow label="No. Pendaftaran" value={data.no_pendaftaran} />
            <InfoRow label="Program Studi" value={data.nama_prodi} />
            <InfoRow label="Fakultas" value={data.fakultas} />
            <InfoRow label="Jalur Masuk" value={data.jalur_masuk} />
            <InfoRow label="Tahun Akademik" value={data.tahun_akademik} />
            <InfoRow label="Asal Sekolah" value={data.asal_sekolah} />
            <InfoRow label="Jurusan Sekolah" value={data.jurusan_sekolah} />
            <InfoRow label="Tahun Lulus" value={data.tahun_lulus} />
            <InfoRow label="Nilai Rata-rata" value={data.nilai_rata_rata} />
            {data.catatan_verifikasi && (
              <div
                style={{
                  marginTop: 10,
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 12.5,
                  color: '#9a3412',
                }}>
                <b>Catatan Admin:</b> {data.catatan_verifikasi}
              </div>
            )}
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: '22px 24px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              border: '1px solid #f1f5f9',
            }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: '#0f172a',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
              <User size={16} color="#6366f1" /> Data Orang Tua
            </div>
            <InfoRow label="Nama Orang Tua" value={data.nama_ortu} />
            <InfoRow label="Pekerjaan" value={data.pekerjaan_ortu} />
            <InfoRow label="Penghasilan" value={data.penghasilan_ortu} />
            <InfoRow label="No. HP" value={data.no_hp_ortu} />
          </div>
        </div>
      </div>

      {/* Berkas */}
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: '22px 24px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          border: '1px solid #f1f5f9',
          marginTop: 20,
        }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: '#0f172a',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
          <FileText size={16} color="#6366f1" /> Berkas ({berkas.length})
        </div>
        {berkas.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '16px 0',
              color: '#94a3b8',
              fontSize: 13,
            }}>
            Belum ada berkas diupload
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
              gap: 12,
            }}>
            {berkas.map((b) => (
              <div
                key={b.id}
                style={{
                  border: '1px solid #f1f5f9',
                  borderRadius: 12,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: '#1e293b',
                      }}>
                      {b.jenis_berkas}
                    </div>
                    <div
                      style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      {b.nama_file} ·{' '}
                      {b.file_size
                        ? `${(b.file_size / 1024).toFixed(0)} KB`
                        : ''}
                    </div>
                  </div>
                  {berkasStatusBadge(b.status_verifikasi)}
                </div>
                {b.catatan && (
                  <div
                    style={{
                      background: '#fff7ed',
                      border: '1px solid #fed7aa',
                      borderRadius: 7,
                      padding: '7px 10px',
                      fontSize: 12,
                      color: '#9a3412',
                    }}>
                    {b.catatan}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => downloadBerkas(b.id)}
                    style={{
                      flex: 1,
                      background: '#f1f5f9',
                      color: '#64748b',
                      border: 'none',
                      borderRadius: 8,
                      padding: '7px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}>
                    ⬇ Download
                  </button>
                  {b.status_verifikasi !== 'approved' && (
                    <button
                      onClick={() =>
                        setModal({
                          type: 'approve-berkas',
                          berkasId: b.id,
                          jenisBerkas: b.jenis_berkas,
                        })
                      }
                      style={{
                        flex: 1,
                        background: '#d1fae5',
                        color: '#059669',
                        border: 'none',
                        borderRadius: 8,
                        padding: '7px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}>
                      ✓ Setujui
                    </button>
                  )}
                  {b.status_verifikasi !== 'rejected' && (
                    <button
                      onClick={() =>
                        setModal({
                          type: 'tolak-berkas',
                          berkasId: b.id,
                          jenisBerkas: b.jenis_berkas,
                        })
                      }
                      style={{
                        flex: 1,
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: 8,
                        padding: '7px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}>
                      ✗ Tolak
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aksi Verifikasi Pendaftaran */}
      {(data.status_pendaftaran === 'submitted' ||
        data.status_pendaftaran === 'verified') && (
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: '22px 24px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
            border: '1px solid #e0e7ff',
            marginTop: 20,
          }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: '#0f172a',
              marginBottom: 6,
            }}>
            🔍 Aksi Verifikasi Pendaftaran
          </div>

          {/* Status submitted → verifikasi awal */}
          {data.status_pendaftaran === 'submitted' && (
            <>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                Pendaftaran sudah disubmit. Verifikasi berkas & pembayaran
                terlebih dahulu, lalu nyatakan diterima atau tolak.
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setModal({ type: 'verif-pendaftaran' })}
                  style={{
                    background: 'linear-gradient(135deg,#10b981,#059669)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 24px',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                  }}>
                  <CheckCircle size={16} /> Verifikasi Berkas & Bayar
                </button>
                <button
                  onClick={() => setModal({ type: 'tolak-pendaftaran' })}
                  style={{
                    background: '#fff',
                    color: '#ef4444',
                    border: '2px solid #fca5a5',
                    borderRadius: 10,
                    padding: '12px 24px',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                  <XCircle size={16} /> Tolak
                </button>
              </div>
            </>
          )}

          {/* Status verified → siap dinilai kelulusan */}
          {data.status_pendaftaran === 'verified' && (
            <>
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 10,
                  padding: '10px 14px',
                  marginBottom: 16,
                  fontSize: 13,
                  color: '#15803d',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                <CheckCircle size={15} />
                Berkas dan pembayaran sudah terverifikasi. Tentukan hasil
                kelulusan pendaftar ini.
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {/* Tombol DITERIMA */}
                <button
                  onClick={() => setModal({ type: 'accepted-pendaftaran' })}
                  style={{
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '13px 28px',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                  }}>
                  🎉 Nyatakan DITERIMA
                </button>
                {/* Tombol TOLAK */}
                <button
                  onClick={() => setModal({ type: 'tolak-pendaftaran' })}
                  style={{
                    background: '#fff',
                    color: '#ef4444',
                    border: '2px solid #fca5a5',
                    borderRadius: 10,
                    padding: '13px 24px',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                  <XCircle size={16} /> Tidak Diterima
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Badge sudah diterima */}
      {data.status_pendaftaran === 'accepted' && (
        <div
          style={{
            background: 'linear-gradient(135deg,#eef2ff,#f5f3ff)',
            border: '1px solid #c7d2fe',
            borderRadius: 16,
            padding: '20px 24px',
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
            <CheckCircle size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#3730a3' }}>
              🎉 Pendaftar Dinyatakan DITERIMA
            </div>
            <div style={{ fontSize: 13, color: '#6366f1', marginTop: 3 }}>
              {data.nama_lengkap} telah diterima di {data.nama_prodi}. Pendaftar
              dapat melihat hasilnya di halaman Kelulusan.
            </div>
          </div>
        </div>
      )}

      {/* Badge ditolak */}
      {data.status_pendaftaran === 'rejected' && (
        <div
          style={{
            background: '#fff5f5',
            border: '1px solid #fca5a5',
            borderRadius: 16,
            padding: '20px 24px',
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
            <XCircle size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#dc2626' }}>
              Pendaftaran Ditolak
            </div>
            <div style={{ fontSize: 13, color: '#ef4444', marginTop: 3 }}>
              {data.catatan && `Catatan: ${data.catatan}`}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// ── List Pendaftaran ──────────────────────────────────────────────────────────
export default function AdminPendaftaran() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // GET /api/pendaftaran?status=&search=&page=&limit=20
      const res = await getAllPendaftaran({ ...filters, limit: 20 });
      setData(res.data || []);
      setPagination(res.pagination);
    } catch {
      setError('Gagal memuat data pendaftaran.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setFilter = (key, val) =>
    setFilters((prev) => ({ ...prev, [key]: val, page: 1 }));

  return (
    <AdminLayout activePage="pendaftaran">
      {/* Filter bar */}
      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          padding: '16px 20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          border: '1px solid #f1f5f9',
          marginBottom: 20,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search
            size={15}
            color="#94a3b8"
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            placeholder="Cari nama, no. pendaftaran, NIK..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 34px',
              fontSize: 13,
              border: '1.5px solid #e2e8f0',
              borderRadius: 10,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Status filter */}
        <select
          value={filters.status}
          onChange={(e) => setFilter('status', e.target.value)}
          style={{
            padding: '9px 14px',
            fontSize: 13,
            border: '1.5px solid #e2e8f0',
            borderRadius: 10,
            outline: 'none',
            background: '#fff',
            cursor: 'pointer',
          }}>
          {STATUS_PENDAFTARAN.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          onClick={fetchData}
          style={{
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '9px 18px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 16,
            fontSize: 13,
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Tabel */}
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          border: '1px solid #f1f5f9',
          overflow: 'hidden',
        }}>
        {/* Header tabel */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1fr 1fr 0.8fr 0.8fr',
            padding: '13px 20px',
            background: '#f8fafc',
            borderBottom: '1px solid #f1f5f9',
            fontSize: 12,
            fontWeight: 700,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
          <span>Pendaftar</span>
          <span>Program Studi</span>
          <span>Jalur</span>
          <span>Pembayaran</span>
          <span>Status</span>
          <span>Aksi</span>
        </div>

        {loading ? (
          <div
            style={{
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} h={50} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 0',
              color: '#94a3b8',
            }}>
            <ClipboardList size={36} style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 14 }}>Tidak ada data pendaftaran</div>
          </div>
        ) : (
          data.map((p, i) => (
            <div
              key={p.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 1fr 1fr 0.8fr 0.8fr',
                padding: '13px 20px',
                alignItems: 'center',
                borderBottom:
                  i < data.length - 1 ? '1px solid #f8fafc' : 'none',
                fontSize: 13,
                background: i % 2 === 0 ? '#fff' : '#fafafa',
              }}>
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                  {p.nama_lengkap}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                  {p.no_pendaftaran || `#${p.id}`}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 500, color: '#334155' }}>
                  {p.nama_prodi}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                  {p.fakultas}
                </div>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#64748b',
                  textTransform: 'capitalize',
                }}>
                {p.jalur_masuk?.replace('_', ' ')}
              </div>
              <div>
                {p.status_pembayaran ? (
                  <span
                    style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 20,
                      fontWeight: 600,
                      background:
                        p.status_pembayaran === 'paid' ? '#d1fae5' : '#fef3c7',
                      color:
                        p.status_pembayaran === 'paid' ? '#059669' : '#d97706',
                    }}>
                    {p.status_pembayaran === 'paid' ? 'Lunas' : 'Belum Bayar'}
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>-</span>
                )}
              </div>
              <div>{statusBadge(p.status_pendaftaran)}</div>
              <div>
                <button
                  onClick={() => navigate(`/admin/pendaftaran/${p.id}`)}
                  style={{
                    background: '#eef2ff',
                    color: '#6366f1',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                  <Eye size={13} /> Detail
                </button>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 20px',
              borderTop: '1px solid #f1f5f9',
              fontSize: 13,
            }}>
            <span style={{ color: '#64748b' }}>
              Menampilkan {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
              dari {pagination.total} data
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                disabled={pagination.page <= 1}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                style={{
                  background: pagination.page <= 1 ? '#f1f5f9' : '#6366f1',
                  color: pagination.page <= 1 ? '#94a3b8' : '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '7px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                }}>
                ← Prev
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                style={{
                  background:
                    pagination.page >= pagination.totalPages
                      ? '#f1f5f9'
                      : '#6366f1',
                  color:
                    pagination.page >= pagination.totalPages
                      ? '#94a3b8'
                      : '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '7px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor:
                    pagination.page >= pagination.totalPages
                      ? 'not-allowed'
                      : 'pointer',
                }}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
