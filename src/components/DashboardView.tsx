import React from 'react';
import { Prestasi } from '../types';
import { Trophy, Award, TrendingUp, Users, Calendar, ArrowRight, ShieldCheck, FileCheck } from 'lucide-react';

interface DashboardViewProps {
  data: Prestasi[];
  onNavigateToTable: (filterParams?: { tingkat?: string; kategori?: string; kelas?: string }) => void;
  onOpenCreate: () => void;
  onSelectPrestasi: (item: Prestasi) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onNavigateToTable,
  onOpenCreate,
  onSelectPrestasi,
}) => {
  // Quantitative summaries
  const totalPrestasi = data.length;
  const tingkatNasionalInternasional = data.filter(
    d => d.tingkat === 'Nasional' || d.tingkat === 'Internasional'
  ).length;
  const totalPoin = data.reduce((acc, curr) => acc + (curr.poinPrestasi || 0), 0);
  const uniqueStudents = new Set(data.map(d => d.nisn)).size;
  const totalDenganSertifikat = data.filter(d => Boolean(d.namaFileSertifikat || d.sertifikatUrl)).length;

  // Breakdown by Tingkat
  const tingkatOrder = ['Internasional', 'Nasional', 'Provinsi', 'Kota', 'Kecamatan', 'Sekolah'];
  const countByTingkat = tingkatOrder.map(tingkat => ({
    tingkat,
    count: data.filter(d => d.tingkat === tingkat).length,
    percentage: totalPrestasi > 0 ? Math.round((data.filter(d => d.tingkat === tingkat).length / totalPrestasi) * 100) : 0,
  }));

  // Breakdown by Kategori
  const kategoriList = [
    'Sains & Matematika (OSN)',
    'Seni & Budaya (FLS2N)',
    'Olahraga (O2SN)',
    'Bahasa & Sastra',
    'Teknologi & Robotika',
    'Keagamaan (MTQ/Pentas PAI)',
    'Kepemimpinan & Pramuka',
  ];

  const countByKategori = kategoriList.map(kat => ({
    kategori: kat,
    count: data.filter(d => d.kategori === kat).length,
  })).sort((a, b) => b.count - a.count);

  // Top Students leaderboard by total points
  const studentMap = new Map<string, { nama: string; kelas: string; nisn: string; totalPoin: number; count: number }>();
  data.forEach(item => {
    const existing = studentMap.get(item.nisn);
    if (existing) {
      existing.totalPoin += item.poinPrestasi || 0;
      existing.count += 1;
    } else {
      studentMap.set(item.nisn, {
        nama: item.namaSiswa,
        kelas: item.kelas,
        nisn: item.nisn,
        totalPoin: item.poinPrestasi || 0,
        count: 1,
      });
    }
  });

  const topStudents = Array.from(studentMap.values())
    .sort((a, b) => b.totalPoin - a.totalPoin)
    .slice(0, 5);

  const recentList = [...data].slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Hero Welcome & Brief Intro */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold text-blue-700 tracking-wide uppercase">
            Sistem Informasi Kesiswaan
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
            Rekapitulasi Prestasi Siswa SMP Negeri 1 Pontianak
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Pencatatan resmi prestasi akademik dan non-akademik siswa terpusat dengan integrasi Google Sheets dan Google Drive. Mendukung validasi sertifikat, ekspor CSV Excel, dan laporan resmi ber-kop surat.
          </p>
        </div>

        {/* 4 Quantitative Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Total Prestasi</span>
              <Trophy className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {totalPrestasi}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Tercatat di sistem</span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Nasional & Global</span>
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {tingkatNasionalInternasional}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Tingkat tertinggi</span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Siswa Berprestasi</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {uniqueStudents}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Individu terdaftar</span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Akumulasi Poin</span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {totalPoin}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Bobot prestasi</span>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Tingkat Breakdown + Top Students Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Capaian Berdasarkan Tingkat Kejuaraan */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Distribusi Tingkat Kejuaraan</h2>
              <p className="text-xs text-slate-500 mt-0.5">Klasifikasi jenjang kompetisi yang diraih siswa</p>
            </div>
            <button
              onClick={() => onNavigateToTable()}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              Lihat Detail
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {countByTingkat.map(item => (
              <div 
                key={item.tingkat}
                onClick={() => onNavigateToTable({ tingkat: item.tingkat })}
                className="group cursor-pointer p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                    Tingkat {item.tingkat}
                  </span>
                  <div className="flex items-center gap-2 font-mono tabular-nums text-slate-500">
                    <span className="font-bold text-slate-900">{item.count} Prestasi</span>
                    <span className="text-slate-400">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-300 bg-blue-600"
                    style={{ width: `${Math.max(item.percentage, item.count > 0 ? 5 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              Sertifikat terunggah: <strong className="text-slate-800 font-mono tabular-nums">{totalDenganSertifikat}</strong> dari {totalPrestasi}
            </span>
            <span className="text-slate-400">SMPN 1 Pontianak</span>
          </div>
        </div>

        {/* Right: Leaderboard Siswa Berprestasi */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Siswa Berprestasi Teratas</h2>
              <p className="text-xs text-slate-500 mt-0.5">Berdasarkan total akumulasi poin prestasi</p>
            </div>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>

          {topStudents.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Belum ada data siswa berprestasi yang tercatat.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {topStudents.map((siswa, idx) => (
                <div 
                  key={siswa.nisn} 
                  onClick={() => onNavigateToTable({ kelas: siswa.kelas })}
                  className="py-3 flex items-center justify-between group cursor-pointer hover:bg-slate-50 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {siswa.nama}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>Kelas {siswa.kelas}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">NISN: {siswa.nisn}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                      {siswa.totalPoin} Poin
                    </span>
                    <span className="block text-xs text-slate-400 font-mono tabular-nums">
                      {siswa.count} kejuaraan
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigateToTable()}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors text-center"
            >
              Buka Semua Data Siswa
            </button>
          </div>
        </div>
      </div>

      {/* Recent Achievements Table Feed */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pencatatan Prestasi Terbaru</h2>
            <p className="text-xs text-slate-500 mt-0.5">Data kejuaraan yang baru diinput oleh operator</p>
          </div>
          <button
            onClick={onOpenCreate}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            + Input Baru
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Siswa & Kelas</th>
                <th className="py-2.5 px-3">Nama Kejuaraan</th>
                <th className="py-2.5 px-3">Tingkat</th>
                <th className="py-2.5 px-3">Peringkat</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3 text-right">Poin</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
              {recentList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada riwayat prestasi yang dicatat. Klik "+ Input Baru" untuk menambahkan data.
                  </td>
                </tr>
              ) : (
                recentList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900 block">{item.namaSiswa}</span>
                      <span className="text-slate-500">Kelas {item.kelas} · {item.nisn}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800 block line-clamp-1">{item.namaLomba}</span>
                      <span className="text-slate-400">{item.kategori}</span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {item.tingkat}
                    </td>
                    <td className="py-3 px-3 font-semibold text-blue-800">
                      {item.peringkat}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono tabular-nums">
                      {item.tanggalKegiatan}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                      +{item.poinPrestasi}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onSelectPrestasi(item)}
                        className="text-xs font-semibold text-slate-600 hover:text-blue-700 px-2 py-1 hover:bg-slate-100 rounded transition-colors"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
