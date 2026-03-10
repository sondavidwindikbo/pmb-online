// src/pages/public/Home.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Users, Award, Clock, ArrowRight, CheckCircle, Info, Menu, X } from 'lucide-react';
import api from '../../api/axios';

const Home = () => {
  const navigate = useNavigate();
  const [pengumuman, setPengumuman] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchPengumuman();
  }, []);

  const fetchPengumuman = async () => {
    try {
      const response = await api.get('/pengumuman?limit=3&kategori=info');
      setPengumuman(response.data.data);
    } catch (error) {
      console.error('Error fetching pengumuman:', error);
    }
  };

  const features = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Pendaftaran Online',
      description: 'Daftar kapan saja, dimana saja tanpa harus datang ke kampus'
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Berbagai Program Studi',
      description: 'Pilihan program studi lengkap dari berbagai fakultas'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Proses Mudah',
      description: 'Sistem pendaftaran yang mudah dan user-friendly'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Terakreditasi',
      description: 'Program studi terakreditasi dengan kualitas terjamin'
    }
  ];

  const steps = [
    { step: 1, title: 'Registrasi Akun', desc: 'Buat akun dengan email aktif' },
    { step: 2, title: 'Isi Formulir', desc: 'Lengkapi data diri dan pilih prodi' },
    { step: 3, title: 'Upload Berkas', desc: 'Upload dokumen yang diperlukan' },
    { step: 4, title: 'Bayar & Submit', desc: 'Lakukan pembayaran dan submit' },
    { step: 5, title: 'Tunggu Hasil', desc: 'Cek pengumuman kelulusan' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PMB Online</h1>
                <p className="text-xs text-gray-600">USNP</p>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/pengumuman" className="text-gray-700 hover:text-blue-600 font-medium">
                Pengumuman
              </Link>
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Daftar Sekarang
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              <Link to="/pengumuman" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
                Pengumuman
              </Link>
              <Link to="/login" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
                Login
              </Link>
              <Link 
                to="/register" 
                className="block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors text-center"
              >
                Daftar Sekarang
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                <Info className="w-4 h-4" />
                <span>Pendaftaran Dibuka!</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Wujudkan Impianmu di
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400"> USNP</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600">
                Universitas Sepuluh Nopember Papua membuka pendaftaran mahasiswa baru untuk tahun akademik 2025/2026. Daftar sekarang dan raih masa depanmu!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all"
                >
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => navigate('/pengumuman')}
                  className="bg-white hover:bg-gray-50 text-gray-800 px-8 py-4 rounded-lg font-bold text-lg border-2 border-gray-300 transition-all"
                >
                  Lihat Pengumuman
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div>
                  <p className="text-3xl md:text-4xl font-bold text-blue-600">15+</p>
                  <p className="text-sm md:text-base text-gray-600">Program Studi</p>
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-bold text-blue-600">1000+</p>
                  <p className="text-sm md:text-base text-gray-600">Mahasiswa</p>
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-bold text-blue-600">50+</p>
                  <p className="text-sm md:text-base text-gray-600">Dosen</p>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                <BookOpen className="w-48 h-48 md:w-64 md:h-64 text-white opacity-20" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 md:p-6 rounded-xl shadow-xl">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm md:text-base">Terakreditasi</p>
                    <p className="text-xs md:text-sm text-gray-600">BAN-PT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Kenapa Memilih USNP?</h2>
            <p className="text-lg md:text-xl text-gray-600">Keunggulan sistem pendaftaran online kami</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Cara Mendaftar</h2>
            <p className="text-lg md:text-xl text-gray-600">5 langkah mudah untuk menjadi mahasiswa USNP</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-center">{item.title}</h3>
                  <p className="text-sm text-gray-600 text-center">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pengumuman Section */}
      {pengumuman.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Pengumuman Terbaru</h2>
              <Link to="/pengumuman" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-2">
                <span>Lihat Semua</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pengumuman.map((item) => (
                <div key={item.id} className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 hover:shadow-lg transition-shadow cursor-pointer">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    {item.kategori}
                  </span>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{item.judul}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.isi}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.tanggal_publish).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-400">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Bergabung dengan USNP?</h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Jangan lewatkan kesempatan emas ini. Daftar sekarang dan raih masa depan cemerlangmu!
          </p>
          <button 
            onClick={() => navigate('/register')}
            className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
          >
            Mulai Pendaftaran
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">PMB Online USNP</h3>
              <p className="text-gray-400">
                Universitas Sepuluh Nopember Papua<br />
                Jl. Gunung Salju, Sorong<br />
                Papua Barat Daya
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Kontak</h3>
              <p className="text-gray-400">
                Email: pmb@usnp.ac.id<br />
                WhatsApp: 0812-3456-7890<br />
                Instagram: @usnp_official
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Jam Layanan</h3>
              <p className="text-gray-400">
                Senin - Jumat: 08:00 - 16:00 WITA<br />
                Sabtu: 08:00 - 12:00 WITA<br />
                Minggu: Libur
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Universitas Sepuluh Nopember Papua. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;