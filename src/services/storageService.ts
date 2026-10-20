import { GasConfiguration, Prestasi } from '../types';
import { INITIAL_PRESTASI } from '../data/initialData';

const STORAGE_KEY = 'smpn1_prestasi_data_v2';
const GAS_CONFIG_KEY = 'smpn1_gas_config_v1';

const DEFAULT_GAS_CONFIG: GasConfiguration = {
  spreadsheetId: '',
  webAppUrl: '',
  driveFolderId: '',
  allowedEmails: [],
  autoSync: false,
};

export const storageService = {
  getPrestasiList(): Prestasi[] {
    try {
      // Clear old v1 demo data if present
      if (localStorage.getItem('smpn1_prestasi_data_v1')) {
        localStorage.removeItem('smpn1_prestasi_data_v1');
      }
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  clearAllPrestasi(): void {
    localStorage.removeItem('smpn1_prestasi_data_v1');
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  },

  savePrestasi(item: Omit<Prestasi, 'id' | 'timestamp'> & { id?: string }): Prestasi {
    const list = this.getPrestasiList();
    const id = item.id || `PRST-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    const newItem: Prestasi = {
      ...item,
      id,
      timestamp,
      poinPrestasi: item.poinPrestasi || calculateDefaultPoints(item.tingkat, item.peringkat),
    };

    const updatedList = [newItem, ...list];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    // Async push to GAS if configured
    this.syncToGasIfEnabled('create', newItem);

    return newItem;
  },

  updatePrestasi(id: string, updates: Partial<Prestasi>): Prestasi {
    const list = this.getPrestasiList();
    const index = list.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Data prestasi ${id} tidak ditemukan.`);
    }

    const updatedItem: Prestasi = {
      ...list[index],
      ...updates,
      id, // keep unchanged
    };

    list[index] = updatedItem;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

    // Async push to GAS if configured
    this.syncToGasIfEnabled('update', updatedItem);

    return updatedItem;
  },

  deletePrestasi(id: string): void {
    const list = this.getPrestasiList();
    const filtered = list.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // Async push to GAS if configured
    this.syncToGasIfEnabled('delete', { id });
  },

  resetDefaultData(): Prestasi[] {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRESTASI));
    return INITIAL_PRESTASI;
  },

  getGasConfig(): GasConfiguration {
    try {
      const data = localStorage.getItem(GAS_CONFIG_KEY);
      if (!data) return DEFAULT_GAS_CONFIG;
      return JSON.parse(data);
    } catch {
      return DEFAULT_GAS_CONFIG;
    }
  },

  saveGasConfig(config: GasConfiguration): void {
    localStorage.setItem(GAS_CONFIG_KEY, JSON.stringify(config));
  },

  async syncToGasIfEnabled(action: 'create' | 'update' | 'delete', data: any): Promise<void> {
    const config = this.getGasConfig();
    if (!config.webAppUrl || !config.autoSync) return;

    try {
      await fetch(config.webAppUrl, {
        method: 'POST',
        mode: 'no-cors', // standard Apps Script redirect handling
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          id: data.id,
          data,
        }),
      });
    } catch (err) {
      console.warn('Gagal sinkronisasi background ke Google Apps Script:', err);
    }
  },

  async testGasConnection(url: string): Promise<{ success: boolean; message: string }> {
    if (!url || !url.startsWith('https://script.google.com/macros/s/')) {
      return {
        success: false,
        message: 'URL Web App harus diawali dengan https://script.google.com/macros/s/...',
      };
    }

    try {
      const response = await fetch(`${url}?format=json`, {
        method: 'GET',
      });
      if (response.ok) {
        const json = await response.json();
        return {
          success: true,
          message: `Koneksi Google Sheets berhasil! Ditemukan ${Array.isArray(json) ? json.length : 0} baris data prestasi.`,
        };
      } else {
        return {
          success: false,
          message: `Koneksi merespon status ${response.status}. Pastikan deployment Google Apps Script diatur 'Who has access: Anyone' atau akun sekolah.`,
        };
      }
    } catch (e: any) {
      return {
        success: false,
        message: `Terjadi kendala jaringan saat menguji koneksi: ${e.message || 'CORS / Blocked'}. Harap pastikan Web App telah di-deploy dengan benar.`,
      };
    }
  },

  exportToCsv(data: Prestasi[], filename = 'rekap_prestasi_smpn1_pontianak.csv'): void {
    const headers = [
      'ID Prestasi',
      'NISN',
      'NIS',
      'Nama Siswa',
      'Jenis Kelamin',
      'Kelas',
      'Nama Lomba / Kejuaraan',
      'Kategori',
      'Tingkat',
      'Peringkat / Juara',
      'Penyelenggara',
      'Tempat Kegiatan',
      'Tanggal Kegiatan',
      'Tahun Ajaran',
      'Guru Pembina',
      'Poin Prestasi',
      'Keterangan',
      'File Sertifikat',
      'Status Verifikasi',
    ];

    const escapeCsv = (str: string | number | undefined | null) => {
      if (str === null || str === undefined) return '""';
      const value = String(str).replace(/"/g, '""');
      return `"${value}"`;
    };

    const rows = data.map(item => [
      escapeCsv(item.id),
      escapeCsv(item.nisn),
      escapeCsv(item.nis),
      escapeCsv(item.namaSiswa),
      escapeCsv(item.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'),
      escapeCsv(item.kelas),
      escapeCsv(item.namaLomba),
      escapeCsv(item.kategori),
      escapeCsv(item.tingkat),
      escapeCsv(item.peringkat),
      escapeCsv(item.penyelenggara),
      escapeCsv(item.tempatKegiatan),
      escapeCsv(item.tanggalKegiatan),
      escapeCsv(item.tahunAjaran),
      escapeCsv(item.guruPembina),
      escapeCsv(item.poinPrestasi),
      escapeCsv(item.keterangan || '-'),
      escapeCsv(item.namaFileSertifikat || '-'),
      escapeCsv(item.status),
    ]);

    // Use \uFEFF UTF-8 BOM so Excel opens Indonesian characters, accents, and format correctly
    const csvContent = '\uFEFF' + [
      headers.join(';'),
      ...rows.map(e => e.join(';')),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

export function calculateDefaultPoints(tingkat: string, peringkat: string): number {
  let base = 20;
  if (tingkat === 'Internasional') base = 90;
  else if (tingkat === 'Nasional') base = 75;
  else if (tingkat === 'Provinsi') base = 50;
  else if (tingkat === 'Kota') base = 35;
  else if (tingkat === 'Kecamatan') base = 25;
  else base = 15;

  let multiplier = 1.0;
  if (peringkat.includes('1') || peringkat.includes('Emas')) multiplier = 1.25;
  else if (peringkat.includes('2') || peringkat.includes('Perak')) multiplier = 1.1;
  else if (peringkat.includes('3') || peringkat.includes('Perunggu')) multiplier = 1.0;
  else if (peringkat.includes('Harapan')) multiplier = 0.85;
  else multiplier = 0.7;

  return Math.round(base * multiplier);
}
