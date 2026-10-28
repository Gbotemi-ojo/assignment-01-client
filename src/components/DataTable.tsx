import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import { InspectionRecord } from '../types/inspection';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink, 
  FileText, 
  Eye, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MapPin,
  Car,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  X
} from 'lucide-react';

interface DataTableProps {
  data: InspectionRecord[];
  onSelectRecord: (record: InspectionRecord) => void;
  isLoading: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  onSelectRecord,
  isLoading,
}) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'rowNumber', desc: true } // Default to newest at top (like recent sheet rows)
  ]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('all');
  const [selectedInspectionType, setSelectedInspectionType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Filtered data based on dropdowns
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (selectedVehicleType !== 'all') {
        if (!row.vehicleType.toLowerCase().includes(selectedVehicleType.toLowerCase())) {
          return false;
        }
      }
      if (selectedInspectionType !== 'all') {
        if (row.inspectionType !== selectedInspectionType) {
          return false;
        }
      }
      if (selectedStatus !== 'all') {
        if (row.status !== selectedStatus) {
          return false;
        }
      }
      return true;
    });
  }, [data, selectedVehicleType, selectedInspectionType, selectedStatus]);

  // Unique values for dropdown filters
  const vehicleTypeOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach(d => {
      if (d.vehicleType && d.vehicleType !== 'Unspecified') set.add(d.vehicleType);
    });
    return Array.from(set).slice(0, 8);
  }, [data]);

  const inspectionTypeOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach(d => {
      if (d.inspectionType) set.add(d.inspectionType);
    });
    return Array.from(set);
  }, [data]);

  // Column definitions for TanStack Table
  const columns = useMemo<ColumnDef<InspectionRecord>[]>(
    () => [
      {
        accessorKey: 'rowNumber',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center space-x-1 text-slate-700 font-semibold text-xs tracking-wider uppercase hover:text-slate-900"
          >
            <span>Row</span>
            {column.getIsSorted() === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : column.getIsSorted() === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        ),
        cell: (info) => (
          <span className="font-mono text-xs font-semibold text-slate-500">
            #{info.getValue() as number}
          </span>
        ),
        size: 70,
      },
      {
        accessorKey: 'timestamp',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center space-x-1 text-slate-700 font-semibold text-xs tracking-wider uppercase hover:text-slate-900"
          >
            <span>Timestamp</span>
            {column.getIsSorted() === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : column.getIsSorted() === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        ),
        cell: (info) => {
          const val = info.getValue() as string;
          return (
            <span className="text-xs text-slate-700 font-medium whitespace-nowrap">
              {val || '—'}
            </span>
          );
        },
      },
      {
        accessorKey: 'partnerName',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center space-x-1 text-slate-700 font-semibold text-xs tracking-wider uppercase hover:text-slate-900"
          >
            <span>Partner / Contact</span>
            {column.getIsSorted() === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : column.getIsSorted() === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        ),
        cell: (info) => {
          const record = info.row.original;
          return (
            <div className="flex flex-col max-w-[210px]">
              <span className="text-xs font-bold text-slate-900 truncate" title={record.partnerName}>
                {record.partnerName}
              </span>
              <span className="text-[11px] text-slate-500 truncate" title={record.partnerEmail}>
                {record.partnerEmail || record.partnerPhone || 'No email provided'}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'inspectionType',
        header: 'Inspection Type',
        cell: (info) => {
          const val = info.getValue() as string;
          const isPreOnboarding = val.includes('Pre-Onboarding');
          const isExisting = val.includes('Existing');
          const isSpot = val.includes('Spot');

          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap ${
                isPreOnboarding
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : isSpot
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : isExisting
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: 'vehicleType',
        header: 'Vehicle & Qty',
        cell: (info) => {
          const record = info.row.original;
          return (
            <div className="flex items-center space-x-1.5 whitespace-nowrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800">
                <Car className="w-3 h-3 mr-1 text-slate-500" />
                {record.vehicleType}
              </span>
              {record.vehiclesCount && (
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                  x{record.vehiclesCount}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: (info) => {
          const val = info.getValue() as string;
          return (
            <div className="flex items-center space-x-1 text-xs text-slate-600 max-w-[140px] truncate" title={val}>
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{val || '—'}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'partnershipStatus',
        header: 'Partner Status',
        cell: (info) => {
          const val = info.getValue() as string;
          const isNew = val.toLowerCase().includes('new');
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                isNew
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-indigo-100 text-indigo-800'
              }`}
            >
              {val || 'Existing'}
            </span>
          );
        },
      },
      {
        id: 'documents',
        header: 'Certificates',
        cell: (info) => {
          const docs = info.row.original.documents;
          return (
            <div className="flex items-center space-x-1">
              {docs.roadWorthiness ? (
                <a
                  href={docs.roadWorthiness}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                  title="Road Worthiness Certificate"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                </a>
              ) : null}
              {docs.insurance ? (
                <a
                  href={docs.insurance}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  title="Insurance Certificate"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </a>
              ) : null}
              {docs.hackneyPermit ? (
                <a
                  href={docs.hackneyPermit}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded bg-purple-50 text-purple-600 hover:bg-purple-100 transition"
                  title="Hackney Permit Certificate"
                >
                  <FileText className="w-3.5 h-3.5" />
                </a>
              ) : null}
              {info.row.original.documentsCount === 0 && (
                <span className="text-[11px] text-slate-400 italic">None</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Team Status',
        cell: (info) => {
          const val = info.getValue() as string;
          const isSent = val.toLowerCase() === 'sent';
          const isManual = val.toLowerCase().includes('manual');

          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap ${
                isSent
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : isManual
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {isSent && <CheckCircle2 className="w-3 h-3 mr-1" />}
              {isManual && <AlertCircle className="w-3 h-3 mr-1" />}
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: 'sharedBy',
        header: 'Shared By',
        cell: (info) => {
          const val = info.getValue() as string;
          return (
            <span className="text-xs text-slate-600 whitespace-nowrap truncate block max-w-[120px]" title={val}>
              {val || 'Direct'}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: (info) => {
          return (
            <button
              onClick={() => onSelectRecord(info.row.original)}
              className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              <span>Details</span>
            </button>
          );
        },
      },
    ],
    [onSelectRecord]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      
      {/* Search and Filters Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search by partner, plate, email, city, notes..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Vehicle Type Filter */}
          <select
            value={selectedVehicleType}
            onChange={(e) => setSelectedVehicleType(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Vehicles</option>
            {vehicleTypeOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          {/* Inspection Type Filter */}
          <select
            value={selectedInspectionType}
            onChange={(e) => setSelectedInspectionType(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Inspection Types</option>
            {inspectionTypeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="Sent">Sent</option>
            <option value="Manual Review — No Centre Match">Manual Review</option>
            <option value="Pending">Pending</option>
          </select>

          {(selectedVehicleType !== 'all' || selectedInspectionType !== 'all' || selectedStatus !== 'all' || globalFilter) && (
            <button
              onClick={() => {
                setSelectedVehicleType('all');
                setSelectedInspectionType('all');
                setSelectedStatus('all');
                setGlobalFilter('');
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2.5 py-2 rounded-lg hover:bg-rose-50 transition"
            >
              Reset Filters
            </button>
          )}

        </div>

      </div>

      {/* Table Container */}
      <div className="overflow-x-auto min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 font-medium">Fetching real-time Google Sheets records...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-2">
            <AlertCircle className="w-10 h-10 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No records found matching filters</p>
            <p className="text-xs text-slate-400">Try adjusting your search terms or clearing the dropdown filters</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-slate-200 bg-slate-50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 select-none"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/80 transition-colors duration-150 group cursor-pointer"
                  onClick={() => onSelectRecord(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td 
                      key={cell.id} 
                      className="px-4 py-3 text-xs text-slate-700 align-middle"
                      onClick={(e) => {
                        // Prevent row click if clicking link or button
                        if ((e.target as HTMLElement).tagName === 'A' || (e.target as HTMLElement).tagName === 'BUTTON') {
                          e.stopPropagation();
                        }
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        
        <div className="flex items-center space-x-2">
          <span>Rows per page:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {[10, 25, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
          <span className="text-slate-400">|</span>
          <span>
            Showing <strong className="font-semibold text-slate-800">{table.getRowModel().rows.length}</strong> of{' '}
            <strong className="font-semibold text-slate-800">{filteredData.length}</strong> entries
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-2 font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
