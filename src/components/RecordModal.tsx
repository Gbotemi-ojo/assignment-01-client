import React from 'react';
import { InspectionRecord } from '../types/inspection';
import { 
  X, 
  ExternalLink, 
  FileText, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Car, 
  ShieldCheck, 
  Clock, 
  Info,
  CheckCircle2
} from 'lucide-react';

interface RecordModalProps {
  record: InspectionRecord | null;
  onClose: () => void;
}

export const RecordModal: React.FC<RecordModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const docList = [
    { label: 'Vehicle License Certificate', url: record.documents.vehicleLicense },
    { label: 'Road Worthiness Certificate', url: record.documents.roadWorthiness },
    { label: 'Hackney Permit Certificate', url: record.documents.hackneyPermit },
    { label: 'Insurance Certificate', url: record.documents.insurance },
    { label: 'Speed Limit Certificate', url: record.documents.speedLimit },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-sm">
              #{record.rowNumber}
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {record.partnerName}
              </h3>
              <p className="text-xs text-slate-500">
                Logged: {record.timestamp}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Key Information Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Car className="w-3.5 h-3.5 mr-1" />
              {record.vehicleType} ({record.vehiclesCount} unit{record.vehiclesCount === 1 ? '' : 's'})
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              {record.inspectionType}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              record.status.toLowerCase() === 'sent'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : record.status.toLowerCase().includes('manual')
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Status: {record.status}
            </span>
            {record.partnershipStatus && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                {record.partnershipStatus}
              </span>
            )}
          </div>

          {/* Partner & Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Partner Name
              </span>
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <User className="w-4 h-4 text-slate-400" />
                {record.partnerName}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Phone Number
              </span>
              <span className="text-sm font-medium text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Phone className="w-4 h-4 text-slate-400" />
                {record.partnerPhone || 'Not provided'}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Email Address
              </span>
              <span className="text-sm font-medium text-slate-800 flex items-center gap-1.5 mt-0.5 truncate">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a href={`mailto:${record.partnerEmail}`} className="text-indigo-600 hover:underline truncate">
                  {record.partnerEmail || 'Not provided'}
                </a>
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Vehicle Location
              </span>
              <span className="text-sm font-medium text-slate-800 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                {record.location || 'Not provided'}
              </span>
            </div>
          </div>

          {/* Vehicle & Operational Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-xl">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Plate Number(s)
              </span>
              <span className="text-sm font-mono font-bold text-slate-900 mt-1 block">
                {record.plateNumber || 'None specified'}
              </span>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Preferred Inspection Date
              </span>
              <span className="text-sm font-medium text-slate-900 flex items-center gap-1.5 mt-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                {record.preferredDate || 'No date specified'}
              </span>
            </div>
          </div>

          {/* Comments / Insight */}
          {record.comments && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
              <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase text-amber-800 mb-1">
                <Info className="w-4 h-4 text-amber-600" />
                <span>Partner Comments / Vehicle Insight</span>
              </div>
              <p className="text-sm text-amber-950 font-normal leading-relaxed italic">
                "{record.comments}"
              </p>
            </div>
          )}

          {/* Submitted Certificates / Drive Documents */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              Attached Google Drive Certificates ({record.documentsCount} of 5)
            </h4>
            <div className="space-y-2">
              {docList.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100 transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${doc.url ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className="text-sm font-medium text-slate-800">
                      {doc.label}
                    </span>
                  </div>
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded transition"
                    >
                      <span>View File</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 italic">
                      Not uploaded
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Internal Team Metadata */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div>
              <span className="font-medium text-slate-700">Referred / Shared by: </span>
              <span>{record.sharedBy || 'Direct'}</span>
            </div>
            {record.scheduledDate && (
              <div>
                <span className="font-medium text-slate-700">Scheduled Date: </span>
                <span>{record.scheduledDate}</span>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
