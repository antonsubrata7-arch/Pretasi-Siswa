export type TingkatPrestasi = 
  | 'Sekolah'
  | 'Kecamatan'
  | 'Kota'
  | 'Provinsi'
  | 'Nasional'
  | 'Internasional';

export type KategoriPrestasi = 
  | 'Sains & Matematika (OSN)'
  | 'Seni & Budaya (FLS2N)'
  | 'Olahraga (O2SN)'
  | 'Bahasa & Sastra'
  | 'Teknologi & Robotika'
  | 'Keagamaan (MTQ/Pentas PAI)'
  | 'Kepemimpinan & Pramuka'
  | 'Lainnya';

export type PeringkatJuara = 
  | 'Juara 1'
  | 'Juara 2'
  | 'Juara 3'
  | 'Harapan 1'
  | 'Harapan 2'
  | 'Harapan 3'
  | 'Medali Emas'
  | 'Medali Perak'
  | 'Medali Perunggu'
  | 'Finalis'
  | 'Peserta Terbaik'
  | 'Penghargaan Khusus';

export type StatusVerifikasi = 'Terverifikasi' | 'Menunggu' | 'Ditolak';

export interface Prestasi {
  id: string;
  timestamp: string;
  // Siswa
  nisn: string;
  nis: string;
  namaSiswa: string;
  jenisKelamin: 'L' | 'P';
  kelas: string; // e.g. "7A", "8C", "9B"
  
  // Prestasi
  namaLomba: string;
  kategori: KategoriPrestasi;
  tingkat: TingkatPrestasi;
  peringkat: PeringkatJuara;
  penyelenggara: string;
  tempatKegiatan: string;
  tanggalKegiatan: string; // YYYY-MM-DD
  tahunAjaran: string; // e.g. "2025/2026"
  guruPembina: string;
  poinPrestasi: number;
  keterangan?: string;
  
  // Sertifikat
  namaFileSertifikat?: string;
  tipeFileSertifikat?: 'image/jpeg' | 'image/png' | 'application/pdf';
  ukuranFileSertifikat?: number; // bytes
  sertifikatUrl?: string; // base64 or Drive URL
  driveFileId?: string;
  
  // Status
  status: StatusVerifikasi;
  catatanVerifikasi?: string;
}

export interface FilterState {
  searchQuery: string;
  kelas: string;
  tingkat: string;
  kategori: string;
  tahunAjaran: string;
  status: string;
}

export interface GasConfiguration {
  spreadsheetId: string;
  webAppUrl: string;
  driveFolderId?: string;
  allowedEmails: string[];
  autoSync: boolean;
}
