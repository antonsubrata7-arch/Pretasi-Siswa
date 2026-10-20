import React from 'react';
import { Plus, Award, FileSpreadsheet, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'table' | 'gas';
  setCurrentTab: (tab: 'dashboard' | 'table' | 'gas') => void;
  onOpenCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenCreateModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Brand Wordmark element without logo image */}
          <div 
            onClick={() => setCurrentTab('dashboard')} 
            className="flex flex-col cursor-pointer shrink-0"
          >
            <span className="text-base font-bold text-slate-900 tracking-tight leading-tight whitespace-nowrap">
              SMP Negeri 1 Kota Pontianak
            </span>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              Sistem Informasi Prestasi Siswa Online
            </span>
          </div>

          {/* Zone 2: 4-5 Concise Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'dashboard'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentTab('table')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'table'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Award className="w-4 h-4 text-slate-500" />
              <span>Data Prestasi</span>
            </button>

            <button
              onClick={() => setCurrentTab('gas')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'gas'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Google Sheets & GAS</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <Plus className="w-4 h-4" />
              <span>+ Input Prestasi</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
