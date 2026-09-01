import React, { useState } from 'react';
import {
  X,
  QrCode,
  Search,
  Camera,
  ArrowLeft,
  CheckCircle2,
  Package,
  Stethoscope,
  Sparkles,
  Building,
  History,
} from 'lucide-react';
import { EquipmentItem } from '../../types';
import { toPersianNumber } from '../../utils/taxonomyAnalytics';
import { isEligibleForFaultReport } from '../../utils/equipmentEligibility';

interface EquipmentQrScannerModalProps {
  equipmentList: EquipmentItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectEquipment: (equipment: EquipmentItem) => void;
}

export const EquipmentQrScannerModal: React.FC<EquipmentQrScannerModalProps> = ({
  equipmentList = [],
  isOpen,
  onClose,
  onSelectEquipment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanningMode, setIsScanningMode] = useState(true);

  if (!isOpen) return null;

  const filteredItems = equipmentList.filter(
    (e) =>
      !e.isDraft &&
      (e.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.faName?.includes(searchQuery) ||
        e.enName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.department?.includes(searchQuery))
  );

  const handleScanSample = (equipment: EquipmentItem) => {
    onSelectEquipment(equipment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto font-sans text-right dir-rtl">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">اسکنر و جستجوی سریع کیو‌آرکد تجهیزات</h3>
              <p className="text-xs text-blue-200/80">
                اسکن بارکد/QR یا وارد کردن کد اموال جهت ورود مستقیم به پرونده دیجیتال
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Scanner Simulation Viewfinder */}
        <div className="p-6 bg-slate-950 text-white flex flex-col items-center justify-center relative overflow-hidden shrink-0">
          <div className="relative w-56 h-56 rounded-2xl border-2 border-blue-500/80 bg-slate-900/60 flex flex-col items-center justify-center p-4 overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            {/* Viewfinder corner brackets */}
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-blue-400" />
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-blue-400" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-blue-400" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-blue-400" />

            {/* Scanning Laser Animation Bar */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444] animate-bounce duration-1000" />

            <Camera className="w-10 h-10 text-blue-400/60 mb-2" />
            <span className="text-[11px] font-bold text-blue-200 text-center">
              دوربین را مقابل QR کد روی تجهیز نگه دارید
            </span>
            <span className="text-[9px] text-slate-400 font-mono mt-1">
              پشتیبانی از کلیه برچسب‌های اموال
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="یا کد اموال (مانند EQ-1042)، شماره سریال یا نام تجهیز را جستجو کنید..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-2xs"
            />
          </div>
        </div>

        {/* Equipment Results Quick Pick */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1 mb-1">
            <span>تجهیزات و کالاهای آماده اسکن:</span>
            <span className="font-mono">{toPersianNumber(filteredItems.length)} مورد</span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <QrCode className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold">موردی با این مشخصات یافت نشد</p>
            </div>
          ) : (
            filteredItems.slice(0, 15).map((item) => {
              const isDevice = isEligibleForFaultReport(item);
              return (
                <button
                  key={item.id}
                  onClick={() => handleScanSample(item)}
                  className="w-full p-3 rounded-2xl bg-white hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-300 transition-all flex items-center justify-between text-right group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isDevice
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}
                    >
                      {isDevice ? <Stethoscope className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-800">
                          {item.code}
                        </span>
                        <h4 className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                          {item.faName}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.brand} ({item.model}) — بخش: {item.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:translate-x-[-2px] transition-transform">
                    <span>مشاهده شناسنامه</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center shrink-0">
          <p className="text-[11px] text-slate-500 font-medium">
            با اسکن QR کد پرینت‌شده روی هر تجهیز، مستقیماً وارد پرونده فنی و بالینی همان دستگاه می‌شوید.
          </p>
        </div>
      </div>
    </div>
  );
};
