import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { InspectionRecord } from '../types/inspection';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Car,
  Clock,
  BarChart2,
  Layers,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export type TimelineGranularity = 'YoY' | 'QoQ' | 'MoM' | 'DoD';
export type ChartStyle = 'trend' | 'stacked' | 'area';

interface TimelineAnalyticsProps {
  records: InspectionRecord[];
}

const VEHICLE_PALETTE: Record<string, string> = {
  Coaster: '#4f46e5', // indigo
  'Sedan/Car': '#06b6d4', // cyan
  Hiace: '#10b981', // emerald
  Sienna: '#f59e0b', // amber
  Others: '#94a3b8', // slate
};

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Robustly parses a timestamp into a Date object
 */
function parseTimestamp(ts: string): Date | null {
  if (!ts) return null;
  const trimmed = ts.trim();
  const [dPart, tPart] = trimmed.split(' ');
  if (!dPart) return null;

  const slashParts = dPart.split('/').map(Number);
  if (slashParts.length === 3 && slashParts[0] && slashParts[1] && slashParts[2]) {
    const [day, month, year] = slashParts;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    if (tPart) {
      const [h, m, s] = tPart.split(':').map(Number);
      if (!isNaN(h)) hours = h;
      if (!isNaN(m)) minutes = m;
      if (!isNaN(s)) seconds = s;
    }
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Normalizes vehicle type to standard buckets
 */
function getVehicleBucket(vType: string): string {
  if (!vType) return 'Others';
  const clean = vType.trim();
  if (clean === 'Coaster') return 'Coaster';
  if (clean === 'Sedan/Car' || clean === 'Sedan') return 'Sedan/Car';
  if (clean === 'Hiace') return 'Hiace';
  if (clean === 'Sienna') return 'Sienna';
  return 'Others';
}

export const TimelineAnalytics: React.FC<TimelineAnalyticsProps> = ({ records }) => {
  const [granularity, setGranularity] = useState<TimelineGranularity>('MoM');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('ALL');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('trend');
  const [dodWindow, setDodWindow] = useState<'30' | '60' | '90' | 'ALL'>('60');
  const [showTable, setShowTable] = useState<boolean>(false);

  // Extract all distinct raw vehicle types for the filter selector
  const availableVehicleTypes = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach((r) => {
      const vt = (r.vehicleType && r.vehicleType.trim()) || 'Unspecified';
      counts[vt] = (counts[vt] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [records]);

  // Filter records based on selected vehicle
  const filteredRecords = useMemo(() => {
    if (selectedVehicle === 'ALL') return records;
    return records.filter((r) => {
      const vt = (r.vehicleType && r.vehicleType.trim()) || 'Unspecified';
      if (selectedVehicle === 'Others') {
        return getVehicleBucket(vt) === 'Others';
      }
      return vt === selectedVehicle || getVehicleBucket(vt) === selectedVehicle;
    });
  }, [records, selectedVehicle]);

  // Aggregate data according to granularity
  const aggregatedTimeline = useMemo(() => {
    const buckets: Record<
      string,
      {
        key: string;
        label: string;
        date: Date;
        count: number;
        vehiclesTotal: number;
        byVehicle: Record<string, number>;
      }
    > = {};

    filteredRecords.forEach((r) => {
      const dt = parseTimestamp(r.timestamp);
      if (!dt) return;

      const year = dt.getFullYear();
      const month = dt.getMonth() + 1;
      const day = dt.getDate();

      let key = '';
      let label = '';
      let sortDate = dt;

      if (granularity === 'YoY') {
        key = `${year}`;
        label = `${year}`;
        sortDate = new Date(year, 0, 1);
      } else if (granularity === 'QoQ') {
        const q = Math.ceil(month / 3);
        key = `${year}-Q${q}`;
        label = `Q${q} ${year}`;
        sortDate = new Date(year, (q - 1) * 3, 1);
      } else if (granularity === 'MoM') {
        const mStr = String(month).padStart(2, '0');
        key = `${year}-${mStr}`;
        label = `${MONTH_NAMES[month - 1]} ${year}`;
        sortDate = new Date(year, month - 1, 1);
      } else {
        // DoD
        const mStr = String(month).padStart(2, '0');
        const dStr = String(day).padStart(2, '0');
        key = `${year}-${mStr}-${dStr}`;
        label = `${day} ${MONTH_NAMES[month - 1]} ${year.toString().slice(-2)}`;
        sortDate = new Date(year, month - 1, day);
      }

      if (!buckets[key]) {
        buckets[key] = {
          key,
          label,
          date: sortDate,
          count: 0,
          vehiclesTotal: 0,
          byVehicle: { Coaster: 0, 'Sedan/Car': 0, Hiace: 0, Sienna: 0, Others: 0 },
        };
      }

      buckets[key].count += 1;
      const vCount = typeof r.vehiclesCount === 'number' ? r.vehiclesCount : parseInt(String(r.vehiclesCount), 10);
      buckets[key].vehiclesTotal += isNaN(vCount) ? 1 : vCount;

      const vBucket = getVehicleBucket(r.vehicleType);
      buckets[key].byVehicle[vBucket] = (buckets[key].byVehicle[vBucket] || 0) + 1;
    });

    let sorted = Object.values(buckets).sort((a, b) => a.date.getTime() - b.date.getTime());

    // Apply Day-on-Day window filter if applicable
    if (granularity === 'DoD' && dodWindow !== 'ALL') {
      const daysCount = parseInt(dodWindow, 10);
      sorted = sorted.slice(-daysCount);
    }

    // Compute period-over-period growth and variance
    const withMetrics = sorted.map((item, idx) => {
      const prev = idx > 0 ? sorted[idx - 1] : null;
      let changeCount = 0;
      let changePercent: number | null = null;

      if (prev) {
        changeCount = item.count - prev.count;
        changePercent = prev.count > 0 ? ((changeCount / prev.count) * 100) : 100;
      }

      return {
        ...item,
        Coaster: item.byVehicle.Coaster || 0,
        'Sedan/Car': item.byVehicle['Sedan/Car'] || 0,
        Hiace: item.byVehicle.Hiace || 0,
        Sienna: item.byVehicle.Sienna || 0,
        Others: item.byVehicle.Others || 0,
        changeCount,
        changePercent,
      };
    });

    return withMetrics;
  }, [filteredRecords, granularity, dodWindow]);

  // Overall Statistics for the selected timeline
  const timelineStats = useMemo(() => {
    const totalRequests = aggregatedTimeline.reduce((acc, curr) => acc + curr.count, 0);
    const periodsCount = aggregatedTimeline.length;
    const average = periodsCount > 0 ? totalRequests / periodsCount : 0;

    let peakPeriod = aggregatedTimeline[0] || null;
    let lowestPeriod = aggregatedTimeline[0] || null;

    aggregatedTimeline.forEach((item) => {
      if (!peakPeriod || item.count > peakPeriod.count) peakPeriod = item;
      if (!lowestPeriod || item.count < lowestPeriod.count) lowestPeriod = item;
    });

    const latest = aggregatedTimeline.length > 0 ? aggregatedTimeline[aggregatedTimeline.length - 1] : null;
    const previous = aggregatedTimeline.length > 1 ? aggregatedTimeline[aggregatedTimeline.length - 2] : null;

    let latestGrowth: number | null = null;
    if (latest && previous && previous.count > 0) {
      latestGrowth = ((latest.count - previous.count) / previous.count) * 100;
    }

    return {
      totalRequests,
      periodsCount,
      average,
      peakPeriod,
      lowestPeriod,
      latest,
      previous,
      latestGrowth,
    };
  }, [aggregatedTimeline]);

  // Compute Vehicle Type Averages across this timeline
  const vehicleTypeAverages = useMemo(() => {
    const periodsCount = aggregatedTimeline.length;
    if (periodsCount === 0) return [];

    const vehicleBuckets: Record<string, { total: number; name: string; color: string }> = {
      Coaster: { total: 0, name: 'Coaster', color: VEHICLE_PALETTE.Coaster },
      'Sedan/Car': { total: 0, name: 'Sedan/Car', color: VEHICLE_PALETTE['Sedan/Car'] },
      Hiace: { total: 0, name: 'Hiace', color: VEHICLE_PALETTE.Hiace },
      Sienna: { total: 0, name: 'Sienna', color: VEHICLE_PALETTE.Sienna },
      Others: { total: 0, name: 'Others', color: VEHICLE_PALETTE.Others },
    };

    aggregatedTimeline.forEach((period) => {
      vehicleBuckets.Coaster.total += period.Coaster;
      vehicleBuckets['Sedan/Car'].total += period['Sedan/Car'];
      vehicleBuckets.Hiace.total += period.Hiace;
      vehicleBuckets.Sienna.total += period.Sienna;
      vehicleBuckets.Others.total += period.Others;
    });

    const totalAll = timelineStats.totalRequests || 1;

    return Object.values(vehicleBuckets)
      .map((v) => ({
        ...v,
        average: v.total / periodsCount,
        sharePct: (v.total / totalAll) * 100,
      }))
      .sort((a, b) => b.total - a.total);
  }, [aggregatedTimeline, timelineStats.totalRequests]);

  const granularityLabel = {
    YoY: 'Year',
    QoQ: 'Quarter',
    MoM: 'Month',
    DoD: 'Day',
  }[granularity];

  const comparisonTitle = {
    YoY: 'Year on Year (YoY)',
    QoQ: 'Quarter on Quarter (QoQ)',
    MoM: 'Month on Month (MoM)',
    DoD: 'Day on Day (DoD)',
  }[granularity];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all space-y-6 p-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Inspection Request Temporal Analytics
                <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">
                  YoY • QoQ • MoM • DoD
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Analyze trends, comparative periodic growth, and average request volumes across custom timelines and vehicle types.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Granularity Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200 shadow-inner">
            {(['YoY', 'QoQ', 'MoM', 'DoD'] as TimelineGranularity[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setGranularity(mode)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                  granularity === mode
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode === 'YoY' && 'Year on Year'}
                {mode === 'QoQ' && 'Quarter on Quarter'}
                {mode === 'MoM' && 'Month on Month'}
                {mode === 'DoD' && 'Day on Day'}
              </button>
            ))}
          </div>

          {/* Vehicle Type Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Car className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Vehicle Types ({records.length})</option>
              <option value="Coaster">Coaster</option>
              <option value="Sedan/Car">Sedan / Car</option>
              <option value="Hiace">Hiace</option>
              <option value="Sienna">Sienna</option>
              <option value="Others">Other / Custom Types</option>
              {availableVehicleTypes
                .filter(
                  ([name]) =>
                    !['Coaster', 'Sedan/Car', 'Hiace', 'Sienna', 'Unspecified'].includes(name)
                )
                .slice(0, 6)
                .map(([name, count]) => (
                  <option key={name} value={name}>
                    {name} ({count})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards: Dynamic Averages & Periodic Changes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: The Average Metric (Key Requirement) */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/80 to-indigo-100/30 border border-indigo-200 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wide uppercase text-indigo-700">
              Average Requests
            </span>
            <span className="p-1 rounded bg-indigo-100 text-indigo-700">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">
              {timelineStats.average.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-slate-600">
              requests / {granularityLabel.toLowerCase()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {timelineStats.periodsCount} recorded {granularityLabel.toLowerCase()}s
            {selectedVehicle !== 'ALL' && ` for ${selectedVehicle}`}
          </p>
        </div>

        {/* Card 2: Latest Period & Period-over-Period Growth */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wide uppercase text-slate-600">
              Latest {granularityLabel} ({timelineStats.latest?.label || 'N/A'})
            </span>
            <span className="p-1 rounded bg-slate-100 text-slate-600">
              <Activity className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {timelineStats.latest?.count || 0}
            </span>
            {timelineStats.latestGrowth !== null ? (
              <span
                className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                  timelineStats.latestGrowth >= 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {timelineStats.latestGrowth >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-0.5" />
                )}
                {Math.abs(timelineStats.latestGrowth).toFixed(1)}% {granularity}
              </span>
            ) : (
              <span className="text-xs text-slate-400">First period</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {timelineStats.previous
              ? `Prev ${granularityLabel}: ${timelineStats.previous.count} requests`
              : 'Baseline period'}
          </p>
        </div>

        {/* Card 3: Peak Volume Period */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/70 to-emerald-100/20 border border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wide uppercase text-emerald-800">
              Peak {granularityLabel}
            </span>
            <span className="p-1 rounded bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">
              {timelineStats.peakPeriod?.count || 0}
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              {timelineStats.peakPeriod?.label}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Highest volume recorded in this timeline
          </p>
        </div>

        {/* Card 4: Total Filtered Requests */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wide uppercase text-slate-600">
              Total Inspected in View
            </span>
            <span className="p-1 rounded bg-slate-100 text-slate-600">
              <Layers className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">
              {timelineStats.totalRequests}
            </span>
            <span className="text-xs font-medium text-slate-500">
              requests
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {selectedVehicle === 'ALL'
              ? 'All fleet categories combined'
              : `Filtered specifically for ${selectedVehicle}`}
          </p>
        </div>

      </div>

      {/* Vehicle Type Average Breakdown Pill Bar */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <Car className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Average Inspection Requests by Vehicle Type ({comparisonTitle})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Click any vehicle to filter the entire timeline
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {vehicleTypeAverages.map((v) => {
            const isSelected = selectedVehicle === v.name;
            return (
              <div
                key={v.name}
                onClick={() => setSelectedVehicle(isSelected ? 'ALL' : v.name)}
                className={`p-3 rounded-lg border transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300'
                    : 'bg-white hover:bg-indigo-50/50 text-slate-800 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {v.name}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 ml-1"
                    style={{ backgroundColor: isSelected ? '#ffffff' : v.color }}
                  />
                </div>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <span className={`text-base font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {v.average.toFixed(1)}
                  </span>
                  <span className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                    avg / {granularityLabel.toLowerCase()}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <span className={isSelected ? 'text-indigo-200' : 'text-slate-500'}>
                    Total: {v.total}
                  </span>
                  <span className={`font-semibold ${isSelected ? 'text-white' : 'text-indigo-600'}`}>
                    {v.sharePct.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {comparisonTitle} Timeline & Average Trend
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            {/* DoD Day Window Selector */}
            {granularity === 'DoD' && (
              <div className="inline-flex rounded-md p-0.5 bg-slate-100 border border-slate-200 text-xs">
                {(['30', '60', '90', 'ALL'] as const).map((win) => (
                  <button
                    key={win}
                    onClick={() => setDodWindow(win)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      dodWindow === win
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {win === 'ALL' ? 'All Days' : `Last ${win}d`}
                  </button>
                ))}
              </div>
            )}

            {/* Chart Style Selector */}
            <div className="inline-flex rounded-md p-0.5 bg-slate-100 border border-slate-200 text-xs">
              <button
                onClick={() => setChartStyle('trend')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  chartStyle === 'trend'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bar Chart
              </button>
              <button
                onClick={() => setChartStyle('area')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  chartStyle === 'area'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Area Trend
              </button>
              {selectedVehicle === 'ALL' && (
                <button
                  onClick={() => setChartStyle('stacked')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                    chartStyle === 'stacked'
                      ? 'bg-white text-indigo-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Vehicle Breakdown
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartStyle === 'area' ? (
              <AreaChart
                data={aggregatedTimeline}
                margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={granularity === 'DoD' ? -35 : -20}
                  textAnchor="end"
                  interval={granularity === 'DoD' ? Math.ceil(aggregatedTimeline.length / 15) : 0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={(props: any) => {
                    const { active, payload } = props;
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1">
                          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">
                            {data.label}
                          </p>
                          <p className="text-indigo-300 font-semibold text-sm">
                            {data.count} Inspection Requests
                          </p>
                          <p className="text-slate-400">
                            Vehicles Count: <span className="text-white">{data.vehiclesTotal}</span>
                          </p>
                          {data.changePercent !== null && (
                            <p className="text-slate-400">
                              {granularity} Change:{' '}
                              <span
                                className={
                                  data.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                }
                              >
                                {data.changePercent >= 0 ? '+' : ''}
                                {data.changePercent.toFixed(1)}% ({data.changeCount >= 0 ? '+' : ''}
                                {data.changeCount})
                              </span>
                            </p>
                          )}
                          <p className="text-amber-400 text-[11px] pt-0.5 border-t border-slate-800">
                            Avg Line: {timelineStats.average.toFixed(1)} req (
                            {data.count >= timelineStats.average ? '+' : ''}
                            {(data.count - timelineStats.average).toFixed(1)})
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={timelineStats.average}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: `Avg: ${timelineStats.average.toFixed(1)} req/${granularityLabel.toLowerCase()}`,
                    fill: '#d97706',
                    position: 'top',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            ) : chartStyle === 'stacked' && selectedVehicle === 'ALL' ? (
              <BarChart
                data={aggregatedTimeline}
                margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={granularity === 'DoD' ? -35 : -20}
                  textAnchor="end"
                  interval={granularity === 'DoD' ? Math.ceil(aggregatedTimeline.length / 15) : 0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={(props: any) => {
                    const { active, payload } = props;
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1">
                          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">
                            {data.label} (Total: {data.count})
                          </p>
                          <div className="space-y-0.5 pt-1">
                            {['Coaster', 'Sedan/Car', 'Hiace', 'Sienna', 'Others'].map((vName) => (
                              <div key={vName} className="flex items-center justify-between text-[11px]">
                                <span className="flex items-center space-x-1.5">
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: VEHICLE_PALETTE[vName] }}
                                  />
                                  <span className="text-slate-300">{vName}:</span>
                                </span>
                                <span className="font-semibold text-white ml-2">
                                  {data[vName] || 0}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={32}
                  wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
                />
                <ReferenceLine
                  y={timelineStats.average}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: `Avg: ${timelineStats.average.toFixed(1)}`,
                    fill: '#d97706',
                    position: 'top',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                />
                <Bar dataKey="Coaster" stackId="a" fill={VEHICLE_PALETTE.Coaster} />
                <Bar dataKey="Sedan/Car" stackId="a" fill={VEHICLE_PALETTE['Sedan/Car']} />
                <Bar dataKey="Hiace" stackId="a" fill={VEHICLE_PALETTE.Hiace} />
                <Bar dataKey="Sienna" stackId="a" fill={VEHICLE_PALETTE.Sienna} />
                <Bar dataKey="Others" stackId="a" fill={VEHICLE_PALETTE.Others} radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart
                data={aggregatedTimeline}
                margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={granularity === 'DoD' ? -35 : -20}
                  textAnchor="end"
                  interval={granularity === 'DoD' ? Math.ceil(aggregatedTimeline.length / 15) : 0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={(props: any) => {
                    const { active, payload } = props;
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1">
                          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">
                            {data.label}
                          </p>
                          <p className="text-indigo-300 font-semibold text-sm">
                            {data.count} Inspection Requests
                          </p>
                          <p className="text-slate-400">
                            Vehicles Count: <span className="text-white">{data.vehiclesTotal}</span>
                          </p>
                          {data.changePercent !== null && (
                            <p className="text-slate-400">
                              {granularity} Growth:{' '}
                              <span
                                className={
                                  data.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                }
                              >
                                {data.changePercent >= 0 ? '+' : ''}
                                {data.changePercent.toFixed(1)}% ({data.changeCount >= 0 ? '+' : ''}
                                {data.changeCount})
                              </span>
                            </p>
                          )}
                          <p className="text-amber-400 text-[11px] pt-0.5 border-t border-slate-800">
                            Avg Reference: {timelineStats.average.toFixed(1)} req (
                            {data.count >= timelineStats.average ? '+' : ''}
                            {(data.count - timelineStats.average).toFixed(1)})
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={timelineStats.average}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: `Avg: ${timelineStats.average.toFixed(1)} req/${granularityLabel.toLowerCase()}`,
                    fill: '#d97706',
                    position: 'top',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[5, 5, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Collapsible Detailed Periodic Breakdown Table */}
      <div className="pt-2 border-t border-slate-100">
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center justify-between w-full text-xs font-bold text-slate-700 hover:text-indigo-600 transition py-1"
        >
          <span className="flex items-center gap-1.5">
            <span>View Detailed {comparisonTitle} Periodic Records & Growth Table</span>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 font-semibold">
              {aggregatedTimeline.length} periods
            </span>
          </span>
          {showTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTable && (
          <div className="mt-3 overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3 text-right">Requests</th>
                  <th className="py-2.5 px-3 text-right">Vehicles</th>
                  <th className="py-2.5 px-3 text-right">{granularity} Growth</th>
                  <th className="py-2.5 px-3 text-right">Vs Average ({timelineStats.average.toFixed(1)})</th>
                  <th className="py-2.5 px-3">Fleet Composition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {aggregatedTimeline
                  .slice()
                  .reverse()
                  .map((period) => {
                    const diffAvg = period.count - timelineStats.average;
                    const diffAvgPct = timelineStats.average > 0 ? (diffAvg / timelineStats.average) * 100 : 0;
                    return (
                      <tr key={period.key} className="hover:bg-slate-50/80 transition">
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {period.label}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          {period.count}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-600">
                          {period.vehiclesTotal}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {period.changePercent !== null ? (
                            <span
                              className={`inline-flex items-center font-semibold ${
                                period.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {period.changePercent >= 0 ? '+' : ''}
                              {period.changePercent.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              diffAvg >= 0
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {diffAvg >= 0 ? '+' : ''}
                            {diffAvg.toFixed(1)} ({diffAvgPct >= 0 ? '+' : ''}
                            {diffAvgPct.toFixed(0)}%)
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                            {period.Coaster > 0 && <span>Coaster: {period.Coaster}</span>}
                            {period['Sedan/Car'] > 0 && <span>Sedan: {period['Sedan/Car']}</span>}
                            {period.Hiace > 0 && <span>Hiace: {period.Hiace}</span>}
                            {period.Sienna > 0 && <span>Sienna: {period.Sienna}</span>}
                            {period.Others > 0 && <span>Other: {period.Others}</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
