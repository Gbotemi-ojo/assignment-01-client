import React, { useState, useEffect, useCallback } from 'react';
import { SheetApiResponse, InspectionRecord } from './types/inspection';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { DataTable } from './components/DataTable';
import { RecordModal } from './components/RecordModal';
import { AlertCircle, RefreshCw, Database, Server } from 'lucide-react';

export const App: React.FC = () => {
  const [data, setData] = useState<SheetApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '';
      const url = `${apiBase}/api/inspections${forceRefresh ? '?forceRefresh=true' : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || `HTTP error! Status: ${response.status}`);
      }
      const json: SheetApiResponse = await response.json();
      if (!json.success) {
        throw new Error(json.message || 'Server returned unsuccessful response');
      }
      setData(json);
    } catch (err: any) {
      console.error('Failed to load sheet data:', err);
      setError(err?.message || 'Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Top Header */}
      <Header
        lastUpdated={data?.sheetInfo.lastFetchedAt || null}
        totalRecords={data?.sheetInfo.totalRows || 0}
        isLoading={isLoading}
        onRefresh={() => fetchData(true)}
        sheetTitle={data?.sheetInfo.title}
        sheetName={data?.sheetInfo.sheetName}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Error Alert Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-bold">Failed to load data from server</h3>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              <div className="mt-2 flex items-center space-x-2">
                <button
                  onClick={() => fetchData(true)}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold inline-flex items-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Connection</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary Cards */}
        {data?.stats && (
          <StatsCards
            stats={data.stats}
            totalVisible={data.data.length}
          />
        )}

        {/* Analytics Charts */}
        {data?.stats && (
          <AnalyticsCharts stats={data.stats} />
        )}

        {/* Interactive Data Table */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              Inspection Requests Register
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Click any row for complete certificate files & partner dossier
            </span>
          </div>

          <DataTable
            data={data?.data || []}
            onSelectRecord={(rec) => setSelectedRecord(rec)}
            isLoading={isLoading && !data}
          />
        </section>

      </main>

      {/* Record Details Modal */}
      <RecordModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Google Sheets Service Account Auth</span>
            <span>•</span>
            <span>Express + React (Vite & Tailwind CSS)</span>
          </div>
          <div>
            <span>Vercel Full-Stack Ready</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
