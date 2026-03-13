// export default Home;
// src/pages/public/Home.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, ArrowRight, CheckCircle, Info,
  Loader, GraduationCap, Bell, MapPin, Phone,
  Mail, Building, Award
} from 'lucide-react';
import { getPengumuman } from '../../api/pengumumanApi';
import api from '../../api/axios';

const formatTanggal = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

const kategoriStyle = {
  penting:   { bg: '#fee2e2', color: '#dc2626', label: 'PENTING' },
  jadwal:    { bg: '#ede9fe', color: '#7c3aed', label: 'JADWAL' },
  info:      { bg: '#dbeafe', color: '#2563eb', label: 'INFO' },
  kelulusan: { bg: '#d1fae5', color: '#059669', label: 'KELULUSAN' },
};

const prodiColors = [
  { from: '#6366f1', to: '#4f46e5' },
  { from: '#0ea5e9', to: '#0284c7' },
  { from: '#10b981', to: '#059669' },
  { from: '#f59e0b', to: '#d97706' },
  { from: '#ec4899', to: '#db2777' },
  { from: '#8b5cf6', to: '#7c3aed' },
];

const Home = () => {
  const navigate = useNavigate();
  const [pengumuman, setPengumuman] = useState([]);
  const [prodiList, setProdiList]   = useState([]);
  const [stats, setStats]           = useState(null);
  const [loadingPengumuman, setLoadingPengumuman] = useState(true);
  const [loadingProdi, setLoadingProdi]           = useState(true);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [scrollY, setScrollY]       = useState(0);

  useEffect(() => {
    setTimeout(() => setHeroLoaded(true), 100);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Pakai getPengumuman dari pengumumanApi
  // → GET /api/pengumuman?is_active=true&limit=3
  const fetchPengumuman = async () => {
    try {
      const data = await getPengumuman({ is_active: true, limit: 3 });
      setPengumuman(data || []);
    } catch (err) {
      console.error('Gagal fetch pengumuman:', err);
    } finally {
      setLoadingPengumuman(false);
    }
  };

  const fetchProdi = async () => {
    try {
      const res = await api.get('/prodi', { params: { is_active: true, limit: 6 } });
      setProdiList(res.data.data || []);
    } catch { /* silent */ }
    finally { setLoadingProdi(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/prodi/stats');
      setStats(res.data.data || null);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchPengumuman();
    fetchProdi();
    fetchStats();
  }, []);

  const steps = [
    { step: 1, icon: '✍️', title: 'Registrasi Akun',  desc: 'Buat akun dengan email aktif Anda' },
    { step: 2, icon: '📋', title: 'Isi Formulir',     desc: 'Lengkapi data diri dan pilih prodi' },
    { step: 3, icon: '📁', title: 'Upload Berkas',    desc: 'Upload dokumen yang diperlukan' },
    { step: 4, icon: '💳', title: 'Bayar & Submit',   desc: 'Pembayaran dan submit pendaftaran' },
    { step: 5, icon: '🎓', title: 'Cek Hasil',        desc: 'Pantau pengumuman kelulusan' },
  ];

  const jumlahProdi = stats?.total_prodi ?? (loadingProdi ? null : prodiList.length);

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', 'Nunito', sans-serif", background: '#f8faff', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes badge-pop { 0%{opacity:0;transform:scale(0.7) translateY(20px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes hero-in { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }

        .nav-link { color:#475569; font-weight:600; font-size:14px; text-decoration:none; padding:6px 4px; position:relative; transition:color 0.2s; }
        .nav-link::after { content:''; position:absolute; bottom:0; left:0; width:0; height:2px; background:#2563eb; transition:width 0.2s; border-radius:2px; }
        .nav-link:hover { color:#2563eb; }
        .nav-link:hover::after { width:100%; }

        .btn-primary { background:linear-gradient(135deg,#2563eb,#1d4ed8); color:#fff; border:none; border-radius:14px; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:8px; transition:all 0.2s; box-shadow:0 6px 24px rgba(37,99,235,0.4); }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 32px rgba(37,99,235,0.5); }
        .btn-secondary { background:#fff; color:#334155; border:2px solid #e2e8f0; border-radius:14px; font-weight:700; cursor:pointer; transition:all 0.2s; }
        .btn-secondary:hover { border-color:#2563eb; color:#2563eb; transform:translateY(-2px); }

        .prodi-card { background:#fff; border:1px solid #e8f0fe; border-radius:20px; padding:24px; transition:all 0.25s; }
        .prodi-card:hover { transform:translateY(-4px); box-shadow:0 12px 40px rgba(37,99,235,0.12); border-color:#bfdbfe; }

        .announce-card { background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:24px; transition:all 0.25s; }
        .announce-card:hover { transform:translateY(-4px); box-shadow:0 12px 40px rgba(0,0,0,0.08); }

        .step-card { background:#fff; border-radius:20px; padding:28px 20px; text-align:center; border:1px solid #f1f5f9; box-shadow:0 2px 12px rgba(0,0,0,0.05); transition:all 0.25s; }
        .step-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(37,99,235,0.1); border-color:#bfdbfe; }

        .feature-card { background:#fff; border-radius:20px; padding:28px 24px; border:1px solid #f1f5f9; box-shadow:0 2px 12px rgba(0,0,0,0.05); transition:all 0.25s; }
        .feature-card:hover { transform:translateY(-4px); box-shadow:0 12px 36px rgba(0,0,0,0.1); }

        .glass-badge { backdrop-filter:blur(16px); background:rgba(255,255,255,0.95); border:1px solid rgba(255,255,255,0.8); box-shadow:0 8px 32px rgba(0,0,0,0.15); }

        .section-tag { display:inline-flex; align-items:center; gap:6px; background:#eff6ff; color:#2563eb; padding:6px 14px; border-radius:20px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:12px; }

        .hero-animated { animation: hero-in 0.8s ease both; }
        .hero-animated-delay { animation: hero-in 0.8s ease 0.2s both; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        background: 'rgba(255,255,255,0.93)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226,232,240,0.8)',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: scrollY > 10 ? '0 4px 24px rgba(0,0,0,0.07)' : 'none',
        transition: 'box-shadow 0.3s',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 68 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
            }}>
              <GraduationCap size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 17, color: '#0f172a', letterSpacing: '-0.02em' }}>PMB Online</div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>USNP · 2025/2026</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <a href="#prodi" className="nav-link">Program Studi</a>
            <a href="#cara-daftar" className="nav-link">Cara Daftar</a>
            <a href="#pengumuman" className="nav-link">Pengumuman</a>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '10px 22px', fontSize: 14, borderRadius: 10, textDecoration: 'none' }}>
              Daftar Sekarang <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 28px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

          {/* Kiri - Teks */}
          <div className="hero-animated">
            <div className="section-tag">
              <Info size={12} /> Pendaftaran Dibuka 2025/2026
            </div>

            <h1 style={{
              fontSize: 50, fontWeight: 900, color: '#0f172a',
              lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.03em',
            }}>
              Wujudkan
              <span style={{
                display: 'block',
                background: 'linear-gradient(135deg,#2563eb 30%,#60a5fa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Impianmu</span>
              di USNP
            </h1>

            <p style={{ fontSize: 17, color: '#475569', lineHeight: 1.75, marginBottom: 32, fontWeight: 500 }}>
              Universitas Sepuluh Nopember Papua membuka pendaftaran mahasiswa baru. Bergabunglah dan raih masa depan cemerlangmu!
            </p>

            <div style={{ display: 'flex', gap: 14, marginBottom: 44 }}>
              <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '15px 32px', fontSize: 16 }}>
                Daftar Sekarang <ArrowRight size={18} />
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary" style={{ padding: '15px 28px', fontSize: 15 }}>
                Sudah Punya Akun?
              </button>
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex', gap: 0,
              background: '#fff', borderRadius: 18, padding: '20px 0',
              boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
              border: '1px solid #f1f5f9',
            }}>
              {[
                { val: jumlahProdi != null ? `${jumlahProdi}+` : '15+', label: 'Program Studi', icon: '🎓' },
                { val: '1.000+', label: 'Mahasiswa', icon: '👨‍🎓' },
                { val: '50+',    label: 'Dosen Aktif', icon: '👩‍🏫' },
              ].map((s, i) => (
                <div key={i} style={{
                  flex: 1, padding: '4px 16px', textAlign: 'center',
                  borderRight: i < 2 ? '1px solid #f1f5f9' : 'none',
                }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Kanan - FOTO */}
          <div className="hero-animated-delay" style={{ position: 'relative' }}>
            {/* Frame foto */}
            <div style={{
              borderRadius: 28, overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(37,99,235,0.25)',
              aspectRatio: '4/3', position: 'relative',
              background: '#dbeafe',
            }}>
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&q=85&auto=format&fit=crop"
                alt="Mahasiswa wisuda"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900&q=80&auto=format&fit=crop';
                }}
              />
              {/* Overlay gradient bawah */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
                background: 'linear-gradient(to top, rgba(15,23,42,0.55), transparent)',
              }} />
              {/* Caption dalam foto */}
              <div style={{ position: 'absolute', bottom: 18, left: 20, color: '#fff' }}>
                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.95, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                  🎓 Ribuan alumni sukses dari USNP
                </div>
              </div>
            </div>

            {/* Badge Terakreditasi */}
            <div className="glass-badge" style={{
              position: 'absolute', bottom: -22, left: -22,
              padding: '14px 20px', borderRadius: 18,
              display: 'flex', alignItems: 'center', gap: 12,
              animation: 'badge-pop 0.6s ease 0.6s both',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg,#10b981,#059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
              }}>
                <CheckCircle size={22} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>Terakreditasi</div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>BAN-PT</div>
              </div>
            </div>

            {/* Badge Pendaftaran */}
            <div className="glass-badge" style={{
              position: 'absolute', top: -16, right: -16,
              padding: '12px 18px', borderRadius: 16,
              display: 'flex', alignItems: 'center', gap: 10,
              animation: 'badge-pop 0.6s ease 0.8s both',
            }}>
              <div style={{ fontSize: 26 }}>🎉</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>Pendaftaran Dibuka!</div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>T.A. 2025/2026</div>
              </div>
            </div>

            {/* Dekorasi */}
            <div style={{
              position: 'absolute', top: -40, right: -50, width: 130, height: 130,
              borderRadius: '50%', background: 'radial-gradient(#93c5fd80, transparent)', zIndex: -1,
            }} />
            <div style={{
              position: 'absolute', bottom: -50, left: -50, width: 100, height: 100,
              borderRadius: '50%', background: 'radial-gradient(#a5f3fc60, transparent)', zIndex: -1,
            }} />
          </div>
        </div>
      </section>

      {/* ── KEUNGGULAN ── */}
      <section style={{ maxWidth: 1200, margin: '72px auto 0', padding: '0 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div className="section-tag"><Award size={12} /> Keunggulan Kami</div>
          <h2 style={{ fontSize: 34, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Kenapa Pilih USNP?
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            { icon: '⚡', title: 'Daftar Online 24/7', desc: 'Proses pendaftaran sepenuhnya online, kapan saja dan di mana saja', bg: '#fef3c7' },
            { icon: '🏛️', title: 'Prodi Lengkap',      desc: 'Berbagai pilihan program studi dari berbagai bidang ilmu', bg: '#dbeafe' },
            { icon: '🎯', title: 'Proses Mudah',       desc: 'Sistem ramah pengguna dengan panduan lengkap tersedia', bg: '#d1fae5' },
            { icon: '🏆', title: 'Terakreditasi',      desc: 'Program studi tersertifikasi BAN-PT dengan kualitas terjamin', bg: '#ede9fe' },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: f.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 26, marginBottom: 16,
              }}>
                {f.icon}
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROGRAM STUDI ── */}
      <section id="prodi" style={{ maxWidth: 1200, margin: '72px auto 0', padding: '0 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <div className="section-tag"><Building size={12} /> Program Studi</div>
            <h2 style={{ fontSize: 34, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              Pilih Jurusanmu
            </h2>
          </div>
          <Link to="/register" style={{ color: '#2563eb', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            Lihat Semua <ArrowRight size={15} />
          </Link>
        </div>

        {loadingProdi ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <Loader size={28} style={{ animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : prodiList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', background: '#f8fafc', borderRadius: 20, fontSize: 14 }}>
            Belum ada program studi tersedia
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
            {prodiList.map((prodi, idx) => {
              const col = prodiColors[idx % prodiColors.length];
              return (
                <div key={prodi.id} className="prodi-card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                      background: `linear-gradient(135deg,${col.from},${col.to})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 6px 16px ${col.from}40`,
                    }}>
                      <GraduationCap size={22} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', marginBottom: 2, lineHeight: 1.3 }}>
                        {prodi.nama_prodi}
                      </div>
                      {prodi.fakultas && (
                        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{prodi.fakultas}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {prodi.jenjang && (
                      <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: `${col.from}20`, color: col.from, fontWeight: 700 }}>
                        {prodi.jenjang}
                      </span>
                    )}
                    {prodi.akreditasi && (
                      <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: '#d1fae5', color: '#065f46', fontWeight: 700 }}>
                        Akreditasi {prodi.akreditasi}
                      </span>
                    )}
                    {prodi.biaya_pendaftaran && (
                      <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: '#fef3c7', color: '#92400e', fontWeight: 700 }}>
                        Rp {Number(prodi.biaya_pendaftaran).toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── CARA MENDAFTAR ── */}
      <section id="cara-daftar" style={{ maxWidth: 1200, margin: '72px auto 0', padding: '0 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div className="section-tag">📋 Panduan</div>
          <h2 style={{ fontSize: 34, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Cara Mendaftar
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', fontWeight: 500, marginTop: 8 }}>
            5 langkah mudah menjadi mahasiswa USNP
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, position: 'relative' }}>
          {/* Garis penghubung */}
          <div style={{
            position: 'absolute', top: 44, left: '10%', right: '10%',
            height: 2, background: 'linear-gradient(to right,#bfdbfe,#93c5fd,#bfdbfe)',
            zIndex: 0,
          }} />
          {steps.map((item, idx) => (
            <div key={idx} className="step-card" style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, margin: '0 auto 16px',
                boxShadow: '0 6px 20px rgba(37,99,235,0.35)',
                border: '3px solid #fff',
              }}>
                {item.icon}
              </div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>{item.desc}</div>
              <div style={{ marginTop: 12, display: 'inline-block', background: '#eff6ff', color: '#2563eb', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>
                Langkah {item.step}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PENGUMUMAN ── */}
      <section id="pengumuman" style={{ maxWidth: 1200, margin: '72px auto 0', padding: '0 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <div className="section-tag"><Bell size={12} /> Pengumuman</div>
            <h2 style={{ fontSize: 34, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              Informasi Terbaru
            </h2>
          </div>
          <Link to="/login" style={{ color: '#2563eb', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            Lihat Semua <ArrowRight size={15} />
          </Link>
        </div>

        {loadingPengumuman ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <Loader size={28} style={{ animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : pengumuman.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', background: '#f8fafc', borderRadius: 24, border: '2px dashed #e2e8f0' }}>
            <Bell size={36} style={{ opacity: 0.3, marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>Belum ada pengumuman tersedia</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 20 }}>
            {pengumuman.map((item) => {
              const kStyle = kategoriStyle[item.kategori] || kategoriStyle.info;
              return (
                <div key={item.id} className="announce-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 20, background: kStyle.bg, color: kStyle.color, letterSpacing: '0.05em' }}>
                      {kStyle.label}
                    </span>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                      {formatTanggal(item.tanggal_publish || item.created_at)}
                    </div>
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', marginBottom: 10, lineHeight: 1.4 }}>
                    {item.judul}
                  </h3>
                  <p style={{
                    fontSize: 13, color: '#475569', lineHeight: 1.65,
                    display: '-webkit-box', WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {item.isi}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 1200, margin: '72px auto 0', padding: '0 28px' }}>
        <div style={{
          background: 'linear-gradient(135deg,#1e40af 0%,#2563eb 55%,#3b82f6 100%)',
          borderRadius: 28, padding: '56px 48px',
          display: 'grid', gridTemplateColumns: '1fr auto',
          gap: 40, alignItems: 'center',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(37,99,235,0.35)',
        }}>
          {/* Decorative circles */}
          <div style={{ position:'absolute', top:-60, right:220, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
          <div style={{ position:'absolute', bottom:-80, right:-40, width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', color:'#fff', padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:700, marginBottom:14 }}>
              🎓 Ayo bergabung sekarang!
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}>
              Siap Bergabung dengan USNP?
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, fontWeight: 500, maxWidth: 520 }}>
              Daftar sekarang dan jadilah bagian dari keluarga besar USNP. Raih masa depan cemerlangmu bersama kami!
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1 }}>
            <button onClick={() => navigate('/register')} style={{
              background: '#fff', color: '#1d4ed8',
              padding: '15px 36px', borderRadius: 14,
              fontWeight: 900, fontSize: 16, border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)', whiteSpace: 'nowrap',
            }}>
              Mulai Pendaftaran →
            </button>
            <button onClick={() => navigate('/login')} style={{
              background: 'transparent', color: 'rgba(255,255,255,0.85)',
              padding: '12px 36px', borderRadius: 14, fontWeight: 700, fontSize: 14,
              border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              Login Akun
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0f172a', color: '#fff', padding: '56px 28px 28px', marginTop: 72 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr', gap: 48, marginBottom: 44 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'linear-gradient(135deg,#2563eb,#3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <GraduationCap size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>PMB Online USNP</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Sistem Penerimaan Mahasiswa Baru</div>
                </div>
              </div>
              <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.8, maxWidth: 300 }}>
                Universitas Sepuluh Nopember Papua, mendidik generasi unggul untuk membangun Papua dan Indonesia.
              </p>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 20, color: '#e2e8f0' }}>Kontak</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: <Mail size={13} />, text: 'pmb@usnp.ac.id' },
                  { icon: <Phone size={13} />, text: '0812-3456-7890' },
                  { icon: <MapPin size={13} />, text: 'Sorong, Papua Barat Daya' },
                ].map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13 }}>
                    <span style={{ color: '#475569' }}>{c.icon}</span> {c.text}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 20, color: '#e2e8f0' }}>Jam Layanan</div>
              <div style={{ color: '#64748b', fontSize: 13, lineHeight: 2.2 }}>
                <div>📅 Senin – Jumat</div>
                <div style={{ paddingLeft: 20, color: '#94a3b8' }}>08.00 – 16.00 WITA</div>
                <div>📅 Sabtu</div>
                <div style={{ paddingLeft: 20, color: '#94a3b8' }}>08.00 – 12.00 WITA</div>
                <div style={{ color: '#475569' }}>🚫 Minggu: Libur</div>
              </div>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid #1e293b', paddingTop: 24,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 8,
          }}>
            <div style={{ color: '#475569', fontSize: 13 }}>
              © 2025 Universitas Sepuluh Nopember Papua. All rights reserved.
            </div>
            <div style={{ color: '#334155', fontSize: 12, display: 'flex', gap: 20 }}>
              <span style={{ cursor: 'pointer' }}>Kebijakan Privasi</span>
              <span style={{ cursor: 'pointer' }}>Syarat & Ketentuan</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Home;