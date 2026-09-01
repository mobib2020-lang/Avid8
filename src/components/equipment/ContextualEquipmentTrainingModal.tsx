import React, { useState } from 'react';
import {
  X,
  BookOpen,
  FileText,
  Video,
  AlertOctagon,
  Award,
  Download,
  Printer,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Search,
  CheckSquare,
  ShieldAlert,
  ChevronRight,
  Info,
  Clock,
  User,
  Sparkles,
} from 'lucide-react';
import { EquipmentItem } from '../../types';
import { EquipmentTrainingMaterial } from '../../utils/equipmentEducationHelper';
import { toPersianNumber } from '../../utils/taxonomyAnalytics';
import { triggerFileDownload } from '../../utils/downloadHelpers';

interface ContextualEquipmentTrainingModalProps {
  equipment: EquipmentItem;
  materials: EquipmentTrainingMaterial[];
  selectedMaterial: EquipmentTrainingMaterial;
  onSelectMaterial: (material: EquipmentTrainingMaterial) => void;
  onClose: () => void;
}

export const ContextualEquipmentTrainingModal: React.FC<ContextualEquipmentTrainingModalProps> = ({
  equipment,
  materials,
  selectedMaterial,
  onSelectMaterial,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(35);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'content' | 'topics' | 'troubleshoot'>('content');
  const [troubleshootSearch, setTroubleshootSearch] = useState<string>('');
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  // Troubleshooting sample data customized for this equipment
  const troubleshootingData = [
    {
      code: 'ERR-01 / LOW-PRESSURE',
      symptom: 'افت ناگهانی فشار مدار / خطای نشتی',
      cause: 'شل بودن اتصالات لوله‌ها یا خرابی واشر ورودی',
      action: 'اتصالات مدارهای بیمار را مجدداً محکم کرده و شیر تست نشتی را بازبینی کنید.',
      severity: 'high',
    },
    {
      code: 'ERR-02 / SENSOR-DISC',
      symptom: 'عدم نمایش سیگنال سنسور یا قطع لیدها',
      cause: 'جدا شدن کابل مانیتورینگ یا آلودگی پین‌های رابط',
      action: 'محل اتصال پروب را تمیز کرده و مجدداً با فشار یکنواخت جا بزنید.',
      severity: 'medium',
    },
    {
      code: 'ERR-03 / BATT-LOW',
      symptom: 'آلارم کاهش ولتاژ باتری در حالت پرتابل',
      cause: 'عدم اتصال به برق شهری طی شیفت قبلی یا اتمام عمر مفید سلول باتری',
      action: 'دستگاه را بلافاصله به پریز برق اضطراری (پریز قرمز بیمارستانی) وصل کنید.',
      severity: 'high',
    },
    {
      code: 'ERR-04 / CALIB-REQUIRED',
      symptom: 'هشدار نیاز به کالیبراسیون سنسور اکسیژن/فلو',
      cause: 'گذشت بیش از ۲۴ ساعت از آخرین آزمون خودکار یا نوسان دمای محیط',
      action: 'آزمون کالیبراسیون ۲۱٪ را از منوی Service Menu دستگاه اجرا کنید.',
      severity: 'low',
    },
  ];

  const filteredTroubleshoot = troubleshootingData.filter(
    (item) =>
      item.code.toLowerCase().includes(troubleshootSearch.toLowerCase()) ||
      item.symptom.includes(troubleshootSearch) ||
      item.cause.includes(troubleshootSearch) ||
      item.action.includes(troubleshootSearch)
  );

  const handleDownload = () => {
    const content = `=====================================================
آموزش و راهنمای عملیاتی بیمارستان تخصصی و فوق‌تخصصی آوید
=====================================================
تجهیز: ${equipment.faName} (${equipment.enName})
کد اموال: ${equipment.code}
برند / مدل: ${equipment.brand} - ${equipment.model}
دپارتمان: ${equipment.department}

عنوان آموزش: ${selectedMaterial.title}
نوع محتوا: ${selectedMaterial.type.toUpperCase()}
مدرس / مرجع: ${selectedMaterial.author} (${selectedMaterial.role})
تاریخ انتشار: ${selectedMaterial.date}
مدت زمان / حجم: ${selectedMaterial.durationOrPages}

شرح و خلاصه آموزش:
${selectedMaterial.description}

سرفصل‌ها و مباحث کلیدی:
${selectedMaterial.keyTopics ? selectedMaterial.keyTopics.map((t, i) => `${i + 1}. ${t}`).join('\n') : 'کلیه مباحث اپراتوری مصوب'}

نکات ایمنی و بالینی:
- رعایت پروتکل‌های ضدعفونی سطحی و عدم نفوذ مایعات به محفظه داخلی
- اتصال دائم به سیستم اتصال زمین (ارت) بیمارستانی
- اعلام هرگونه مغایرت یا خطای تکرارشونده به واحد مهندسی پزشکی
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    triggerFileDownload(blob, selectedMaterial.downloadName || `Education_${equipment.code}.txt`);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleStepCheck = (index: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div
      id="contextual-training-modal-backdrop"
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[80] flex items-center justify-center p-3 sm:p-6 dir-rtl font-sans text-right animate-in fade-in duration-200"
    >
      <div
        id="contextual-training-modal-container"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-right"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shrink-0 shadow-sm">
              {selectedMaterial.type === 'video' ? (
                <Video className="w-6 h-6 text-indigo-400" />
              ) : selectedMaterial.type === 'troubleshoot' ? (
                <AlertOctagon className="w-6 h-6 text-amber-400" />
              ) : selectedMaterial.type === 'sop' ? (
                <Award className="w-6 h-6 text-emerald-400" />
              ) : (
                <BookOpen className="w-6 h-6 text-blue-400" />
              )}
            </div>

            <div className="overflow-hidden">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-bold border border-indigo-400/30">
                  {equipment.code}
                </span>
                <span className="text-xs text-slate-300 bg-white/10 px-2 py-0.5 rounded-full font-medium">
                  {equipment.faName}
                </span>
                <span className="text-xs text-indigo-300 font-bold">
                  ({equipment.brand} {equipment.model})
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white truncate mt-1">
                {selectedMaterial.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="دانلود مستندات آموزشی"
            >
              <Download className="w-4 h-4 text-indigo-200" />
              <span className="hidden sm:inline">دانلود فایل</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden md:flex p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors items-center gap-1.5 cursor-pointer"
              title="چاپ دستورالعمل"
            >
              <Printer className="w-4 h-4 text-slate-200" />
              <span>چاپ</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-600/80 text-white flex items-center justify-center transition-colors cursor-pointer mr-1"
              title="بستن و بازگشت به پرونده هوشمند"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Training Materials Switcher Bar */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap ml-2">
            محتواهای اختصاصی این تجهیز:
          </span>
          {materials.map((mat) => {
            const isCurrent = mat.id === selectedMaterial.id;
            return (
              <button
                key={mat.id}
                onClick={() => onSelectMaterial(mat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200/80'
                }`}
              >
                {mat.type === 'video' ? (
                  <Video className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-indigo-600'}`} />
                ) : mat.type === 'troubleshoot' ? (
                  <AlertOctagon className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-amber-600'}`} />
                ) : mat.type === 'sop' ? (
                  <Award className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-emerald-600'}`} />
                ) : (
                  <FileText className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-blue-600'}`} />
                )}
                <span>{mat.title.length > 32 ? mat.title.slice(0, 32) + '...' : mat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Metadata Banner */}
          <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4 flex-wrap text-slate-700">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                <span>مدرس / مرجع: <strong>{selectedMaterial.author}</strong> ({selectedMaterial.role})</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>مدت / حجم: <strong className="font-mono">{selectedMaterial.durationOrPages}</strong></span>
              </div>
              <span>•</span>
              <span>تاریخ انتشار: <strong className="font-mono">{toPersianNumber(selectedMaterial.date)}</strong></span>
            </div>

            <div className="flex items-center gap-1.5">
              {selectedMaterial.tags?.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full bg-white text-indigo-700 text-[11px] font-bold border border-indigo-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Video Player Simulator */}
          {selectedMaterial.type === 'video' && (
            <div className="space-y-3">
              <div className="relative aspect-video max-h-[380px] w-full rounded-2xl bg-slate-950 overflow-hidden shadow-xl border border-slate-800 flex flex-col justify-between p-4">
                {/* Simulated video background frame */}
                <div className="absolute inset-0 bg-radial from-slate-800 to-slate-950 opacity-90" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3 z-10">
                  <div
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-16 h-16 rounded-full bg-indigo-600/90 hover:bg-indigo-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 mr-1" />}
                  </div>
                  <div className="space-y-1">
                    <span className="text-white text-sm font-bold block">
                      {isPlaying ? 'در حال پخش ویدیوی کارگاهی...' : 'برای شروع پخش ویدیو کلیک کنید'}
                    </span>
                    <span className="text-slate-400 text-xs font-mono">
                      کیفیت: Full HD 1080p | بالین بیمار {equipment.department}
                    </span>
                  </div>
                </div>

                {/* Video controls bottom bar */}
                <div className="relative z-20 mt-auto bg-slate-900/90 backdrop-blur-sm rounded-xl p-2.5 flex items-center gap-3 text-white border border-white/10">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setVideoProgress(0)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors cursor-pointer"
                    title="پخش مجدد از ابتدا"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Scrubber */}
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-300">
                      ۰۴:۱۲
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={videoProgress}
                      onChange={(e) => setVideoProgress(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="text-[11px] font-mono text-slate-400">
                      ۱۲:۰۰
                    </span>
                  </div>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Description & Clinical Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>خلاصه و اهداف آموزشی:</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {selectedMaterial.description}
            </p>
          </div>

          {/* Key Topics & Step-by-Step Procedure */}
          {selectedMaterial.keyTopics && selectedMaterial.keyTopics.length > 0 && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>سرفصل‌ها و چک‌لیست گام‌های عملیاتی:</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  {Object.values(checkedSteps).filter(Boolean).length} از {selectedMaterial.keyTopics.length} مورد انجام شد
                </span>
              </div>

              <div className="space-y-2">
                {selectedMaterial.keyTopics.map((topic, index) => {
                  const isChecked = !!checkedSteps[index];
                  return (
                    <div
                      key={index}
                      onClick={() => toggleStepCheck(index)}
                      className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleStepCheck(index)}
                        className="mt-0.5 w-4 h-4 rounded text-indigo-600 accent-indigo-600 shrink-0 cursor-pointer"
                      />
                      <div className="flex-1 text-xs font-medium leading-normal">
                        <strong className="text-slate-900 block mb-0.5">
                          گام {toPersianNumber(index + 1)}:
                        </strong>
                        {topic}
                      </div>
                      {isChecked && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Troubleshooting Matrix (if relevant or troubleshoot type) */}
          {(selectedMaterial.type === 'troubleshoot' || activeTab === 'troubleshoot') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-amber-600" />
                    <span>ماتریس عیب‌یابی سریع و رفع کدهای خطای متداول</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    اقدامات اصلاحی فوری توسط اپراتور بخش قبل از تماس با واحد مهندسی پزشکی
                  </p>
                </div>

                {/* Search in errors */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={troubleshootSearch}
                    onChange={(e) => setTroubleshootSearch(e.target.value)}
                    placeholder="جستجو در کدهای خطا یا علائم..."
                    className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                      <th className="p-3">کد خطا</th>
                      <th className="p-3">نشانه / پیام خطا</th>
                      <th className="p-3">علت احتمالی</th>
                      <th className="p-3">اقدام فوری اپراتور</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTroubleshoot.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-rose-700">
                          {row.code}
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          {row.symptom}
                        </td>
                        <td className="p-3 text-slate-600">
                          {row.cause}
                        </td>
                        <td className="p-3 font-medium text-emerald-800 bg-emerald-50/40 rounded-lg">
                          {row.action}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Safety Notice */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold text-amber-900 block">
                الزام ایمنی و اعتباربخشی بالینی:
              </strong>
              <p className="text-[11px] leading-relaxed text-amber-900/90">
                در صورت بروز هرگونه رفتار نامتعارف یا عدم تطابق نتایج سنسورها با علائم بالینی بیمار، بلافاصله تجهیز جایگزین آماده نموده و از طریق دکمه «اعلام خرابی» در شناسنامه، موضوع را به مهندسی پزشکی ارجاع دهید.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              پرونده هوشمند: <strong>{equipment.faName}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>دانلود نسخه متنی / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <span>بازگشت به پرونده هوشمند</span>
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
