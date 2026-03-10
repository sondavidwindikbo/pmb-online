-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 10 Mar 2026 pada 18.25
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pmb_online_usnp`
--

DELIMITER $$
--
-- Prosedur
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `generate_nomor_pendaftaran` (IN `p_prodi_id` INT, IN `p_tahun` VARCHAR(4), OUT `p_nomor_pendaftaran` VARCHAR(20))   BEGIN
    DECLARE v_kode_prodi VARCHAR(10);
    DECLARE v_counter INT;
    
    -- Ambil kode prodi
    SELECT kode_prodi INTO v_kode_prodi FROM prodi WHERE id = p_prodi_id;
    
    -- Hitung jumlah pendaftar untuk prodi tersebut di tahun ini
    SELECT COUNT(*) + 1 INTO v_counter
    FROM pendaftaran pd
    JOIN pendaftar p ON pd.pendaftar_id = p.id
    WHERE pd.prodi_id = p_prodi_id 
    AND YEAR(pd.tanggal_daftar) = p_tahun;
    
    -- Format: PMB-2025-TI01-0001
    SET p_nomor_pendaftaran = CONCAT('PMB-', p_tahun, '-', v_kode_prodi, '-', LPAD(v_counter, 4, '0'));
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `berkas`
--

CREATE TABLE `berkas` (
  `id` int(11) NOT NULL,
  `pendaftaran_id` int(11) NOT NULL,
  `jenis_berkas` enum('ktp','ijazah','foto','rapor','surat_sehat','kartu_keluarga','akta_lahir') NOT NULL,
  `nama_file` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `mime_type` varchar(50) DEFAULT NULL,
  `status_verifikasi` enum('pending','approved','rejected') DEFAULT 'pending',
  `catatan` text DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `verified_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `berkas`
--

INSERT INTO `berkas` (`id`, `pendaftaran_id`, `jenis_berkas`, `nama_file`, `file_path`, `file_size`, `mime_type`, `status_verifikasi`, `catatan`, `verified_by`, `uploaded_at`, `verified_at`) VALUES
(1, 1, '', '7-doc-1772564388633-552175828.jpg', 'uploads\\ktp\\7-doc-1772564388633-552175828.jpg', 296766, 'image/jpeg', 'approved', NULL, 1, '2026-03-03 18:59:48', '2026-03-05 14:31:40'),
(2, 1, '', '7-doc-1772564538030-834738271.JPG', 'uploads\\ktp\\7-doc-1772564538030-834738271.JPG', 314507, 'image/jpeg', 'approved', NULL, 1, '2026-03-03 19:02:18', '2026-03-05 14:32:15'),
(3, 1, '', '7-doc-1772564540777-393458633.pdf', 'uploads\\ktp\\7-doc-1772564540777-393458633.pdf', 122409, 'application/pdf', 'approved', NULL, 1, '2026-03-03 19:02:20', '2026-03-05 14:32:25'),
(4, 1, '', '7-doc-1772564609199-912920207.jpg', 'uploads\\ktp\\7-doc-1772564609199-912920207.jpg', 1239417, 'image/jpeg', 'approved', NULL, 1, '2026-03-03 19:03:29', '2026-03-05 14:32:39'),
(5, 1, '', '7-doc-1772564613827-591474318.JPG', 'uploads\\ktp\\7-doc-1772564613827-591474318.JPG', 431362, 'image/jpeg', 'approved', NULL, 1, '2026-03-03 19:03:33', '2026-03-05 14:31:45'),
(6, 1, '', '7-doc-1772564616167-18529830.jpg', 'uploads\\ktp\\7-doc-1772564616167-18529830.jpg', 296766, 'image/jpeg', 'approved', NULL, 1, '2026-03-03 19:03:36', '2026-03-05 14:32:18'),
(7, 1, '', '7-doc-1772564646731-833324942.jpg', 'uploads\\ktp\\7-doc-1772564646731-833324942.jpg', 1889034, 'image/jpeg', 'approved', NULL, 1, '2026-03-03 19:04:06', '2026-03-05 14:32:29'),
(8, 1, '', '7-doc-1772565024645-442522317.jpg', 'uploads\\ktp\\7-doc-1772565024645-442522317.jpg', 1168660, 'image/jpeg', 'approved', NULL, 1, '2026-03-03 19:10:24', '2026-03-05 14:32:42'),
(9, 1, '', '7-doc-1772565047565-396383978.jpg', 'uploads\\ktp\\7-doc-1772565047565-396383978.jpg', 1141381, 'image/jpeg', 'approved', NULL, 1, '2026-03-03 19:10:47', '2026-03-05 14:31:55'),
(10, 1, '', '7-doc-1772565061731-41013970.jpg', 'uploads\\ktp\\7-doc-1772565061731-41013970.jpg', 1587187, 'image/jpeg', 'approved', NULL, 1, '2026-03-03 19:11:01', '2026-03-05 14:32:21'),
(11, 1, '', '7-doc-1772565230051-30613710.jpg', 'uploads\\ktp\\7-doc-1772565230051-30613710.jpg', 1587187, 'image/jpeg', 'approved', NULL, 1, '2026-03-03 19:13:50', '2026-03-05 14:32:36'),
(12, 2, '', '6-doc-1772816350071-574332865.jpg', 'uploads\\ktp\\6-doc-1772816350071-574332865.jpg', 1889034, 'image/jpeg', 'approved', NULL, 1, '2026-03-06 16:59:10', '2026-03-06 17:00:36'),
(13, 2, '', '6-doc-1772816364291-835252420.jpg', 'uploads\\ktp\\6-doc-1772816364291-835252420.jpg', 1889034, 'image/jpeg', 'approved', NULL, 1, '2026-03-06 16:59:24', '2026-03-06 17:00:40'),
(14, 2, '', '6-doc-1772816376669-169038161.jpg', 'uploads\\ktp\\6-doc-1772816376669-169038161.jpg', 1141381, 'image/jpeg', 'approved', NULL, 1, '2026-03-06 16:59:36', '2026-03-06 17:00:42'),
(15, 2, '', '6-doc-1772816379682-444499311.jpg', 'uploads\\ktp\\6-doc-1772816379682-444499311.jpg', 1889034, 'image/jpeg', 'approved', NULL, 1, '2026-03-06 16:59:39', '2026-03-06 17:00:45'),
(16, 2, '', '6-doc-1772816388223-67828268.jpg', 'uploads\\ktp\\6-doc-1772816388223-67828268.jpg', 1985434, 'image/jpeg', 'approved', NULL, 1, '2026-03-06 16:59:48', '2026-03-06 17:00:37'),
(17, 3, '', '8-doc-1772990205741-995772953.jpg', 'uploads\\ktp\\8-doc-1772990205741-995772953.jpg', 1511191, 'image/jpeg', 'approved', NULL, 1, '2026-03-08 17:16:45', '2026-03-08 17:17:59'),
(18, 3, '', '8-doc-1772990216765-32828419.jpg', 'uploads\\ktp\\8-doc-1772990216765-32828419.jpg', 1721364, 'image/jpeg', 'approved', NULL, 1, '2026-03-08 17:16:56', '2026-03-08 17:18:06'),
(19, 3, '', '8-doc-1772990226538-399899789.jpg', 'uploads\\ktp\\8-doc-1772990226538-399899789.jpg', 1325330, 'image/jpeg', 'approved', NULL, 1, '2026-03-08 17:17:06', '2026-03-08 17:18:11'),
(20, 3, '', '8-doc-1772990235512-311085836.jpg', 'uploads\\ktp\\8-doc-1772990235512-311085836.jpg', 1883347, 'image/jpeg', 'approved', NULL, 1, '2026-03-08 17:17:15', '2026-03-08 17:18:15'),
(21, 3, '', '8-doc-1772990242488-844482296.jpg', 'uploads\\ktp\\8-doc-1772990242488-844482296.jpg', 1587187, 'image/jpeg', 'approved', NULL, 1, '2026-03-08 17:17:22', '2026-03-08 17:18:03');

-- --------------------------------------------------------

--
-- Struktur dari tabel `log_aktivitas`
--

CREATE TABLE `log_aktivitas` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `aktivitas` varchar(255) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `pembayaran`
--

CREATE TABLE `pembayaran` (
  `id` int(11) NOT NULL,
  `pendaftaran_id` int(11) NOT NULL,
  `kode_pembayaran` varchar(50) NOT NULL,
  `jumlah` decimal(10,2) NOT NULL,
  `metode_pembayaran` enum('transfer','va','qris','manual') DEFAULT 'transfer',
  `bank` varchar(50) DEFAULT NULL,
  `nomor_rekening` varchar(50) DEFAULT NULL,
  `status_pembayaran` enum('pending','paid','expired','failed','refunded') DEFAULT 'pending',
  `bukti_pembayaran` varchar(500) DEFAULT NULL,
  `tanggal_bayar` timestamp NULL DEFAULT NULL,
  `expired_at` timestamp NULL DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `catatan` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `pembayaran`
--

INSERT INTO `pembayaran` (`id`, `pendaftaran_id`, `kode_pembayaran`, `jumlah`, `metode_pembayaran`, `bank`, `nomor_rekening`, `status_pembayaran`, `bukti_pembayaran`, `tanggal_bayar`, `expired_at`, `verified_at`, `verified_by`, `catatan`, `created_at`, `updated_at`) VALUES
(1, 1, 'PAY-1772722615192-155', 250000.00, '', 'BNI', '1342342424', 'paid', 'uploads\\ktp\\7-doc-1772722639939-920390683.jpg', '2026-03-05 14:57:19', '2026-03-06 14:56:55', '2026-03-05 14:58:50', 1, 'terimakasih son sudah mendaftar untuk info selanjut pantau terus ig kami usn123', '2026-03-03 18:04:47', '2026-03-05 14:58:50'),
(2, 2, 'PAY-1772816553782-667', 250000.00, '', 'BNI', '154 35345 06', 'paid', 'uploads\\ktp\\6-doc-1772816661590-133331251.jpg', '2026-03-06 17:04:21', '2026-03-07 17:02:33', '2026-03-06 17:25:23', 1, NULL, '2026-03-06 17:02:33', '2026-03-06 17:25:23'),
(3, 3, 'PAY-1772990318317-770', 200000.00, '', 'BNI', '', 'paid', 'uploads\\ktp\\8-doc-1772990330322-320090687.jpg', '2026-03-08 17:18:50', '2026-03-09 17:18:38', '2026-03-08 17:19:27', 1, NULL, '2026-03-08 17:18:38', '2026-03-08 17:19:27');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pendaftar`
--

CREATE TABLE `pendaftar` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `no_pendaftaran` varchar(20) DEFAULT NULL,
  `nama_lengkap` varchar(150) NOT NULL,
  `nik` varchar(16) DEFAULT NULL,
  `tempat_lahir` varchar(100) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `jenis_kelamin` enum('L','P') NOT NULL,
  `agama` varchar(20) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `kabupaten` varchar(100) DEFAULT NULL,
  `provinsi` varchar(100) DEFAULT NULL,
  `kode_pos` varchar(10) DEFAULT NULL,
  `no_hp` varchar(15) DEFAULT NULL,
  `email_alternatif` varchar(100) DEFAULT NULL,
  `nama_ortu` varchar(150) DEFAULT NULL,
  `pekerjaan_ortu` varchar(100) DEFAULT NULL,
  `penghasilan_ortu` enum('< 1 juta','1-3 juta','3-5 juta','> 5 juta') DEFAULT NULL,
  `no_hp_ortu` varchar(15) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `pendaftar`
--

INSERT INTO `pendaftar` (`id`, `user_id`, `no_pendaftaran`, `nama_lengkap`, `nik`, `tempat_lahir`, `tanggal_lahir`, `jenis_kelamin`, `agama`, `alamat`, `kabupaten`, `provinsi`, `kode_pos`, `no_hp`, `email_alternatif`, `nama_ortu`, `pekerjaan_ortu`, `penghasilan_ortu`, `no_hp_ortu`, `created_at`, `updated_at`) VALUES
(1, 2, NULL, 'John Doe Papua', NULL, NULL, NULL, 'L', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-11 14:55:42', '2025-12-11 14:55:42'),
(2, 3, NULL, 'John Doe Papua', NULL, NULL, NULL, 'L', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-13 08:53:32', '2025-12-13 08:53:32'),
(4, 6, 'PMB-2026-SI01-0001', 'Test User', '9123303009040003', 'jayapura', '2025-09-03', '', 'Islam', 'jln yosudarso', 'Jayapura', 'Indonesia', '55332', '082227242545', NULL, 'batu wenda', 'guru', '', '089224245678', '2025-12-14 23:14:10', '2026-03-06 16:57:56'),
(5, 7, 'PMB-2026-TI01-0001', 'SON DAVID WIDIKBO', '9123303009040001', 'minimo', '2025-09-01', '', 'Hindu', 'jln bhanyangkara', 'Jayapura', 'Indonesia', '55667', '081364055537', NULL, 'isaskar wenda', 'petani', '', '081365222145', '2026-03-02 17:59:46', '2026-03-03 16:54:20'),
(6, 8, 'PMB-2026-AK01-0001', 'roni wanimbo', '9123303009040009', 'timika', '2024-10-10', '', 'Katolik', 'abepura', 'Jayapura', 'Indonesia', '55667', '082215111161718', NULL, 'kaleb wanimbo', 'Buruh kasar', '', '082424241514', '2026-03-08 17:12:47', '2026-03-08 17:16:08');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pendaftaran`
--

CREATE TABLE `pendaftaran` (
  `id` int(11) NOT NULL,
  `pendaftar_id` int(11) NOT NULL,
  `prodi_id` int(11) NOT NULL,
  `jalur_masuk` enum('SNBP','SNBT','Mandiri') DEFAULT 'Mandiri',
  `tahun_akademik` varchar(9) NOT NULL,
  `semester` enum('Ganjil','Genap') DEFAULT 'Ganjil',
  `asal_sekolah` varchar(150) DEFAULT NULL,
  `npsn` varchar(20) DEFAULT NULL,
  `jurusan_sekolah` varchar(50) DEFAULT NULL,
  `tahun_lulus` year(4) DEFAULT NULL,
  `nilai_rata_rata` decimal(4,2) DEFAULT NULL,
  `status_pendaftaran` enum('draft','submitted','verified','rejected','accepted') DEFAULT 'draft',
  `catatan` varchar(500) DEFAULT NULL,
  `tanggal_daftar` timestamp NOT NULL DEFAULT current_timestamp(),
  `tanggal_verifikasi` timestamp NULL DEFAULT NULL,
  `catatan_verifikasi` text DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `pendaftaran`
--

INSERT INTO `pendaftaran` (`id`, `pendaftar_id`, `prodi_id`, `jalur_masuk`, `tahun_akademik`, `semester`, `asal_sekolah`, `npsn`, `jurusan_sekolah`, `tahun_lulus`, `nilai_rata_rata`, `status_pendaftaran`, `catatan`, `tanggal_daftar`, `tanggal_verifikasi`, `catatan_verifikasi`, `verified_by`, `created_at`, `updated_at`) VALUES
(1, 5, 1, '', '2025/2026', 'Ganjil', 'sma pgri wamena', '2421', 'tkj', '2026', 85.21, 'accepted', NULL, '2026-03-03 16:54:20', '2026-03-10 15:26:58', NULL, 1, '2026-03-03 16:54:20', '2026-03-10 15:26:58'),
(2, 4, 2, '', '2025/2026', 'Ganjil', 'sma negeri 1 wamena', '2421', 'ipa', '2026', 61.78, 'verified', NULL, '2026-03-06 16:57:56', '2026-03-06 17:25:23', NULL, NULL, '2026-03-06 16:57:56', '2026-03-10 15:00:26'),
(3, 6, 4, '', '2025/2026', 'Ganjil', 'sma negeri 1 wamena', '2421', 'ips', '2026', 78.52, 'verified', NULL, '2026-03-08 17:16:08', '2026-03-08 17:19:27', NULL, NULL, '2026-03-08 17:16:08', '2026-03-10 15:00:26');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pengumuman`
--

CREATE TABLE `pengumuman` (
  `id` int(11) NOT NULL,
  `judul` varchar(200) NOT NULL,
  `isi` text NOT NULL,
  `kategori` enum('info','kelulusan','penting','jadwal') DEFAULT 'info',
  `prioritas` enum('low','medium','high') DEFAULT 'medium',
  `file_attachment` varchar(500) DEFAULT NULL,
  `tanggal_publish` timestamp NOT NULL DEFAULT current_timestamp(),
  `tanggal_berakhir` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `pengumuman`
--

INSERT INTO `pengumuman` (`id`, `judul`, `isi`, `kategori`, `prioritas`, `file_attachment`, `tanggal_publish`, `tanggal_berakhir`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Selamat Datang di PMB Online USNP 2025', 'Universitas Sepuluh Nopember Papua (USNP) membuka pendaftaran mahasiswa baru untuk tahun akademik 2025/2026.\r\n\r\nJalur pendaftaran:\r\n- SNBP (Seleksi Nasional Berdasarkan Prestasi)\r\n- SNBT (Seleksi Nasional Berdasarkan Test)\r\n- Mandiri USNP\r\n\r\nPendaftaran dibuka mulai 1 Juni 2025 sampai 31 Agustus 2025.\r\n\r\nUntuk informasi lebih lanjut, silakan hubungi:\r\nEmail: pmb@usnp.ac.id\r\nWhatsApp: 0812-3456-7890', 'info', 'high', NULL, '2025-05-31 23:00:00', NULL, 1, 1, '2025-12-14 16:02:56', '2025-12-14 16:02:56'),
(2, 'Perpanjangan Waktu Pendaftaran', 'Bagi calon mahasiswa yang belum sempat mendaftar, kami informasikan bahwa waktu pendaftaran diperpanjang hingga 15 September 2025.\r\n\r\nManfaatkan kesempatan ini dengan sebaik-baiknya!', 'info', 'medium', NULL, '2025-08-25 01:00:00', '2025-09-15 14:59:59', 1, 1, '2025-12-14 16:02:56', '2025-12-14 16:02:56'),
(3, 'Jadwal Verifikasi Berkas', 'Kepada seluruh calon mahasiswa yang sudah submit pendaftaran, proses verifikasi berkas akan dilakukan pada:\r\n\r\nTanggal: 10-20 Juli 2025\r\nWaktu: Setiap hari kerja (08:00 - 16:00 WITA)\r\n\r\nMohon pastikan semua berkas sudah diupload dengan lengkap dan benar.\r\n\r\nBerkas yang harus diupload:\r\n1. KTP\r\n2. Ijazah/SKL\r\n3. Foto 4x6\r\n4. Rapor (opsional)\r\n\r\nStatus verifikasi dapat dicek di dashboard masing-masing.', 'jadwal', 'high', NULL, '2025-07-05 00:00:00', NULL, 1, 1, '2025-12-14 16:02:56', '2025-12-14 16:02:56'),
(4, 'Jadwal Wawancara Calon Mahasiswa', 'Kepada calon mahasiswa yang lolos verifikasi berkas, akan mengikuti tahap wawancara dengan jadwal sebagai berikut:\r\n\r\n📅 Fakultas Teknik:\r\n- Teknik Informatika: 25 Juli 2025\r\n- Sistem Informasi: 26 Juli 2025\r\n\r\n📅 Fakultas Ekonomi:\r\n- Manajemen: 27 Juli 2025\r\n- Akuntansi: 28 Juli 2025\r\n\r\n⏰ Waktu: 08:00 - 16:00 WITA\r\n📍 Tempat: Kampus USNP, Gedung Rektorat Lt. 2\r\n\r\nHarap hadir 30 menit sebelum jadwal wawancara Anda.\r\nBawa berkas asli untuk verifikasi.\r\n\r\nInfo lebih lanjut: pmb@usnp.ac.id', 'jadwal', 'high', NULL, '2025-07-15 01:00:00', NULL, 1, 1, '2025-12-14 16:02:56', '2025-12-14 16:02:56'),
(5, '⚠️ PENTING: Verifikasi Pembayaran', 'Kepada seluruh calon mahasiswa,\r\n\r\nKami informasikan bahwa proses verifikasi pembayaran dilakukan maksimal 2x24 jam setelah upload bukti pembayaran.\r\n\r\nPastikan:\r\n✅ Upload bukti transfer yang jelas\r\n✅ Nominal sesuai dengan tagihan\r\n✅ Nama pengirim tercantum\r\n\r\nJika lebih dari 2x24 jam pembayaran belum terverifikasi, silakan hubungi:\r\n📧 keuangan@usnp.ac.id\r\n📱 WA: 0812-9999-8888', 'penting', 'high', NULL, '2025-06-09 23:00:00', NULL, 1, 1, '2025-12-14 16:02:56', '2025-12-14 16:02:56'),
(6, '🎉 PENGUMUMAN HASIL SELEKSI PMB 2025 - GELOMBANG 1', 'Kepada seluruh calon mahasiswa peserta Penerimaan Mahasiswa Baru (PMB) USNP Tahun Akademik 2025/2026 Gelombang 1,\r\n\r\nDengan ini kami umumkan bahwa hasil seleksi telah diumumkan.\r\n\r\n🔍 CEK HASIL KELULUSAN:\r\nLogin ke sistem PMB Online → Menu \"Cek Kelulusan\"\r\n\r\nBagi yang DITERIMA:\r\n✅ Selamat! Anda resmi menjadi bagian dari keluarga besar USNP\r\n✅ Silakan lakukan registrasi ulang sesuai jadwal\r\n✅ Cek email untuk informasi lebih lanjut\r\n\r\nBagi yang BELUM LOLOS:\r\n❤️ Terima kasih atas partisipasi Anda\r\n❤️ Jangan menyerah, masih ada Gelombang 2\r\n❤️ Pendaftaran Gelombang 2: 1-31 Agustus 2025\r\n\r\n📧 Info: pmb@usnp.ac.id\r\n📱 WA: 0812-3456-7890\r\n\r\nSelamat kepada yang diterima!\r\nSalam hangat dari kampus USNP Papua! 🌴', 'kelulusan', 'high', NULL, '2025-08-01 00:00:00', NULL, 1, 1, '2025-12-14 16:02:56', '2025-12-14 16:02:56'),
(7, 'Informasi Registrasi Ulang Mahasiswa Baru', 'Kepada mahasiswa baru yang telah DITERIMA,\r\n\r\nSilakan lakukan registrasi ulang dengan ketentuan:\r\n\r\n📅 Waktu: 5-15 Agustus 2025\r\n📍 Tempat: Kampus USNP, Gedung Akademik\r\n\r\n📝 Persyaratan:\r\n1. Print Kartu Tanda Peserta\r\n2. Ijazah asli + fotokopi\r\n3. KTP asli + fotokopi  \r\n4. Kartu Keluarga asli + fotokopi\r\n5. Foto 4x6 (3 lembar)\r\n6. Bukti pembayaran registrasi\r\n\r\n💰 Biaya Registrasi Ulang:\r\n- Uang Pangkal: Rp 5.000.000\r\n- SPP Semester 1: Rp 3.500.000\r\n\r\nBatas akhir registrasi: 15 Agustus 2025 pukul 16:00 WITA\r\n\r\nJika tidak registrasi ulang sesuai jadwal, dianggap MENGUNDURKAN DIRI.\r\n\r\nInfo: akademik@usnp.ac.id', 'kelulusan', 'high', NULL, '2025-08-01 01:00:00', NULL, 1, 1, '2025-12-14 16:02:56', '2026-03-05 14:59:08'),
(8, 'Test Pengumuman Expired', 'Ini adalah pengumuman yang sudah expired. Tidak akan muncul di list public.', 'info', 'low', NULL, '2024-12-31 15:00:00', '2025-05-31 14:59:59', 1, 1, '2025-12-14 16:02:56', '2025-12-14 16:02:56'),
(9, 'Pengumuman Terjadwal', 'Ini adalah pengumuman yang dijadwalkan publish di masa depan. Belum akan muncul di public.', 'info', 'medium', NULL, '2025-12-30 15:00:00', NULL, 1, 1, '2025-12-14 16:02:56', '2025-12-14 16:02:56'),
(10, 'Draft Pengumuman', 'Ini adalah pengumuman yang masih draft (inactive). Tidak akan muncul di public.', 'info', 'low', NULL, '2025-05-31 15:00:00', NULL, 0, 1, '2025-12-14 16:02:56', '2025-12-14 16:02:56');

-- --------------------------------------------------------

--
-- Struktur dari tabel `prodi`
--

CREATE TABLE `prodi` (
  `id` int(11) NOT NULL,
  `kode_prodi` varchar(10) NOT NULL,
  `nama_prodi` varchar(100) NOT NULL,
  `fakultas` varchar(100) NOT NULL,
  `jenjang` enum('D3','D4','S1','S2') DEFAULT 'S1',
  `kuota` int(11) DEFAULT 0,
  `biaya_pendaftaran` decimal(10,2) DEFAULT 0.00,
  `deskripsi` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `prodi`
--

INSERT INTO `prodi` (`id`, `kode_prodi`, `nama_prodi`, `fakultas`, `jenjang`, `kuota`, `biaya_pendaftaran`, `deskripsi`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'TI01', 'Teknik Informatika', 'Fakultas Teknik', 'S1', 100, 250000.00, NULL, 1, '2025-12-11 10:48:26', '2025-12-11 10:48:26'),
(2, 'SI01', 'Sistem Informasi', 'Fakultas Teknik', 'S1', 80, 250000.00, NULL, 1, '2025-12-11 10:48:26', '2025-12-11 10:48:26'),
(3, 'MN01', 'Manajemen', 'Fakultas Ekonomi', 'S1', 120, 200000.00, NULL, 1, '2025-12-11 10:48:26', '2025-12-11 10:48:26'),
(4, 'AK01', 'Akuntansi', 'Fakultas Ekonomi', 'S1', 100, 200000.00, NULL, 1, '2025-12-11 10:48:26', '2025-12-11 10:48:26');

-- --------------------------------------------------------

--
-- Struktur dari tabel `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `settings`
--

INSERT INTO `settings` (`id`, `setting_key`, `setting_value`, `description`, `updated_at`) VALUES
(1, 'app_name', 'PMB Online USNP', 'Nama Aplikasi', '2025-12-11 10:48:26'),
(2, 'tahun_akademik_aktif', '2025/2026', 'Tahun Akademik yang Sedang Dibuka', '2025-12-11 10:48:26'),
(3, 'batas_pendaftaran', '2025-08-30', 'Batas Akhir Pendaftaran', '2025-12-11 10:48:26'),
(4, 'email_admin', 'pmb@usnp.ac.id', 'Email Admin PMB', '2025-12-11 10:48:26'),
(5, 'max_file_size', '2097152', 'Maksimal ukuran file upload (2MB dalam bytes)', '2025-12-11 10:48:26');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','pendaftar') DEFAULT 'pendaftar',
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'admin@usnp.ac.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, '2026-03-10 15:40:26', '2025-12-11 10:48:25', '2026-03-10 15:40:26'),
(2, 'john.doe@example.com', '$2b$10$MD7fipBpOCIUf/CKvsxBHO3J7vdr6aK2peU9lKF4xHfTKedK4IKNq', 'pendaftar', 1, NULL, '2025-12-11 14:55:42', '2025-12-11 14:55:42'),
(3, 'mahasiswa@example.com', '$2b$10$L1J/XKn5BKZvnWJlVCiThOVQtoI.MUo6Tms3aRbIEKNVoqkxJS.pW', 'pendaftar', 1, '2025-12-13 09:27:09', '2025-12-13 08:53:32', '2025-12-13 09:27:09'),
(6, 'test@example.com', '$2b$10$GzDhKc4j7t4TmnlzxBATQ.gxmT5A.DlGw8vphuC4tjTdpGYUjjgxa', 'pendaftar', 1, '2026-03-10 15:42:48', '2025-12-14 23:14:10', '2026-03-10 15:42:48'),
(7, 'windikboson@gmail.com', '$2b$10$vHHTwSSEDgmbXvYKxA50iufyUhpQ0f4mp.Z659aK44N8b9WQq7PMW', 'pendaftar', 1, '2026-03-10 15:28:36', '2026-03-02 17:59:46', '2026-03-10 15:28:36'),
(8, 'wanimboroni@gmail.com', '$2b$10$DzdUrxHh7Jji2ZhHVUxvY.dH2m773nK5r/YaasZyNFFaE6ZnCgpWe', 'pendaftar', 1, '2026-03-10 14:19:21', '2026-03-08 17:12:47', '2026-03-10 14:19:21');

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `view_statistik_pendaftaran`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `view_statistik_pendaftaran` (
`nama_prodi` varchar(100)
,`fakultas` varchar(100)
,`kuota` int(11)
,`total_pendaftar` bigint(21)
,`submitted` decimal(22,0)
,`verified` decimal(22,0)
,`accepted` decimal(22,0)
,`rejected` decimal(22,0)
);

-- --------------------------------------------------------

--
-- Struktur untuk view `view_statistik_pendaftaran`
--
DROP TABLE IF EXISTS `view_statistik_pendaftaran`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_statistik_pendaftaran`  AS SELECT `p`.`nama_prodi` AS `nama_prodi`, `p`.`fakultas` AS `fakultas`, `p`.`kuota` AS `kuota`, count(`pd`.`id`) AS `total_pendaftar`, sum(case when `pd`.`status_pendaftaran` = 'submitted' then 1 else 0 end) AS `submitted`, sum(case when `pd`.`status_pendaftaran` = 'verified' then 1 else 0 end) AS `verified`, sum(case when `pd`.`status_pendaftaran` = 'accepted' then 1 else 0 end) AS `accepted`, sum(case when `pd`.`status_pendaftaran` = 'rejected' then 1 else 0 end) AS `rejected` FROM (`prodi` `p` left join `pendaftaran` `pd` on(`p`.`id` = `pd`.`prodi_id`)) WHERE `p`.`is_active` = 1 GROUP BY `p`.`id`, `p`.`nama_prodi`, `p`.`fakultas`, `p`.`kuota` ;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `berkas`
--
ALTER TABLE `berkas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `verified_by` (`verified_by`),
  ADD KEY `idx_pendaftaran` (`pendaftaran_id`),
  ADD KEY `idx_jenis` (`jenis_berkas`),
  ADD KEY `idx_status` (`status_verifikasi`);

--
-- Indeks untuk tabel `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indeks untuk tabel `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_pembayaran` (`kode_pembayaran`),
  ADD KEY `verified_by` (`verified_by`),
  ADD KEY `idx_kode` (`kode_pembayaran`),
  ADD KEY `idx_status` (`status_pembayaran`),
  ADD KEY `idx_pendaftaran` (`pendaftaran_id`);

--
-- Indeks untuk tabel `pendaftar`
--
ALTER TABLE `pendaftar`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `no_pendaftaran` (`no_pendaftaran`),
  ADD UNIQUE KEY `nik` (`nik`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_no_pendaftaran` (`no_pendaftaran`),
  ADD KEY `idx_nik` (`nik`);

--
-- Indeks untuk tabel `pendaftaran`
--
ALTER TABLE `pendaftaran`
  ADD PRIMARY KEY (`id`),
  ADD KEY `verified_by` (`verified_by`),
  ADD KEY `idx_pendaftar` (`pendaftar_id`),
  ADD KEY `idx_prodi` (`prodi_id`),
  ADD KEY `idx_status` (`status_pendaftaran`),
  ADD KEY `idx_tahun` (`tahun_akademik`);

--
-- Indeks untuk tabel `pengumuman`
--
ALTER TABLE `pengumuman`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_kategori` (`kategori`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_publish` (`tanggal_publish`);

--
-- Indeks untuk tabel `prodi`
--
ALTER TABLE `prodi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_prodi` (`kode_prodi`),
  ADD KEY `idx_kode` (`kode_prodi`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indeks untuk tabel `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `idx_key` (`setting_key`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `berkas`
--
ALTER TABLE `berkas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT untuk tabel `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `pembayaran`
--
ALTER TABLE `pembayaran`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `pendaftar`
--
ALTER TABLE `pendaftar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `pendaftaran`
--
ALTER TABLE `pendaftaran`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `pengumuman`
--
ALTER TABLE `pengumuman`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `prodi`
--
ALTER TABLE `prodi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `berkas`
--
ALTER TABLE `berkas`
  ADD CONSTRAINT `berkas_ibfk_1` FOREIGN KEY (`pendaftaran_id`) REFERENCES `pendaftaran` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `berkas_ibfk_2` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  ADD CONSTRAINT `log_aktivitas_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD CONSTRAINT `pembayaran_ibfk_1` FOREIGN KEY (`pendaftaran_id`) REFERENCES `pendaftaran` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pembayaran_ibfk_2` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `pendaftar`
--
ALTER TABLE `pendaftar`
  ADD CONSTRAINT `pendaftar_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `pendaftaran`
--
ALTER TABLE `pendaftaran`
  ADD CONSTRAINT `pendaftaran_ibfk_1` FOREIGN KEY (`pendaftar_id`) REFERENCES `pendaftar` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pendaftaran_ibfk_2` FOREIGN KEY (`prodi_id`) REFERENCES `prodi` (`id`),
  ADD CONSTRAINT `pendaftaran_ibfk_3` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `pengumuman`
--
ALTER TABLE `pengumuman`
  ADD CONSTRAINT `pengumuman_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
