import React, { useState } from 'react';
import {
  X,
  CheckSquare,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Activity,
  ShieldCheck,
  Calendar,
  Clock,
  User,
  FileText,
  HelpCircle,
  Stethoscope,
  Plus,
  Trash2,
  Edit3,
  Sliders,
  Check,
} from 'lucide-react';
import { EquipmentItem, AppUser, OperatorDailyCareLog, DailyCareChecklistItem } from '../../types';
import { getPersianDateShortString } from '../../utils/persianDate';
import { logPanelActivity } from '../../utils/activityLogger';

interface OperatorDailyCareModalProps {
  equipment: EquipmentItem;
  currentUser?: AppUser;
  onSaveDailyCare: (
    equipmentId: string,
    log: OperatorDailyCareLog,
    updatedChecklist?: DailyCareChecklistItem[]
  ) => void;
  onOpenFaultReport?: (equipment: EquipmentItem) => void;
  onClose: () => void;
}

export const OperatorDailyCareModal: React.FC<OperatorDailyCareModalProps> = ({
  equipment,
  currentUser,
  onSaveDailyCare,
  onOpenFaultReport,
  onClose,
}) => {
  const [shift, setShift] = useState<'morning' | 'evening' | 'night'>('morning');
  const [visualCheckPassed, setVisualCheckPassed] = useState<boolean>(true);
  const [cleaningPerformed, setCleaningPerformed] = useState<boolean>(true);
  const [cablesAndAccessoriesChecked, setCablesAndAccessoriesChecked] = useState<boolean>(true);
  const [powerAndBatteryChecked, setPowerAndBatteryChecked] = useState<boolean>(true);
  const [generalConditionStatus, setGeneralConditionStatus] = useState<
    'excellent' | 'normal' | 'needs_attention' | 'fault_suspected'
  >('normal');
  const [notes, setNotes] = useState<string>('');

  // Device-specific checklist items generator
  const getInitialTasks = (): Array<{ id: string; title: string; done: boolean }> => {
    // 1. If equipment already has customized checklist, load it
    if (equipment.dailyCareChecklist && equipment.dailyCareChecklist.length > 0) {
      return equipment.dailyCareChecklist.map((c) => ({
        id: c.id,
        title: c.title,
        done: true,
      }));
    }
    if (equipment.customDailyChecklist && equipment.customDailyChecklist.length > 0) {
      return equipment.customDailyChecklist.map((title, idx) => ({
        id: `custom-${idx}`,
        title,
        done: true,
      }));
    }

    // 2. Otherwise generate intelligent defaults based on device category and model
    const fa = equipment.faName || '';
    const en = (equipment.enName || '').toLowerCase();
    const cat = equipment.category || '';
    const subcat = equipment.subcategory || '';

    const isVentilator = fa.includes('ونتیلاتور') || en.includes('ventilator');
    const isMonitor = fa.includes('مانیتور') || en.includes('monitor');
    const isDefib = fa.includes('شوک') || fa.includes('دفیبریلاتور') || en.includes('defibrillator');
    const isDental = cat.includes('دندانپزشکی') || subcat.includes('دندانپزشکی') || fa.includes('یونیت');
    const isInfusion = fa.includes('پمپ') || en.includes('pump') || fa.includes('سرنگ');
    const isAutoclave = fa.includes('اتوکلاو') || en.includes('autoclave') || fa.includes('استریل');

    if (isVentilator) {
      return [
        { id: 'v1', title: 'بررسی سلامت ست لوله‌های بیمار، فیلتر باکتریال و محفظه رطوبت‌ساز', done: true },
        { id: 'v2', title: 'کنترل اتصالات خطوط گاز اکسیژن و هوای فشرده (O2/Air)', done: true },
        { id: 'v3', title: 'انجام تست خودکار پیش از کاربری (Pre-Use Check / Calibration Test)', done: true },
        { id: 'v4', title: 'ضدعفونی بدنه خارجی و بررسی سلامت شارژ باتری داخلی پشتیبان', done: true },
      ];
    } else if (isMonitor) {
      return [
        { id: 'm1', title: 'بررسی سلامت سیم لیدهای ECG، پروب پالس‌اکسیمتری (SpO2) و کاف NIBP', done: true },
        { id: 'm2', title: 'تست آلارم‌های صوتی و نوری و کالیبره لمسی صفحه نمایش', done: true },
        { id: 'm3', title: 'ضدعفونی ملایم پروب‌ها با پد الکلی و بررسی سلامت کابل برق و باتری', done: true },
        { id: 'm4', title: 'اطمینان از وجود کاغذ رول پرینتر ثبت در صورت نیاز', done: true },
      ];
    } else if (isDefib) {
      return [
        { id: 'd1', title: 'اجرای آزمون خودکار روزانه تخلیه انرژی (Daily Self-Test 30J / 50J)', done: true },
        { id: 'd2', title: 'بررسی تاریخ انقضای پدال‌های چندمنظوره و سلامت ژل الکترود', done: true },
        { id: 'd3', title: 'بررسی سطح شارژ ۱۰۰٪ باتری و اتصال دائم به پریز برق اضطراری', done: true },
        { id: 'd4', title: 'کنترل کیف احیا و کابل لیدهای مانیتورینگ بیمار', done: true },
      ];
    } else if (isDental) {
      return [
        { id: 'dt1', title: 'شست‌وشو و فلاشینگ خطوط ساکشن جراحی و بزاق‌کش با محلول ضدعفونی', done: true },
        { id: 'dt2', title: 'روغن‌کاری و استریل توربین، آنگل و اینسترومنت‌ها در اتوکلاو', done: true },
        { id: 'dt3', title: 'بررسی فشار گیج هوای فشرده کمپرسور و فیلتر ورودی آب', done: true },
        { id: 'dt4', title: 'ضدعفونی رویه صندلی یونیت، تابلت و چراغ اتاق معاینه', done: true },
      ];
    } else if (isInfusion) {
      return [
        { id: 'p1', title: 'بررسی سنسور قطره‌شمار و سلامت کلمپ‌های نگه‌دارنده سرنگ/ست', done: true },
        { id: 'p2', title: 'تست سنسور فشار انسداد (Occlusion Test) و آلارم اتمام مایع', done: true },
        { id: 'p3', title: 'تمیزکاری سنسور نوری و بدنه و کنترل شارژ کامل باتری', done: true },
      ];
    } else if (isAutoclave) {
      return [
        { id: 'a1', title: 'بررسی سطح آب مقطر در مخزن و سلامت واشر دور درب چمبر', done: true },
        { id: 'a2', title: 'کنترل گیج‌های فشار و شیرهای تخلیه بخار', done: true },
        { id: 'a3', title: 'اجرای تست روزانه نفوذ بخار و اندیکاتور شیمیایی (Bowie-Dick)', done: true },
      ];
    }

    return [
      { id: 'g1', title: 'بازرسی چشمی بدنه، کلیدها، نمایشگر و پورت‌های ورودی', done: true },
      { id: 'g2', title: 'ضدعفونی سطحی با محلول استاندارد مورد تایید بیمارستان', done: true },
      { id: 'g3', title: 'تست اولیه روشن شدن و بررسی عملکرد شارژ باتری داخلی', done: true },
      { id: 'g4', title: 'کنترل کابل برق اصلی، لوازم جانبی و ضمائم کاربری', done: true },
    ];
  };

  const [checklistItems, setChecklistItems] = useState(getInitialTasks);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [saveAsDeviceDefault, setSaveAsDeviceDefault] = useState(true);

  const toggleTask = (index: number) => {
    setChecklistItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, done: !item.done } : item))
    );
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    const newItem = {
      id: `task-${Date.now()}`,
      title: newItemTitle.trim(),
      done: true,
    };
    setChecklistItems((prev) => [...prev, newItem]);
    setNewItemTitle('');
  };

  const handleRemoveItem = (id: string) => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: OperatorDailyCareLog = {
      id: `care-${Date.now()}`,
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      date: getPersianDateShortString(),
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      operatorId: currentUser?.id,
      operatorName: currentUser?.name || 'نسرین کریمی (اپراتور)',
      operatorRole: currentUser?.roleFa || 'اپراتور بالینی',
      shift,
      visualCheckPassed,
      cleaningPerformed,
      cablesAndAccessoriesChecked,
      powerAndBatteryChecked,
      generalConditionStatus,
      notes: notes.trim() || undefined,
      checklistItems: checklistItems.map((c) => ({ id: c.id, title: c.title, done: c.done })),
    };

    const updatedCustomChecklist: DailyCareChecklistItem[] = checklistItems.map((c) => ({
      id: c.id,
      title: c.title,
      required: true,
    }));

    // 1. Log completion in Audit Trail (for supervisors and upstream reporting)
    logPanelActivity({
      userId: currentUser?.id || 'usr-7',
      userName: currentUser?.name || 'نسرین کریمی',
      userRoleFa: currentUser?.roleFa || 'پرستار / اپراتور بالینی',
      userPersonnelCode: currentUser?.personnelCode || '۹۹۴۸۲',
      userDepartment: currentUser?.department || equipment.department,
      actionType: 'daily_care_completed',
      actionTitleFa: `ثبت چک‌لیست مراقبت روزانه (${
        shift === 'morning' ? 'شیفت صبح' : shift === 'evening' ? 'شیفت عصر' : 'شیفت شب'
      })`,
      detailsFa: `پایش روزانه دستگاه با وضعیت ${
        generalConditionStatus === 'excellent'
          ? 'عالی و آماده'
          : generalConditionStatus === 'normal'
          ? 'عادی و استاندارد'
          : generalConditionStatus === 'needs_attention'
          ? 'نیازمند مراقبت'
          : 'مشکوک به نقص فنی'
      } — ${checklistItems.filter((i) => i.done).length} از ${checklistItems.length} اقدام انجام شد.`,
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.faName,
      department: equipment.department,
      metadata: {
        shift,
        generalConditionStatus,
        notes: notes.trim() || undefined,
        itemsCount: checklistItems.length,
        completedCount: checklistItems.filter((i) => i.done).length,
      },
    });

    // 2. If customized, also record customization event in audit trail
    if (isCustomizing || saveAsDeviceDefault) {
      logPanelActivity({
        userId: currentUser?.id || 'usr-7',
        userName: currentUser?.name || 'نسرین کریمی',
        userRoleFa: currentUser?.roleFa || 'پرستار / اپراتور بالینی',
        userPersonnelCode: currentUser?.personnelCode || '۹۹۴۸۲',
        userDepartment: currentUser?.department || equipment.department,
        actionType: 'daily_checklist_customized',
        actionTitleFa: 'شخصی‌سازی چک‌لیست پایش دستگاه',
        detailsFa: `تنظیم و ذخیره چک‌لیست اختصاصی با ${checklistItems.length} عنوان اقدام ویژه برای این دستگاه`,
        equipmentId: equipment.id,
        equipmentCode: equipment.code,
        equipmentName: equipment.faName,
        department: equipment.department,
      });
    }

    onSaveDailyCare(
      equipment.id,
      newLog,
      saveAsDeviceDefault ? updatedCustomChecklist : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[80] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden dir-rtl my-8 text-right font-sans">
        {/* Header Banner */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                ثبت چک‌لیست مراقبت و پایش روزانه اپراتور
              </h2>
              <p className="text-xs text-emerald-200 mt-0.5">
                {equipment.faName} ({equipment.code}) • مستقر در {equipment.location || equipment.department}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Context Strip */}
        <div className="bg-emerald-50/70 border-b border-emerald-100 p-3.5 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>ثبت‌کننده: <strong>{currentUser?.name || 'نسرین کریمی'}</strong> ({currentUser?.roleFa || 'اپراتور'})</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>تاریخ: <strong>امروز ({getPersianDateShortString()})</strong></span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Shift Selection */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-2">
              شیفت کاری جاری
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'morning', label: 'شیفت صبح (۰۷:۰۰ - ۱۴:۰۰)' },
                { id: 'evening', label: 'شیفت عصر (۱۴:۰۰ - ۲۰:۰۰)' },
                { id: 'night', label: 'شیفت شب (۲۰:۰۰ - ۰۷:۰۰)' },
              ].map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setShift(s.id as any)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                    shift === s.id
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Operational Checks (4 Pillars) */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-800">
              ارزیابی‌های چهارگانه عملکردی
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label
                onClick={() => setVisualCheckPassed(!visualCheckPassed)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  visualCheckPassed
                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-white ${
                      visualCheckPassed ? 'bg-emerald-600' : 'bg-rose-500'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">سلامت بدنه و بازرسی چشمی</span>
                    <span className="text-[10px] text-slate-500">عدم وجود شکستگی یا ضربه</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold">
                  {visualCheckPassed ? 'تایید شد' : 'دارای ایراد'}
                </span>
              </label>

              <label
                onClick={() => setCleaningPerformed(!cleaningPerformed)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  cleaningPerformed
                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-white ${
                      cleaningPerformed ? 'bg-emerald-600' : 'bg-rose-500'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">تمیزکاری و ضدعفونی سطحی</span>
                    <span className="text-[10px] text-slate-500">انجام طبق پروتکل بهداشت</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold">
                  {cleaningPerformed ? 'انجام شد' : 'انجام نشده'}
                </span>
              </label>

              <label
                onClick={() => setCablesAndAccessoriesChecked(!cablesAndAccessoriesChecked)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  cablesAndAccessoriesChecked
                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-white ${
                      cablesAndAccessoriesChecked ? 'bg-emerald-600' : 'bg-rose-500'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">اتصالات، کابل‌ها و پروب‌ها</span>
                    <span className="text-[10px] text-slate-500">عدم قطعی یا لهیدگی کابل</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold">
                  {cablesAndAccessoriesChecked ? 'سالم و مرتب' : 'مشکوک به قطعی'}
                </span>
              </label>

              <label
                onClick={() => setPowerAndBatteryChecked(!powerAndBatteryChecked)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  powerAndBatteryChecked
                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-white ${
                      powerAndBatteryChecked ? 'bg-emerald-600' : 'bg-rose-500'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">وضعیت برق و شارژ باتری</span>
                    <span className="text-[10px] text-slate-500">شارژ بیش از ۸۰٪ و آماده</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold">
                  {powerAndBatteryChecked ? 'شارژ کامل' : 'نیاز به شارژ/بررسی'}
                </span>
              </label>
            </div>
          </div>

          {/* Device Customizable Checklist Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>اقدامات تخصصی این دستگاه (قابل شخصی‌سازی)</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomizing(!isCustomizing)}
                className="text-[11px] text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1 cursor-pointer bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60"
              >
                <Sliders className="w-3 h-3" />
                <span>{isCustomizing ? 'بستن شخصی‌سازی' : 'ویرایش و افزودن آیتم'}</span>
              </button>
            </div>

            {/* Customization Form */}
            {isCustomizing && (
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3 animate-in fade-in">
                <div className="text-[11px] text-indigo-900 font-medium">
                  می‌توانید متناسب با پروتکل‌های این بخش، آیتم‌های پایش جدیدی به این دستگاه بیفزایید یا موارد زائد را حذف کنید:
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder="مثلاً: تست سنسور دبی، بررسی گیج فشار مانومتر و..."
                    className="flex-1 p-2 text-xs rounded-xl bg-white border border-indigo-200 focus:outline-none focus:border-indigo-600"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewItem(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddNewItem}
                    disabled={!newItemTitle.trim()}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن</span>
                  </button>
                </div>

                <label className="flex items-center gap-2 text-[11px] text-indigo-900 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveAsDeviceDefault}
                    onChange={(e) => setSaveAsDeviceDefault(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>ذخیره تغییرات به عنوان چک‌لیست دائمی و استاندارد این دستگاه</span>
                </label>
              </div>
            )}

            {/* Checklist Items list */}
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              {checklistItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    item.done
                      ? 'bg-white border-slate-200/90 text-slate-800 shadow-2xs'
                      : 'bg-slate-100/80 border-slate-200 text-slate-400'
                  }`}
                >
                  <div
                    onClick={() => toggleTask(idx)}
                    className="flex items-center gap-2.5 flex-1 cursor-pointer"
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                        item.done
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {item.done && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-xs font-bold">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      onClick={() => toggleTask(idx)}
                      className="text-[11px] font-bold text-slate-400 cursor-pointer"
                    >
                      {item.done ? 'تکمیل' : 'اقدام نشده'}
                    </span>
                    {isCustomizing && checklistItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="حذف این آیتم از چک‌لیست"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Condition Status */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-2">
              وضعیت کلی تجهیز در پایان پایش
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'excellent', label: 'عالی و کاملاً آماده', color: 'border-emerald-500 bg-emerald-50 text-emerald-900' },
                { id: 'normal', label: 'عادی و استاندارد', color: 'border-blue-500 bg-blue-50 text-blue-900' },
                { id: 'needs_attention', label: 'نیازمند مراقبت دوره‌ای', color: 'border-amber-500 bg-amber-50 text-amber-900' },
                { id: 'fault_suspected', label: 'مشکوک به نقص / خرابی', color: 'border-rose-500 bg-rose-50 text-rose-900' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setGeneralConditionStatus(c.id as any)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                    generalConditionStatus === c.id
                      ? `${c.color} font-black shadow-xs`
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fault Suspected Warning Strip */}
          {generalConditionStatus === 'fault_suspected' && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  به دلیل اعلام نقص، بلافاصله گزارش خرابی جهت بررسی مهندس تجهیزات پزشکی ارسال خواهد شد.
                </span>
              </div>
              {onOpenFaultReport && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFaultReport(equipment);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors shrink-0 cursor-pointer"
                >
                  تکمیل فرم گزارش خرابی
                </button>
              )}
            </div>
          )}

          {/* Operator Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              یادداشت و ملاحظات اپراتور (تحویل به شیفت بعدی)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: مخزن آب مقطر مرطوب‌ساز تعویض شد، پروب اکسیژن شماره ۲ تمیزکاری گردید..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ثبت در شناسنامه و سابقه پایش دستگاه</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
