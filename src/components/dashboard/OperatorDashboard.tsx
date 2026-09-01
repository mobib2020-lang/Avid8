import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  ShoppingCart,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ChevronLeft,
  Activity,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  XCircle,
  MessageSquare,
  MessageSquarePlus,
  Wrench,
  Award,
  Search,
  Filter,
  UserCheck,
  Layers,
  FileText,
  Paperclip,
  Check,
  Eye,
  Info,
  Building,
  Tag,
  ThumbsUp,
  Brush,
  Volume2,
} from 'lucide-react';
import {
  EquipmentItem,
  PurchaseRequest,
  FailureReport,
  PageId,
  AppUser,
  OperatorFeedbackItem,
  CalibrationRecord,
} from '../../types';
import { toPersianNumber } from '../../utils/taxonomyAnalytics';
import { useLivePersianDate, getPersianDateShortString } from '../../utils/persianDate';
import { OperatorFeedbackModal } from '../equipment/OperatorFeedbackModal';
import { EquipmentDetailModal } from '../equipment/EquipmentDetailModal';
import { EquipmentFaultReportModal } from '../equipment/EquipmentFaultReportModal';
import { OperatorDailyCareModal } from '../equipment/OperatorDailyCareModal';

interface OperatorDashboardProps {
  currentUser?: AppUser;
  equipmentList: EquipmentItem[];
  purchaseRequests?: PurchaseRequest[];
  failuresList?: FailureReport[];
  calibrationsList?: CalibrationRecord[];
  setActivePage: (page: PageId) => void;
  onSelectEquipment?: (item: EquipmentItem) => void;
  onUpdateEquipment?: (item: EquipmentItem) => void;
  onAddFailureReport?: (report: FailureReport) => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  currentUser,
  equipmentList = [],
  purchaseRequests = [],
  failuresList = [],
  calibrationsList = [],
  setActivePage,
  onSelectEquipment,
  onUpdateEquipment,
  onAddFailureReport,
}) => {
  const liveDate = useLivePersianDate();
  // Checklist interactive state
  const [checklist, setChecklist] = useState([
    { id: '1', title: 'چک عملکرد و باتری ونتیلاتور تخت ۱ تا ۴ بخش ICU', done: true, time: '۰۸:۳۰' },
    { id: '2', title: 'بررسی سلامت اتصالات و پروب مانیتورینگ علائم حیاتی', done: true, time: '۰۹:۱۵' },
    { id: '3', title: 'ثبت چک‌لیست روزانه تمیزکاری و ضدعفونی پمپ سرنگ', done: false, time: '۱۱:۰۰' },
    { id: '4', title: 'تحویل اقلام مصرفی و ست تزریق از انبار بخش', done: false, time: '۱۳:۰۰' },
  ]);

  // Modal states
  const [selectedFeedbackEquipment, setSelectedFeedbackEquipment] = useState<EquipmentItem | null>(null);
  const [selectedDetailEquipment, setSelectedDetailEquipment] = useState<EquipmentItem | null>(null);
  const [selectedFaultEquipment, setSelectedFaultEquipment] = useState<EquipmentItem | null>(null);
  const [selectedDailyCareEquipment, setSelectedDailyCareEquipment] = useState<EquipmentItem | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter & Search states for the Operator Equipment Workspace
  const [equipmentSearchQuery, setEquipmentSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<
    'all' | 'needs_action' | 'under_service' | 'ready'
  >('all');

  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. FILTERING: EQUIPMENT UNDER MY RESPONSIBILITY ONLY
  // Strictly based on assignment relationship
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const currentUserId = currentUser?.id || 'usr-7';
  const currentUserName = currentUser?.name || 'نسرین کریمی';

  const myAssignedEquipment = useMemo(() => {
    return equipmentList.filter((item) => {
      if (item.itemKind === 'consumable' || item.isDraft) return false;
      
      const isDirectlyAssignedId = item.assignedOperatorId === currentUserId;
      const isDirectlyAssignedName = item.assignedOperator === currentUserName;
      const isAuthorized = Array.isArray(item.authorizedOperators) && item.authorizedOperators.includes(currentUserName);
      
      return isDirectlyAssignedId || isDirectlyAssignedName || isAuthorized;
    });
  }, [equipmentList, currentUserId, currentUserName]);

  // Filtered list based on search and tab
  const filteredAssignedEquipment = useMemo(() => {
    let list = myAssignedEquipment;

    if (equipmentSearchQuery.trim()) {
      const q = equipmentSearchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.faName?.toLowerCase().includes(q) ||
          e.code?.toLowerCase().includes(q) ||
          e.serialNumber?.toLowerCase().includes(q) ||
          e.brand?.toLowerCase().includes(q) ||
          e.model?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q)
      );
    }

    if (activeFilterTab === 'needs_action') {
      list = list.filter((e) => {
        const latestFeedback = e.operatorFeedbacks?.[0];
        const isProblematic =
          latestFeedback?.overallCondition === 'needs_attention' ||
          latestFeedback?.overallCondition === 'needs_cleaning' ||
          latestFeedback?.overallCondition === 'degraded_performance';
        return isProblematic || e.status === 'under_maintenance';
      });
    } else if (activeFilterTab === 'under_service') {
      list = list.filter(
        (e) =>
          e.status === 'under_maintenance' ||
          (e.repairHistory && e.repairHistory.some((r) => r.status === 'in_progress'))
      );
    } else if (activeFilterTab === 'ready') {
      list = list.filter((e) => e.status === 'active' || e.status === 'in_use');
    }

    return list;
  }, [myAssignedEquipment, equipmentSearchQuery, activeFilterTab]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. OPERATIONAL SUMMARY METRICS (5 Key Operator Questions)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const totalAssignedCount = myAssignedEquipment.length;
  const readyCount = myAssignedEquipment.filter(
    (e) => e.status === 'active' || e.status === 'in_use'
  ).length;
  const underMaintenanceCount = myAssignedEquipment.filter(
    (e) => e.status === 'under_maintenance'
  ).length;

  // Total feedbacks logged by this operator on assigned equipment
  const totalFeedbacksCount = myAssignedEquipment.reduce(
    (sum, e) => sum + (e.operatorFeedbacks ? e.operatorFeedbacks.length : 0),
    0
  );

  // Active failure reports submitted by this operator
  const myFailures = failuresList.filter(
    (f) => f.reporterId === currentUser?.id || f.department === (currentUser?.department || 'ICU')
  );
  const myFailuresCount = myFailures.length;

  // Purchase requests
  const myRequests = purchaseRequests.filter(
    (r) => r.requesterId === currentUser?.id || r.department === (currentUser?.department || 'ICU')
  );
  const myRequestsCount = myRequests.length;

  const todayTasksCount = checklist.length;
  const completedTasksCount = checklist.filter((c) => c.done).length;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HANDLERS: FEEDBACK & FAULT ACTIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleSaveFeedback = (equipmentId: string, feedback: OperatorFeedbackItem) => {
    const targetEq = equipmentList.find((e) => e.id === equipmentId);
    if (!targetEq) return;

    const existingFeedbacks = targetEq.operatorFeedbacks || [];
    const updatedFeedbacks = [feedback, ...existingFeedbacks];

    const updatedEquipment: EquipmentItem = {
      ...targetEq,
      operatorFeedbacks: updatedFeedbacks,
    };

    if (onUpdateEquipment) {
      onUpdateEquipment(updatedEquipment);
    }

    // Also update selectedDetailEquipment if open
    if (selectedDetailEquipment && selectedDetailEquipment.id === equipmentId) {
      setSelectedDetailEquipment(updatedEquipment);
    }

    showToast(`گزارش وضعیت / نظر شما برای تجهیز «${targetEq.faName}» با موفقیت ثبت گردید.`);
  };

  const handleSaveFaultReportFromModal = (report: FailureReport) => {
    if (onAddFailureReport) {
      onAddFailureReport(report);
    }
    showToast(`گزارش خرابی برای تجهیز ${report.equipmentName} به واحد مهندسی پزشکی ارسال شد.`);
  };

  const userDept = currentUser?.department || 'مراقبت‌های ویژه (ICU)';

  return (
    <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold animate-in fade-in border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. WELCOME HEADER & OPERATIONAL CONTEXT */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>میز کار اپراتور • سلام {currentUser?.name || 'نسرین کریمی'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            دپارتمان: <strong className="text-slate-700 dark:text-slate-200">{userDept}</strong> • نظارت و پایش تجهیزات تحت مسئولیت مستقیم
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#2b64f6] dark:text-blue-400" />
            <span>{liveDate}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. OPERATOR 4-CARD METRIC OVERVIEW */}
      {/* Answers: What's under my care? Current status? Action needed? Feedbacks?   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Equipment Under My Responsibility */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              تجهیزات تحت مسئولیت من
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-[#2b64f6] dark:text-blue-400 flex items-center justify-center border border-blue-200/50 dark:border-blue-800/40">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {toPersianNumber(totalAssignedCount)}
            </span>
            <span className="text-xs text-slate-400">دستگاه تخصیص‌یافته</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] font-medium">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {toPersianNumber(readyCount)} آماده به کار
            </span>
            {underMaintenanceCount > 0 && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  {toPersianNumber(underMaintenanceCount)} در تعمیر
                </span>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Shift Checklist & Daily Care */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              وظایف و چک‌لیست شیفت
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/40">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {toPersianNumber(completedTasksCount)} / {toPersianNumber(todayTasksCount)}
            </span>
            <span className="text-xs text-slate-400">انجام‌شده</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
            {toPersianNumber(todayTasksCount - completedTasksCount)} مورد باقی‌مانده برای تکمیل
          </span>
        </div>

        {/* Card 3: My Feedbacks / Status Reports Logged */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              نظرات و گزارش‌های وضعیت من
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/50 dark:border-purple-800/40">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-700 dark:text-purple-300 font-mono">
              {toPersianNumber(totalFeedbacksCount)}
            </span>
            <span className="text-xs text-slate-400">گزارش در شناسنامه</span>
          </div>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1 block">
            مشاهدات کاربری و پایش عملکردی
          </span>
        </div>

        {/* Card 4: Technical Fault Reports (Distinct from Feedback) */}
        <div
          onClick={() => setActivePage('failures')}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              خرابی‌های فنی ارجاع‌شده
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-rose-200/50 dark:border-rose-800/40">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {toPersianNumber(myFailuresCount)}
            </span>
            <span className="text-xs text-slate-400">گزارش خرابی فعال</span>
          </div>
          <span className="text-[11px] text-rose-700 dark:text-rose-400 font-bold mt-1 block">
            تحت بررسی تیم مهندسی پزشکی
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DEDICATED SECTION: OPERATOR EQUIPMENT WORKSPACE (تجهیزات تحت مسئولیت من) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-[#2b64f6] dark:text-blue-400 flex items-center justify-center border border-blue-200/50 dark:border-blue-800/40">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  «تجهیزات تحت مسئولیت من»
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#2b64f6] dark:text-blue-300 font-mono font-bold border border-blue-200/60 dark:border-blue-800/40">
                  {toPersianNumber(filteredAssignedEquipment.length)} دستگاه
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                نمایش تجهیزات پزشکی اختصاص‌یافته به شما بر اساس پروتکل تحویل و مسئولیت
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={equipmentSearchQuery}
                onChange={(e) => setEquipmentSearchQuery(e.target.value)}
                placeholder="جستجو در نام، کد، سریال، مدل یا محل..."
                className="w-48 sm:w-64 pr-8 pl-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2b64f6]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          {[
            { id: 'all', label: 'همه تجهیزات من', count: myAssignedEquipment.length },
            {
              id: 'needs_action',
              label: 'نیازمند بررسی یا اقدام',
              count: myAssignedEquipment.filter((e) => {
                const latest = e.operatorFeedbacks?.[0];
                return (
                  latest?.overallCondition === 'needs_attention' ||
                  latest?.overallCondition === 'needs_cleaning' ||
                  latest?.overallCondition === 'degraded_performance' ||
                  e.status === 'under_maintenance'
                );
              }).length,
            },
            {
              id: 'under_service',
              label: 'در حال تعمیر یا کالیبراسیون',
              count: myAssignedEquipment.filter(
                (e) =>
                  e.status === 'under_maintenance' ||
                  (e.repairHistory && e.repairHistory.some((r) => r.status === 'in_progress'))
              ).length,
            },
            {
              id: 'ready',
              label: 'آماده به کار و فعال',
              count: myAssignedEquipment.filter(
                (e) => e.status === 'active' || e.status === 'in_use'
              ).length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilterTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilterTab === tab.id
                  ? 'bg-[#2b64f6] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeFilterTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {toPersianNumber(tab.count)}
              </span>
            </button>
          ))}
        </div>

        {/* Assigned Equipment Grid Cards */}
        {filteredAssignedEquipment.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#2b64f6] dark:text-blue-400 flex items-center justify-center mx-auto">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              تجهیزی با معیارهای انتخاب‌شده یافت نشد
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              تنها تجهیزاتی در این بخش نمایش داده می‌شوند که رسماً به حساب کاربری شما تخصیص داده شده باشند.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignedEquipment.map((item) => {
              const latestFeedback = item.operatorFeedbacks?.[0];
              const feedbacksCount = (item.operatorFeedbacks || []).length;
              const hasActiveRepair =
                item.status === 'under_maintenance' ||
                (item.repairHistory && item.repairHistory.some((r) => r.status === 'in_progress'));
              const activeRepair = item.repairHistory?.find((r) => r.status === 'in_progress');

              // Status badge helpers
              const isReady = item.status === 'active' || item.status === 'in_use';

              // Latest feedback condition badge
              const conditionBadge = latestFeedback
                ? {
                    optimal: { label: 'عالی و پایدار', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300' },
                    normal: { label: 'عادی و مطلوب', bg: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300' },
                    needs_attention: { label: 'نیازمند پایش', bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300' },
                    needs_cleaning: { label: 'نیازمند نظافت', bg: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300' },
                    degraded_performance: { label: 'افت کارایی', bg: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300' },
                  }[latestFeedback.overallCondition] || { label: 'ثبت‌شده', bg: 'bg-slate-100 text-slate-800' }
                : null;

              return (
                <div
                  key={item.id}
                  id={`operator-equipment-card-${item.id}`}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-4 shadow-2xs hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xs transition-all flex flex-col justify-between gap-3 text-right"
                >
                  <div className="space-y-3">
                    {/* Top Row: Code & Current Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {item.code}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          hasActiveRepair
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : isReady
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'
                        }`}
                      >
                        {hasActiveRepair
                          ? 'تحت تعمیر در کارگاه'
                          : item.status === 'in_use'
                          ? 'در حال استفاده در بخش'
                          : 'آماده به کار'}
                      </span>
                    </div>

                    {/* Equipment Name & Brand (Clickable to detail modal) */}
                    <div>
                      <h3
                        onClick={() => {
                          setSelectedDetailEquipment(item);
                          onSelectEquipment?.(item);
                        }}
                        className="text-xs sm:text-sm font-black text-slate-900 dark:text-white hover:text-[#2b64f6] dark:hover:text-blue-400 transition-colors cursor-pointer line-clamp-1"
                        title="مشاهده شناسنامه و پرونده کامل تجهیز"
                      >
                        {item.faName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.brand} • {item.model} {item.serialNumber && `(سریال: ${item.serialNumber})`}
                      </p>
                    </div>

                    {/* Location Badge */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        <strong>محل استقرار:</strong> {item.location || item.department}
                      </span>
                    </div>

                    {/* Last Logged Status / Assessment by Operator */}
                    <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-[#2b64f6] dark:text-blue-400" />
                          <span>آخرین وضعیت ثبت‌شده:</span>
                        </span>
                        {conditionBadge && (
                          <span className={`px-2 py-0.2 rounded-md font-bold text-[10px] border ${conditionBadge.bg}`}>
                            {conditionBadge.label}
                          </span>
                        )}
                      </div>

                      {latestFeedback ? (
                        <div className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {latestFeedback.feedbackTypeLabel || 'بازخورد'}:{' '}
                          </span>
                          <span className="line-clamp-2">{latestFeedback.comment}</span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">
                          تاکنون بازخوردی ثبت نشده است (عملکرد اولیه نرمال).
                        </p>
                      )}
                    </div>

                    {/* Repair & Calibration Status Section (When applicable) */}
                    {(hasActiveRepair || item.nextCalibrationDate) && (
                      <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 space-y-1 text-xs text-amber-900 dark:text-amber-200">
                        {hasActiveRepair && (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                            <Wrench className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>
                              تعمیر فعال: {activeRepair?.title || 'سرویس تخصصی در کارگاه'}
                            </span>
                          </div>
                        )}
                        {item.nextCalibrationDate && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
                            <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>سررسید کالیبراسیون بعدی: <strong className="font-mono">{item.nextCalibrationDate}</strong></span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Last Activity Meta */}
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          آخرین فعالیت: {latestFeedback ? `${latestFeedback.date} • ${latestFeedback.time || ''}` : item.assignmentDate || 'تحویل اولیه'}
                        </span>
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono font-medium">
                        {toPersianNumber(feedbacksCount)} نظر ثبت‌شده
                      </span>
                    </div>
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    {/* Primary Button: «ثبت نظر / گزارش وضعیت» */}
                    <button
                      type="button"
                      id={`btn-feedback-equipment-${item.id}`}
                      onClick={() => setSelectedFeedbackEquipment(item)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#2b64f6] hover:bg-blue-700 text-white font-bold transition-all shadow-xs cursor-pointer"
                      title="ثبت مشاهدات، کیفیت عملکرد و یادداشت‌های کاربری"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      <span>ثبت نظر / گزارش</span>
                    </button>

                    {/* Secondary Button: «اعلام خرابی» */}
                    <button
                      type="button"
                      id={`btn-fault-equipment-${item.id}`}
                      onClick={() => setSelectedFaultEquipment(item)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800 transition-all cursor-pointer"
                      title="اعلام نقص فنی و ارسال تیکت به مهندسی پزشکی"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <span>اعلام خرابی</span>
                    </button>

                    {/* Full Passport / History Link */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDetailEquipment(item);
                        onSelectEquipment?.(item);
                      }}
                      className="col-span-2 py-1.5 text-center text-xs font-semibold text-slate-500 hover:text-[#2b64f6] dark:text-slate-400 dark:hover:text-blue-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>مشاهده شناسنامه و پرونده کامل تجهیز ❯</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. TODAY'S SHIFT CHECKLIST & QUICK INCIDENT ACTION */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Checklist (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#2b64f6] dark:text-blue-400" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                کارهای امروز من و چک‌لیست شیفت
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {toPersianNumber(completedTasksCount)} از {toPersianNumber(todayTasksCount)} تکمیل شده
            </span>
          </div>

          <div className="space-y-2.5">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  item.done
                    ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400 line-through'
                    : 'bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700 hover:border-blue-300 text-slate-800 dark:text-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      item.done
                        ? 'bg-emerald-500 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white dark:bg-slate-700'
                    }`}
                  >
                    {item.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-bold">{item.title}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 shrink-0 font-normal no-underline">
                  ساعت {toPersianNumber(item.time)}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Care Log Action */}
          <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20 flex items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#2b64f6] dark:text-blue-400 shrink-0" />
              <div className="text-xs text-slate-700 dark:text-slate-300">
                <strong className="text-blue-950 dark:text-blue-200 font-bold block">
                  ثبت بازخورد روزانه:
                </strong>
                ثبت وضعیت کارکرد و نظافت برای تجهیزات بخش پیش از تحویل شیفت
              </div>
            </div>
            {myAssignedEquipment[0] && (
              <button
                type="button"
                onClick={() => setSelectedFeedbackEquipment(myAssignedEquipment[0])}
                className="shrink-0 text-xs font-bold bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 text-[#2b64f6] dark:text-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer"
              >
                ثبت نظر سریع
              </button>
            )}
          </div>
        </div>

        {/* Operational Reminders / Alerts (1 Col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <HeartPulse className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              هشدارهای بخش {userDept}
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>دستگاه‌های آماده به کار</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                کلیه ونتیلاتورهای فعال بخش تست اولیه صبحگاهی را با موفقیت پاس کردند.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>پیگیری تعمیرات در جریان</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                تعمیر کابل مانیتورینگ علائم حیاتی توسط کارشناس در حال انجام است.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
                <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
                <span>درخواست مصرفی</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                درخواست دستکش استریل و لوله تراشه در سبد تدارکات تایید شد.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. MODALS INTEGRATION                                                     */}
      {/* ========================================================================= */}

      {/* A. Operator Feedback Modal («ثبت نظر / گزارش وضعیت») */}
      {selectedFeedbackEquipment && (
        <OperatorFeedbackModal
          equipment={selectedFeedbackEquipment}
          currentUser={currentUser}
          onSubmitFeedback={handleSaveFeedback}
          onSwitchToFaultReport={(eq) => {
            setSelectedFeedbackEquipment(null);
            setSelectedFaultEquipment(eq);
          }}
          onClose={() => setSelectedFeedbackEquipment(null)}
        />
      )}

      {/* B. Technical Fault Report Modal («ثبت خرابی») */}
      {selectedFaultEquipment && (
        <EquipmentFaultReportModal
          equipment={selectedFaultEquipment}
          currentUser={currentUser}
          onSubmitReport={(report) => {
            handleSaveFaultReportFromModal(report);
            setSelectedFaultEquipment(null);
          }}
          onClose={() => setSelectedFaultEquipment(null)}
        />
      )}

      {/* C. Equipment Detail Modal (Passport & Full Hub) */}
      {selectedDetailEquipment && (
        <EquipmentDetailModal
          equipment={selectedDetailEquipment}
          currentUser={currentUser}
          failuresList={failuresList}
          calibrationsList={calibrationsList}
          onClose={() => setSelectedDetailEquipment(null)}
          onOpenAssignmentModal={() => {}}
          onOpenDailyCareModal={(eq) => {
            setSelectedDetailEquipment(null);
            setSelectedDailyCareEquipment(eq);
          }}
          onOpenFaultReportModal={(eq) => {
            setSelectedDetailEquipment(null);
            setSelectedFaultEquipment(eq);
          }}
          onOpenFeedbackModal={(eq) => {
            setSelectedDetailEquipment(null);
            setSelectedFeedbackEquipment(eq);
          }}
          onOpenRepairModal={() => {}}
          onOpenCalibrationModal={() => {}}
          onAddComment={(eqId, text) => {
            const targetEq = equipmentList.find((e) => e.id === eqId);
            if (!targetEq) return;
            const updated: EquipmentItem = {
              ...targetEq,
              comments: [
                {
                  id: `comm-${Date.now()}`,
                  authorName: currentUser?.name || 'اپراتور',
                  authorRole: currentUser?.roleFa || 'اپراتور بخش',
                  date: getPersianDateShortString(),
                  commentType: 'shift_handover',
                  text,
                },
                ...(targetEq.comments || []),
              ],
            };
            if (onUpdateEquipment) {
              onUpdateEquipment(updated);
            }
            setSelectedDetailEquipment(updated);
            showToast('یادداشت تحویل شیفت ثبت گردید.');
          }}
        />
      )}

      {/* D. Operator Daily Care Modal */}
      {selectedDailyCareEquipment && (
        <OperatorDailyCareModal
          equipment={selectedDailyCareEquipment}
          currentUser={currentUser}
          onClose={() => setSelectedDailyCareEquipment(null)}
          onSaveDailyCare={(eqId, log) => {
            const targetEq = equipmentList.find((e) => e.id === eqId);
            if (!targetEq) return;
            const updated: EquipmentItem = {
              ...targetEq,
              dailyCareLogs: [log, ...(targetEq.dailyCareLogs || [])],
            };
            if (onUpdateEquipment) {
              onUpdateEquipment(updated);
            }
            setSelectedDailyCareEquipment(null);
            showToast('چک‌لیست مراقبت روزانه با موفقیت ثبت شد.');
          }}
          onOpenFaultReport={(eq) => {
            setSelectedDailyCareEquipment(null);
            setSelectedFaultEquipment(eq);
          }}
        />
      )}
    </div>
  );
};
