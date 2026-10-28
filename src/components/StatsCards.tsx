import React from 'react';
import { InspectionStats } from '../types/inspection';
import { 
  ClipboardCheck, 
  Car, 
  FileCheck, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  ArrowUpRight 
} from 'lucide-react';

interface StatsCardsProps {
  stats: InspectionStats;
  totalVisible: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, totalVisible }) => {
  const preOnboarding = stats.byInspectionType['Pre-Onboarding Inspection'] || 0;
  const existingVehicles = stats.byInspectionType['Existing Vehicles Inspection'] || 0;
  const spotChecks = stats.byInspectionType['Spot Check'] || 0;

  const cards = [
    {
      title: 'Total Requests',
      value: stats.totalRecords.toLocaleString(),
      subValue: `${stats.totalVehiclesInspected} vehicles requested`,
      icon: ClipboardCheck,
      color: 'from-blue-600 to-indigo-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Pre-Onboarding',
      value: preOnboarding.toLocaleString(),
      subValue: `${Math.round((preOnboarding / (stats.totalRecords || 1)) * 100)}% of all inspections`,
      icon: Car,
      color: 'from-emerald-600 to-teal-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'Existing & Spot Checks',
      value: (existingVehicles + spotChecks).toLocaleString(),
      subValue: `${existingVehicles} existing, ${spotChecks} spot checks`,
      icon: Users,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-100',
    },
    {
      title: 'Review & Sent Status',
      value: stats.sentCount.toLocaleString(),
      subValue: `${stats.manualReviewCount} need manual review`,
      icon: CheckCircle,
      color: 'from-purple-600 to-pink-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.bgColor} ${card.textColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {card.subValue}
            </p>
          </div>
        );
      })}
    </div>
  );
};
