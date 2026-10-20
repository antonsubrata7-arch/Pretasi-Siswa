/**
 * APLIKASI INPUT PRESTASI SISWA ONLINE
 * SMP NEGERI 1 KOTA PONTIANAK
 * 
 * Terintegrasi Google Sheets & Google Drive
 */

import React, { useState, useEffect } from 'react';
import { Prestasi } from './types';
import { storageService } from './services/storageService';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PrestasiTable } from './components/PrestasiTable';
import { PrestasiModal } from './components/PrestasiModal';
import { PrestasiDetailModal } from './components/PrestasiDetailModal';
import { ReportPrintModal } from './components/ReportPrintModal';
import { GasGuideModal } from './components/GasGuideModal';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'table' | 'gas'>('dashboard');
  const [data, setData] = useState<Prestasi[]>(() => storageService.getPrestasiList());

  // Navigation filter state
  const [tableFilters, setTableFilters] = useState<{ tingkat?: string; kategori?: string; kelas?: string } | undefined>(undefined);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Prestasi | null>(null);
  const [detailItem, setDetailItem] = useState<Prestasi | null>(null);
  const [isReportPrintOpen, setIsReportPrintOpen] = useState(false);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Prestasi) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSavePrestasi = (prestasiData: Omit<Prestasi, 'id' | 'timestamp'> & { id?: string }) => {
    if (prestasiData.id) {
      const updated = storageService.updatePrestasi(prestasiData.id, prestasiData);
      setData(storageService.getPrestasiList());
      showToast(`Data prestasi ${updated.namaSiswa} berhasil diperbarui.`);
    } else {
      const created = storageService.savePrestasi(prestasiData);
      setData(storageService.getPrestasiList());
      showToast(`Data prestasi baru ${created.namaSiswa} berhasil disimpan.`);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    storageService.deletePrestasi(id);
    setData(storageService.getPrestasiList());
    showToast('Data prestasi berhasil dihapus dari sistem.', 'info');
  };

  const handleClearAll = () => {
    storageService.clearAllPrestasi();
    setData([]);
    showToast('Semua isi data prestasi telah berhasil dikosongkan.', 'info');
  };

  const handleExportCsv = (filteredData: Prestasi[]) => {
    storageService.exportToCsv(filteredData);
    showToast(`Berhasil mengekspor ${filteredData.length} data ke CSV (kompatibel Excel).`);
  };

  const handleNavigateToTableWithFilters = (filters?: { tingkat?: string; kategori?: string; kelas?: string }) => {
    setTableFilters(filters);
    setCurrentTab('table');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={tab => {
          setTableFilters(undefined);
          setCurrentTab(tab);
        }}
        onOpenCreateModal={handleCreateNew}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            data={data}
            onNavigateToTable={handleNavigateToTableWithFilters}
            onOpenCreate={handleCreateNew}
            onSelectPrestasi={item => setDetailItem(item)}
          />
        )}

        {currentTab === 'table' && (
          <PrestasiTable
            data={data}
            onOpenCreate={handleCreateNew}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClearAll={handleClearAll}
            onSelectDetail={item => setDetailItem(item)}
            onOpenReportPrint={() => setIsReportPrintOpen(true)}
            onExportCsv={handleExportCsv}
            initialFilters={tableFilters}
          />
        )}

        {currentTab === 'gas' && (
          <GasGuideModal
            onSyncSuccess={() => {
              setData(storageService.getPrestasiList());
              showToast('Sinkronisasi Google Sheets selesai.');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">SMP Negeri 1 Kota Pontianak</span>
            <span aria-hidden="true">·</span>
            <span>Jl. Jend. Urip No. 1, Kota Pontianak, Kalimantan Barat</span>
          </div>
          <div>
            Aplikasi Input Prestasi Siswa Terpadu © {new Date().getFullYear()}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PrestasiModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSavePrestasi}
        initialData={editingItem}
      />

      <PrestasiDetailModal
        prestasi={detailItem}
        onClose={() => setDetailItem(null)}
        onEdit={item => {
          setDetailItem(null);
          handleEdit(item);
        }}
      />

      <ReportPrintModal
        isOpen={isReportPrintOpen}
        onClose={() => setIsReportPrintOpen(false)}
        allData={data}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-800 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
