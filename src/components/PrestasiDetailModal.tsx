import React from 'react';
import { Prestasi } from '../types';
import { X, Award, FileText, Download, Calendar, MapPin, User, CheckCircle, ExternalLink, Edit } from 'lucide-react';

interface PrestasiDetailModalProps {
  prestasi: Prestasi | null;
  onClose: () => void;
  onEdit: (item: Prestasi) => void;
}

export const PrestasiDetailModal: React.FC<PrestasiDetailModalProps> = ({
  prestasi,
  onClose,
  onEdit,
}) => {
  if (!prestasi) return null;

  const hasCertificate = Boolean(prestasi.namaFileSertifikat || prestasi.sertifikatUrl);
  const isImageCertificate = prestasi.tipeFileSertifikat?.startsWith('image/') || 
    (prestasi.namaFileSertifikat && (prestasi.namaFileSertifikat.endsWith('.jpg') || prestasi.namaFileSertifikat.endsWith('.png') || prestasi.namaFileSertifikat.endsWith('.jpeg')));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-500">
              {prestasi.id}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-blue-700">
              Tingkat {prestasi.tingkat}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
          {/* Main Title & Rank */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">
                  {prestasi.namaLomba}
                </h2>
                <div className="flex items-center gap-2 text-slate-500 mt-1">
                  <span>{prestasi.kategori}</span>
                  <span aria-hidden="true">·</span>
                  <span>Tahun Ajaran {prestasi.tahunAjaran}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base font-bold text-blue-900 block">
                  {prestasi.peringkat}
                </span>
                <span className="font-mono tabular-nums text-slate-500">
                  {prestasi.poinPrestasi} Poin
                </span>
              </div>
            </div>
          </div>

          {/* Student Profile Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px]">
              Identitas Siswa
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px]">Nama Siswa</span>
                <strong className="text-slate-900 text-xs">{prestasi.namaSiswa}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Kelas / JK</span>
                <span className="font-medium text-slate-800">
                  Kelas {prestasi.kelas} ({prestasi.jenisKelamin === 'L' ? 'L' : 'P'})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">NISN</span>
                <span className="font-mono font-medium text-slate-800">{prestasi.nisn}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">NIS Sekolah</span>
                <span className="font-mono font-medium text-slate-800">{prestasi.nis}</span>
              </div>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="text-slate-400 text-[10px] block mb-0.5">Penyelenggara Kegiatan</span>
              <span className="font-medium text-slate-900">{prestasi.penyelenggara}</span>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="text-slate-400 text-[10px] block mb-0.5">Waktu Pelaksanaan</span>
              <span className="font-mono font-medium text-slate-900">{prestasi.tanggalKegiatan}</span>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="text-slate-400 text-[10px] block mb-0.5">Lokasi / Tempat</span>
              <span className="font-medium text-slate-900">{prestasi.tempatKegiatan || 'Tidak dicantumkan'}</span>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="text-slate-400 text-[10px] block mb-0.5">Guru Pembina / Pendamping</span>
              <span className="font-medium text-slate-900">{prestasi.guruPembina || '-'}</span>
            </div>
          </div>

          {/* Additional Notes */}
          {prestasi.keterangan && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 text-[10px] block mb-1">Catatan Keterangan</span>
              <p className="text-slate-700 leading-relaxed">{prestasi.keterangan}</p>
            </div>
          )}

          {/* Certificate Section */}
          <div className="pt-2">
            <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px]">
              Dokumen Sertifikat / Piagam Penghargaan
            </h3>

            {hasCertificate ? (
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-semibold text-slate-900">
                        {prestasi.namaFileSertifikat || 'Sertifikat_Kejuaraan.pdf'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {prestasi.ukuranFileSertifikat 
                          ? `${(prestasi.ukuranFileSertifikat / 1024).toFixed(1)} KB` 
                          : 'Tersimpan di Google Drive / Berkas Lokal'}
                      </div>
                    </div>
                  </div>

                  {prestasi.sertifikatUrl && (
                    <a
                      href={prestasi.sertifikatUrl}
                      download={prestasi.namaFileSertifikat || 'sertifikat.pdf'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh File</span>
                    </a>
                  )}
                </div>

                {/* Inline Preview if Image */}
                {isImageCertificate && prestasi.sertifikatUrl && (
                  <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden bg-white max-h-72 flex items-center justify-center">
                    <img
                      src={prestasi.sertifikatUrl}
                      alt="Pratinjau Sertifikat"
                      className="max-h-72 object-contain"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-slate-200 rounded-lg text-center text-slate-400">
                Belum ada berkas sertifikat yang diunggah untuk prestasi ini.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              onClose();
              onEdit(prestasi);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Data</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
