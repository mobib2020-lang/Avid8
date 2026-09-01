import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  UserCheck,
  UserPlus,
  AlertTriangle,
  Wrench,
  Award,
  CheckSquare,
  FileText,
  MessageSquare,
  Activity,
  History,
  Calendar,
  Clock,
  Building,
  Tag,
  CheckCircle2,
  ExternalLink,
  Printer,
  Upload,
  Plus,
  ChevronLeft,
  ChevronRight,
  Info,
  QrCode,
  Download,
  Stethoscope,
  Sparkles,
  ArrowUpRight,
  HelpCircle,
  Eye,
  Package,
  Layers,
  Archive,
  DollarSign,
  TrendingDown,
} from 'lucide-react';
import {
  EquipmentItem,
  FailureReport,
  CalibrationRecord,
  EquipmentRepairRecord,
  OperatorDailyCareLog,
  OperatorFeedbackItem,
  AppUser,
} from '../../types';
import { toPersianNumber } from '../../utils/taxonomyAnalytics';
import {
  getEquipmentTechnicalProfile,
  isEligibleForFaultReport,
  isEligibleForCalibration,
} from '../../utils/equipmentEligibility';

interface EquipmentDetailModalProps {
  equipment: EquipmentItem;
  currentUser?: AppUser;
  failuresList?: FailureReport[];
  calibrationsList?: CalibrationRecord[];
  onClose: () => void;
  onOpenAssignmentModal: (equipment: EquipmentItem) => void;
  onOpenDailyCareModal: (equipment: EquipmentItem) => void;
  onOpenFaultReportModal: (equipment: EquipmentItem) => void;
  onOpenFeedbackModal?: (equipment: EquipmentItem) => void;
  onOpenRepairModal: (equipment: EquipmentItem, faultReport?: FailureReport | null) => void;
  onOpenCalibrationModal: (equipment: EquipmentItem, existingRecord?: CalibrationRecord | null) => void;
  onAddComment?: (equipmentId: string, commentText: string, commentType: any) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  equipment,
  currentUser,
  failuresList = [],
  calibrationsList = [],
  onClose,
  onOpenAssignmentModal,
  onOpenDailyCareModal,
  onOpenFaultReportModal,
  onOpenFeedbackModal,
  onOpenRepairModal,
  onOpenCalibrationModal,
  onAddComment,
}) => {
  const { canReportFault, canRequireCalibration, isConsumable, categoryRoleText } =
    getEquipmentTechnicalProfile(equipment);

  const [activeTab, setActiveTab] = useState<
    | 'specs'
    | 'assignment'
    | 'lifecycle'
    | 'failures'
    | 'repairs'
    | 'calibration'
    | 'daily_care'
    | 'documents'
    | 'comments'
  >('specs');

  const [newCommentText, setNewCommentText] = useState('');

  // Matched records specifically for this equipment
  const matchedFailures = failuresList.filter(
    (f) =>
      f.equipmentCode?.toLowerCase() === equipment.code.toLowerCase() ||
      f.equipmentId === equipment.id ||
      f.equipmentName?.includes(equipment.faName)
  );

  const matchedCalibrations = calibrationsList.filter(
    (c) =>
      c.equipmentCode?.toLowerCase() === equipment.code.toLowerCase() ||
      c.equipmentId === equipment.id ||
      c.equipmentName?.includes(equipment.faName)
  );

  const repairHistory = equipment.repairHistory || [
    {
      id: 'rep-init-1',
      repairNo: 'SRV-89410',
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.faName,
      brand: equipment.brand,
      model: equipment.model,
      serialNumber: equipment.serialNumber,
      location: equipment.location,
      department: equipment.department,
      probableCause: 'سوختگی فیوز ورودی ناشی از نوسان برق و استهلاک سنسور اکسیژن',
      finalDiagnosis: 'خرابی برد پاور و افت خروجی سلول گالوانیک O2',
      severity: 'moderate',
      deliveryCondition: 'تجهیز همراه با متعلقات تحویل کارگاه شد',
      actionsDescription: 'تعمیر برد تغذیه، تعویض سنسور اکسیژن و کالیبراسیون ۲۱٪ و ۱۰۰٪',
      repairedComponents: 'برد سوئیچینگ اصلی',
      replacedComponents: 'سلول سنسور O2 (Max-250)',
      calibrationsAndAdjustments: 'تنظیم اسپان سنسور و تست فلو با آنالایزر VT650',
      partsList: [
        {
          id: 'p-1',
          partName: 'سلول اکسیژن Max-250',
          partNumber: 'OX-MAX-250',
          condition: 'مستهلک',
          action: 'تعویض شد',
          quantity: 1,
        },
      ],
      engineerName: 'مهندس امین رضایی',
      startDate: '۱۴۰۳/۰۴/۱۵',
      endDate: '۱۴۰۳/۰۴/۱۶',
      returnToServiceDate: '۱۴۰۳/۰۴/۱۶',
      finalStatus: 'ready_for_service',
      finalTestResult: 'pass',
      functionalTestNotes: 'کلیه مدهای تنفسی با دقت ۹۹.۴٪ تست شد',
      electricalSafetyTestNotes: 'آزمون جریان نشتی بدنه مطابق IEC 60601-1 پاس شد',
      completionType: 'both',
      uploadedDocumentName: 'Signed_Repair_SRV-89410.pdf',
    },
  ];

  const dailyCareLogs = equipment.dailyCareLogs || [
    {
      id: 'care-1',
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      date: '۱۴۰۳/۰۵/۲۲',
      time: '۰۸:۳۰',
      operatorName: equipment.assignedOperator || 'نسرین کریمی',
      operatorRole: 'اپراتور شیفت صبح',
      shift: 'morning',
      visualCheckPassed: true,
      cleaningPerformed: true,
      cablesAndAccessoriesChecked: true,
      powerAndBatteryChecked: true,
      generalConditionStatus: 'normal',
      notes: 'تمیزکاری سطحی و بررسی اتصالات انجام شد. دستگاه کاملاً آماده به کار است.',
    },
    {
      id: 'care-2',
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      date: '۱۴۰۳/۰۵/۲۱',
      time: '۱۵:۰۰',
      operatorName: 'مریم حسینی',
      operatorRole: 'پرستار بخش',
      shift: 'evening',
      visualCheckPassed: true,
      cleaningPerformed: true,
      cablesAndAccessoriesChecked: true,
      powerAndBatteryChecked: true,
      generalConditionStatus: 'excellent',
      notes: 'تست اولیه روشن شدن و آزمون باتری بدون هیچ خطایی پاس شد.',
    },
  ];

  const assignmentHistory = equipment.assignmentHistory || [
    {
      id: 'asg-1',
      userId: 'usr-7',
      userName: equipment.assignedOperator || 'نسرین کریمی',
      userRoleFa: 'اپراتور / پرستار مراقبت‌های ویژه',
      department: equipment.department,
      assignedDate: equipment.assignmentDate || '۱۴۰۳/۰۱/۱۵',
      status: 'active',
      assignedBy: 'مهندس رضا محمدی',
      assignedByRole: 'مدیر اموال و تجهیزات',
      notes: 'تخصیص دائم و تحویل رسمی با برگه تحویل اموال',
    },
  ];

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !onAddComment) return;
    onAddComment(equipment.id, newCommentText.trim(), 'shift_handover');
    setNewCommentText('');
  };

  const getStatusBadge = () => {
    switch (equipment.status) {
      case 'active':
      case 'in_use':
      case 'in_stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>آماده به کار و فعال در بخش</span>
          </span>
        );
      case 'under_maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
            <Wrench className="w-3.5 h-3.5" />
            <span>تحت تعمیر و سرویس مهندسی</span>
          </span>
        );
      case 'decommissioned':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>غیرقابل استفاده / خارج از سرویس</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/20 text-slate-300 border border-slate-400/30">
            <span>موجود در انبار</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden dir-rtl my-6 text-right font-sans flex flex-col max-h-[92vh]">
        {/* Header Hero Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                {isConsumable ? <Package className="w-7 h-7" /> : <Stethoscope className="w-7 h-7" />}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 font-bold border border-blue-400/30">
                    {equipment.code}
                  </span>
                  <span className="text-xs text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full">
                    {equipment.category}
                  </span>
                  <span className="text-xs text-indigo-200 bg-indigo-500/20 border border-indigo-400/30 px-2.5 py-0.5 rounded-full font-medium">
                    {categoryRoleText}
                  </span>
                  {getStatusBadge()}
                </div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  {equipment.faName}
                </h1>
                <p className="text-xs text-blue-200 font-sans flex flex-wrap items-center gap-3">
                  <span>نام لاتین: <strong className="font-mono">{equipment.enName}</strong></span>
                  <span>•</span>
                  <span>سازنده / برند: <strong className="text-white">{equipment.brand}</strong> ({equipment.model})</span>
                  <span>•</span>
                  <span>محل استقرار / انبار: <strong className="text-white">{equipment.location || equipment.department}</strong></span>
                  {!isConsumable && (
                    <>
                      <span>•</span>
                      <span>اپراتور مسئول: <strong className="text-emerald-300 font-bold">{equipment.assignedOperator || 'تخصیص نیافته'}</strong></span>
                    </>
                  )}
                  {isConsumable && equipment.quantity !== undefined && (
                    <>
                      <span>•</span>
                      <span>موجودی فعلی: <strong className="text-emerald-300 font-bold font-mono">{toPersianNumber(equipment.quantity)} {equipment.unit || 'عدد'}</strong></span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canReportFault && (
                <button
                  type="button"
                  onClick={() => onOpenFaultReportModal(equipment)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>اعلام خرابی</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation Bar */}
        <div className="bg-slate-100/90 border-b border-slate-200/90 px-6 py-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1">
            {(canReportFault
              ? [
                  { id: 'specs', label: 'اطلاعات فنی و پایه', icon: Info },
                  { id: 'assignment', label: 'مسئولیت و تخصیص', icon: UserCheck, badge: equipment.assignedOperator ? 'فعال' : undefined },
                  { id: 'lifecycle', label: 'چرخه حیات و گردش‌کار', icon: History },
                  { id: 'daily_care', label: 'مراقبت روزانه اپراتور', icon: CheckSquare, count: dailyCareLogs.length },
                  { id: 'failures', label: 'گزارش‌های خرابی', icon: AlertTriangle, count: matchedFailures.length },
                  { id: 'repairs', label: 'تعمیرات و سرویس فنی', icon: Wrench, count: repairHistory.length },
                  ...(canRequireCalibration
                    ? [{ id: 'calibration', label: 'کالیبراسیون و QC', icon: Award, count: matchedCalibrations.length }]
                    : []),
                  { id: 'documents', label: 'دستورالعمل‌ها و اسناد', icon: FileText },
                  { id: 'comments', label: 'تحویل شیفت و نظرات', icon: MessageSquare },
                ]
              : [
                  { id: 'specs', label: 'مشخصات کالا و انبار', icon: Package },
                  { id: 'documents', label: 'برگه‌های اطلاعاتی و اسناد', icon: FileText },
                  { id: 'comments', label: 'یادداشت‌ها و تاریخچه انبار', icon: MessageSquare },
                ]
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#2b64f6] shadow-2xs border border-slate-200/80 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2b64f6]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-normal ${
                        isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {toPersianNumber(tab.count)}
                    </span>
                  )}
                  {tab.badge && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: SPECS & BASIC INFO */}
          {/* ========================================================================= */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              {isConsumable ? (
                /* Consumable Layout */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1. Inventory & Batch */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                      <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-[#2b64f6]" />
                        <span>موجودی، واحد و انبارداری</span>
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">تعداد موجود در انبار:</span>
                          <strong className="font-mono text-emerald-700 font-bold text-sm">
                            {equipment.quantity !== undefined ? toPersianNumber(equipment.quantity) : '—'} {equipment.unit || 'بسته'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">شماره بچ / لات (Batch/Lot No):</span>
                          <span className="font-mono text-slate-900 font-bold">{equipment.batchNo || equipment.serialNumber || 'LOT-2024-A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">تاریخ انقضا:</span>
                          <span className="font-mono text-amber-700 font-bold">{equipment.expiryDate || equipment.warrantyExpiry || '۱۴۰۶/۰۳/۲۰'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">نوع کالا:</span>
                          <span className="text-indigo-700 font-bold">مصرفی پزشکی / دارویی غیرسرمایه‌ای</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Warehouse & Distribution */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                      <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-emerald-600" />
                        <span>محل استقرار و توزیع</span>
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">انبار / بخش مقصد:</span>
                          <strong className="text-slate-900 font-bold">{equipment.department}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">محل دقیق قفسه / ردیف:</span>
                          <span className="text-slate-800 font-bold">{equipment.location || 'قفسه انبار مرکزی'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">انباردار / تحویل‌گیرنده:</span>
                          <span className="text-slate-800 font-bold">{equipment.owner || 'مدیریت انبار و تدارکات'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">ثبت‌کننده ورودی:</span>
                          <span className="text-slate-700">{equipment.creator || 'واحد ترخیص و انبار'}</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Supplier & Financial */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                      <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Archive className="w-4 h-4 text-amber-600" />
                        <span>تأمین‌کننده و ارزش ریالی</span>
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">شرکت تأمین‌کننده:</span>
                          <strong className="text-slate-900 font-bold">{equipment.supplier || 'تأمین‌کننده معتبر دارویی'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">تاریخ خرید / ورود:</span>
                          <span className="text-slate-800 font-mono font-bold">{equipment.purchaseDate || '۱۴۰۳/۰۱/۱۵'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">ارزش ریالی واحد:</span>
                          <span className="text-slate-900 font-bold font-mono">
                            {equipment.price ? `${toPersianNumber(equipment.price.toLocaleString('fa-IR'))} ریال` : 'تعیین‌نشده'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">مسیر ساختار:</span>
                          <span className="text-slate-600 text-[11px] truncate block">{equipment.classificationPath}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#2b64f6] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="font-black text-slate-900 block">
                        راهنمای مدیریت اقلام مصرفی و ملزومات:
                      </strong>
                      <p className="text-slate-600 leading-relaxed">
                        این ردیف اموال شامل ملزومات یکبارمصرف یا کالای مصرفی درمانی است و فرآیندهای خرابی، تعمیر و کالیبراسیون برای آن تعریف نمی‌گردد. درخواست خرید، شارژ انبار و تخصیص مستقیم به بخش‌ها از طریق منوی سبد هوشمند و تدارکات صورت می‌پذیرد.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Medical Device Layout */
                <>
                  {/* Core Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1. Classification & Identity */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                      <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-[#2b64f6]" />
                        <span>شناسنامه و ساختار طبقه‌بندی</span>
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">کد پلاک اموال:</span>
                          <strong className="font-mono text-slate-900 font-bold">{equipment.code}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">مسیر کامل ساختار اموال:</span>
                          <span className="text-slate-700 font-bold leading-relaxed">
                            {equipment.classificationPath || `${equipment.category} > ${equipment.subcategory || 'دستگاه ها'} > ${equipment.type || 'عمومی'}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">شماره سریال کمپانی:</span>
                          <span className="font-mono text-slate-800 font-bold">{equipment.serialNumber}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">نوع موجودی:</span>
                          <span className="text-slate-800 font-bold">دستگاه سرمایه‌ای پزشکی</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Location & Department */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                      <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-emerald-600" />
                        <span>استقرار و مسئولیت‌ها</span>
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">دپارتمان بهره‌بردار:</span>
                          <strong className="text-slate-900 font-bold">{equipment.department}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">محل فیزیکی دقیق:</span>
                          <span className="text-slate-800 font-bold">{equipment.location || 'اتاق ۱ - تخت ۱'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">اپراتور تخصیص‌یافته:</span>
                          <span className="text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {equipment.assignedOperator || 'تعیین‌نشده'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">مسئول اموال / تحویل‌دهنده:</span>
                          <span className="text-slate-800 font-bold">{equipment.owner || 'مدیریت اموال'}</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Safety & Calibration Summary */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                      <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>شاخص سلامت و کالیبراسیون</span>
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">امتیاز سلامت و ایمنی:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="grow bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  equipment.safetyScore >= 90
                                    ? 'bg-emerald-500'
                                    : equipment.safetyScore >= 75
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${equipment.safetyScore}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-slate-900">{equipment.safetyScore}٪</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">سررسید کالیبراسیون بعدی:</span>
                          <span className="text-indigo-900 font-bold font-mono">
                            {canRequireCalibration ? (equipment.nextCalibrationDate || '۱۴۰۴/۰۵/۲۲') : 'بی‌نیاز از کالیبراسیون مترولوژی'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">اعتبار گارانتی:</span>
                          <span className="text-slate-700 font-mono">{equipment.warrantyExpiry || '۱۴۰۶/۰۵/۲۰'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">تاریخ خرید / تحویل:</span>
                          <span className="text-slate-700 font-mono">{equipment.purchaseDate || '۱۴۰۳/۰۱/۱۵'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Specifications Map */}
                  {equipment.specs && Object.keys(equipment.specs).length > 0 && (
                    <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                      <h4 className="text-xs font-black text-slate-900">مشخصات فنی و پارامترهای کارخانه</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        {Object.entries(equipment.specs).map(([key, val]) => (
                          <div key={key} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                            <span className="text-slate-400 block text-[10px]">{key}</span>
                            <strong className="text-slate-800 font-bold block mt-0.5">{val}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: RESPONSIBILITY & ASSIGNMENT */}
          {/* ========================================================================= */}
          {activeTab === 'assignment' && (
            <div className="space-y-6">
              {/* Current Assignment Hero Card */}
              <div className="bg-gradient-to-br from-blue-50/80 to-slate-50 border border-blue-200 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <UserCheck className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">
                      اپراتور و تحویل‌گیرنده اصلی فعلی
                    </span>
                    <h3 className="text-lg font-black text-slate-900">
                      {equipment.assignedOperator || 'تخصیص نیافته'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      بخش: <strong>{equipment.department}</strong> • تاریخ شروع تخصیص: {equipment.assignmentDate || '۱۴۰۳/۰۱/۱۵'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenAssignmentModal(equipment)}
                    className="px-4 py-2.5 rounded-2xl bg-[#2b64f6] hover:bg-blue-700 text-white text-xs font-black transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>تغییر یا تخصیص به کاربر جدید</span>
                  </button>
                </div>
              </div>

              {/* Authorized Secondary Operators */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>اپراتورهای مجاز شیفت‌های کاری (همکاران پشتیبان)</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(equipment.authorizedOperators || ['مریم حسینی (پرستار)', 'علی باقری (تکنسین ICU)', 'زهرا کریمی (پرستار ویژه)']).map(
                    (op) => (
                      <div
                        key={op}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{op}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Assignment History Log Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden space-y-2">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-600" />
                    <span>تاریخچه کامل مسئولیت‌ها و تخصیص‌های قبلی دستگاه</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-bold">
                    ثبت غیرقابل تغییر سوابق تحویل اموال
                  </span>
                </div>

                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-50/50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">کاربر / اپراتور</th>
                      <th className="p-3">نقش و بخش</th>
                      <th className="p-3">تاریخ شروع</th>
                      <th className="p-3">تاریخ پایان</th>
                      <th className="p-3">وضعیت</th>
                      <th className="p-3">تخصیص‌دهنده</th>
                      <th className="p-3">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignmentHistory.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{h.userName}</td>
                        <td className="p-3 text-slate-600">{h.userRoleFa} • {h.department}</td>
                        <td className="p-3 font-mono">{h.assignedDate}</td>
                        <td className="p-3 font-mono text-slate-400">{h.endDate || 'در حال استفاده'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {h.status === 'active' ? 'فعال و جاری' : 'انتقال یافته'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{h.assignedBy}</td>
                        <td className="p-3 text-slate-500">{h.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: LIFECYCLE TIMELINE & WORKFLOW INTEGRATION */}
          {/* ========================================================================= */}
          {activeTab === 'lifecycle' && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      گردش کار یکپارچه چرخه حیات تجهیز (Equipment Lifecycle State Machine)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ارتباط زنجیره‌ای: ورود به انبار → تخصیص → پایش روزانه → اعلام عیب → بررسی فنی → تعمیر/کالیبراسیون → تست نهایی → بازگشت به خدمت
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                    وضعیت کنونی: {equipment.status === 'under_maintenance' ? 'در حال تعمیر و بررسی' : 'فعال در سرویس'}
                  </span>
                </div>

                {/* Visual Step-by-Step Chain */}
                <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
                  {[
                    { step: 1, title: '۱. ثبت در انبار', desc: 'تکمیل شناسنامه و برچسب اموال', icon: Building, status: 'completed' },
                    { step: 2, title: '۲. تخصیص به اپراتور', desc: equipment.assignedOperator || 'تحویل بالینی', icon: UserCheck, status: 'completed' },
                    { step: 3, title: '۳. پایش روزانه', desc: 'چک‌لیست شیفت و تمیزکاری', icon: CheckSquare, status: 'completed' },
                    { step: 4, title: '۴. اعلام خرابی', desc: `${matchedFailures.length} گزارش ثبت شده`, icon: AlertTriangle, status: matchedFailures.length > 0 ? 'completed' : 'ready' },
                    { step: 5, title: '۵. ارزیابی بیومدیکال', desc: 'عیب‌یابی تخصصی مهندسی', icon: Activity, status: 'completed' },
                    { step: 6, title: '۶. سرویس و قطعات', desc: 'تعویض سلول و تعمیر برد', icon: Wrench, status: 'completed' },
                    { step: 7, title: '۷. تست نهایی و ایمنی', desc: 'کنترل کیفی و کالیبراسیون', icon: Award, status: 'completed' },
                    { step: 8, title: '۸. بازگشت به خدمت', desc: 'آماده بهره‌برداری بالینی', icon: CheckCircle2, status: 'active' },
                  ].map((s) => (
                    <div
                      key={s.step}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-between text-center transition-all ${
                        s.status === 'completed'
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                          : s.status === 'active'
                          ? 'bg-blue-50 border-blue-400 text-blue-950 ring-2 ring-blue-400/30'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${
                          s.status === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : s.status === 'active'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <s.icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black block">{s.title}</span>
                      <span className="text-[10px] text-slate-500 mt-1 block leading-tight">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: OPERATOR DAILY CARE */}
          {/* ========================================================================= */}
          {activeTab === 'daily_care' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-950">سوابق پایش، نظافت و مراقبت روزانه اپراتور</h4>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      کنترل اتصالات، کابل‌ها، پروب‌ها، تمیزکاری و آماده‌به‌کاری دستگاه در شیفت‌های مختلف
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenDailyCareModal(equipment)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>ثبت چک‌لیست پایش امروز</span>
                </button>
              </div>

              <div className="space-y-3">
                {dailyCareLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{log.operatorName}</span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {log.operatorRole} • شیفت {log.shift === 'morning' ? 'صبح' : log.shift === 'evening' ? 'عصر' : 'شب'}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {log.date} — ساعت {log.time}
                      </span>
                    </div>

                    {/* 4 Pillars Status */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>بازرسی چشمی: تایید</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ضدعفونی سطحی: انجام شد</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>کابل و اتصالات: سالم</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>برق و باتری: شارژ کامل</span>
                      </div>
                    </div>

                    {log.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                        <strong>یادداشت اپراتور:</strong> {log.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: FAULT REPORTS */}
          {/* ========================================================================= */}
          {activeTab === 'failures' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-rose-50 p-4 rounded-2xl border border-rose-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-rose-950">گزارش‌های خرابی و اعلام نقص این دستگاه</h4>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      کلیه هشدارهای ارسالی توسط کادر درمان با پیش‌تکمیل خودکار اطلاعات دستگاه
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenFaultReportModal(equipment)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>ثبت گزارش خرابی جدید</span>
                </button>
              </div>

              <div className="space-y-3">
                {matchedFailures.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-400">
                    هیچ گزارش خرابی برای این دستگاه ثبت نشده است.
                  </div>
                ) : (
                  matchedFailures.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {report.reportNo}
                          </span>
                          <span className="font-bold text-xs text-slate-900">{report.faultType || 'خطای عملکردی'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              report.priority === 'critical'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            اولویت: {report.priority === 'critical' ? 'بحرانی' : 'بالا'}
                          </span>
                          <span className="text-xs font-mono text-slate-400">{report.reportDate}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        <strong>شرح مشکل:</strong> {report.defectDescription}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <span>گزارش‌دهنده: <strong>{report.reporterName}</strong> ({report.reporterRole})</span>
                        <button
                          type="button"
                          onClick={() => onOpenRepairModal(equipment, report)}
                          className="text-xs font-bold text-[#2b64f6] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>شروع سرویس فنی و تعمیر براساس این گزارش</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: REPAIR & TECHNICAL SERVICE RECORDS */}
          {/* ========================================================================= */}
          {activeTab === 'repairs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-2xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2b64f6] text-white flex items-center justify-center">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-blue-950">پرونده‌های سرویس فنی و تعمیرات مهندسی پزشکی</h4>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      تشخیص کارشناسی، تعویض قطعات، آزمون ایمنی الکتریکی و نسخه‌های چاپی/اسکن‌شده
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenRepairModal(equipment)}
                  className="px-4 py-2 bg-[#2b64f6] hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>ثبت پرونده تعمیر جدید</span>
                </button>
              </div>

              <div className="space-y-3">
                {repairHistory.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all space-y-4 shadow-2xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          {rep.repairNo}
                        </span>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">{rep.finalDiagnosis}</h4>
                          <span className="text-[11px] text-slate-500">کارشناس: {rep.engineerName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          {rep.finalStatus === 'ready_for_service' ? 'آماده به کار و تایید نهایی' : 'تعمیر مشروط'}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{rep.endDate}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block">اقدامات انجام‌شده:</span>
                        <p className="text-slate-800 font-bold">{rep.actionsDescription}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block">قطعات تعویضی:</span>
                        <p className="text-slate-800 font-bold">{rep.replacedComponents || 'تنظیم نرم‌افزاری'}</p>
                      </div>
                    </div>

                    {/* Safety and Tests */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs flex flex-wrap items-center justify-between gap-2">
                      <span className="text-slate-700">
                        <strong>تست عملکرد و ایمنی:</strong> {rep.functionalTestNotes}
                      </span>
                      {rep.uploadedDocumentName && (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <FileText className="w-3 h-3" />
                          <span>سند اسکن‌شده پیوست است: {rep.uploadedDocumentName}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: CALIBRATION & QUALITY CONTROL */}
          {/* ========================================================================= */}
          {activeTab === 'calibration' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-indigo-950">گواهینامه‌ها و آزمون‌های کنترل کیفی و کالیبراسیون</h4>
                    <p className="text-[11px] text-indigo-700 mt-0.5">
                      ثبت دقیق متغیرهای اندازه‌گیری‌شده، آزمایشگاه مرجع و سررسید انقضا
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenCalibrationModal(equipment)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>ثبت گواهی کالیبراسیون جدید</span>
                </button>
              </div>

              <div className="space-y-3">
                {matchedCalibrations.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-400">
                    گواهی کالیبراسیونی برای این دستگاه در سامانه یافت نشد.
                  </div>
                ) : (
                  matchedCalibrations.map((cal) => (
                    <div
                      key={cal.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all space-y-4 shadow-2xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                            {cal.certNumber}
                          </span>
                          <div>
                            <h4 className="text-xs font-black text-slate-900">{cal.agency}</h4>
                            <span className="text-[11px] text-slate-500">کارشناس آزمون‌گر: {cal.inspector}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            معتبر تا {cal.expiryDate}
                          </span>
                        </div>
                      </div>

                      {/* Measurement Params if exist */}
                      {cal.measurements && cal.measurements.length > 0 && (
                        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                          <table className="w-full text-right">
                            <thead className="bg-slate-100 text-slate-700 font-bold">
                              <tr>
                                <th className="p-2">پارامتر سنجش</th>
                                <th className="p-2">قبل</th>
                                <th className="p-2">مرجع</th>
                                <th className="p-2">بعد از تنظیم</th>
                                <th className="p-2 text-center">نتیجه</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {cal.measurements.map((m) => (
                                <tr key={m.id}>
                                  <td className="p-2 font-bold text-slate-900">{m.parameter}</td>
                                  <td className="p-2 font-mono">{m.beforeValue}</td>
                                  <td className="p-2 font-mono text-indigo-700 font-bold">{m.referenceValue}</td>
                                  <td className="p-2 font-mono text-emerald-700 font-bold">{m.afterValue}</td>
                                  <td className="p-2 text-center font-bold text-emerald-800">{m.result}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <p className="text-xs text-slate-600">
                        <strong>ملاحظات ایمنی:</strong> {cal.safetyNotes}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: TECHNICAL MANUALS & DOCUMENTS */}
          {/* ========================================================================= */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900">
                    دفترچه‌های راهنما، نقشه‌های فنی و فیلم‌های آموزشی کاربری
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    اسناد جهت استفاده ایمن اپراتور و سرویس تخصصی مهندسی پزشکی
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: 'دفترچه راهنمای کاربری بالینی (User Manual Fa)', size: '4.2 MB', date: '۱۴۰۳/۰۱/۱۰' },
                  { title: 'راهنمای سرویس و نقشه‌های الکترونیک (Service Manual)', size: '8.7 MB', date: '۱۴۰۳/۰۱/۱۰' },
                  { title: 'پروتکل استاندارد تمیزکاری و استریلیزاسیون بخش', size: '1.1 MB', date: '۱۴۰۳/۰۲/۱۵' },
                  { title: 'برگه تحویل اولیه اموال و گارانتی شرکتی', size: '950 KB', date: '۱۴۰۳/۰۱/۱۵' },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2b64f6] flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{doc.title}</h5>
                        <span className="text-[10px] text-slate-400 font-mono">حجم: {doc.size} • {doc.date}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="text-xs font-bold text-[#2b64f6] hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>دانلود</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 9: OPERATOR FEEDBACKS, COMMENTS & SHIFT HANDOVER */}
          {/* ========================================================================= */}
          {activeTab === 'comments' && (
            <div className="space-y-5">
              {/* Header & Quick Action Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-teal-50/80 dark:bg-teal-950/20 p-4 rounded-2xl border border-teal-200/80 dark:border-teal-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      نظرات و گزارش‌های وضعیت اپراتورها
                    </h4>
                    <p className="text-[11px] text-teal-800 dark:text-teal-300 mt-0.5">
                      سوابق پایش کاربری، ارزیابی کیفیت عملکرد، نظافت و یادداشت‌های تحویل شیفت
                    </p>
                  </div>
                </div>

                {onOpenFeedbackModal && (
                  <button
                    type="button"
                    onClick={() => onOpenFeedbackModal(equipment)}
                    className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ثبت نظر / گزارش وضعیت جدید</span>
                  </button>
                )}
              </div>

              {/* 1. Official Operator Feedback Records */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span>گزارش‌ها و بازخوردهای ثبت‌شده اپراتور</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 font-mono">
                    {toPersianNumber((equipment.operatorFeedbacks || []).length)}
                  </span>
                </h5>

                {(!equipment.operatorFeedbacks || equipment.operatorFeedbacks.length === 0) ? (
                  <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                    تاکنون هیچ گزارش یا نظر عملیاتی رسمی برای این تجهیز ثبت نشده است.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {equipment.operatorFeedbacks.map((fb) => {
                      const conditionMap = {
                        optimal: { label: 'عالی و پایدار', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                        normal: { label: 'عادی و مطلوب', bg: 'bg-sky-50 text-sky-800 border-sky-200' },
                        needs_attention: { label: 'نیازمند پایش و بررسی', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
                        needs_cleaning: { label: 'نیازمند نظافت', bg: 'bg-purple-50 text-purple-800 border-purple-200' },
                        degraded_performance: { label: 'افت کارایی', bg: 'bg-orange-50 text-orange-800 border-orange-200' },
                      };
                      const cond = conditionMap[fb.overallCondition] || conditionMap.normal;

                      return (
                        <div
                          key={fb.id}
                          className="p-4 rounded-2xl border border-slate-200 bg-white dark:bg-slate-800/80 shadow-2xs space-y-2.5 hover:border-teal-300 transition-all"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                                {fb.operatorName.slice(0, 1)}
                              </div>
                              <div>
                                <span className="font-bold text-xs text-slate-900 dark:text-white">
                                  {fb.operatorName}
                                </span>
                                <span className="text-[10px] text-slate-400 mr-2">
                                  ({fb.operatorRole || 'اپراتور'})
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cond.bg}`}>
                                {cond.label}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                {fb.date} {fb.time && `• ${fb.time}`}
                              </span>
                            </div>
                          </div>

                          {fb.feedbackTypeLabel && (
                            <div className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                              موضوع: {fb.feedbackTypeLabel}
                            </div>
                          )}

                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {fb.comment}
                          </p>

                          {fb.attachmentName && (
                            <div className="flex items-center gap-2 pt-1 text-xs text-teal-700 dark:text-teal-400">
                              <FileText className="w-3.5 h-3.5" />
                              <span className="font-medium">پیوست: {fb.attachmentName}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. Shift Handover & General Notes */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <form onSubmit={handlePostComment} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">ثبت سریع یادداشت تحویل شیفت</h4>
                  <textarea
                    rows={2}
                    required
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="یادداشت تحویل دستگاه، وضعیت کارکرد یا توصیه‌ها به همکاران شیفت بعدی..."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:border-teal-500"
                  />
                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-black rounded-xl bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer"
                    >
                      ثبت یادداشت تحویل
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  {(equipment.comments || []).map((comm) => (
                    <div key={comm.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{comm.authorName} ({comm.authorRole})</span>
                        <span className="font-mono text-[10px]">{comm.date}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{comm.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
