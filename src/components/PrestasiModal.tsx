import React, { useState, useEffect } from 'react';
import { Prestasi, TingkatPrestasi, KategoriPrestasi, PeringkatJuara } from '../types';
import { DAFTAR_KELAS, TINGKAT_OPTIONS, KATEGORI_OPTIONS, PERINGKAT_OPTIONS } from '../data/initialData';
import { calculateDefaultPoints } from '../services/storageService';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

interface PrestasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prestasiData: Omit<Prestasi, 'id' | 'timestamp'> & { id?: string }) => void;
  initialData?: Prestasi | null;
}

export const PrestasiModal: React.FC<PrestasiModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const isEditing = Boolean(initialData);

  // Form states
  const [nisn, setNisn] = useState('');
  const [nis, setNis] = useState('');
  const [namaSiswa, setNamaSiswa] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [kelas, setKelas] = useState('7A');
  const [tahunAjaran, setTahunAjaran] = useState('2025/2026');

  const [namaLomba, setNamaLomba] = useState('');
  const [kategori, setKategori] = useState<KategoriPrestasi>('Sains & Matematika (OSN)');
  const [tingkat, setTingkat] = useState<TingkatPrestasi>('Kota');
  const [peringkat, setPeringkat] = useState<PeringkatJuara>('Juara 1');
  const [penyelenggara, setPenyelenggara] = useState('');
  const [tempatKegiatan, setTempatKegiatan] = useState('');
  const [tanggalKegiatan, setTanggalKegiatan] = useState(new Date().toISOString().split('T')[0]);
  const [guruPembina, setGuruPembina] = useState('');
  const [poinPrestasi, setPoinPrestasi] = useState(35);
  const [keterangan, setKeterangan] = useState('');

  // Certificate upload states
  const [namaFileSertifikat, setNamaFileSertifikat] = useState('');
  const [tipeFileSertifikat, setTipeFileSertifikat] = useState<'image/jpeg' | 'image/png' | 'application/pdf' | undefined>(undefined);
  const [ukuranFileSertifikat, setUkuranFileSertifikat] = useState<number | undefined>(undefined);
  const [sertifikatUrl, setSertifikatUrl] = useState<string | undefined>(undefined);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Reset or fill data when modal opens/changes
  useEffect(() => {
    if (initialData) {
      setNisn(initialData.nisn);
      setNis(initialData.nis);
      setNamaSiswa(initialData.namaSiswa);
      setJenisKelamin(initialData.jenisKelamin);
      setKelas(initialData.kelas);
      setTahunAjaran(initialData.tahunAjaran);
      setNamaLomba(initialData.namaLomba);
      setKategori(initialData.kategori);
      setTingkat(initialData.tingkat);
      setPeringkat(initialData.peringkat);
      setPenyelenggara(initialData.penyelenggara);
      setTempatKegiatan(initialData.tempatKegiatan);
      setTanggalKegiatan(initialData.tanggalKegiatan);
      setGuruPembina(initialData.guruPembina);
      setPoinPrestasi(initialData.poinPrestasi);
      setKeterangan(initialData.keterangan || '');
      setNamaFileSertifikat(initialData.namaFileSertifikat || '');
      setTipeFileSertifikat(initialData.tipeFileSertifikat);
      setUkuranFileSertifikat(initialData.ukuranFileSertifikat);
      setSertifikatUrl(initialData.sertifikatUrl);
    } else {
      setNisn('');
      setNis('');
      setNamaSiswa('');
      setJenisKelamin('L');
      setKelas('7A');
      setTahunAjaran('2025/2026');
      setNamaLomba('');
      setKategori('Sains & Matematika (OSN)');
      setTingkat('Kota');
      setPeringkat('Juara 1');
      setPenyelenggara('');
      setTempatKegiatan('');
      setTanggalKegiatan(new Date().toISOString().split('T')[0]);
      setGuruPembina('');
      setPoinPrestasi(calculateDefaultPoints('Kota', 'Juara 1'));
      setKeterangan('');
      setNamaFileSertifikat('');
      setTipeFileSertifikat(undefined);
      setUkuranFileSertifikat(undefined);
      setSertifikatUrl(undefined);
    }
    setUploadError(null);
  }, [initialData, isOpen]);

  // Recalculate points on level / rank change if user hasn't edited manually
  const handleTingkatChange = (newTingkat: TingkatPrestasi) => {
    setTingkat(newTingkat);
    setPoinPrestasi(calculateDefaultPoints(newTingkat, peringkat));
  };

  const handlePeringkatChange = (newPeringkat: PeringkatJuara) => {
    setPeringkat(newPeringkat);
    setPoinPrestasi(calculateDefaultPoints(tingkat, newPeringkat));
  };

  // Handle file input with 5 MB max limit as requested
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size <= 5 MB
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError(`Ukuran file (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal 5 MB.`);
      e.target.value = '';
      return;
    }

    // Check type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Format berkas tidak didukung. Harap unggah berkas PDF, JPG, atau PNG.');
      e.target.value = '';
      return;
    }

    setNamaFileSertifikat(file.name);
    setTipeFileSertifikat(file.type as any);
    setUkuranFileSertifikat(file.size);

    // Convert to data url for preview and local storage
    const reader = new FileReader();
    reader.onload = () => {
      setSertifikatUrl(reader.result as string);
    };
    reader.onerror = () => {
      setUploadError('Gagal membaca berkas file sertifikat.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setNamaFileSertifikat('');
    setTipeFileSertifikat(undefined);
    setUkuranFileSertifikat(undefined);
    setSertifikatUrl(undefined);
    setUploadError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nisn.trim() || !namaSiswa.trim() || !namaLomba.trim()) {
      alert('Mohon lengkapi kolom bertanda bintang (*) sebelum menyimpan.');
      return;
    }

    onSave({
      id: initialData?.id,
      nisn: nisn.trim(),
      nis: nis.trim(),
      namaSiswa: namaSiswa.trim(),
      jenisKelamin,
      kelas,
      tahunAjaran,
      namaLomba: namaLomba.trim(),
      kategori,
      tingkat,
      peringkat,
      penyelenggara: penyelenggara.trim(),
      tempatKegiatan: tempatKegiatan.trim(),
      tanggalKegiatan,
      guruPembina: guruPembina.trim(),
      poinPrestasi: Number(poinPrestasi) || 0,
      keterangan: keterangan.trim(),
      namaFileSertifikat: namaFileSertifikat || undefined,
      tipeFileSertifikat: tipeFileSertifikat || undefined,
      ukuranFileSertifikat: ukuranFileSertifikat || undefined,
      sertifikatUrl: sertifikatUrl || undefined,
      status: initialData?.status || 'Terverifikasi',
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isEditing ? 'Perbarui Data Prestasi Siswa' : 'Form Input Prestasi Siswa Online'}
            </h2>
            <p className="text-xs text-slate-500">
              SMP Negeri 1 Kota Pontianak · Data tersimpan otomatis
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Section 1: Data Identitas Siswa */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
              1. Identitas Siswa
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  NISN (10 Digit) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={nisn}
                  onChange={e => setNisn(e.target.value.replace(/\D/g, ''))}
                  placeholder="Contoh: 0098765431"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  NIS Sekolah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nis}
                  onChange={e => setNis(e.target.value)}
                  placeholder="Contoh: 232407001"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Kelas / Rombel <span className="text-rose-500">*</span>
                </label>
                <select
                  value={kelas}
                  onChange={e => setKelas(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {DAFTAR_KELAS.map(k => (
                    <option key={k} value={k}>Kelas {k}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaSiswa}
                  onChange={e => setNamaSiswa(e.target.value)}
                  placeholder="Nama lengkap sesuai data Dapodik / Rapor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Jenis Kelamin <span className="text-rose-500">*</span>
                </label>
                <select
                  value={jenisKelamin}
                  onChange={e => setJenisKelamin(e.target.value as 'L' | 'P')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="L">Laki-Laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Data Prestasi & Kejuaraan */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
              2. Rincian Prestasi & Kejuaraan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Lomba / Kejuaraan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaLomba}
                  onChange={e => setNamaLomba(e.target.value)}
                  placeholder="Contoh: Olimpiade Sains Nasional (OSN) SMP IPA"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Kategori Bidang <span className="text-rose-500">*</span>
                </label>
                <select
                  value={kategori}
                  onChange={e => setKategori(e.target.value as KategoriPrestasi)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {KATEGORI_OPTIONS.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Tingkat Kejuaraan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={tingkat}
                  onChange={e => handleTingkatChange(e.target.value as TingkatPrestasi)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {TINGKAT_OPTIONS.map(t => (
                    <option key={t} value={t}>Tingkat {t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Peringkat / Juara <span className="text-rose-500">*</span>
                </label>
                <select
                  value={peringkat}
                  onChange={e => handlePeringkatChange(e.target.value as PeringkatJuara)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {PERINGKAT_OPTIONS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Tanggal Pelaksanaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={tanggalKegiatan}
                  onChange={e => setTanggalKegiatan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">
                  Instansi Penyelenggara <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={penyelenggara}
                  onChange={e => setPenyelenggara(e.target.value)}
                  placeholder="Contoh: BPTI Kemendikbudristek / Disdikbud Pontianak"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Tempat / Lokasi Lomba
                </label>
                <input
                  type="text"
                  value={tempatKegiatan}
                  onChange={e => setTempatKegiatan(e.target.value)}
                  placeholder="Contoh: Gedung Kartini Pontianak / Daring"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">
                  Guru Pembimbing / Pembina
                </label>
                <input
                  type="text"
                  value={guruPembina}
                  onChange={e => setGuruPembina(e.target.value)}
                  placeholder="Nama guru pembina atau pelatih"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  value={tahunAjaran}
                  onChange={e => setTahunAjaran(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-medium text-slate-700 mb-1">
                  Catatan / Keterangan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={keterangan}
                  onChange={e => setKeterangan(e.target.value)}
                  placeholder="Misal: Catatan skor, kategori beregu/individu, nomor perlombaan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Unggah Berkas Sertifikat (Maksimal 5 MB) */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100 flex items-center justify-between">
              <span>3. Berkas Sertifikat Kejuaraan</span>
              <span className="text-[11px] font-normal text-slate-500 normal-case">
                Maks. 5 MB · PDF, JPG, PNG
              </span>
            </h3>

            {uploadError && (
              <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {namaFileSertifikat ? (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{namaFileSertifikat}</div>
                    <div className="text-[11px] text-slate-500">
                      {ukuranFileSertifikat ? `${(ukuranFileSertifikat / 1024).toFixed(1)} KB` : 'Berkas terlampir'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                  title="Hapus berkas sertifikat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  id="sertifikatFileInput"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="sertifikatFileInput"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <UploadCloud className="w-8 h-8 text-blue-600 mb-1.5" />
                  <span className="font-semibold text-blue-700 hover:text-blue-800">
                    Pilih Berkas Sertifikat
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Tarik file ke sini atau klik untuk mencari berkas (maks. 5 MB)
                  </span>
                </label>
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
          >
            {isEditing ? 'Simpan Perubahan' : 'Simpan Data Prestasi'}
          </button>
        </div>
      </div>
    </div>
  );
};
