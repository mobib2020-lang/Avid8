import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  QrCode,
  Printer,
  Copy,
  Check,
  Building,
  UserCheck,
  ShieldCheck,
  Calendar,
  Clock,
  Wrench,
  Award,
  BookOpen,
  FileText,
  Video,
  AlertTriangle,
  CheckSquare,
  MessageSquare,
  Download,
  ExternalLink,
  Package,
  Stethoscope,
  Sparkles,
  Info,
  Layers,
  Activity,
  ChevronRight,
  Shield,
  FileCheck,
  Eye,
  CheckCircle2,
  Thermometer,
  Boxes,
  HelpCircle,
  AlertOctagon,
  MessageSquarePlus,
  Star,
} from 'lucide-react';
import {
  EquipmentItem,
  FailureReport,
  CalibrationRecord,
  EquipmentRepairRecord,
  OperatorDailyCareLog,
  AppUser,
  EquipmentComment,
} from '../../types';
import { toPersianNumber } from '../../utils/taxonomyAnalytics';
import {
  getEquipmentTechnicalProfile,
  isEligibleForCalibration,
  isEligibleForFaultReport,
} from '../../utils/equipmentEligibility';
import {
  getEducationMaterialsForEquipment,
  EquipmentTrainingMaterial,
} from '../../utils/equipmentEducationHelper';
import { getEquipmentPassportUrl } from '../../utils/qrCodeHelper';
import { logPanelActivity } from '../../utils/activityLogger';
import { EquipmentQrPrintModal } from './EquipmentQrPrintModal';
import { EquipmentFaultReportModal } from './EquipmentFaultReportModal';
import { OperatorDailyCareModal } from './OperatorDailyCareModal';
import { EquipmentRepairModal } from './EquipmentRepairModal';
import { EquipmentCalibrationModal } from './EquipmentCalibrationModal';
import { EquipmentAssignmentModal } from './EquipmentAssignmentModal';
import { OperatorFeedbackModal } from './OperatorFeedbackModal';
import { ContextualEquipmentTrainingModal } from './ContextualEquipmentTrainingModal';

interface EquipmentPassportModalProps {
  equipment: EquipmentItem;
  currentUser?: AppUser;
  failuresList?: FailureReport[];
  calibrationsList?: CalibrationRecord[];
  allEquipmentList?: EquipmentItem[];
  onClose: () => void;
  onUpdateEquipment?: (equipment: EquipmentItem) => void;
  onOpenFaultReportModal?: (equipment: EquipmentItem) => void;
  onOpenDailyCareModal?: (equipment: EquipmentItem) => void;
  onOpenAssignmentModal?: (equipment: EquipmentItem) => void;
  onOpenRepairModal?: (equipment: EquipmentItem, faultReport?: FailureReport | null) => void;
  onOpenCalibrationModal?: (equipment: EquipmentItem, existingRecord?: CalibrationRecord | null) => void;
  onOpenFeedbackModal?: (equipment: EquipmentItem) => void;
  onNavigateToCalibration?: (equipment: EquipmentItem) => void;
  onAddComment?: (equipmentId: string, text: string, type: any) => void;
}

type PassportTab =
  | 'specs'
  | 'operator'
  | 'education'
  | 'calibration'
  | 'repairs'
  | 'failures'
  | 'handover';

export const EquipmentPassportModal: React.FC<EquipmentPassportModalProps> = ({
  equipment: initialEquipment,
  currentUser,
  failuresList = [],
  calibrationsList = [],
  allEquipmentList = [],
  onClose,
  onUpdateEquipment,
  onOpenFaultReportModal,
  onOpenDailyCareModal,
  onOpenAssignmentModal,
  onOpenRepairModal,
  onOpenCalibrationModal,
  onOpenFeedbackModal,
  onNavigateToCalibration,
  onAddComment,
}) => {
  // Local mutable state for instant reactive updates within the Smart Record
  const [equipment, setEquipment] = useState<EquipmentItem>(initialEquipment);
  const [activeTab, setActiveTab] = useState<PassportTab>('specs');
  const [copiedLink, setCopiedLink] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  // Sub-modal state controllers for perfect layering (rendered at z-[80] directly on top of Passport z-[60])
  const [isFaultReportOpen, setIsFaultReportOpen] = useState(false);
  const [isDailyCareOpen, setIsDailyCareOpen] = useState(false);
  const [isRepairOpen, setIsRepairOpen] = useState(false);
  const [selectedRepairFaultReport, setSelectedRepairFaultReport] = useState<FailureReport | null>(null);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<EquipmentTrainingMaterial | null>(null);

  const { canReportFault, canRequireCalibration, isConsumable, categoryRoleText } =
    getEquipmentTechnicalProfile(equipment);

  const passportUrl = getEquipmentPassportUrl(equipment);
  const trainings = getEducationMaterialsForEquipment(equipment);

  // Filter matched records
  const matchedFailures = failuresList.filter(
    (f) =>
      f.equipmentCode?.toLowerCase() === equipment.code?.toLowerCase() ||
      f.equipmentId === equipment.id ||
      f.equipmentName?.includes(equipment.faName)
  );

  const matchedCalibrations = calibrationsList.filter(
    (c) =>
      c.equipmentCode?.toLowerCase() === equipment.code?.toLowerCase() ||
      c.equipmentId === equipment.id ||
      c.equipmentName?.includes(equipment.faName)
  );

  const repairHistory = equipment.repairHistory || [
    {
      id: 'rep-sample-1',
      repairNo: 'SRV-89410',
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.faName,
      brand: equipment.brand,
      model: equipment.model,
      serialNumber: equipment.serialNumber,
      location: equipment.location,
      department: equipment.department,
      probableCause: 'سوختگی فیوز ورودی ناشی از نوسان برق و استهلاک سنسور',
      finalDiagnosis: 'خرابی برد پاور و افت خروجی سلول اندازه‌گیری',
      severity: 'moderate',
      deliveryCondition: 'تجهیز همراه با متعلقات تحویل کارگاه شد',
      actionsDescription: 'تعمیر برد تغذیه، تعویض سنسور و کالیبراسیون کامل',
      repairedComponents: 'برد سوئیچینگ اصلی',
      replacedComponents: 'سلول سنسور O2 (Max-250)',
      calibrationsAndAdjustments: 'تنظیم اسپان سنسور و تست فلو با آنالایزر VT650',
      partsList: [
        {
          id: 'p-1',
          partName: 'سلول سنسور کالیبره',
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
      functionalTestNotes: 'کلیه مدهای کاری با دقت ۹۹.۴٪ تست شد',
      electricalSafetyTestNotes: 'آزمون جریان نشتی بدنه مطابق IEC 60601-1 پاس شد',
      completionType: 'both',
      uploadedDocumentName: 'Signed_Repair_Report.pdf',
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(passportUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: EquipmentComment = {
      id: `cm-${Date.now()}`,
      authorName: currentUser?.name || 'اپراتور شیفت',
      authorRole: currentUser?.role || 'اپراتور بالینی',
      department: currentUser?.department || equipment.department,
      date: '۱۴۰۳/۰۵/۲۲',
      commentType: 'shift_handover',
      text: newCommentText.trim(),
    };

    const updatedEquipment: EquipmentItem = {
      ...equipment,
      comments: [newComment, ...(equipment.comments || [])],
    };

    logPanelActivity({
      userId: currentUser?.id || 'usr-default',
      userName: currentUser?.name || 'اپراتور شیفت',
      userRoleFa: currentUser?.role || 'اپراتور بالینی',
      userDepartment: equipment.department,
      actionType: 'comment_added',
      actionTitleFa: 'ثبت یادداشت تحویل شیفت در پرونده هوشمند',
      detailsFa: newCommentText.trim(),
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.faName,
      department: equipment.department,
      isAuditOnly: true,
    });

    setEquipment(updatedEquipment);
    onUpdateEquipment?.(updatedEquipment);
    onAddComment?.(equipment.id, newCommentText.trim(), 'shift_handover');
    setNewCommentText('');
  };

  // Sub-modal submission handlers with silent audit log registration
  const handleFaultReportSubmit = (report: FailureReport) => {
    logPanelActivity({
      userId: currentUser?.id || 'usr-default',
      userName: currentUser?.name || report.reporterName || 'کاربر سیستم',
      userRoleFa: currentUser?.role || report.reporterRole || 'اپراتور بالینی',
      userDepartment: equipment.department,
      actionType: 'fault_reported',
      actionTitleFa: 'اعلام خرابی تجهیز در پرونده هوشمند',
      detailsFa: `ثبت گزارش خرابی شماره ${report.reportNo}: ${report.defectDescription}`,
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.faName,
      department: equipment.department,
      isAuditOnly: true,
    });

    const updatedEquipment: EquipmentItem = {
      ...equipment,
      status: report.priority === 'high' || report.priority === 'critical' ? 'under_maintenance' : equipment.status,
    };
    setEquipment(updatedEquipment);
    onUpdateEquipment?.(updatedEquipment);
    setIsFaultReportOpen(false);
  };

  const handleDailyCareSubmit = (
    eqId: string,
    log: OperatorDailyCareLog,
    customChecklist?: any[]
  ) => {
    const updatedLogs = [log, ...(equipment.dailyCareLogs || [])];
    const updatedEquipment: EquipmentItem = {
      ...equipment,
      dailyCareLogs: updatedLogs,
      lastDailyCareDate: log.date,
      lastDailyCareStatus: log.generalConditionStatus,
      customDailyChecklist: customChecklist || equipment.customDailyChecklist,
    };

    logPanelActivity({
      userId: currentUser?.id || 'usr-default',
      userName: log.operatorName || currentUser?.name || 'اپراتور بالینی',
      userRoleFa: log.operatorRole || currentUser?.role || 'اپراتور بالینی',
      userDepartment: equipment.department,
      actionType: 'daily_care_completed',
      actionTitleFa: 'ثبت چک‌لیست مراقبت روزانه در پرونده هوشمند',
      detailsFa: `ثبت موفقیت‌آمیز چک‌لیست مراقبت شیفت توسط ${log.operatorName}`,
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.faName,
      department: equipment.department,
      isAuditOnly: true,
    });

    setEquipment(updatedEquipment);
    onUpdateEquipment?.(updatedEquipment);
    setIsDailyCareOpen(false);
  };

  const handleRepairSubmit = (
    eqId: string,
    record: EquipmentRepairRecord,
    finalStatus?: any
  ) => {
    const updatedHistory = [record, ...(equipment.repairHistory || [])];
    const updatedEquipment: EquipmentItem = {
      ...equipment,
      repairHistory: updatedHistory,
      status: finalStatus === 'ready_for_service' ? 'active' : 'under_maintenance',
    };

    logPanelActivity({
      userId: currentUser?.id || 'usr-default',
      userName: record.engineerName || currentUser?.name || 'کارشناس مهندسی پزشکی',
      userRoleFa: 'کارشناس ارشد مهندسی پزشکی',
      userDepartment: 'واحد مهندسی پزشکی',
      actionType: 'repair_completed',
      actionTitleFa: 'ثبت اقدام تعمیر و نگهداری در پرونده هوشمند',
      detailsFa: `ثبت فرم تعمیر شماره ${record.repairNo}: ${record.actionsDescription}`,
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.faName,
      department: equipment.department,
      isAuditOnly: true,
    });

    setEquipment(updatedEquipment);
    onUpdateEquipment?.(updatedEquipment);
    setIsRepairOpen(false);
  };

  const handleCalibrationSubmit = (
    eqId: string,
    record: CalibrationRecord,
    newExpiryDate?: string
  ) => {
    const updatedRecords = [record, ...(equipment.calibrationRecords || [])];
    const updatedEquipment: EquipmentItem = {
      ...equipment,
      calibrationRecords: updatedRecords,
      lastCalibrationDate: record.issueDate,
      nextCalibrationDate: newExpiryDate || record.expiryDate || equipment.nextCalibrationDate,
      calibrationStatus: 'valid',
    };

    logPanelActivity({
      userId: currentUser?.id || 'usr-default',
      userName: record.inspector || record.agency || currentUser?.name || 'ممیز کنترل کیفیت',
      userRoleFa: 'کارشناس کالیبراسیون و کنترل کیفی',
      userDepartment: 'کنترل کیفی و استاندارد',
      actionType: 'calibration_completed',
      actionTitleFa: 'ثبت گواهی کالیبراسیون در پرونده هوشمند',
      detailsFa: `ثبت گواهی کالیبراسیون شماره ${record.certNumber || record.id} برای ${equipment.faName}`,
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.faName,
      department: equipment.department,
      isAuditOnly: true,
    });

    setEquipment(updatedEquipment);
    onUpdateEquipment?.(updatedEquipment);
    setIsCalibrationOpen(false);
  };

  const handleAssignmentSubmit = (equipmentId: string, assignment: any) => {
    const updatedEquipment: EquipmentItem = {
      ...equipment,
      department: assignment.department || equipment.department,
      location: assignment.location || equipment.location,
      assignedOperator: assignment.assignedOperator || equipment.assignedOperator,
    };

    logPanelActivity({
      userId: currentUser?.id || 'usr-default',
      userName: currentUser?.name || 'مدیریت تجهیزات',
      userRoleFa: currentUser?.role || 'مدیریت تجهیزات پزشکی',
      userDepartment: equipment.department,
      actionType: 'equipment_assigned',
      actionTitleFa: 'ثبت تغییر یا واگذاری در پرونده هوشمند',
      detailsFa: `انتقال/تخصیص تجهیز به بخش ${assignment.department || equipment.department} و اپراتور ${assignment.assignedOperator || equipment.assignedOperator}`,
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.faName,
      department: equipment.department,
      isAuditOnly: true,
    });

    setEquipment(updatedEquipment);
    onUpdateEquipment?.(updatedEquipment);
    setIsAssignmentOpen(false);
  };

  const handleFeedbackSubmit = (eqId: string, feedback: any) => {
    const updatedFeedbacks = [feedback, ...(equipment.operatorFeedbacks || [])];
    const updatedEquipment: EquipmentItem = {
      ...equipment,
      operatorFeedbacks: updatedFeedbacks,
    };

    logPanelActivity({
      userId: currentUser?.id || 'usr-default',
      userName: feedback.authorName || currentUser?.name || 'اپراتور بالینی',
      userRoleFa: feedback.authorRole || currentUser?.role || 'اپراتور بالینی',
      userDepartment: equipment.department,
      actionType: 'comment_added',
      actionTitleFa: 'ثبت بازخورد اپراتوری در پرونده هوشمند',
      detailsFa: `ثبت بازخورد کاربری و ارزیابی عملکرد تجهیز`,
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.faName,
      department: equipment.department,
      isAuditOnly: true,
    });

    setEquipment(updatedEquipment);
    onUpdateEquipment?.(updatedEquipment);
    setIsFeedbackOpen(false);
  };

  return (
    <div
      id="equipment-passport-modal-backdrop"
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-[60] flex items-center justify-center p-3 md:p-6 overflow-y-auto font-sans text-right dir-rtl"
    >
      <div
        id="equipment-passport-modal-container"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* TOP HERO HEADER WITH ASSET PASSPORT BADGE & ACTIONS  */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white shrink-0 relative overflow-hidden">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start justify-between gap-5 relative z-10">
            {/* Right: Main Identity */}
            <div className="flex items-start gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg ${
                  isConsumable
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30'
                    : 'bg-blue-500/20 text-blue-400 border-blue-400/30'
                }`}
              >
                {isConsumable ? <Package className="w-8 h-8" /> : <Stethoscope className="w-8 h-8" />}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 font-bold border border-blue-400/30">
                    {equipment.code}
                  </span>
                  <span className="text-xs text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full font-medium">
                    {equipment.category}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                      isConsumable
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
                    }`}
                  >
                    {categoryRoleText}
                  </span>
                  {equipment.status === 'active' || equipment.status === 'in_stock' ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>آماده به کار و فعال</span>
                    </span>
                  ) : equipment.status === 'under_maintenance' ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>تحت سرویس و تعمیر</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-500/20 text-slate-300 border border-slate-400/30 font-bold">
                      <span>موجود در انبار</span>
                    </span>
                  )}
                </div>

                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  شناسنامه دیجیتال: {equipment.faName}
                </h1>

                <div className="text-xs text-blue-200/90 flex flex-wrap items-center gap-3">
                  <span>نام انگلیسی: <strong className="font-mono text-white">{equipment.enName}</strong></span>
                  <span>•</span>
                  <span>برند / سازنده: <strong className="text-white">{equipment.brand}</strong> ({equipment.model})</span>
                  <span>•</span>
                  <span>بخش استقرار: <strong className="text-white">{equipment.department}</strong></span>
                  {!isConsumable && (
                    <>
                      <span>•</span>
                      <span>اپراتور مسئول: <strong className="text-emerald-300 font-bold">{equipment.assignedOperator || 'کادر بخش'}</strong></span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Left: Action Triggers & Clean QR Label Action */}
            <div className="flex flex-wrap items-center gap-2.5 self-end md:self-auto shrink-0">
              {/* Contextual Training Action Button */}
              <button
                id="passport-header-training-btn"
                onClick={() => {
                  if (trainings.length > 0) {
                    setSelectedTraining(trainings[0]);
                  } else {
                    setActiveTab('education');
                  }
                }}
                className="px-3.5 py-2 rounded-2xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border border-indigo-400/30 cursor-pointer"
                title="مشاهده آموزش‌ها و دستورالعمل‌های کاربری اختصاصی این تجهیز"
              >
                <BookOpen className="w-4 h-4 text-indigo-200" />
                <span>آموزش مرتبط</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono font-bold">
                  {toPersianNumber(trainings.length)}
                </span>
              </button>

              {/* Fault Report Action Button */}
              {canReportFault && (
                <button
                  id="passport-header-fault-btn"
                  onClick={() => setIsFaultReportOpen(true)}
                  className="px-3.5 py-2 rounded-2xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border border-rose-400/30 cursor-pointer"
                  title="ثبت فوری گزارش خرابی یا نقص فنی دستگاه"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>اعلام خرابی</span>
                </button>
              )}

              {/* Clean QR Tag Card with Single Print Action */}
              <div className="flex items-center gap-2.5 bg-slate-900/90 p-2 rounded-2xl border border-white/10 shrink-0 shadow-lg">
                <div
                  className="p-1 bg-white rounded-xl shadow-xs shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setIsPrintModalOpen(true)}
                  title="کلیک جهت چاپ برچسب متال پلاک"
                >
                  <QRCodeSVG value={passportUrl} size={44} level="M" />
                </div>

                <div className="space-y-1 text-right">
                  <span className="text-[10px] text-blue-200 font-bold block">
                    پلاک شناسنامه QR
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsPrintModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Printer className="w-3 h-3" />
                      <span>چاپ پلاک</span>
                    </button>

                    <button
                      onClick={handleCopyLink}
                      className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title="کپی لینک اختصاصی شناسنامه"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Close 'X' Button */}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-600/80 text-white flex items-center justify-center transition-colors cursor-pointer mr-1 self-center"
                title="بستن پرونده هوشمند"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* NAVIGATION TABS (NATURE-AWARE ADAPTATION)            */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {[
            { id: 'specs', label: 'مشخصات فنی و شناسنامه', icon: Info, badge: null },
            {
              id: 'operator',
              label: 'پایش و اپراتوری شیفت',
              icon: Activity,
              badge: !isConsumable ? toPersianNumber(dailyCareLogs.length) : null,
            },
            {
              id: 'education',
              label: 'آموزش‌ها و راهنماها',
              icon: BookOpen,
              badge: toPersianNumber(trainings.length),
            },
            {
              id: 'calibration',
              label: 'کالیبراسیون و QC',
              icon: Award,
              badge: canRequireCalibration ? 'معتبر' : null,
              hidden: !canRequireCalibration,
            },
            {
              id: 'repairs',
              label: 'سوابق تعمیرات و سرویس',
              icon: Wrench,
              badge: canReportFault ? toPersianNumber(repairHistory.length) : null,
              hidden: !canReportFault,
            },
            {
              id: 'failures',
              label: 'گزارش‌های خرابی',
              icon: AlertTriangle,
              badge: matchedFailures.length > 0 ? toPersianNumber(matchedFailures.length) : null,
              badgeColor: matchedFailures.length > 0 ? 'bg-rose-500 text-white' : undefined,
              hidden: !canReportFault,
            },
            {
              id: 'handover',
              label: 'یادداشت‌ها و تحویل شیفت',
              icon: MessageSquare,
              badge: equipment.comments?.length ? toPersianNumber(equipment.comments.length) : null,
            },
          ]
            .filter((tab) => !tab.hidden)
            .map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as PassportTab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        tab.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700')
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* TAB CONTENTS                                         */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: TECHNICAL SPECS & IDENTITY PASSPORT */}
          {/* ========================================================================= */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              {/* Asset Identity Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>شناسنامه هویتی و ثبت در کاردکس اموال</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsFeedbackOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      <span>ثبت نظر کاربری</span>
                    </button>
                    <span className="text-xs text-slate-400 font-mono">
                      آخرین ویرایش: {toPersianNumber(equipment.lastModified || '۱۴۰۳/۰۵/۲۲')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <span className="text-slate-400 block text-[11px]">کد انحصاری اموال:</span>
                    <strong className="text-slate-900 font-mono text-sm">{equipment.code}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <span className="text-slate-400 block text-[11px]">شماره سریال کارخانه:</span>
                    <strong className="text-slate-900 font-mono text-sm">{equipment.serialNumber || '—'}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <span className="text-slate-400 block text-[11px]">سازنده و برند:</span>
                    <strong className="text-slate-900">{equipment.brand}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <span className="text-slate-400 block text-[11px]">مدل دستگاه:</span>
                    <strong className="text-slate-900 font-mono">{equipment.model || 'Standard'}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <span className="text-slate-400 block text-[11px]">دپارتمان و بخش:</span>
                    <strong className="text-slate-900">{equipment.department}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <span className="text-slate-400 block text-[11px]">موقعیت استقرار فیزیکی:</span>
                    <strong className="text-slate-900">{equipment.location || 'بخش بستری'}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <span className="text-slate-400 block text-[11px]">موجودی / تعداد ثبت‌شده:</span>
                    <strong className="text-slate-900 font-mono">
                      {toPersianNumber(equipment.quantity || 1)} {equipment.unit || 'دستگاه'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>مشخصات فنی، الزامات الکتریکی و ایمنی بالینی</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 border border-slate-100 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500">منبع تغذیه و ولتاژ:</span>
                    <strong className="font-mono text-slate-800">220V AC / 50Hz (Internal Batt 4h)</strong>
                  </div>
                  <div className="p-3 border border-slate-100 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500">کلاس ایمنی الکتریکی:</span>
                    <strong className="font-mono text-slate-800">Class I, Type CF Defibrillation-proof</strong>
                  </div>
                  <div className="p-3 border border-slate-100 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500">گواهینامه‌های استاندارد:</span>
                    <strong className="font-mono text-slate-800">CE 0123, ISO 13485, FDA</strong>
                  </div>
                  <div className="p-3 border border-slate-100 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500">کشور سازنده:</span>
                    <strong className="text-slate-800">سوئیس / آلمان</strong>
                  </div>
                  <div className="p-3 border border-slate-100 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500">تاریخ خرید و نصب:</span>
                    <strong className="font-mono text-slate-800">۱۴۰۲/۰۹/۱۰</strong>
                  </div>
                  <div className="p-3 border border-slate-100 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500">وضعیت گارانتی / خدمات:</span>
                    <strong className="text-emerald-700 font-bold">معتبر (تا ۱۴۰۵/۰۹/۱۰)</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: OPERATOR MONITORING & DAILY CARE CHECKS */}
          {/* ========================================================================= */}
          {activeTab === 'operator' && !isConsumable && (
            <div className="space-y-6">
              {/* Daily Care Status Banner & Triggers */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-sm font-black text-slate-900">
                      پایش سلامت روزانه و چک‌لیست مراقبت شیفت
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600">
                    اپراتور مسئول: <strong className="text-slate-900">{equipment.assignedOperator || 'کادر بخش'}</strong> — آخرین پایش: <span className="font-mono">{toPersianNumber(equipment.lastDailyCareDate || 'امروز ۰۸:۳۰')}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDailyCareOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>ثبت چک‌لیست مراقبت شیفت</span>
                  </button>

                  <button
                    onClick={() => setIsAssignmentOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>تغییر یا واگذاری</span>
                  </button>
                </div>
              </div>

              {/* Specific Customizable Checklist for this Unit */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-black text-slate-800">
                      چک‌لیست مراقبت اختصاصی این دستگاه
                    </h4>
                    {equipment.customDailyChecklist && equipment.customDailyChecklist.length > 0 ? (
                      <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                        شخصی‌سازی‌شده برای این تجهیز
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
                        استاندارد کلاس پزشکی
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsDailyCareOpen(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>تنظیم و شخصی‌سازی آیتم‌ها</span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {(equipment.customDailyChecklist || [
                    { id: '1', title: 'بررسی فیزیکی کابل برق و بدنه دستگاه', category: 'safety', isMandatory: true },
                    { id: '2', title: 'تست شارژ باتری و عملکرد نشانگر ولتاژ', category: 'electrical', isMandatory: true },
                    { id: '3', title: 'ضدعفونی سنسورها و کاوشگرها با الکل ایزوپروپیل', category: 'hygiene', isMandatory: true },
                    { id: '4', title: 'تست عملکرد آلارم‌های صوتی و دیداری', category: 'function', isMandatory: true },
                  ]).map((item: any, idx: number) => (
                    <div
                      key={item.id || idx}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-slate-800">{item.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">الزامی</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shift Monitoring Logbook Table */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>لاگ سوابق پایش شیفت‌های قبلی</span>
                </h4>

                <div className="space-y-2">
                  {dailyCareLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 font-bold">{log.operatorName}</strong>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {log.operatorRole}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {log.shift === 'morning' ? 'شیفت صبح' : log.shift === 'evening' ? 'شیفت عصر' : 'شیفت شب'}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{log.notes}</p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-[11px] text-slate-500">
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          پاس شد
                        </span>
                        <span>•</span>
                        <span>{toPersianNumber(log.date)} {log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CONTEXTUAL TRAINING & OPERATIONAL MANUALS */}
          {/* ========================================================================= */}
          {activeTab === 'education' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>محتواها و کارگاه‌های آموزشی اختصاصی: {equipment.faName}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    دستورالعمل‌های مصوب کاربری، ماتریس عیب‌یابی و فیلم‌های آموزشی ضبط‌شده در بالین
                  </p>
                </div>

                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {toPersianNumber(trainings.length)} سند فعال
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trainings.map((mat) => (
                  <div
                    key={mat.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3.5 flex flex-col justify-between hover:border-indigo-300 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            {mat.type === 'video' ? (
                              <Video className="w-4 h-4 text-indigo-600" />
                            ) : mat.type === 'troubleshoot' ? (
                              <AlertOctagon className="w-4 h-4 text-amber-600" />
                            ) : mat.type === 'sop' ? (
                              <Award className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <FileText className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <span className="text-xs font-bold text-slate-800">
                            {mat.type === 'video' ? 'فیلم کارگاهی' : mat.type === 'troubleshoot' ? 'ماتریس خطاها' : mat.type === 'sop' ? 'پروتکل استاندارد' : 'دفترچه کاربری'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {mat.durationOrPages}
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-slate-900 leading-snug">
                        {mat.title}
                      </h4>

                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {mat.description}
                      </p>

                      {mat.keyTopics && (
                        <div className="pt-2">
                          <span className="text-[10px] text-indigo-800 font-bold block mb-1">
                            سرفصل‌های کلیدی:
                          </span>
                          <ul className="text-[11px] text-slate-500 space-y-0.5 list-disc list-inside">
                            {mat.keyTopics.slice(0, 3).map((topic, i) => (
                              <li key={i}>{topic}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-500">
                        مدرس / مرجع: <strong>{mat.author}</strong>
                      </span>
                      <button
                        onClick={() => setSelectedTraining(mat)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>مشاهده و مطالعه</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: CALIBRATION & METROLOGY QUALITY CONTROL */}
          {/* ========================================================================= */}
          {activeTab === 'calibration' && canRequireCalibration && (
            <div className="space-y-6">
              {/* Calibration Status Badge & Trigger */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">
                        گواهی کالیبراسیون رسمی معتبر (ISO 17025)
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        معتبر و کالیبره
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      شماره گواهینامه: <span className="font-mono font-bold">CAL-1403-9018</span> — شرکت مجری: <strong className="text-slate-800">مؤسسه آزمون سنجش دقیق</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left font-mono text-xs text-slate-700 bg-white px-3 py-2 rounded-xl border border-emerald-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block">سررسید کالیبراسیون بعدی:</span>
                    <strong className="text-emerald-700 font-bold text-sm">
                      {toPersianNumber(equipment.nextCalibrationDate || '۱۴۰۴/۰۶/۱۵')}
                    </strong>
                  </div>

                  <button
                    onClick={() => setIsCalibrationOpen(true)}
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>ثبت گواهی جدید</span>
                  </button>
                </div>
              </div>

              {/* Calibration Measurement Parameters Table */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>نتایج آزمون‌های پارامتریک و دقت سنجش دستگاه</span>
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                        <th className="p-3">پارامتر / متغیر سنجش</th>
                        <th className="p-3">مقدار استاندارد مرجع</th>
                        <th className="p-3">مقدار قبل از تنظیم</th>
                        <th className="p-3">مقدار بعد از کالیبراسیون</th>
                        <th className="p-3">رواداری مجاز (Tolerance)</th>
                        <th className="p-3 text-center">نتیجه</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { param: 'غلظت اکسیژن خروجی (FiO2 21%)', ref: '21.0 %', before: '19.4 %', after: '21.1 %', tol: '± 1 %', res: 'قبول' },
                        { param: 'غلظت اکسیژن خروجی (FiO2 100%)', ref: '100.0 %', before: '97.2 %', after: '99.8 %', tol: '± 2 %', res: 'قبول' },
                        { param: 'دقت حجم جاری (Tidal Vol 500ml)', ref: '500 ml', before: '480 ml', after: '498 ml', tol: '± 5 %', res: 'قبول' },
                        { param: 'فشار PEEP تنفسی (10 cmH2O)', ref: '10.0 mbar', before: '9.2 mbar', after: '10.1 mbar', tol: '± 0.5 mbar', res: 'قبول' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-800">{row.param}</td>
                          <td className="p-3 font-mono text-slate-600">{row.ref}</td>
                          <td className="p-3 font-mono text-amber-700">{row.before}</td>
                          <td className="p-3 font-mono text-emerald-700 font-bold">{row.after}</td>
                          <td className="p-3 font-mono text-slate-500">{row.tol}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {row.res}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: REPAIR & MAINTENANCE HISTORY */}
          {/* ========================================================================= */}
          {activeTab === 'repairs' && canReportFault && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span>سوابق تعمیرات و اقدامات فنی مهندسی پزشکی</span>
                </h4>
                <button
                  onClick={() => setIsRepairOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>ثبت فرم تعمیر جدید</span>
                </button>
              </div>

              <div className="space-y-3">
                {repairHistory.map((rep) => (
                  <div
                    key={rep.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                            {rep.repairNo}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            آماده به کار (پاس کامل تست‌ها)
                          </span>
                        </div>
                        <h5 className="text-xs font-black text-slate-900 mt-1">
                          شرح اقدام: {rep.actionsDescription}
                        </h5>
                      </div>

                      <div className="text-left text-[11px] font-mono text-slate-500">
                        <span>تاریخ تعمیر: {toPersianNumber(rep.startDate)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[10px]">تشخیص نهایی مهندسی:</span>
                        <strong className="text-slate-800">{rep.finalDiagnosis}</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[10px]">قطعات تعویض‌شده:</span>
                        <strong className="text-slate-800 font-mono">{rep.replacedComponents || '—'}</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[10px]">کارشناس مهندسی پزشکی:</span>
                        <strong className="text-blue-900">{rep.engineerName}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: FAILURE REPORTS */}
          {/* ========================================================================= */}
          {activeTab === 'failures' && canReportFault && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>گزارش‌های خرابی و حوادث ثبت‌شده</span>
                </h4>
                <button
                  onClick={() => setIsFaultReportOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>ثبت اعلام خرابی</span>
                </button>
              </div>

              {matchedFailures.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <h5 className="text-xs font-bold text-slate-700">هیچ گزارش خرابی فعالی برای این تجهیز ثبت نشده است</h5>
                  <p className="text-[11px] text-slate-400">تجهیز در وضعیت پایدار و کاملاً آماده به کار می‌باشد.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matchedFailures.map((f) => (
                    <div key={f.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-700">{f.reportNo}</span>
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                          {f.status === 'resolved' ? 'برطرف‌شده' : 'در حال بررسی'}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800">{f.defectDescription}</p>
                      <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                        <span>گزارش‌دهنده: {f.reporterName} ({f.reporterRole})</span>
                        <span>تاریخ: {toPersianNumber(f.reportDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: COMMENTS & SHIFT HANDOVERS */}
          {/* ========================================================================= */}
          {activeTab === 'handover' && (
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>یادداشت‌های تحویل شیفت و تبادل نظر پرسنل</span>
              </h4>

              {/* Add comment box */}
              <form onSubmit={handlePostComment} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <textarea
                  rows={3}
                  placeholder="ثبت یادداشت تحویل شیفت یا نکته‌ای در خصوص وضعیت کارکرد تجهیز..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    ثبت یادداشت در پرونده تجهیز
                  </button>
                </div>
              </form>

              {/* Sample Comments List */}
              <div className="space-y-2">
                {(equipment.comments || [
                  {
                    id: 'comm-1',
                    authorName: 'نسرین کریمی',
                    authorRole: 'اپراتور شیفت صبح',
                    date: '۱۴۰۳/۰۵/۲۲',
                    commentType: 'shift_handover',
                    text: 'تحویل شیفت انجام شد. سنسورها تمیز و مدار تنفسی تعویض گردید.',
                  },
                ]).map((comm) => (
                  <div key={comm.id} className="p-3.5 bg-white rounded-xl border border-slate-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-800">{comm.authorName} ({comm.authorRole})</strong>
                      <span className="text-[10px] text-slate-400 font-mono">{toPersianNumber(comm.date)}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{comm.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* FOOTER                                               */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedLink ? 'لینک کپی شد' : 'کپی لینک مستقیم این صفحه'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              بستن
            </button>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all flex items-center gap-2 shadow-md hover:shadow-blue-500/25 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ لیبل برچسب اموال QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* SUB-MODALS (ALL GUARANTEED TO RENDER ON TOP AT z-[80])*/}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

      {/* 1. Contextual Training Reader Modal */}
      {selectedTraining && (
        <ContextualEquipmentTrainingModal
          equipment={equipment}
          materials={trainings}
          selectedMaterial={selectedTraining}
          onSelectMaterial={(mat) => setSelectedTraining(mat)}
          onClose={() => setSelectedTraining(null)}
        />
      )}

      {/* 2. Equipment Fault Report Modal */}
      {isFaultReportOpen && (
        <EquipmentFaultReportModal
          equipment={equipment}
          currentUser={currentUser}
          onClose={() => setIsFaultReportOpen(false)}
          onSubmitReport={handleFaultReportSubmit}
        />
      )}

      {/* 3. Operator Daily Care Modal */}
      {isDailyCareOpen && (
        <OperatorDailyCareModal
          equipment={equipment}
          currentUser={currentUser}
          onClose={() => setIsDailyCareOpen(false)}
          onSaveDailyCare={handleDailyCareSubmit}
          onOpenFaultReport={() => {
            setIsDailyCareOpen(false);
            setIsFaultReportOpen(true);
          }}
        />
      )}

      {/* 4. Equipment Repair Modal */}
      {isRepairOpen && (
        <EquipmentRepairModal
          equipment={equipment}
          faultReport={selectedRepairFaultReport}
          currentUser={currentUser}
          onClose={() => {
            setIsRepairOpen(false);
            setSelectedRepairFaultReport(null);
          }}
          onSaveRepairRecord={handleRepairSubmit}
        />
      )}

      {/* 5. Equipment Calibration Modal */}
      {isCalibrationOpen && (
        <EquipmentCalibrationModal
          equipment={equipment}
          currentUser={currentUser}
          onClose={() => setIsCalibrationOpen(false)}
          onSaveCalibrationRecord={handleCalibrationSubmit}
        />
      )}

      {/* 6. Equipment Assignment Modal */}
      {isAssignmentOpen && (
        <EquipmentAssignmentModal
          equipment={equipment}
          currentUser={currentUser}
          onClose={() => setIsAssignmentOpen(false)}
          onSaveAssignment={handleAssignmentSubmit}
        />
      )}

      {/* 7. Operator Feedback Modal */}
      {isFeedbackOpen && (
        <OperatorFeedbackModal
          equipment={equipment}
          currentUser={currentUser}
          onClose={() => setIsFeedbackOpen(false)}
          onSubmitFeedback={handleFeedbackSubmit}
          onOpenFaultReport={() => {
            setIsFeedbackOpen(false);
            setIsFaultReportOpen(true);
          }}
        />
      )}

      {/* 8. QR Code Metal Tag Print Modal */}
      {isPrintModalOpen && (
        <EquipmentQrPrintModal
          equipment={equipment}
          allEquipmentList={allEquipmentList}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
};
