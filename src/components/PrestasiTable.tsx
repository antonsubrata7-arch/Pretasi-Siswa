import React, { useState, useMemo } from 'react';
import { Prestasi, TingkatPrestasi, KategoriPrestasi } from '../types';
import { DAFTAR_KELAS, TINGKAT_OPTIONS, KATEGORI_OPTIONS } from '../data/initialData';
import { 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  X,
  RotateCcw
} from 'lucide-react';

interface PrestasiTableProps {
  data: Prestasi[];
  onOpenCreate: () => void;
  onEdit: (item: Prestasi) => void;
  onDelete: (id: string) => void;
  onClearAll?: () => void;
  onSelectDetail: (item: Prestasi) => void;
  onOpenReportPrint: () => void;
  onExportCsv: (filteredData: Prestasi[]) => void;
  initialFilters?: { tingkat?: string; kategori?: string; kelas?: string };
}

export const PrestasiTable: React.FC<PrestasiTableProps> = ({
  data,
  onOpenCreate,
  onEdit,
  onDelete,
  onClearAll,
  onSelectDetail,
  onOpenReportPrint,
  onExportCsv,
  initialFilters,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelas, setSelectedKelas] = useState(initialFilters?.kelas || 'ALL');
  const [selectedTingkat, setSelectedTingkat] = useState(initialFilters?.tingkat || 'ALL');
  const [selectedKategori, setSelectedKategori] = useState(initialFilters?.kategori || 'ALL');
  const [selectedSertifikat, setSelectedSertifikat] = useState<'ALL' | 'WITH' | 'WITHOUT'>('ALL');

  // Deletion confirm states
  const [deleteIdConfirm, setDeleteIdConfirm] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = item.namaSiswa.toLowerCase().includes(query);
        const matchNisn = item.nisn.toLowerCase().includes(query);
        const matchNis = item.nis.toLowerCase().includes(query);
        const matchLomba = item.namaLomba.toLowerCase().includes(query);
        const matchPembina = item.guruPembina.toLowerCase().includes(query);
        const matchPenyelenggara = item.penyelenggara.toLowerCase().includes(query);
        if (!matchName && !matchNisn && !matchNis && !matchLomba && !matchPembina && !matchPenyelenggara) {
          return false;
        }
      }

      // Kelas filter
      if (selectedKelas !== 'ALL') {
        if (selectedKelas === 'KELAS_7') {
          if (!item.kelas.startsWith('7')) return false;
        } else if (selectedKelas === 'KELAS_8') {
          if (!item.kelas.startsWith('8')) return false;
        } else if (selectedKelas === 'KELAS_9') {
          if (!item.kelas.startsWith('9')) return false;
        } else if (item.kelas !== selectedKelas) {
          return false;
        }
      }

      // Tingkat filter
      if (selectedTingkat !== 'ALL' && item.tingkat !== selectedTingkat) {
        return false;
      }

      // Kategori filter
      if (selectedKategori !== 'ALL' && item.kategori !== selectedKategori) {
        return false;
      }

      // Sertifikat filter
      if (selectedSertifikat === 'WITH') {
        if (!item.namaFileSertifikat && !item.sertifikatUrl) return false;
      } else if (selectedSertifikat === 'WITHOUT') {
        if (item.namaFileSertifikat || item.sertifikatUrl) return false;
      }

      return true;
    });
  }, [data, searchQuery, selectedKelas, selectedTingkat, selectedKategori, selectedSertifikat]);

  const hasActiveFilters = 
    searchQuery.trim() !== '' || 
    selectedKelas !== 'ALL' || 
    selectedTingkat !== 'ALL' || 
    selectedKategori !== 'ALL' || 
    selectedSertifikat !== 'ALL';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedKelas('ALL');
    setSelectedTingkat('ALL');
    setSelectedKategori('ALL');
    setSelectedSertifikat('ALL');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Database Prestasi Siswa
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>SMP Negeri 1 Kota Pontianak</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums font-semibold text-slate-700">
                {filteredData.length} dari {data.length} data ditampilkan
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {data.length > 0 && onClearAll && (
              <button
                onClick={() => setShowClearAllConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
                title="Hapus semua isi pada data prestasi"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Kosongkan Semua Data</span>
              </button>
            )}

            <button
              onClick={() => onExportCsv(filteredData)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
              title="Ekspor data saat ini ke format CSV yang kompatibel dengan Microsoft Excel"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Ekspor CSV (Excel)</span>
            </button>

            <button
              onClick={onOpenReportPrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
              title="Cetak Laporan Rekapitulasi Resmi dengan Kop Surat SMPN 1 Pontianak"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Cetak Laporan PDF</span>
            </button>

            <button
              onClick={onOpenCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Input Prestasi</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls Grid */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari siswa, NISN, lomba, atau pembina..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Kelas */}
          <div>
            <select
              value={selectedKelas}
              onChange={e => setSelectedKelas(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">Semua Kelas</option>
              <option value="KELAS_7">Semua Kelas 7 (7A - 7I)</option>
              <option value="KELAS_8">Semua Kelas 8 (8A - 8I)</option>
              <option value="KELAS_9">Semua Kelas 9 (9A - 9I)</option>
              <optgroup label="Spesifik Rombel">
                {DAFTAR_KELAS.map(k => (
                  <option key={k} value={k}>Kelas {k}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Filter Tingkat */}
          <div>
            <select
              value={selectedTingkat}
              onChange={e => setSelectedTingkat(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">Semua Tingkat</option>
              {TINGKAT_OPTIONS.map(t => (
                <option key={t} value={t}>Tingkat {t}</option>
              ))}
            </select>
          </div>

          {/* Filter Kategori */}
          <div>
            <select
              value={selectedKategori}
              onChange={e => setSelectedKategori(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">Semua Kategori</option>
              {KATEGORI_OPTIONS.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Chips & Reset Bar */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Filter sedang aktif</span>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-800"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Semua Filter</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="py-16 text-center px-4">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">
              {data.length === 0 ? 'Belum Ada Data Prestasi Siswa' : 'Data Prestasi Tidak Ditemukan'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {data.length === 0
                ? 'Seluruh data prestasi saat ini kosong. Klik tombol di bawah untuk mulai menginput data prestasi baru.'
                : 'Tidak ada data prestasi yang cocok dengan kriteria pencarian atau filter yang dipilih.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Reset Filter
                </button>
              )}
              <button
                onClick={onOpenCreate}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
              >
                + Input Prestasi Baru
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                  <th className="py-3 px-3 w-12 text-center">No</th>
                  <th className="py-3 px-3">Identitas Siswa</th>
                  <th className="py-3 px-3">Kejuaraan & Kategori</th>
                  <th className="py-3 px-3">Tingkat</th>
                  <th className="py-3 px-3">Peringkat</th>
                  <th className="py-3 px-3">Penyelenggara & Tanggal</th>
                  <th className="py-3 px-3 text-center">Sertifikat</th>
                  <th className="py-3 px-3 text-right">Poin</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredData.map((item, index) => {
                  const hasCertificate = Boolean(item.namaFileSertifikat || item.sertifikatUrl);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* No */}
                      <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-400">
                        {index + 1}
                      </td>

                      {/* Identitas Siswa */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 leading-snug">
                          {item.namaSiswa}
                        </div>
                        <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-slate-700">Kelas {item.kelas}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">NISN: {item.nisn}</span>
                        </div>
                      </td>

                      {/* Kejuaraan & Kategori */}
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-medium text-slate-900 line-clamp-1" title={item.namaLomba}>
                          {item.namaLomba}
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          {item.kategori}
                        </div>
                      </td>

                      {/* Tingkat */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-medium text-slate-800">
                          {item.tingkat}
                        </span>
                      </td>

                      {/* Peringkat */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold text-blue-900">
                          {item.peringkat}
                        </span>
                      </td>

                      {/* Penyelenggara & Tanggal */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-slate-700 truncate max-w-[180px]" title={item.penyelenggara}>
                          {item.penyelenggara}
                        </div>
                        <div className="text-slate-400 font-mono tabular-nums mt-0.5">
                          {item.tanggalKegiatan}
                        </div>
                      </td>

                      {/* Sertifikat */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {hasCertificate ? (
                          <button
                            onClick={() => onSelectDetail(item)}
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium py-0.5 px-2 rounded hover:bg-emerald-50 transition-colors"
                            title={item.namaFileSertifikat || 'Lihat Sertifikat'}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Ada</span>
                          </button>
                        ) : (
                          <span className="text-slate-400">
                            -
                          </span>
                        )}
                      </td>

                      {/* Poin */}
                      <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                        {item.poinPrestasi}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectDetail(item)}
                            className="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors"
                            title="Lihat Detail Lengkap"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEdit(item)}
                            className="p-1 text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded transition-colors"
                            title="Edit Data Prestasi"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteIdConfirm(item.id)}
                            className="p-1 text-slate-500 hover:text-rose-700 hover:bg-slate-100 rounded transition-colors"
                            title="Hapus Data Prestasi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>Menampilkan {filteredData.length} catatan prestasi</span>
          <span className="font-mono tabular-nums">
            Total Nilai Poin: {filteredData.reduce((acc, curr) => acc + (curr.poinPrestasi || 0), 0)}
          </span>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteIdConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Data</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus data prestasi dengan ID <strong className="font-mono">{deleteIdConfirm}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteIdConfirm(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDelete(deleteIdConfirm);
                  setDeleteIdConfirm(null);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Dialog */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Kosongkan Semua Data Prestasi?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Tindakan ini akan menghapus seluruh catatan data prestasi siswa ({data.length} item) yang tersimpan di sistem.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (onClearAll) onClearAll();
                  setShowClearAllConfirm(false);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Ya, Kosongkan Semua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
