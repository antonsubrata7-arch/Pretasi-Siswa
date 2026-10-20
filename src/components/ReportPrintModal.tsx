import React, { useState, useMemo } from 'react';
import { Prestasi } from '../types';
import { Printer, X, Download, Filter } from 'lucide-react';

interface ReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  allData: Prestasi[];
}

export const ReportPrintModal: React.FC<ReportPrintModalProps> = ({
  isOpen,
  onClose,
  allData,
}) => {
  const [filterKelas, setFilterKelas] = useState('ALL');
  const [filterTingkat, setFilterTingkat] = useState('ALL');
  const [filterTahun, setFilterTahun] = useState('2025/2026');

  const filteredData = useMemo(() => {
    return allData.filter(item => {
      if (filterKelas !== 'ALL') {
        if (filterKelas === '7' && !item.kelas.startsWith('7')) return false;
        if (filterKelas === '8' && !item.kelas.startsWith('8')) return false;
        if (filterKelas === '9' && !item.kelas.startsWith('9')) return false;
        if (filterKelas.length > 1 && item.kelas !== filterKelas) return false;
      }
      if (filterTingkat !== 'ALL' && item.tingkat !== filterTingkat) {
        return false;
      }
      if (filterTahun && item.tahunAjaran !== filterTahun) {
        return false;
      }
      return true;
    });
  }, [allData, filterKelas, filterTingkat, filterTahun]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const totalPoints = filteredData.reduce((acc, curr) => acc + (curr.poinPrestasi || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[96vh] my-4 border border-slate-300">
        {/* Top Control Bar (Hidden when printing via .no-print) */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Pratinjau Cetak Laporan Resmi Prestasi Siswa
            </h2>
            <p className="text-xs text-slate-500">
              Format kedinasan standar SMP Negeri 1 Kota Pontianak untuk pencetakan fisik atau ekspor PDF
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar (Hidden when printing via .no-print) */}
        <div className="no-print px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Filter Jenjang Kelas:</span>
            <select
              value={filterKelas}
              onChange={e => setFilterKelas(e.target.value)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
            >
              <option value="ALL">Semua Kelas (7, 8, 9)</option>
              <option value="7">Hanya Kelas 7</option>
              <option value="8">Hanya Kelas 8</option>
              <option value="9">Hanya Kelas 9</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Tingkat:</span>
            <select
              value={filterTingkat}
              onChange={e => setFilterTingkat(e.target.value)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
            >
              <option value="ALL">Semua Tingkat</option>
              <option value="Internasional">Internasional</option>
              <option value="Nasional">Nasional</option>
              <option value="Provinsi">Provinsi</option>
              <option value="Kota">Kota</option>
              <option value="Kecamatan">Kecamatan</option>
              <option value="Sekolah">Sekolah</option>
            </select>
          </div>

          <div className="ml-auto text-slate-500 font-mono">
            {filteredData.length} data ditemukan
          </div>
        </div>

        {/* Printable Paper Area (Styled like an A4 document) */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-white text-black font-sans printable-document">
          {/* Official Kop Surat */}
          <div className="text-center pb-3 border-b-4 border-double border-black">
            <h4 className="text-xs font-semibold tracking-wider uppercase leading-tight">
              Pemerintah Kota Pontianak
            </h4>
            <h3 className="text-sm font-bold tracking-wider uppercase leading-tight">
              Dinas Pendidikan dan Kebudayaan
            </h3>
            <h2 className="text-lg font-black tracking-wide uppercase leading-tight text-blue-950 mt-0.5">
              SMP Negeri 1 Kota Pontianak
            </h2>
            <p className="text-[11px] text-slate-600 leading-tight mt-1">
              Jalan Jenderal Urip No. 1, Kel. Tengah, Kec. Pontianak Kota, Kota Pontianak, Kalimantan Barat 78111
            </p>
            <p className="text-[10px] text-slate-500 leading-tight">
              Telepon: (0561) 734005 · Pos-el: info@smpn1pontianak.sch.id · Laman: smpn1pontianak.sch.id
            </p>
          </div>

          {/* Document Title */}
          <div className="text-center my-6">
            <h1 className="text-base font-bold uppercase tracking-wider underline">
              Laporan Rekapitulasi Prestasi Siswa
            </h1>
            <p className="text-xs font-medium mt-1">
              Tahun Ajaran {filterTahun} · {filterKelas === 'ALL' ? 'Semua Jenjang' : `Kelas ${filterKelas}`}
            </p>
          </div>

          {/* Table */}
          <div className="mt-4">
            <table className="w-full text-[11px] border border-black border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-black text-center font-bold">
                  <th className="border border-black py-2 px-1.5 w-8">No</th>
                  <th className="border border-black py-2 px-2 text-left">Nama Siswa / NISN</th>
                  <th className="border border-black py-2 px-1.5 w-12">Kelas</th>
                  <th className="border border-black py-2 px-2 text-left">Nama Kejuaraan & Penyelenggara</th>
                  <th className="border border-black py-2 px-1.5 w-20">Tingkat</th>
                  <th className="border border-black py-2 px-1.5 w-20">Peringkat</th>
                  <th className="border border-black py-2 px-1.5 w-18">Tanggal</th>
                  <th className="border border-black py-2 px-1.5 w-12 text-right">Poin</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-500 italic border border-black">
                      Tidak ada data prestasi yang memenuhi kriteria filter.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, idx) => (
                    <tr key={item.id} className="border-b border-black">
                      <td className="border border-black py-1.5 px-1 text-center font-mono">
                        {idx + 1}
                      </td>
                      <td className="border border-black py-1.5 px-2">
                        <strong className="block">{item.namaSiswa}</strong>
                        <span className="text-[10px] text-slate-600 font-mono">NISN: {item.nisn}</span>
                      </td>
                      <td className="border border-black py-1.5 px-1.5 text-center font-semibold">
                        {item.kelas}
                      </td>
                      <td className="border border-black py-1.5 px-2">
                        <div className="font-semibold">{item.namaLomba}</div>
                        <div className="text-[10px] text-slate-600">{item.penyelenggara}</div>
                      </td>
                      <td className="border border-black py-1.5 px-1.5 text-center">
                        {item.tingkat}
                      </td>
                      <td className="border border-black py-1.5 px-1.5 text-center font-semibold">
                        {item.peringkat}
                      </td>
                      <td className="border border-black py-1.5 px-1.5 text-center font-mono text-[10px]">
                        {item.tanggalKegiatan}
                      </td>
                      <td className="border border-black py-1.5 px-1.5 text-right font-mono font-bold">
                        {item.poinPrestasi}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t border-black">
                  <td colSpan={7} className="border border-black py-2 px-3 text-right">
                    Total Akumulasi Poin Prestasi:
                  </td>
                  <td className="border border-black py-2 px-1.5 text-right font-mono">
                    {totalPoints}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Official Signature Block */}
          <div className="mt-10 pt-4 flex items-start justify-between text-xs leading-relaxed break-inside-avoid">
            {/* Left Signature: Pembina Kesiswaan */}
            <div className="text-center w-64">
              <p>Mengetahui,</p>
              <p className="font-semibold">Pembina Kesiswaan SMPN 1 Pontianak</p>
              <div className="h-20"></div>
              <p className="font-bold underline">Dra. Hj. Sri Wahyuni, M.Pd.</p>
              <p className="text-[10px] font-mono text-slate-700">NIP. 19680512 199412 2 001</p>
            </div>

            {/* Right Signature: Kepala Sekolah */}
            <div className="text-center w-64">
              <p>Pontianak, {currentDateFormatted}</p>
              <p className="font-semibold">Kepala SMP Negeri 1 Pontianak</p>
              <div className="h-20"></div>
              <p className="font-bold underline">Dr. H. Edy Sutrisno, M.Pd.</p>
              <p className="text-[10px] font-mono text-slate-700">NIP. 19710315 199702 1 003</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
