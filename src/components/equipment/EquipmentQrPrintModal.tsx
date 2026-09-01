import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  QrCode,
  Sparkles,
  Building,
  ShieldCheck,
  UserCheck,
  Calendar,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { EquipmentItem } from '../../types';
import { toPersianNumber } from '../../utils/taxonomyAnalytics';
import { getEquipmentPassportUrl } from '../../utils/qrCodeHelper';
import { isEligibleForCalibration, isEligibleForFaultReport } from '../../utils/equipmentEligibility';

interface EquipmentQrPrintModalProps {
  equipment: EquipmentItem;
  allEquipmentList?: EquipmentItem[];
  onClose: () => void;
  onSelectAnotherEquipment?: (item: EquipmentItem) => void;
}

type PrintTemplate = 'standard_sticker' | 'compact_sticker' | 'certificate_a5' | 'sheet_a4';
type LabelTheme = 'hospital_blue' | 'thermal_bw' | 'emerald_clinical';

export const EquipmentQrPrintModal: React.FC<EquipmentQrPrintModalProps> = ({
  equipment,
  allEquipmentList = [],
  onClose,
  onSelectAnotherEquipment,
}) => {
  const [template, setTemplate] = useState<PrintTemplate>('standard_sticker');
  const [theme, setTheme] = useState<LabelTheme>('hospital_blue');
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedBatchItems, setSelectedBatchItems] = useState<EquipmentItem[]>([
    equipment,
    ...allEquipmentList.filter((e) => e.id !== equipment.id && !e.isDraft).slice(0, 11),
  ]);

  const printableRef = useRef<HTMLDivElement>(null);

  const passportUrl = getEquipmentPassportUrl(equipment);
  const isDevice = isEligibleForFaultReport(equipment);
  const requiresCalib = isEligibleForCalibration(equipment);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(passportUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDirectPrint = () => {
    window.print();
  };

  const handleDownloadSvg = () => {
    const svgElement = printableRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `Label_QR_${equipment.code}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[80] flex items-center justify-center p-4 overflow-y-auto font-sans text-right dir-rtl">
      {/* Styles for print mode */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-label-area, #printable-label-area * {
            visibility: visible;
          }
          #printable-label-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-2xs">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-200 font-bold border border-blue-400/30">
                  {equipment.code}
                </span>
                <h3 className="text-base font-black text-white">
                  مرکز چاپ و تولید لیبل اموال و کیو‌آرکد تجهیز
                </h3>
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5">
                تولید برچسب فیزیکی استاندارد و اسکن‌پذیر جهت الصاق روی بدنه تجهیز و کالای بیمارستانی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDirectPrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md hover:shadow-blue-500/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ پرینتر (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 shrink-0 no-print">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Template Selectors */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600 ml-1">قالب چاپ:</span>
              {[
                { id: 'standard_sticker', label: 'برچسب استاندارد اموال (۸×۵)' },
                { id: 'compact_sticker', label: 'برچسب فشرده و کوچک (۵×۳)' },
                { id: 'certificate_a5', label: 'شناسنامه دیواری (A5)' },
                { id: 'sheet_a4', label: 'برگه چاپ گروهی A4 (۱۲ تایی)' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id as PrintTemplate)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    template === t.id
                      ? 'bg-blue-600 text-white shadow-2xs font-black'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Printable Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/70 flex items-center justify-center min-h-[380px]">
          <div
            id="printable-label-area"
            ref={printableRef}
            className="w-full flex items-center justify-center"
          >
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* TEMPLATE 1: STANDARD ASSET STICKER (8x5 cm style) */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {template === 'standard_sticker' && (
              <div
                className={`w-full max-w-[540px] bg-white rounded-2xl border-2 p-5 shadow-lg transition-all ${
                  theme === 'hospital_blue'
                    ? 'border-blue-900 ring-4 ring-blue-100/50'
                    : theme === 'emerald_clinical'
                    ? 'border-emerald-800 ring-4 ring-emerald-100/50'
                    : 'border-slate-950 ring-4 ring-slate-100'
                }`}
              >
                {/* Header of the label */}
                <div
                  className={`flex items-center justify-between pb-2.5 border-b-2 ${
                    theme === 'hospital_blue'
                      ? 'border-blue-900 text-blue-950'
                      : theme === 'emerald_clinical'
                      ? 'border-emerald-800 text-emerald-950'
                      : 'border-slate-950 text-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                        theme === 'hospital_blue'
                          ? 'bg-blue-900'
                          : theme === 'emerald_clinical'
                          ? 'bg-emerald-800'
                          : 'bg-slate-950'
                      }`}
                    >
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black tracking-tight">
                        مرکز آموزشی، پژوهشی و درمانی تخصصی
                      </h4>
                      <p className="text-[9px] font-bold text-slate-500">
                        سامانه جامع مدیریت هوشمند دارایی‌ها و تجهیزات
                      </p>
                    </div>
                  </div>

                  <div className="text-left font-mono">
                    <span
                      className={`text-sm font-black px-2.5 py-1 rounded-md border ${
                        theme === 'hospital_blue'
                          ? 'bg-blue-50 border-blue-900 text-blue-950'
                          : theme === 'emerald_clinical'
                          ? 'bg-emerald-50 border-emerald-800 text-emerald-950'
                          : 'bg-slate-100 border-slate-950 text-slate-950'
                      }`}
                    >
                      {equipment.code}
                    </span>
                  </div>
                </div>

                {/* Body: QR Code + Key Details */}
                <div className="grid grid-cols-12 gap-4 pt-3 items-center">
                  {/* QR Code Container */}
                  <div className="col-span-4 flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <QRCodeSVG
                      value={passportUrl}
                      size={120}
                      level="H"
                      includeMargin={true}
                      className="w-full h-auto max-w-[120px]"
                    />
                    <span className="text-[8.5px] font-bold text-slate-600 mt-1 text-center">
                      اسکن جهت پرونده هوشمند
                    </span>
                  </div>

                  {/* Metadata fields - ONLY STATIC / IMMUTABLE */}
                  <div className="col-span-8 space-y-2 text-right">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-1">
                        {equipment.faName}
                      </h3>
                      <p className="font-mono text-[10px] text-slate-500 truncate">
                        {equipment.enName || `${equipment.brand} ${equipment.model}`}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] pt-1.5 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[9px]">سازنده / برند:</span>
                        <strong className="text-slate-800 font-bold">
                          {equipment.brand}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">مدل دستگاه:</span>
                        <strong className="text-slate-800 font-mono font-bold">
                          {equipment.model || 'N/A'}
                        </strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[9px]">شماره سریال سخت‌افزاری (Serial No):</span>
                        <strong className="text-slate-900 font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded inline-block">
                          {equipment.serialNumber || 'SN-N/A'}
                        </strong>
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[9px] text-slate-500 leading-tight">
                      ℹ️ اطلاعات اپراتور، محل استقرار و سوابق کالیبراسیون/تعمیر به‌صورت زنده با اسکن بارکد در دسترس است.
                    </div>
                  </div>
                </div>

                {/* Footer Warnings */}
                <div
                  className={`mt-3 pt-2 border-t flex items-center justify-between text-[8.5px] font-bold ${
                    theme === 'hospital_blue'
                      ? 'border-blue-100 text-blue-900'
                      : theme === 'emerald_clinical'
                      ? 'border-emerald-100 text-emerald-900'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>اموال رسمی مرکز درمانی — جداکردن یا مخدوش کردن برچسب پیگرد دارد</span>
                  </span>
                  <span className="font-mono">ثبت: {toPersianNumber(equipment.purchaseDate || '۱۴۰۳')}</span>
                </div>
              </div>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* TEMPLATE 2: COMPACT / MINI STICKER (5x3 cm style) */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {template === 'compact_sticker' && (
              <div
                className={`w-full max-w-[380px] bg-white rounded-xl border-2 p-3 shadow-md ${
                  theme === 'hospital_blue'
                    ? 'border-blue-900'
                    : theme === 'emerald_clinical'
                    ? 'border-emerald-800'
                    : 'border-slate-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg shrink-0">
                    <QRCodeSVG value={passportUrl} size={84} level="M" />
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-500">اموال بیمارستان</span>
                      <span className="font-mono text-xs font-black bg-slate-100 px-1.5 py-0.2 rounded border border-slate-300">
                        {equipment.code}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 truncate">
                      {equipment.faName}
                    </h4>
                    <p className="text-[10px] text-slate-600 font-bold truncate">
                      {equipment.brand} — {equipment.department}
                    </p>
                    <p className="text-[8px] text-slate-400 font-mono">
                      SN: {equipment.serialNumber || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* TEMPLATE 3: FULL A5 WALL / DESK CERTIFICATE */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {template === 'certificate_a5' && (
              <div className="w-full max-w-[620px] bg-white rounded-3xl border-2 border-slate-900 p-6 shadow-xl space-y-4">
                {/* Formal Certificate Header */}
                <div className="text-center pb-3 border-b-2 border-slate-900 space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Building className="w-5 h-5 text-blue-900" />
                    <h3 className="text-base font-black text-slate-900">
                      شناسنامه رسمی و برگه مشخصات فنی تجهیز پزشکی
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold">
                    معاونت درمان و مهندسی پزشکی — سامانه هوشمند ردیابی دارایی‌های بالینی
                  </p>
                </div>

                {/* Middle Content */}
                <div className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-4 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <QRCodeSVG value={passportUrl} size={140} level="H" includeMargin={true} />
                    <div>
                      <span className="text-[10px] font-black text-blue-900 block">
                        کیو‌آرکد اختصاصی
                      </span>
                      <span className="text-[8.5px] text-slate-500 font-mono">
                        جهت مشاهده سوابق و آموزش‌ها
                      </span>
                    </div>
                  </div>

                  <div className="col-span-8 space-y-2 text-xs">
                    <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-blue-800 font-bold">کد دارایی / اموال:</span>
                        <strong className="font-mono text-sm text-blue-950 font-black">
                          {equipment.code}
                        </strong>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 mt-1">{equipment.faName}</h4>
                      <p className="font-mono text-[10px] text-slate-600">{equipment.enName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 block text-[9px]">کمپانی سازنده:</span>
                        <strong className="text-slate-800 font-bold">{equipment.brand}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">مدل دستگاه:</span>
                        <strong className="text-slate-800 font-mono font-bold">{equipment.model}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[9px]">شماره سریال سخت‌افزاری (Serial Number):</span>
                        <strong className="text-slate-900 font-mono font-bold">{equipment.serialNumber}</strong>
                      </div>
                      <div className="col-span-2 text-[9.5px] text-slate-500 pt-1 border-t border-slate-200/60">
                        محل استقرار، نام اپراتور و سررسید کالیبراسیون با اسکن کیو‌آرکد به صورت آنلاین از سرور مرکزی استعلام می‌شود.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[10px] text-slate-700 space-y-1">
                  <div className="font-black text-slate-900 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>دستورالعمل اسکن و کاربری:</span>
                  </div>
                  <p className="leading-relaxed">
                    پرسنل و کادر بالینی موظفند قبل از آغاز شیفت، با اسکن کیو‌آرکد فوق، چک‌لیست مراقبت
                    روزانه را ثبت نموده و در صورت مشاهده هرگونه نقص فنی، سریعاً اعلام خرابی نمایند.
                  </p>
                </div>
              </div>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* TEMPLATE 4: A4 BATCH SHEET (12 Stickers on 1 Page) */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {template === 'sheet_a4' && (
              <div className="w-full bg-white rounded-2xl border border-slate-300 p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 no-print">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>پیش‌نمایش چاپ گروهی برگه A4 (شامل ۱۲ برچسب اموال آماده برش بدون فیلدهای متغیر)</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    تعداد: {toPersianNumber(selectedBatchItems.length)} لیبل
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedBatchItems.map((item, idx) => {
                    const itemUrl = getEquipmentPassportUrl(item);
                    return (
                      <div
                        key={item.id || idx}
                        className="p-3 rounded-xl border-2 border-dashed border-slate-300 bg-white space-y-2 text-right relative hover:border-blue-500 transition-colors"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                          <span className="text-[9px] font-black text-blue-900">اموال بیمارستان</span>
                          <span className="font-mono text-[10px] font-black bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-slate-800">
                            {item.code}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-slate-50 border border-slate-200 rounded shrink-0">
                            <QRCodeSVG value={itemUrl} size={64} level="M" />
                          </div>
                          <div className="overflow-hidden space-y-0.5">
                            <h5 className="text-[11px] font-black text-slate-900 truncate">
                              {item.faName}
                            </h5>
                            <p className="text-[9px] text-slate-500 truncate">
                              {item.brand} ({item.model})
                            </p>
                            <p className="text-[8px] text-slate-400 font-mono">
                              SN: {item.serialNumber || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="text-[7.5px] text-slate-400 font-mono flex justify-between pt-0.5 border-t border-slate-100">
                          <span>اسکن برای پرونده آنلاین</span>
                          <span>{item.purchaseDate || '۱۴۰۳'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">لینک اختصاصی کپی شد!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>کپی لینک مستقیم پرونده</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadSvg}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>دانلود فایل گرافیکی QR (SVG)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              بستن
            </button>
            <button
              onClick={handleDirectPrint}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all flex items-center gap-2 shadow-md hover:shadow-blue-500/25 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ لیبل بر روی پرینتر</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
