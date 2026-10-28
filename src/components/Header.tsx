import React from 'react';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Database,
  ExternalLink,
  Car
} from 'lucide-react';

interface HeaderProps {
  lastUpdated: string | null;
  totalRecords: number;
  isLoading: boolean;
  onRefresh: () => void;
  sheetTitle?: string;
  sheetName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  lastUpdated,
  totalRecords,
  isLoading,
  onRefresh,
  sheetTitle = 'Vehicle Inspection and Maintenance Records',
  sheetName = 'Inspection Request',
}) => {
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Syncing...';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Title and Branding */}
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 ring-4 ring-emerald-50">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {sheetTitle}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Live
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  Tab: {sheetName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  {totalRecords} rows loaded
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Synced {formattedTime}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge & Actions */}
          <div className="flex items-center space-x-3 self-end md:self-auto">
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Google Sheets API Connected</span>
            </div>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center space-x-2 px-3.5 py-2 text-sm font-semibold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              title="Force sync latest records from Google Sheets"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">{isLoading ? 'Syncing...' : 'Sync Sheet'}</span>
            </button>

            <a
              href="https://docs.google.com/spreadsheets/d/1gyuhg7Gx84acLtbZed506b4wOW8R31Cmn2p6VZVFxWs/edit?gid=1524404096#gid=1524404096"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Open Sheet</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
