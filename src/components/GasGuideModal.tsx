import React, { useState } from 'react';
import { CODE_GS_TEMPLATE, INDEX_HTML_TEMPLATE } from '../data/gasTemplates';
import { storageService } from '../services/storageService';
import { GasConfiguration } from '../types';
import { 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  HelpCircle,
  FolderGit2
} from 'lucide-react';

interface GasGuideModalProps {
  onSyncSuccess?: () => void;
}

export const GasGuideModal: React.FC<GasGuideModalProps> = ({ onSyncSuccess }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'codegs' | 'indexhtml' | 'config'>('guide');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Configuration state
  const [config, setConfig] = useState<GasConfiguration>(() => storageService.getGasConfig());
  const [spreadsheetInput, setSpreadsheetInput] = useState(config.spreadsheetId || '');
  const [webAppUrlInput, setWebAppUrlInput] = useState(config.webAppUrl || '');
  const [allowedEmailsInput, setAllowedEmailsInput] = useState(config.allowedEmails.join(', ') || '');
  const [autoSync, setAutoSync] = useState(config.autoSync || false);

  // Connection testing state
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // 12-step installation checklist state
  const [completedSteps, setCompletedSteps] = useState<number[]>([1, 2]);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepNumber) 
        ? prev.filter(s => s !== stepNumber) 
        : [...prev, stepNumber]
    );
  };

  const stepsList = [
    {
      num: 1,
      title: 'Buat Google Spreadsheet baru',
      desc: 'Buka sheets.google.com dengan akun Google resmi sekolah (misal @smpn1pontianak.sch.id) dan buat lembar kerja baru.',
    },
    {
      num: 2,
      title: 'Salin ID Spreadsheet dari URL',
      desc: 'Ambil teks di antara /d/ dan /edit pada bilah alamat browser Anda.',
    },
    {
      num: 3,
      title: 'Buka Ekstensi > Apps Script',
      desc: 'Di menu Google Spreadsheet, klik menu Ekstensi lalu pilih Apps Script.',
    },
    {
      num: 4,
      title: 'Ganti isi Code.gs',
      desc: 'Hapus kode bawaan di Code.gs dan salin seluruh isi dari tab "File Code.gs".',
    },
    {
      num: 5,
      title: 'Buat file HTML baru: Index',
      desc: 'Klik tombol + di samping File, pilih HTML, beri nama persis "Index", lalu salin isi file Index.html.',
    },
    {
      num: 6,
      title: 'Konfigurasi SPREADSHEET_ID',
      desc: 'Pada Code.gs, ganti teks "GANTI_DENGAN_ID_SPREADSHEET" dengan ID spreadsheet yang telah disalin di langkah 2.',
    },
    {
      num: 7,
      title: 'Jalankan fungsi setupApp 1x',
      desc: 'Pilih fungsi setupApp dari dropdown, klik Jalankan (Run) dan berikan izin otorisasi akses Google Sheets serta Google Drive.',
    },
    {
      num: 8,
      title: 'Deploy > New deployment',
      desc: 'Klik tombol Deploy di kanan atas, pilih "New deployment", lalu pilih jenis "Web app".',
    },
    {
      num: 9,
      title: 'Pilih Execute as: Akun Pemilik',
      desc: 'Atur "Execute as" ke: "Me (akun pemilik aplikasi)".',
    },
    {
      num: 10,
      title: 'Atur Who has access',
      desc: 'Pilih akses paling terbatas yang sesuai, misalnya akun organisasi sekolah jika tersedia. Jangan pilih akses publik kecuali memang disetujui sekolah.',
    },
    {
      num: 11,
      title: 'Salin URL Web App',
      desc: 'Klik Deploy, salin URL Web App yang dihasilkan, dan simpan atau bagikan kepada petugas yang diizinkan.',
    },
    {
      num: 12,
      title: 'Uji akses dari akun operator',
      desc: 'Buka URL dari komputer atau browser kedua untuk memverifikasi hak akses sebelum digunakan secara resmi.',
    },
  ];

  // Dynamic Code.gs with the user's spreadsheet ID inserted if entered
  const generatedCodeGs = spreadsheetInput.trim()
    ? CODE_GS_TEMPLATE.replace('GANTI_DENGAN_ID_SPREADSHEET', spreadsheetInput.trim())
    : CODE_GS_TEMPLATE;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveConfig = () => {
    const emailList = allowedEmailsInput
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 0);

    const newConfig: GasConfiguration = {
      spreadsheetId: spreadsheetInput.trim(),
      webAppUrl: webAppUrlInput.trim(),
      allowedEmails: emailList,
      autoSync,
    };

    storageService.saveGasConfig(newConfig);
    setConfig(newConfig);
    setTestResult({
      success: true,
      message: 'Pengaturan integrasi Google Sheets berhasil disimpan!',
    });
  };

  const handleTestConnection = async () => {
    if (!webAppUrlInput.trim()) {
      setTestResult({
        success: false,
        message: 'Masukkan URL Web App hasil deploy terlebih dahulu.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const res = await storageService.testGasConnection(webAppUrlInput.trim());
    setTesting(false);
    setTestResult(res);
  };

  const progressPercent = Math.round((completedSteps.length / stepsList.length) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Integrasi Google Sheets & Google Drive · SMPN 1 Pontianak</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Panduan Pemasangan & Paket Google Apps Script
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Arsitektur terpusat menggunakan Google Sheets sebagai database utama dan Google Drive sebagai penyimpanan berkas sertifikat tanpa biaya server tambahan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadFile('Code.gs', generatedCodeGs)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Unduh Code.gs</span>
            </button>
            <button
              onClick={() => handleDownloadFile('Index.html', INDEX_HTML_TEMPLATE)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Unduh Index.html</span>
            </button>
          </div>
        </div>

        {/* Tab Selector Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'guide'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            1. Panduan 12 Langkah ({completedSteps.length}/{stepsList.length})
          </button>

          <button
            onClick={() => setActiveTab('codegs')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'codegs'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            2. File Code.gs (Backend)
          </button>

          <button
            onClick={() => setActiveTab('indexhtml')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'indexhtml'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            3. File Index.html (Tampilan)
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'config'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            4. Pengaturan & Uji Koneksi Live
          </button>
        </div>
      </div>

      {/* TAB 1: 12-Step Installation Checklist */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Progres Pemasangan Operator
              </span>
              <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                {progressPercent}% Selesai ({completedSteps.length} dari 12)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs divide-y divide-slate-100">
            {stepsList.map(step => {
              const isDone = completedSteps.includes(step.num);

              return (
                <div
                  key={step.num}
                  onClick={() => toggleStep(step.num)}
                  className={`p-4 sm:p-5 flex items-start gap-4 cursor-pointer transition-colors ${
                    isDone ? 'bg-slate-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <button
                    type="button"
                    className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 text-transparent hover:border-slate-400'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-slate-400">
                        Langkah {step.num}
                      </span>
                      <h3 className={`text-sm font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Security Best Practices Callout */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">
              <ShieldCheck className="w-5 h-5 text-blue-700" />
              <span>Protokol Keamanan Data SMP Negeri 1 Pontianak</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <strong className="text-slate-900 block mb-1">Batasi Akses Web App</strong>
                Hanya beri izin akses kepada operator dan staf kesiswaan sekolah. Gunakan pembatasan akun organisasi Google Workspace jika ada.
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <strong className="text-slate-900 block mb-1">Privasi Google Drive</strong>
                Folder "Sertifikat Prestasi" dibuat otomatis di Google Drive dan tidak disetel publik bebas; hanya akun sekolah yang berhak membuka.
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <strong className="text-slate-900 block mb-1">Cadangan Berkala</strong>
                Unduh file CSV atau buat salinan cadangan Google Spreadsheet setiap akhir semester / tahun ajaran baru.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: File Code.gs Viewer */}
      {activeTab === 'codegs' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Code.gs (Backend Apps Script)</h3>
              <p className="text-xs text-slate-500">
                Berisi logika setup tabel, upload file ke Google Drive, doGet dan doPost API.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(generatedCodeGs, 'codegs')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
              >
                {copiedType === 'codegs' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Seluruh Kode</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-slate-100 overflow-x-auto max-h-[600px] text-xs font-mono leading-relaxed">
            <pre>{generatedCodeGs}</pre>
          </div>
        </div>
      )}

      {/* TAB 3: File Index.html Viewer */}
      {activeTab === 'indexhtml' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Index.html (Tampilan Web App Mandiri)</h3>
              <p className="text-xs text-slate-500">
                File tampilan HTML+CSS+JS yang disalin ke Google Apps Script (HTML Service).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(INDEX_HTML_TEMPLATE, 'indexhtml')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
              >
                {copiedType === 'indexhtml' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Index.html</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-slate-100 overflow-x-auto max-h-[600px] text-xs font-mono leading-relaxed">
            <pre>{INDEX_HTML_TEMPLATE}</pre>
          </div>
        </div>
      )}

      {/* TAB 4: Configuration & Live Sync */}
      {activeTab === 'config' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Konfigurasi Integrasi Langsung ke Google Apps Script
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Hubungkan aplikasi web ini langsung ke Google Spreadsheet dan Google Drive sekolah Anda dengan memasukkan URL hasil Deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Google Spreadsheet ID
              </label>
              <input
                type="text"
                value={spreadsheetInput}
                onChange={e => setSpreadsheetInput(e.target.value)}
                placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Teks di antara /d/ dan /edit dari URL Google Spreadsheet.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                URL Web App Google Apps Script
              </label>
              <input
                type="text"
                value={webAppUrlInput}
                onChange={e => setWebAppUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                URL yang Anda dapatkan setelah klik Deploy &gt; New deployment &gt; Web app.
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Daftar Email yang Diizinkan (ALLOWED_EMAILS)
              </label>
              <input
                type="text"
                value={allowedEmailsInput}
                onChange={e => setAllowedEmailsInput(e.target.value)}
                placeholder="operator@smpn1pontianak.sch.id, kesiswaan@smpn1pontianak.sch.id"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Pisahkan dengan koma. Kosongkan jika pembatasan dikelola langsung oleh hak akses Google Deployment.
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={e => setAutoSync(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800">
                  Otomatis kirim data baru ke Google Apps Script saat tombol simpan ditekan
                </span>
              </label>
            </div>
          </div>

          {/* Test & Save buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleSaveConfig}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
            >
              Simpan Pengaturan
            </button>

            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Menguji Koneksi...' : 'Uji Koneksi Google Apps Script'}</span>
            </button>
          </div>

          {/* Test connection alert message */}
          {testResult && (
            <div
              className={`p-4 rounded-lg border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <div className="leading-relaxed">
                {testResult.message}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
