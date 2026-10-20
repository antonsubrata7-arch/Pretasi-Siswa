/**
 * Production-ready Google Apps Script (Code.gs) and Web App Template (Index.html)
 * for SMP Negeri 1 Kota Pontianak
 */

export const CODE_GS_TEMPLATE = `/**
 * =========================================================================
 * APLIKASI INPUT PRESTASI SISWA ONLINE
 * SMP NEGERI 1 KOTA PONTIANAK
 * 
 * File: Code.gs (Google Apps Script Backend)
 * Integrasi: Google Sheets & Google Drive
 * =========================================================================
 */

// 1. Masukkan ID Spreadsheet Anda di sini (salin teks di antara /d/ dan /edit)
var SPREADSHEET_ID = "GANTI_DENGAN_ID_SPREADSHEET";

// 2. Nama sheet data prestasi
var SHEET_NAME = "DataPrestasi";

// 3. Nama folder khusus di Google Drive untuk menyimpan sertifikat
var FOLDER_NAME = "Sertifikat Prestasi - SMPN 1 Pontianak";

// 4. Pengaturan Keamanan: Batasi email yang diizinkan mengedit/mengakses
// Biarkan kosong [] jika akses diatur melalui pengaturan deployment Web App
var ALLOWED_EMAILS = [
  // "operator.prestasi@smpn1pontianak.sch.id",
  // "kesiswaan@smpn1pontianak.sch.id"
];

/**
 * Inisialisasi awal aplikasi (Jalankan fungsi ini 1x dari editor Apps Script)
 * Menu Dropdown: pilih 'setupApp' -> klik 'Run' (Jalankan)
 */
function setupApp() {
  if (SPREADSHEET_ID === "GANTI_DENGAN_ID_SPREADSHEET" || !SPREADSHEET_ID) {
    throw new Error("PENTING: Harap ganti SPREADSHEET_ID dengan ID Google Spreadsheet Anda terlebih dahulu!");
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  
  // Buat sheet jika belum ada
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // Format Header Kolom
  var headers = [
    "Timestamp", "ID Prestasi", "NISN", "NIS", "Nama Lengkap Siswa", 
    "Jenis Kelamin", "Kelas", "Nama Lomba / Kejuaraan", "Kategori", 
    "Tingkat", "Peringkat / Juara", "Penyelenggara", "Tempat Kegiatan", 
    "Tanggal Kegiatan", "Tahun Ajaran", "Guru Pembimbing / Pembina", 
    "Poin Prestasi", "Keterangan", "Nama File Sertifikat", "Link Drive Sertifikat", 
    "File ID Drive", "Status Verifikasi"
  ];

  // Cek apakah baris 1 sudah ada header
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0f274a");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setFontFamily("Arial");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }

  // Buat folder sertifikat di Google Drive jika belum ada
  var folderId = getOrCreateFolder(FOLDER_NAME);
  PropertiesService.getScriptProperties().setProperty("CERTIFICATE_FOLDER_ID", folderId);

  Logger.log("SETUP BERHASIL! Folder sertifikat ID: " + folderId);
  return {
    status: "success",
    message: "Setup Google Spreadsheet & Google Drive berhasil diselesaikan!",
    folderId: folderId
  };
}

/**
 * Mencari atau membuat folder Google Drive
 */
function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next().getId();
  } else {
    var newFolder = DriveApp.createFolder(folderName);
    return newFolder.getId();
  }
}

/**
 * Verifikasi Akses Pengguna (Email Check)
 */
function checkUserAccess() {
  if (ALLOWED_EMAILS.length === 0) return true;
  var userEmail = Session.getActiveUser().getEmail();
  if (!userEmail) return true; // Bila mode publik / anon
  return ALLOWED_EMAILS.indexOf(userEmail.toLowerCase()) !== -1;
}

/**
 * Menampilkan Web App UI atau API Response
 */
function doGet(e) {
  // Jika diminta format JSON untuk API
  if (e && e.parameter && e.parameter.format === "json") {
    return ContentService.createTextOutput(JSON.stringify(getDataPrestasi()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Render file Index.html untuk Web App mandiri
  return HtmlService.createHtmlOutputFromFile("Index")
    .setTitle("Input Prestasi Siswa - SMPN 1 Pontianak")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

/**
 * Menerima request POST untuk simpan, edit, atau hapus
 */
function doPost(e) {
  try {
    if (!checkUserAccess()) {
      return jsonResponse({ success: false, message: "Akses ditolak: Email Anda tidak memiliki izin." });
    }

    var postData;
    if (e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else {
      postData = e.parameter;
    }

    var action = postData.action || "create";

    if (action === "create") {
      var result = simpanPrestasi(postData.data);
      return jsonResponse({ success: true, message: "Data berhasil disimpan ke Google Sheets!", data: result });
    } else if (action === "update") {
      var updateResult = updatePrestasi(postData.id, postData.data);
      return jsonResponse({ success: true, message: "Data berhasil diperbarui!", data: updateResult });
    } else if (action === "delete") {
      hapusPrestasi(postData.id);
      return jsonResponse({ success: true, message: "Data berhasil dihapus dari Google Sheets!" });
    } else if (action === "getAll") {
      return jsonResponse({ success: true, data: getDataPrestasi() });
    }

    return jsonResponse({ success: false, message: "Aksi tidak dikenali." });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Mengambil semua data prestasi dari Google Sheets
 */
function getDataPrestasi() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return [];

  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    list.push({
      timestamp: r[0],
      id: r[1],
      nisn: String(r[2]),
      nis: String(r[3]),
      namaSiswa: r[4],
      jenisKelamin: r[5],
      kelas: r[6],
      namaLomba: r[7],
      kategori: r[8],
      tingkat: r[9],
      peringkat: r[10],
      penyelenggara: r[11],
      tempatKegiatan: r[12],
      tanggalKegiatan: r[13] instanceof Date ? Utilities.formatDate(r[13], Session.getScriptTimeZone(), "yyyy-MM-dd") : String(r[13]),
      tahunAjaran: r[14],
      guruPembina: r[15],
      poinPrestasi: Number(r[16]) || 0,
      keterangan: r[17],
      namaFileSertifikat: r[18],
      sertifikatUrl: r[19],
      driveFileId: r[20],
      status: r[21] || "Terverifikasi"
    });
  }
  return list;
}

/**
 * Menyimpan data prestasi baru + upload berkas sertifikat
 */
function simpanPrestasi(p) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    setupApp();
    sheet = ss.getSheetByName(SHEET_NAME);
  }

  var idPrestasi = p.id || ("PRST-" + new Date().getFullYear() + "-" + Utilities.getUuid().substr(0, 5).toUpperCase());
  var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

  var driveUrl = "";
  var driveFileId = "";

  // Proses upload berkas sertifikat jika ada base64
  if (p.fileBase64 && p.fileName) {
    try {
      var folderId = PropertiesService.getScriptProperties().getProperty("CERTIFICATE_FOLDER_ID") || getOrCreateFolder(FOLDER_NAME);
      var folder = DriveApp.getFolderById(folderId);

      var contentType = p.fileType || "application/octet-stream";
      var bytes = Utilities.base64Decode(p.fileBase64);
      var blob = Utilities.newBlob(bytes, contentType, idPrestasi + "_" + p.fileName);
      
      var file = folder.createFile(blob);
      driveFileId = file.getId();
      driveUrl = file.getUrl();
    } catch (e) {
      Logger.log("Gagal simpan file ke Drive: " + e.message);
    }
  }

  var newRow = [
    timestamp,
    idPrestasi,
    p.nisn || "",
    p.nis || "",
    p.namaSiswa || "",
    p.jenisKelamin || "L",
    p.kelas || "",
    p.namaLomba || "",
    p.kategori || "",
    p.tingkat || "",
    p.peringkat || "",
    p.penyelenggara || "",
    p.tempatKegiatan || "",
    p.tanggalKegiatan || "",
    p.tahunAjaran || "2025/2026",
    p.guruPembina || "",
    p.poinPrestasi || 0,
    p.keterangan || "",
    p.fileName || p.namaFileSertifikat || "",
    driveUrl || p.sertifikatUrl || "",
    driveFileId || p.driveFileId || "",
    p.status || "Terverifikasi"
  ];

  sheet.appendRow(newRow);
  return { id: idPrestasi, driveUrl: driveUrl, driveFileId: driveFileId };
}

/**
 * Memperbarui data prestasi berdasarkan ID
 */
function updatePrestasi(id, p) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(id)) {
      var rowNum = i + 1;
      
      if (p.nisn !== undefined) sheet.getRange(rowNum, 3).setValue(p.nisn);
      if (p.nis !== undefined) sheet.getRange(rowNum, 4).setValue(p.nis);
      if (p.namaSiswa !== undefined) sheet.getRange(rowNum, 5).setValue(p.namaSiswa);
      if (p.jenisKelamin !== undefined) sheet.getRange(rowNum, 6).setValue(p.jenisKelamin);
      if (p.kelas !== undefined) sheet.getRange(rowNum, 7).setValue(p.kelas);
      if (p.namaLomba !== undefined) sheet.getRange(rowNum, 8).setValue(p.namaLomba);
      if (p.kategori !== undefined) sheet.getRange(rowNum, 9).setValue(p.kategori);
      if (p.tingkat !== undefined) sheet.getRange(rowNum, 10).setValue(p.tingkat);
      if (p.peringkat !== undefined) sheet.getRange(rowNum, 11).setValue(p.peringkat);
      if (p.penyelenggara !== undefined) sheet.getRange(rowNum, 12).setValue(p.penyelenggara);
      if (p.tempatKegiatan !== undefined) sheet.getRange(rowNum, 13).setValue(p.tempatKegiatan);
      if (p.tanggalKegiatan !== undefined) sheet.getRange(rowNum, 14).setValue(p.tanggalKegiatan);
      if (p.tahunAjaran !== undefined) sheet.getRange(rowNum, 15).setValue(p.tahunAjaran);
      if (p.guruPembina !== undefined) sheet.getRange(rowNum, 16).setValue(p.guruPembina);
      if (p.poinPrestasi !== undefined) sheet.getRange(rowNum, 17).setValue(p.poinPrestasi);
      if (p.keterangan !== undefined) sheet.getRange(rowNum, 18).setValue(p.keterangan);
      if (p.status !== undefined) sheet.getRange(rowNum, 22).setValue(p.status);
      
      return { id: id, updated: true };
    }
  }
  throw new Error("Data prestasi dengan ID " + id + " tidak ditemukan.");
}

/**
 * Menghapus baris prestasi berdasarkan ID
 */
function hapusPrestasi(id) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(id)) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  throw new Error("Data ID tidak ditemukan.");
}
`;

export const INDEX_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aplikasi Input Prestasi Siswa - SMPN 1 Pontianak</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; }
  </style>
</head>
<body class="text-slate-800 antialiased min-h-screen">
  <!-- Header -->
  <header class="bg-slate-900 text-white px-6 py-4 border-b border-slate-800">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-sm shadow">
          SP1
        </div>
        <div>
          <h1 class="text-lg font-bold leading-tight">SMP NEGERI 1 KOTA PONTIANAK</h1>
          <p class="text-xs text-slate-400">Aplikasi Input Prestasi Siswa Terintegrasi Google Sheets</p>
        </div>
      </div>
      <div class="text-xs text-slate-400 text-right hidden sm:block">
        <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1.5"></span>
        Sistem Terhubung ke Google Apps Script
      </div>
    </div>
  </header>

  <!-- Container Utama -->
  <main class="max-w-7xl mx-auto px-4 py-8">
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div class="flex items-center justify-between pb-6 border-b border-slate-100">
        <div>
          <h2 class="text-xl font-bold text-slate-900">Formulir Rekap Prestasi Siswa</h2>
          <p class="text-sm text-slate-500">Kirim data prestasi baru langsung ke Google Spreadsheet sekolah.</p>
        </div>
      </div>

      <form id="prestasiForm" class="mt-6 space-y-6" onsubmit="handleFormSubmit(event)">
        <!-- Bagian Data Siswa -->
        <div>
          <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">1. Identitas Siswa</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">NISN (10 Digit) *</label>
              <input type="text" id="nisn" required maxlength="10" placeholder="Contoh: 0098765431" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">NIS *</label>
              <input type="text" id="nis" required placeholder="Contoh: 232407001" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Nama Lengkap Siswa *</label>
              <input type="text" id="namaSiswa" required placeholder="Nama lengkap sesuai rapor" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Jenis Kelamin *</label>
              <select id="jenisKelamin" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="L">Laki-Laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Kelas *</label>
              <select id="kelas" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="">-- Pilih Kelas --</option>
                <option value="7A">7A</option><option value="7B">7B</option><option value="7C">7C</option><option value="7D">7D</option>
                <option value="8A">8A</option><option value="8B">8B</option><option value="8C">8C</option><option value="8D">8D</option>
                <option value="9A">9A</option><option value="9B">9B</option><option value="9C">9C</option><option value="9D">9D</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Tahun Ajaran *</label>
              <input type="text" id="tahunAjaran" value="2025/2026" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
          </div>
        </div>

        <!-- Bagian Prestasi -->
        <div class="pt-4 border-t border-slate-200">
          <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">2. Rincian Prestasi & Lomba</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
              <label class="block text-xs font-medium text-slate-700 mb-1">Nama Lomba / Kejuaraan *</label>
              <input type="text" id="namaLomba" required placeholder="Contoh: Olimpiade Sains Nasional (OSN) IPA" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Kategori *</label>
              <select id="kategori" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="Sains & Matematika (OSN)">Sains & Matematika (OSN)</option>
                <option value="Seni & Budaya (FLS2N)">Seni & Budaya (FLS2N)</option>
                <option value="Olahraga (O2SN)">Olahraga (O2SN)</option>
                <option value="Bahasa & Sastra">Bahasa & Sastra</option>
                <option value="Teknologi & Robotika">Teknologi & Robotika</option>
                <option value="Keagamaan (MTQ/Pentas PAI)">Keagamaan (MTQ/Pentas PAI)</option>
                <option value="Kepemimpinan & Pramuka">Kepemimpinan & Pramuka</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Tingkat *</label>
              <select id="tingkat" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="Sekolah">Sekolah</option>
                <option value="Kecamatan">Kecamatan</option>
                <option value="Kota" selected>Kota (Pontianak)</option>
                <option value="Provinsi">Provinsi (Kalbar)</option>
                <option value="Nasional">Nasional</option>
                <option value="Internasional">Internasional</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Peringkat / Juara *</label>
              <select id="peringkat" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="Juara 1">Juara 1</option>
                <option value="Juara 2">Juara 2</option>
                <option value="Juara 3">Juara 3</option>
                <option value="Harapan 1">Harapan 1</option>
                <option value="Medali Emas">Medali Emas</option>
                <option value="Medali Perak">Medali Perak</option>
                <option value="Medali Perunggu">Medali Perunggu</option>
                <option value="Finalis">Finalis</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Tanggal Kegiatan *</label>
              <input type="date" id="tanggalKegiatan" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Instansi Penyelenggara *</label>
              <input type="text" id="penyelenggara" required placeholder="Contoh: Disdikbud Kota Pontianak" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Tempat / Lokasi</label>
              <input type="text" id="tempatKegiatan" placeholder="Contoh: Gedung Kartini Pontianak" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Guru Pembina / Pendamping</label>
              <input type="text" id="guruPembina" placeholder="Nama Guru Pembina" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
          </div>
        </div>

        <!-- Unggah Sertifikat (Max 5 MB) -->
        <div class="pt-4 border-t border-slate-200">
          <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">3. Unggah Berkas Sertifikat</h3>
          <p class="text-xs text-slate-500 mb-3">Format PDF, JPG, atau PNG. Ukuran maksimal 5 MB. Otomatis disimpan ke Google Drive sekolah.</p>
          <div class="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 bg-slate-50 transition-colors">
            <input type="file" id="fileSertifikat" accept=".pdf,.jpg,.jpeg,.png" onchange="previewFile(event)" class="hidden">
            <label for="fileSertifikat" class="cursor-pointer inline-flex flex-col items-center">
              <svg class="w-10 h-10 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
              <span class="text-sm font-medium text-blue-600 hover:text-blue-700">Klik untuk memilih file</span>
              <span class="text-xs text-slate-500 mt-1" id="fileLabel">Belum ada file dipilih</span>
            </label>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
          <button type="reset" class="px-5 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">Batal / Reset</button>
          <button type="submit" id="submitBtn" class="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
            Simpan Data Prestasi
          </button>
        </div>
      </form>

      <div id="statusAlert" class="hidden mt-6 p-4 rounded-lg text-sm"></div>
    </div>
  </main>

  <script>
    let uploadedFileBase64 = null;
    let uploadedFileName = '';
    let uploadedFileType = '';

    function previewFile(e) {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file melebihi batas maksimal 5 MB!");
        e.target.value = '';
        return;
      }

      uploadedFileName = file.name;
      uploadedFileType = file.type;
      document.getElementById('fileLabel').textContent = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';

      const reader = new FileReader();
      reader.onload = function(evt) {
        const base64String = evt.target.result.split(',')[1];
        uploadedFileBase64 = base64String;
      };
      reader.readAsDataURL(file);
    }

    function handleFormSubmit(e) {
      e.preventDefault();
      const submitBtn = document.getElementById('submitBtn');
      const statusAlert = document.getElementById('statusAlert');

      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Menyimpan ke Google Sheets...';

      const payload = {
        action: 'create',
        data: {
          nisn: document.getElementById('nisn').value,
          nis: document.getElementById('nis').value,
          namaSiswa: document.getElementById('namaSiswa').value,
          jenisKelamin: document.getElementById('jenisKelamin').value,
          kelas: document.getElementById('kelas').value,
          tahunAjaran: document.getElementById('tahunAjaran').value,
          namaLomba: document.getElementById('namaLomba').value,
          kategori: document.getElementById('kategori').value,
          tingkat: document.getElementById('tingkat').value,
          peringkat: document.getElementById('peringkat').value,
          tanggalKegiatan: document.getElementById('tanggalKegiatan').value,
          penyelenggara: document.getElementById('penyelenggara').value,
          tempatKegiatan: document.getElementById('tempatKegiatan').value,
          guruPembina: document.getElementById('guruPembina').value,
          fileName: uploadedFileName,
          fileType: uploadedFileType,
          fileBase64: uploadedFileBase64
        }
      };

      // Jika berjalan di dalam Google Apps Script (HTMLService)
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(function(response) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Simpan Data Prestasi';
            statusAlert.className = 'mt-6 p-4 rounded-lg text-sm bg-emerald-50 text-emerald-800 border border-emerald-200';
            statusAlert.textContent = 'Sukses! Data prestasi berhasil disimpan ke Google Sheets.';
            document.getElementById('prestasiForm').reset();
            document.getElementById('fileLabel').textContent = 'Belum ada file dipilih';
          })
          .withFailureHandler(function(err) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Simpan Data Prestasi';
            statusAlert.className = 'mt-6 p-4 rounded-lg text-sm bg-rose-50 text-rose-800 border border-rose-200';
            statusAlert.textContent = 'Gagal menyimpan: ' + err.message;
          })
          .simpanPrestasi(payload.data);
      } else {
        // Mode browser mandiri
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Simpan Data Prestasi';
          statusAlert.className = 'mt-6 p-4 rounded-lg text-sm bg-emerald-50 text-emerald-800 border border-emerald-200';
          statusAlert.textContent = 'Berhasil dicatat! (Gunakan Aplikasi Lengkap untuk sinkronisasi live ke Google Apps Script)';
        }, 1000);
      }
    }
  </script>
</body>
</html>
`;
