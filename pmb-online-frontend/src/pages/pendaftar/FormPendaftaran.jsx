import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, BookOpen, Home, GraduationCap, CheckCircle,
  ChevronRight, ChevronLeft, AlertCircle, Loader
} from "lucide-react";
import { DashboardLayout } from "./Dashboard";
import { createPendaftaran, getProdiList } from "../../api/pendaftaranApi";

const STEPS = [
  { id: 1, label: "Data Pribadi",    icon: User },
  { id: 2, label: "Data Orang Tua",  icon: Home },
  { id: 3, label: "Data Pendidikan", icon: GraduationCap },
  { id: 4, label: "Pilih Prodi",     icon: BookOpen },
  { id: 5, label: "Konfirmasi",      icon: CheckCircle },
];

const JALUR_LIST   = ["Reguler", "Beasiswa Prestasi", "Beasiswa Tidak Mampu", "Kerjasama Instansi"];
const AGAMA_LIST   = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"];
const JK_LIST      = ["Laki-laki", "Perempuan"];
const PENGHASILAN  = [
  { value: "< 1jt",  label: "< Rp 1.000.000" },
  { value: "1-3jt",  label: "Rp 1.000.000 – Rp 3.000.000" },
  { value: "3-5jt",  label: "Rp 3.000.000 – Rp 5.000.000" },
  { value: "5-10jt", label: "Rp 5.000.000 – Rp 10.000.000" },
  { value: "> 10jt", label: "> Rp 10.000.000" },
];

const INIT = {
  // Step 1 - Data Pribadi
  nik: "", tempat_lahir: "", tanggal_lahir: "",
  jenis_kelamin: "", agama: "", no_hp: "",
  alamat: "", kabupaten: "", provinsi: "", kode_pos: "",
  // Step 2 - Data Orang Tua (sesuai backend: nama_ortu, pekerjaan_ortu, dll)
  nama_ortu: "", pekerjaan_ortu: "", penghasilan_ortu: "", no_hp_ortu: "",
  // Step 3 - Data Pendidikan
  asal_sekolah: "", npsn: "", jurusan_sekolah: "", tahun_lulus: "", nilai_rata_rata: "",
  // Step 4 - Prodi
  prodi_id: "", jalur_masuk: "",
};

// ─── Reusable components ───────────────────────────────────────────────────────
function Input({ label, required, error, ...props }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <input
        {...props}
        style={{
          width: "100%", padding: "10px 14px", fontSize: 13.5,
          border: `1.5px solid ${error ? "#fca5a5" : "#e2e8f0"}`,
          borderRadius: 10, outline: "none", color: "#1e293b",
          background: error ? "#fff5f5" : "#fff",
          boxSizing: "border-box", transition: "border-color 0.2s",
        }}
        onFocus={e => e.target.style.borderColor = "#6366f1"}
        onBlur={e => e.target.style.borderColor = error ? "#fca5a5" : "#e2e8f0"}
      />
      {error && (
        <div style={{ fontSize: 11.5, color: "#ef4444", marginTop: 5, display: "flex", gap: 4, alignItems: "center" }}>
          <AlertCircle size={12} /> {error}
        </div>
      )}
    </div>
  );
}

function Select({ label, required, error, options, placeholder, ...props }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <select
        {...props}
        style={{
          width: "100%", padding: "10px 14px", fontSize: 13.5,
          border: `1.5px solid ${error ? "#fca5a5" : "#e2e8f0"}`,
          borderRadius: 10, outline: "none", color: props.value ? "#1e293b" : "#9ca3af",
          background: "#fff", boxSizing: "border-box", cursor: "pointer",
        }}
      >
        <option value="">{placeholder || "-- Pilih --"}</option>
        {options.map(o => (
          <option key={typeof o === "object" ? o.value : o} value={typeof o === "object" ? o.value : o}>
            {typeof o === "object" ? o.label : o}
          </option>
        ))}
      </select>
      {error && (
        <div style={{ fontSize: 11.5, color: "#ef4444", marginTop: 5, display: "flex", gap: 4, alignItems: "center" }}>
          <AlertCircle size={12} /> {error}
        </div>
      )}
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>{children}</div>;
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 12.5, fontWeight: 700, color: "#6366f1",
      textTransform: "uppercase", letterSpacing: "0.06em",
      paddingBottom: 8, borderBottom: "1px solid #e0e7ff", marginBottom: 4,
    }}>{children}</div>
  );
}

// ─── Validasi per step ────────────────────────────────────────────────────────
function validate(step, form) {
  const err = {};
  if (step === 1) {
    if (!form.nik || form.nik.length !== 16)    err.nik          = "NIK harus 16 digit";
    if (!form.tempat_lahir.trim())              err.tempat_lahir = "Tempat lahir wajib diisi";
    if (!form.tanggal_lahir)                    err.tanggal_lahir= "Tanggal lahir wajib diisi";
    if (!form.jenis_kelamin)                    err.jenis_kelamin= "Jenis kelamin wajib dipilih";
    if (!form.agama)                            err.agama        = "Agama wajib dipilih";
    if (!form.no_hp || form.no_hp.length < 10) err.no_hp        = "No. HP tidak valid";
    if (!form.alamat.trim())                    err.alamat       = "Alamat wajib diisi";
    if (!form.kabupaten.trim())                 err.kabupaten    = "Kabupaten/Kota wajib diisi";
    if (!form.provinsi.trim())                  err.provinsi     = "Provinsi wajib diisi";
  }
  if (step === 2) {
    if (!form.nama_ortu.trim())      err.nama_ortu     = "Nama orang tua wajib diisi";
    if (!form.pekerjaan_ortu.trim()) err.pekerjaan_ortu= "Pekerjaan orang tua wajib diisi";
  }
  if (step === 3) {
    if (!form.asal_sekolah.trim())  err.asal_sekolah  = "Nama sekolah wajib diisi";
    if (!form.jurusan_sekolah.trim())err.jurusan_sekolah="Jurusan wajib diisi";
    if (!form.tahun_lulus)          err.tahun_lulus   = "Tahun lulus wajib diisi";
    if (!form.nilai_rata_rata)      err.nilai_rata_rata= "Nilai rata-rata wajib diisi";
    else if (parseFloat(form.nilai_rata_rata) < 0 || parseFloat(form.nilai_rata_rata) > 100)
      err.nilai_rata_rata = "Nilai harus antara 0-100";
  }
  if (step === 4) {
    if (!form.prodi_id)   err.prodi_id   = "Program studi wajib dipilih";
    if (!form.jalur_masuk)err.jalur_masuk= "Jalur masuk wajib dipilih";
  }
  return err;
}

// ─── Step Components ──────────────────────────────────────────────────────────
function Step1({ form, errors, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionTitle>Identitas Diri</SectionTitle>
      <Input label="NIK" required name="nik" value={form.nik}
        onChange={onChange} placeholder="16 digit NIK" maxLength={16} error={errors.nik} />
      <Row>
        <Input label="Tempat Lahir" required name="tempat_lahir" value={form.tempat_lahir}
          onChange={onChange} placeholder="Kota tempat lahir" error={errors.tempat_lahir} />
        <Input label="Tanggal Lahir" required type="date" name="tanggal_lahir"
          value={form.tanggal_lahir} onChange={onChange} error={errors.tanggal_lahir} />
      </Row>
      <Row>
        <Select label="Jenis Kelamin" required name="jenis_kelamin" value={form.jenis_kelamin}
          onChange={onChange} options={JK_LIST} error={errors.jenis_kelamin} />
        <Select label="Agama" required name="agama" value={form.agama}
          onChange={onChange} options={AGAMA_LIST} error={errors.agama} />
      </Row>
      <Input label="No. HP / WhatsApp" required name="no_hp" value={form.no_hp}
        onChange={onChange} placeholder="08xxxxxxxxxx" error={errors.no_hp} />
      <SectionTitle>Alamat</SectionTitle>
      <Input label="Alamat Lengkap" required name="alamat" value={form.alamat}
        onChange={onChange} placeholder="Jalan, RT/RW, Kelurahan, Kecamatan" error={errors.alamat} />
      <Row>
        <Input label="Kabupaten / Kota" required name="kabupaten" value={form.kabupaten}
          onChange={onChange} placeholder="Kabupaten/Kota" error={errors.kabupaten} />
        <Input label="Provinsi" required name="provinsi" value={form.provinsi}
          onChange={onChange} placeholder="Provinsi" error={errors.provinsi} />
      </Row>
      <Input label="Kode Pos" name="kode_pos" value={form.kode_pos}
        onChange={onChange} placeholder="Kode pos" maxLength={5} />
    </div>
  );
}

function Step2({ form, errors, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionTitle>Data Orang Tua / Wali</SectionTitle>
      <div style={{
        background: "#eff6ff", border: "1px solid #bfdbfe",
        borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#2563eb",
      }}>
        💡 Isi dengan data orang tua atau wali yang bertanggung jawab.
      </div>
      <Input label="Nama Orang Tua / Wali" required name="nama_ortu" value={form.nama_ortu}
        onChange={onChange} placeholder="Nama lengkap orang tua/wali" error={errors.nama_ortu} />
      <Row>
        <Input label="Pekerjaan" required name="pekerjaan_ortu" value={form.pekerjaan_ortu}
          onChange={onChange} placeholder="Pekerjaan orang tua" error={errors.pekerjaan_ortu} />
        <Input label="No. HP Orang Tua" name="no_hp_ortu" value={form.no_hp_ortu}
          onChange={onChange} placeholder="08xxxxxxxxxx" error={errors.no_hp_ortu} />
      </Row>
      <Select label="Penghasilan per Bulan" name="penghasilan_ortu" value={form.penghasilan_ortu}
        onChange={onChange} options={PENGHASILAN} />
    </div>
  );
}

function Step3({ form, errors, onChange }) {
  const tahunSekarang = new Date().getFullYear();
  const tahunOptions  = Array.from({ length: 10 }, (_, i) => String(tahunSekarang - i));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionTitle>Asal Sekolah</SectionTitle>
      <Input label="Nama Sekolah (SMA/SMK/MA)" required name="asal_sekolah"
        value={form.asal_sekolah} onChange={onChange}
        placeholder="Nama lengkap sekolah" error={errors.asal_sekolah} />
      <Row>
        <Input label="Jurusan / Program Keahlian" required name="jurusan_sekolah"
          value={form.jurusan_sekolah} onChange={onChange}
          placeholder="IPA / IPS / TKJ / dll" error={errors.jurusan_sekolah} />
        <Select label="Tahun Lulus" required name="tahun_lulus" value={form.tahun_lulus}
          onChange={onChange} options={tahunOptions}
          placeholder="-- Pilih Tahun --" error={errors.tahun_lulus} />
      </Row>
      <Input label="NPSN Sekolah" name="npsn" value={form.npsn}
        onChange={onChange} placeholder="Nomor Pokok Sekolah Nasional" maxLength={8} />
      <SectionTitle>Nilai Akademik</SectionTitle>
      <Input label="Nilai Rata-rata Rapor (Semester 1-5)" required
        type="number" min="0" max="100" step="0.01"
        name="nilai_rata_rata" value={form.nilai_rata_rata}
        onChange={onChange} placeholder="Contoh: 85.50" error={errors.nilai_rata_rata} />
      <div style={{
        background: "#eff6ff", border: "1px solid #bfdbfe",
        borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#2563eb",
      }}>
        💡 Nilai rata-rata dari semester 1 hingga 5 untuk semua mata pelajaran.
      </div>
    </div>
  );
}

function Step4({ form, errors, onChange, prodiList, loadingProdi }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionTitle>Pilih Program Studi</SectionTitle>

      {loadingProdi ? (
        <div style={{ textAlign: "center", padding: 24, color: "#94a3b8" }}>
          <Loader size={24} style={{ animation: "spin 0.8s linear infinite" }} />
          <div style={{ marginTop: 8, fontSize: 13 }}>Memuat daftar prodi...</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {prodiList.map(prodi => {
            const isSelected = String(form.prodi_id) === String(prodi.id);
            return (
              <button key={prodi.id} type="button"
                onClick={() => onChange({ target: { name: "prodi_id", value: String(prodi.id) } })}
                style={{
                  padding: "16px 18px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                  border: `2px solid ${isSelected ? "#6366f1" : "#e2e8f0"}`,
                  background: isSelected ? "#eef2ff" : "#fff",
                  transition: "all 0.18s",
                  boxShadow: isSelected ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 13.5, color: isSelected ? "#6366f1" : "#1e293b" }}>
                    {prodi.nama_prodi}
                  </span>
                  {isSelected && <CheckCircle size={18} color="#6366f1" />}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 20,
                    background: "#f1f5f9", color: "#64748b", fontWeight: 600,
                  }}>{prodi.jenjang}</span>
                  {prodi.akreditasi && (
                    <span style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 20,
                      background: prodi.akreditasi === "A" ? "#d1fae5" : "#fef3c7",
                      color: prodi.akreditasi === "A" ? "#059669" : "#d97706",
                      fontWeight: 600,
                    }}>Akreditasi {prodi.akreditasi}</span>
                  )}
                </div>
                {prodi.biaya_pendaftaran && (
                  <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 6 }}>
                    Biaya: Rp {Number(prodi.biaya_pendaftaran).toLocaleString("id")}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {errors.prodi_id && (
        <div style={{ fontSize: 12, color: "#ef4444", display: "flex", gap: 4, alignItems: "center" }}>
          <AlertCircle size={13} /> {errors.prodi_id}
        </div>
      )}

      <SectionTitle>Jalur Masuk</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {JALUR_LIST.map(jalur => {
          const isSelected = form.jalur_masuk === jalur;
          return (
            <button key={jalur} type="button"
              onClick={() => onChange({ target: { name: "jalur_masuk", value: jalur } })}
              style={{
                padding: "12px 16px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                border: `2px solid ${isSelected ? "#6366f1" : "#e2e8f0"}`,
                background: isSelected ? "#eef2ff" : "#fff",
                color: isSelected ? "#6366f1" : "#374151",
                fontWeight: isSelected ? 700 : 500, fontSize: 13,
                display: "flex", alignItems: "center", gap: 8, transition: "all 0.18s",
              }}
            >
              {isSelected && <CheckCircle size={15} color="#6366f1" />}
              {jalur}
            </button>
          );
        })}
      </div>
      {errors.jalur_masuk && (
        <div style={{ fontSize: 12, color: "#ef4444", display: "flex", gap: 4, alignItems: "center" }}>
          <AlertCircle size={13} /> {errors.jalur_masuk}
        </div>
      )}
    </div>
  );
}

function Step5({ form, prodiList }) {
  const prodi = prodiList.find(p => String(p.id) === String(form.prodi_id));
  const sections = [
    {
      title: "Data Pribadi",
      rows: [
        ["NIK",              form.nik],
        ["Tempat, Tgl Lahir",`${form.tempat_lahir}, ${form.tanggal_lahir}`],
        ["Jenis Kelamin",    form.jenis_kelamin],
        ["Agama",            form.agama],
        ["No. HP",           form.no_hp],
        ["Alamat",           `${form.alamat}, ${form.kabupaten}, ${form.provinsi}`],
      ],
    },
    {
      title: "Data Orang Tua",
      rows: [
        ["Nama Orang Tua",  form.nama_ortu],
        ["Pekerjaan",       form.pekerjaan_ortu],
        ["No. HP Ortu",     form.no_hp_ortu || "-"],
        ["Penghasilan",     form.penghasilan_ortu || "-"],
      ],
    },
    {
      title: "Data Pendidikan",
      rows: [
        ["Sekolah",         form.asal_sekolah],
        ["Jurusan",         form.jurusan_sekolah],
        ["Tahun Lulus",     form.tahun_lulus],
        ["NPSN",            form.npsn || "-"],
        ["Nilai Rata-rata", form.nilai_rata_rata],
      ],
    },
    {
      title: "Pilihan Prodi",
      rows: [
        ["Program Studi",   prodi?.nama_prodi || "-"],
        ["Jenjang",         prodi?.jenjang    || "-"],
        ["Jalur Masuk",     form.jalur_masuk],
      ],
    },
  ];

  return (
    <div>
      <div style={{
        background: "#eef2ff", border: "1px solid #c7d2fe",
        borderRadius: 12, padding: "16px 20px", marginBottom: 20,
        display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <AlertCircle size={18} color="#6366f1" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 13, color: "#4338ca", lineHeight: 1.6 }}>
          <strong>Periksa kembali data Anda.</strong> Data yang sudah disubmit tidak dapat diubah kecuali menghubungi admin.
        </div>
      </div>
      {sections.map(section => (
        <div key={section.title} style={{
          background: "#fff", borderRadius: 12, marginBottom: 12,
          border: "1px solid #f1f5f9", overflow: "hidden",
        }}>
          <div style={{
            background: "#f8fafc", padding: "10px 18px",
            fontWeight: 700, fontSize: 11.5, color: "#6366f1",
            textTransform: "uppercase", letterSpacing: "0.05em",
            borderBottom: "1px solid #f1f5f9",
          }}>{section.title}</div>
          {section.rows.map(([label, value]) => (
            <div key={label} style={{
              display: "flex", gap: 16, padding: "10px 18px",
              borderBottom: "1px solid #f8fafc",
            }}>
              <span style={{ width: 170, fontSize: 12.5, color: "#94a3b8", fontWeight: 500, flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 600 }}>{value || "-"}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FormPendaftaran() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState(INIT);
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [done, setDone]         = useState(false);
  const [nomorPendaftaran, setNomorPendaftaran] = useState("");

  // Prodi dari backend
  const [prodiList, setProdiList]     = useState([]);
  const [loadingProdi, setLoadingProdi] = useState(false);

  // Fetch prodi saat step 4
  useEffect(() => {
    if (step === 4 && prodiList.length === 0) {
      setLoadingProdi(true);
      getProdiList()
        .then(data => setProdiList(Array.isArray(data) ? data : []))
        .catch(() => setProdiList([]))
        .finally(() => setLoadingProdi(false));
    }
  }, [step]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => { const n = {...prev}; delete n[name]; return n; });
    if (apiError) setApiError("");
  };

  const handleNext = () => {
    const err = validate(step, form);
    if (Object.keys(err).length > 0) { setErrors(err); return; }
    setErrors({});
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setErrors({});
    setApiError("");
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setApiError("");
    try {
      // Kirim semua field sesuai yang diterima backend
      const payload = {
        prodi_id:       parseInt(form.prodi_id),
        jalur_masuk:    form.jalur_masuk,
        // Data pendidikan
        asal_sekolah:   form.asal_sekolah,
        npsn:           form.npsn,
        jurusan_sekolah:form.jurusan_sekolah,
        tahun_lulus:    form.tahun_lulus,
        nilai_rata_rata:parseFloat(form.nilai_rata_rata),
        // Data pribadi (update pendaftar)
        nik:            form.nik,
        tempat_lahir:   form.tempat_lahir,
        tanggal_lahir:  form.tanggal_lahir,
        jenis_kelamin:  form.jenis_kelamin,
        agama:          form.agama,
        alamat:         form.alamat,
        kabupaten:      form.kabupaten,
        provinsi:       form.provinsi,
        kode_pos:       form.kode_pos,
        no_hp:          form.no_hp,
        // Data orang tua
        nama_ortu:      form.nama_ortu,
        pekerjaan_ortu: form.pekerjaan_ortu,
        penghasilan_ortu:form.penghasilan_ortu,
        no_hp_ortu:     form.no_hp_ortu,
      };

      const result = await createPendaftaran(payload);
      setNomorPendaftaran(result?.no_pendaftaran || result?.nomor_pendaftaran || "");
      setDone(true);
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal submit pendaftaran, coba lagi.";
      setApiError(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <DashboardLayout activePage="pendaftaran">
        <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center", paddingTop: 40 }}>
          <div style={{
            width: 88, height: 88, borderRadius: "50%",
            background: "linear-gradient(135deg,#10b981,#059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 8px 32px rgba(16,185,129,0.35)",
          }}>
            <CheckCircle size={44} color="#fff" strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
            Pendaftaran Berhasil! 🎉
          </h2>
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24, lineHeight: 1.7 }}>
            Data pendaftaran Anda sudah diterima. Silakan lanjut upload berkas dan lakukan pembayaran.
          </p>
          {nomorPendaftaran && (
            <div style={{
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: 14, padding: "18px 24px", marginBottom: 28,
            }}>
              <div style={{ fontSize: 12, color: "#059669", fontWeight: 600, marginBottom: 6 }}>
                Nomor Pendaftaran Anda
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#065f46", letterSpacing: "0.06em" }}>
                {nomorPendaftaran}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                Simpan nomor ini untuk keperluan selanjutnya
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => navigate("/pendaftar/upload-berkas")} style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
              border: "none", borderRadius: 12, padding: "13px 24px",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
            }}>
              Upload Berkas →
            </button>
            <button onClick={() => navigate("/pendaftar/dashboard")} style={{
              background: "#f1f5f9", color: "#64748b", border: "none",
              borderRadius: 12, padding: "13px 24px", fontSize: 14,
              fontWeight: 600, cursor: "pointer",
            }}>
              Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout activePage="pendaftaran">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Form Pendaftaran</h2>
        <p style={{ fontSize: 13.5, color: "#64748b" }}>Isi semua data dengan benar dan lengkap.</p>
      </div>

      {/* API Error */}
      {apiError && (
        <div style={{
          background: "#fee2e2", border: "1px solid #fca5a5",
          borderRadius: 10, padding: "12px 16px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 10,
          fontSize: 13, color: "#dc2626",
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          {apiError}
        </div>
      )}

      {/* Step Indicator */}
      <div style={{
        background: "#fff", borderRadius: 16, padding: "20px 24px",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
        marginBottom: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {STEPS.map((s, i) => {
            const done   = step > s.id;
            const active = step === s.id;
            const Icon   = s.icon;
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: done ? "#6366f1" : active ? "#fff" : "#f1f5f9",
                    border: `2px solid ${done || active ? "#6366f1" : "#e2e8f0"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: active ? "0 0 0 4px rgba(99,102,241,0.15)" : "none",
                    transition: "all 0.3s",
                  }}>
                    {done
                      ? <CheckCircle size={18} color="#fff" strokeWidth={2.5} />
                      : <Icon size={16} color={active ? "#6366f1" : "#94a3b8"} strokeWidth={active ? 2.2 : 1.8} />
                    }
                  </div>
                  <span style={{
                    fontSize: 10.5, fontWeight: active ? 700 : 500,
                    color: done || active ? "#6366f1" : "#94a3b8", whiteSpace: "nowrap",
                  }}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: 2, margin: "0 6px", marginBottom: 20,
                    background: done ? "#6366f1" : "#e2e8f0",
                    borderRadius: 2, transition: "background 0.3s",
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <div style={{
        background: "#fff", borderRadius: 16, padding: "28px 32px",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
        marginBottom: 24,
      }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 22 }}>
          Langkah {step} — {STEPS[step - 1]?.label}
        </div>
        {step === 1 && <Step1 form={form} errors={errors} onChange={onChange} />}
        {step === 2 && <Step2 form={form} errors={errors} onChange={onChange} />}
        {step === 3 && <Step3 form={form} errors={errors} onChange={onChange} />}
        {step === 4 && <Step4 form={form} errors={errors} onChange={onChange} prodiList={prodiList} loadingProdi={loadingProdi} />}
        {step === 5 && <Step5 form={form} prodiList={prodiList} />}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={step === 1 ? () => navigate("/pendaftar/dashboard") : handleBack}
          style={{
            background: "#f1f5f9", color: "#64748b", border: "none",
            borderRadius: 12, padding: "13px 24px", fontSize: 14,
            fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
          }}>
          <ChevronLeft size={17} /> {step === 1 ? "Batal" : "Kembali"}
        </button>

        <span style={{ fontSize: 12.5, color: "#94a3b8" }}>
          Langkah <strong style={{ color: "#6366f1" }}>{step}</strong> dari {STEPS.length}
        </span>

        {step < 5 ? (
          <button onClick={handleNext} style={{
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
            border: "none", borderRadius: 12, padding: "13px 28px",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
          }}>
            Lanjut <ChevronRight size={17} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} style={{
            background: submitting ? "#e2e8f0" : "linear-gradient(135deg,#10b981,#059669)",
            color: submitting ? "#94a3b8" : "#fff",
            border: "none", borderRadius: 12, padding: "13px 28px",
            fontSize: 14, fontWeight: 700,
            cursor: submitting ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: submitting ? "none" : "0 4px 14px rgba(16,185,129,0.4)",
            transition: "all 0.2s",
          }}>
            {submitting
              ? <><Loader size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Menyimpan...</>
              : <>✓ Submit Pendaftaran</>}
          </button>
        )}
      </div>
    </DashboardLayout>
  );
}