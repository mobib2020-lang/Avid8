import React, { useState } from 'react';
import {
  X,
  Search,
  Package,
  ShoppingCart,
  AlertTriangle,
  Award,
  ListTodo,
  BookOpen,
  CheckCircle2,
  Filter,
  FileText,
  Activity,
  Calendar,
} from 'lucide-react';
import {
  EquipmentItem,
  PurchaseRequest,
  FailureReport,
  CalibrationRecord,
  TaskEvent,
  MessageRecordAttachment,
  MessageRecordType,
  PageId,
} from '../../types';

interface RecordPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecord: (record: MessageRecordAttachment) => void;
  equipmentList?: EquipmentItem[];
  purchaseRequests?: PurchaseRequest[];
  failureReports?: FailureReport[];
  calibrations?: CalibrationRecord[];
  tasksList?: TaskEvent[];
}

export const RecordPickerModal: React.FC<RecordPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectRecord,
  equipmentList = [],
  purchaseRequests = [],
  failureReports = [],
  calibrations = [],
  tasksList = [],
}) => {
  const [activeTab, setActiveTab] = useState<MessageRecordType>('equipment');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const tabs: { id: MessageRecordType; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'equipment', label: 'تجهیزات و اموال', icon: Package, count: equipmentList.length },
    { id: 'failure', label: 'گزارش‌های خرابی', icon: AlertTriangle, count: failureReports.length },
    { id: 'purchase_request', label: 'درخواست‌های خرید', icon: ShoppingCart, count: purchaseRequests.length },
    { id: 'calibration', label: 'کالیبراسیون و آزمون', icon: Award, count: calibrations.length },
    { id: 'task', label: 'وظایف و چک‌لیست', icon: ListTodo, count: tasksList.length },
    { id: 'education', label: 'محتوای آموزشی', icon: BookOpen, count: 6 },
  ];

  // Filtering records by tab and search
  const filteredEquipment = equipmentList.filter(
    (eq) =>
      eq.faName.includes(searchQuery) ||
      eq.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.department.includes(searchQuery)
  );

  const filteredFailures = failureReports.filter(
    (f) =>
      f.title?.includes(searchQuery) ||
      f.equipmentCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.department?.includes(searchQuery) ||
      f.trackingCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPurchaseRequests = purchaseRequests.filter(
    (pr) =>
      pr.title?.includes(searchQuery) ||
      pr.trackingCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.department?.includes(searchQuery) ||
      pr.requestedBy?.includes(searchQuery)
  );

  const filteredCalibrations = calibrations.filter(
    (c) =>
      c.equipmentName?.includes(searchQuery) ||
      c.equipmentCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department?.includes(searchQuery) ||
      c.company?.includes(searchQuery)
  );

  const filteredTasks = tasksList.filter(
    (t) =>
      t.title?.includes(searchQuery) ||
      t.equipmentName?.includes(searchQuery) ||
      t.department?.includes(searchQuery) ||
      t.assigneeName?.includes(searchQuery)
  );

  const mockEducationItems = [
    {
      id: 'edu-pb840-manual',
      title: 'راهنمای جامع کاربری و کالیبراسیون ونتیلاتور Puritan Bennett 840',
      subtitle: 'مدیکال بوک و دستورالعمل کالیبراسیون سنسور اکسیژن و دیافراگم بازدمی',
      code: 'EDU-VENT-01',
      statusFa: 'تاییدشده بالینی',
      department: 'مهندسی پزشکی و ICU',
      actionLabel: 'مشاهده در آموزش',
      targetPage: 'education' as PageId,
    },
    {
      id: 'edu-evita-sop',
      title: 'دستورالعمل جامع سرویس دوره‌ای ونتیلاتور Dräger Evita V500',
      subtitle: 'چک‌لیست آزمون نشتی، مدار ونتیلاسیون و استریلیزاسیون فیلترها',
      code: 'EDU-VENT-02',
      statusFa: 'دستورالعمل SOP',
      department: 'مهندسی پزشکی و ICU',
      actionLabel: 'مشاهده در آموزش',
      targetPage: 'education' as PageId,
    },
    {
      id: 'edu-zoll-r-series',
      title: 'راهنمای کاربری و آزمون ایمنی الکتروشوک Zoll R Series Plus',
      subtitle: 'پروتکل دفیبریلاسیون همگام، پیس‌میکر خارجی و تست روزانه پدل‌ها',
      code: 'EDU-DEFIB-01',
      statusFa: 'آموزش احیای قلبی',
      department: 'اورژانس و اتاق عمل',
      actionLabel: 'مشاهده در آموزش',
      targetPage: 'education' as PageId,
    },
    {
      id: 'edu-jms-pump',
      title: 'دستورالعمل تنظیم و نگهداری پمپ سرنگ JMS SP-500',
      subtitle: 'تنظیم نرخ تزریق دقیق، رفع خطای انسداد (Occlusion) و کالیبراسیون',
      code: 'EDU-PUMP-01',
      statusFa: 'آموزش تزریق دقیق',
      department: 'بخش‌های بالینی و CCU',
      actionLabel: 'مشاهده در آموزش',
      targetPage: 'education' as PageId,
    },
    {
      id: 'edu-who-hand-hygiene',
      title: 'اطلس جامع بهداشت دست WHO و پروتکل ضدعفونی تجهیزات پزشکی',
      subtitle: 'راهنمای پنج موقعیت بهداشت دست و ضدعفونی پروب‌های سونوگرافی',
      code: 'EDU-SOP-01',
      statusFa: 'کنترل عفونت بیمارستانی',
      department: 'کنترل عفونت و ایمنی بیمار',
      actionLabel: 'مشاهده در آموزش',
      targetPage: 'education' as PageId,
    },
  ].filter((item) => item.title.includes(searchQuery) || item.code.includes(searchQuery));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 dir-rtl">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">الصاق رکورد سیستمی به پیام</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                یک رکورد از سیستم بیمارستان انتخاب کنید تا کارت ارجاع مستقیم به پیام پیوست شود.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-200/80 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs & Search */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-sky-800 text-sky-100' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در عنوان، کد رهگیری، بخش یا نام..."
              className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Records List Body */}
        <div className="p-4 overflow-y-auto max-h-[480px] space-y-2.5 bg-slate-50/50 flex-1">
          {/* EQUIPMENT */}
          {activeTab === 'equipment' && (
            filteredEquipment.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold">تجهیزی با این مشخصات یافت نشد.</p>
              </div>
            ) : (
              filteredEquipment.map((eq) => (
                <div
                  key={eq.id}
                  onClick={() => {
                    onSelectRecord({
                      type: 'equipment',
                      id: eq.id,
                      title: eq.faName,
                      subtitle: `${eq.brand} ${eq.model} — کد اموال: ${eq.code}`,
                      code: eq.code,
                      statusFa: eq.status === 'active' ? 'فعال و آماده به کار' : eq.status === 'under_maintenance' ? 'در حال تعمیر' : 'موجود در انبار',
                      statusColor: eq.status === 'active' ? 'emerald' : eq.status === 'under_maintenance' ? 'rose' : 'sky',
                      department: eq.department,
                      additionalInfo: `مکان: ${eq.location} — دسته‌بندی: ${eq.category}`,
                      actionLabel: 'مشاهده تجهیز در انبار',
                      targetPage: 'inventory',
                      targetRecordId: eq.id,
                    });
                    onClose();
                  }}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 font-bold border border-sky-100 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 truncate">{eq.faName}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {eq.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {eq.brand} {eq.model} • {eq.department} • {eq.location}
                      </p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-sky-50 text-sky-700 group-hover:bg-sky-600 group-hover:text-white rounded-xl text-xs font-bold shrink-0 transition-colors">
                    انتخاب
                  </button>
                </div>
              ))
            )
          )}

          {/* FAILURES */}
          {activeTab === 'failure' && (
            filteredFailures.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <AlertTriangle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold">گزارش خرابی یافت نشد.</p>
              </div>
            ) : (
              filteredFailures.map((f) => (
                <div
                  key={f.id}
                  onClick={() => {
                    onSelectRecord({
                      type: 'failure',
                      id: f.id,
                      title: f.title || 'گزارش خرابی دستگاه',
                      subtitle: `${f.equipmentName || ''} (کد: ${f.equipmentCode || ''})`,
                      code: f.trackingCode || f.equipmentCode || 'FL-REPORT',
                      statusFa: f.status === 'investigating' ? 'در حال بررسی' : f.status === 'fixed' ? 'تعمیر شد' : 'در انتظار قطعه',
                      statusColor: f.status === 'fixed' ? 'emerald' : f.status === 'investigating' ? 'amber' : 'rose',
                      department: f.department,
                      additionalInfo: `فوریت: ${f.urgency || 'فوری'} — گزارش‌دهنده: ${f.reporterName || 'کاربر'}`,
                      actionLabel: 'مشاهده گزارش خرابی',
                      targetPage: 'failures',
                      targetRecordId: f.id,
                    });
                    onClose();
                  }}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-rose-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 font-bold border border-rose-100 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 truncate">{f.title || 'گزارش نقص فنی'}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                          {f.trackingCode || f.equipmentCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {f.equipmentName} • {f.department} • گزارش: {f.reportDate || 'امروز'}
                      </p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-rose-50 text-rose-700 group-hover:bg-rose-600 group-hover:text-white rounded-xl text-xs font-bold shrink-0 transition-colors">
                    انتخاب
                  </button>
                </div>
              ))
            )
          )}

          {/* PURCHASE REQUESTS */}
          {activeTab === 'purchase_request' && (
            filteredPurchaseRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold">درخواست خریدی یافت نشد.</p>
              </div>
            ) : (
              filteredPurchaseRequests.map((pr) => (
                <div
                  key={pr.id}
                  onClick={() => {
                    onSelectRecord({
                      type: 'purchase_request',
                      id: pr.id,
                      title: pr.title || 'درخواست خرید کالا',
                      subtitle: `${pr.itemName || pr.category || ''} — تعداد: ${pr.quantity || 1} ${pr.unit || 'عدد'}`,
                      code: pr.trackingCode || 'PR-REQUEST',
                      statusFa: pr.status === 'approved' ? 'تایید شده' : pr.status === 'pending_finance' ? 'در انتظار مالی' : 'در حال بررسی',
                      statusColor: pr.status === 'approved' ? 'emerald' : 'sky',
                      department: pr.department,
                      additionalInfo: `درخواست‌دهنده: ${pr.requestedBy} — برآورد: ${pr.estimatedCost ? Number(pr.estimatedCost).toLocaleString('fa-IR') + ' ریال' : 'مشخص نشده'}`,
                      actionLabel: 'مشاهده درخواست خرید',
                      targetPage: 'purchase_requests',
                      targetRecordId: pr.id,
                    });
                    onClose();
                  }}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 truncate">{pr.title}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {pr.trackingCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {pr.itemName} • {pr.department} • متقاضی: {pr.requestedBy}
                      </p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white rounded-xl text-xs font-bold shrink-0 transition-colors">
                    انتخاب
                  </button>
                </div>
              ))
            )
          )}

          {/* CALIBRATIONS */}
          {activeTab === 'calibration' && (
            filteredCalibrations.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Award className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold">پرونده کالیبراسیونی یافت نشد.</p>
              </div>
            ) : (
              filteredCalibrations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectRecord({
                      type: 'calibration',
                      id: c.id,
                      title: `آزمون کالیبراسیون و کنترل کیفی ${c.equipmentName}`,
                      subtitle: `دستگاه: ${c.equipmentName} (کد اموال: ${c.equipmentCode})`,
                      code: c.certificateNumber || c.equipmentCode || 'CAL-RECORD',
                      statusFa: c.status === 'passed' ? 'دارای تاییدیه معتبر' : c.status === 'pending' ? 'در انتظار آزمون' : 'نیازمند کالیبراسیون',
                      statusColor: c.status === 'passed' ? 'emerald' : c.status === 'pending' ? 'amber' : 'rose',
                      department: c.department,
                      additionalInfo: `شرکت مجری: ${c.company || 'آزمایشگاه مرجع'} — انقضا: ${c.expiryDate || 'نامشخص'}`,
                      actionLabel: 'مشاهده کالیبراسیون',
                      targetPage: 'calibration',
                      targetRecordId: c.id,
                    });
                    onClose();
                  }}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold border border-amber-100 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 truncate">{c.equipmentName}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          {c.equipmentCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {c.company} • تاریخ: {c.date} • {c.department}
                      </p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white rounded-xl text-xs font-bold shrink-0 transition-colors">
                    انتخاب
                  </button>
                </div>
              ))
            )
          )}

          {/* TASKS */}
          {activeTab === 'task' && (
            filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ListTodo className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold">وظیفه‌ای یافت نشد.</p>
              </div>
            ) : (
              filteredTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectRecord({
                      type: 'task',
                      id: t.id,
                      title: t.title,
                      subtitle: `${t.equipmentName || 'عملیات دوره‌ای'} (بخش: ${t.department || 'بیمارستان'})`,
                      code: t.equipmentCode || 'TSK-EVENT',
                      statusFa: t.status === 'completed' ? 'تکمیل شده' : t.status === 'in_progress' ? 'در حال اجرا' : 'در انتظار انجام',
                      statusColor: t.status === 'completed' ? 'emerald' : t.status === 'in_progress' ? 'sky' : 'amber',
                      department: t.department,
                      additionalInfo: `مسئول: ${t.assigneeName || 'کارگروه'} — مهلت: ${t.dueDate || 'امروز'}`,
                      actionLabel: 'مشاهده وظیفه',
                      targetPage: 'tasks',
                      targetRecordId: t.id,
                    });
                    onClose();
                  }}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <ListTodo className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 truncate">{t.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                          {t.priority === 'urgent' ? 'فوری' : 'عادی'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        مسئول: {t.assigneeName} • مهلت: {t.dueDate}
                      </p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white rounded-xl text-xs font-bold shrink-0 transition-colors">
                    انتخاب
                  </button>
                </div>
              ))
            )
          )}

          {/* EDUCATION */}
          {activeTab === 'education' && (
            mockEducationItems.map((edu) => (
              <div
                key={edu.id}
                onClick={() => {
                  onSelectRecord({
                    type: 'education',
                    id: edu.id,
                    title: edu.title,
                    subtitle: edu.subtitle,
                    code: edu.code,
                    statusFa: edu.statusFa,
                    statusColor: 'purple',
                    department: edu.department,
                    additionalInfo: 'محتوای مرجع آموزش بیمارستان آوید',
                    actionLabel: edu.actionLabel,
                    targetPage: 'education',
                    targetRecordId: edu.id,
                  });
                  onClose();
                }}
                className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 font-bold border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800 truncate">{edu.title}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                        {edu.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {edu.subtitle}
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white rounded-xl text-xs font-bold shrink-0 transition-colors">
                  انتخاب
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
