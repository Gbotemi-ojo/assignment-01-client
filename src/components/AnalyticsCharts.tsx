import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { InspectionStats } from '../types/inspection';
import { BarChart3, PieChart as PieIcon, ChevronDown, ChevronUp } from 'lucide-react';

interface AnalyticsChartsProps {
  stats: InspectionStats;
}

const VEHICLE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];
const STATUS_COLORS = ['#10b981', '#f59e0b', '#6366f1', '#94a3b8'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ stats }) => {
  const [isOpen, setIsOpen] = useState(true);

  // Prepare vehicle type data (top 5 + Other)
  const vehicleEntries = Object.entries(stats.byVehicleType)
    .sort((a, b) => b[1] - a[1]);
  
  const topVehicles = vehicleEntries.slice(0, 5).map(([name, count]) => ({
    name: name.length > 12 ? name.substring(0, 12) + '...' : name,
    fullName: name,
    count,
  }));
  const otherVehiclesCount = vehicleEntries.slice(5).reduce((acc, curr) => acc + curr[1], 0);
  if (otherVehiclesCount > 0) {
    topVehicles.push({ name: 'Others', fullName: 'Others', count: otherVehiclesCount });
  }

  // Prepare inspection types
  const inspectionData = Object.entries(stats.byInspectionType)
    .map(([name, value]) => ({
      name: name.replace(' Inspection', '').replace(' Vehicles', ''),
      fullName: name,
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  // Status breakdown
  const statusData = [
    { name: 'Pending / In Progress', value: stats.pendingCount },
    { name: 'Sent to Partner', value: stats.sentCount },
    { name: 'Manual Review Needed', value: stats.manualReviewCount },
  ].filter(s => s.value > 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-4 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
      >
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">
            Fleet Breakdown & Inspection Analytics
          </h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
            Live Visualizations
          </span>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Chart 1: Vehicle Models */}
          <div className="flex flex-col">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Vehicle Models Distribution
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topVehicles} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    angle={-20} 
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    formatter={(val: number) => [`${val} vehicles`, 'Count']}
                    labelFormatter={(label) => `Model: ${label}`}
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      borderRadius: '8px', 
                      color: '#ffffff', 
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}
                    itemStyle={{ color: '#38bdf8', fontWeight: 600 }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 500 }}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Inspection Types */}
          <div className="flex flex-col">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Inspection Type Breakdown
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inspectionData}
                    cx="50%"
                    cy="45%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {inspectionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={VEHICLE_COLORS[index % VEHICLE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: number) => [`${val} inspections`, 'Total']}
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      borderRadius: '8px', 
                      color: '#ffffff', 
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}
                    itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                    labelStyle={{ color: '#38bdf8', fontWeight: 600 }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Review & Routing Status */}
          <div className="flex flex-col">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Routing & Processing Status
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-status-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: number) => [`${val} records`, 'Count']}
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      borderRadius: '8px', 
                      color: '#ffffff', 
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}
                    itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                    labelStyle={{ color: '#38bdf8', fontWeight: 600 }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
