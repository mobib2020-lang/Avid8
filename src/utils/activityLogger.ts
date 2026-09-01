import { PanelActivityLog, ActivityActionType, AppUser } from '../types';
import { getPersianDateShortString } from './persianDate';

const STORAGE_KEY = 'avid_panel_activity_logs_v1';

// Initial realistic seed audit logs
const INITIAL_AUDIT_LOGS: PanelActivityLog[] = [
  {
    id: 'log-101',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    date: '۱۴۰۳/۰۵/۲۲',
    time: '۰۸:۴۵',
    userId: 'usr-7',
    userName: 'نسرین کریمی',
    userRoleFa: 'پرستار / اپراتور بالینی',
    userPersonnelCode: '۹۹۴۸۲',
    userDepartment: 'بخش مراقبت‌های ویژه (ICU)',
    actionType: 'daily_care_completed',
    actionTitleFa: 'ثبت چک‌لیست مراقبت روزانه شیفت صبح',
    detailsFa: 'تکمیل موفقیت‌آمیز چک‌لیست ۴ موردی سلامت دستگاه، آزمون خودکار اولیه و تمیزکاری سطحی',
    equipmentId: 'eq-1',
    equipmentCode: 'EQ-1403-1042',
    equipmentName: 'دستگاه ونتیلاتور مراقبت ویژه Hamilton-C6',
    department: 'بخش مراقبت‌های ویژه (ICU)',
    metadata: {
      shift: 'morning',
      generalConditionStatus: 'normal',
      checklistCount: 4,
    },
    isAuditOnly: true,
  },
  {
    id: 'log-102',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    date: '۱۴۰۳/۰۵/۲۲',
    time: '۰۸:۱۵',
    userId: 'usr-7',
    userName: 'نسرین کریمی',
    userRoleFa: 'پرستار / اپراتور بالینی',
    userPersonnelCode: '۹۹۴۸۲',
    userDepartment: 'بخش مراقبت‌های ویژه (ICU)',
    actionType: 'daily_checklist_customized',
    actionTitleFa: 'شخصی‌سازی چک‌لیست پایش دستگاه',
    detailsFa: 'افزودن آیتم سفارشی "کنترل فشار خط اکسیژن و فیلتر ورودی" به چک‌لیست اختصاصی ونتیلاتور',
    equipmentId: 'eq-1',
    equipmentCode: 'EQ-1403-1042',
    equipmentName: 'دستگاه ونتیلاتور مراقبت ویژه Hamilton-C6',
    department: 'بخش مراقبت‌های ویژه (ICU)',
    metadata: {
      addedItem: 'کنترل فشار خط اکسیژن و فیلتر ورودی',
    },
    isAuditOnly: true,
  },
  {
    id: 'log-103',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    date: '۱۴۰۳/۰۵/۲۲',
    time: '۰۶:۳۰',
    userId: 'usr-3',
    userName: 'مهندس امین رضایی',
    userRoleFa: 'کارشناس مهندسی پزشکی',
    userPersonnelCode: '۴۸۱۰۲',
    userDepartment: 'واحد مهندسی پزشکی',
    actionType: 'repair_completed',
    actionTitleFa: 'ثبت و تکمیل گزارش کارشناسی تعمیرات (SRV-89410)',
    detailsFa: 'تعویض سلول سنسور کالیبره O2 و رفع نقص نوسان تغذیه برق با تاییدیه تست ایمنی الکتریکی',
    equipmentId: 'eq-1',
    equipmentCode: 'EQ-1403-1042',
    equipmentName: 'دستگاه ونتیلاتور مراقبت ویژه Hamilton-C6',
    department: 'بخش مراقبت‌های ویژه (ICU)',
    metadata: {
      repairNo: 'SRV-89410',
      finalStatus: 'ready_for_service',
    },
    isAuditOnly: true,
  },
  {
    id: 'log-104',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    date: '۱۴۰۳/۰۵/۲۱',
    time: '۱۴:۲۰',
    userId: 'usr-1',
    userName: 'مهندس سارا امیری',
    userRoleFa: 'امین و مدیر تجهیزات اموال',
    userPersonnelCode: '۱۰۴۸۰',
    userDepartment: 'مدیریت تجهیزات پزشکی',
    actionType: 'qr_label_printed',
    actionTitleFa: 'تولید و چاپ پلاک هوشمند QR Code',
    detailsFa: 'صدور و چاپ برچسب متال فیزیکی استاندارد متصل به شناسنامه دیجیتال پایدار',
    equipmentId: 'eq-1',
    equipmentCode: 'EQ-1403-1042',
    equipmentName: 'دستگاه ونتیلاتور مراقبت ویژه Hamilton-C6',
    department: 'بخش مراقبت‌های ویژه (ICU)',
    isAuditOnly: true,
  },
  {
    id: 'log-105',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    date: '۱۴۰۳/۰۵/۲۰',
    time: '۱۱:۰۰',
    userId: 'usr-5',
    userName: 'مهندس احمد حسینی',
    userRoleFa: 'مسئول کالیبراسیون و QC',
    userPersonnelCode: '۳۹۴۰۲',
    userDepartment: 'کنترل کیفیت و آزمون',
    actionType: 'calibration_completed',
    actionTitleFa: 'ثبت گواهینامه کالیبراسیون دوره‌ای (CAL-1403-490)',
    detailsFa: 'آزمون کنترل کیفی گازهای بیهوشی و حجم تنفسی با نتیجه قبولی ۱۰۰٪ استاندارد',
    equipmentId: 'eq-1',
    equipmentCode: 'EQ-1403-1042',
    equipmentName: 'دستگاه ونتیلاتور مراقبت ویژه Hamilton-C6',
    department: 'بخش مراقبت‌های ویژه (ICU)',
    metadata: {
      certNumber: 'CAL-1403-490',
      result: 'pass',
    },
    isAuditOnly: true,
  },
  {
    id: 'log-106',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    date: '۱۴۰۳/۰۵/۱۹',
    time: '۰۹:۱۵',
    userId: 'usr-1',
    userName: 'مهندس سارا امیری',
    userRoleFa: 'امین و مدیر تجهیزات اموال',
    userPersonnelCode: '۱۰۴۸۰',
    userDepartment: 'مدیریت تجهیزات پزشکی',
    actionType: 'equipment_assigned',
    actionTitleFa: 'تحویل رسمی و تخصیص اپراتور مسئول',
    detailsFa: 'تحویل رسمی تجهیز همراه با متعلقات و پروب‌ها به سرکار خانم نسرین کریمی (سرپرستار ICU)',
    equipmentId: 'eq-1',
    equipmentCode: 'EQ-1403-1042',
    equipmentName: 'دستگاه ونتیلاتور مراقبت ویژه Hamilton-C6',
    department: 'بخش مراقبت‌های ویژه (ICU)',
    isAuditOnly: true,
  },
];

let inMemoryLogs: PanelActivityLog[] | null = null;

function loadStoredLogs(): PanelActivityLog[] {
  if (inMemoryLogs) return inMemoryLogs;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      inMemoryLogs = JSON.parse(raw);
      return inMemoryLogs || INITIAL_AUDIT_LOGS;
    }
  } catch (e) {
    console.warn('Could not read activity logs from localStorage', e);
  }
  inMemoryLogs = [...INITIAL_AUDIT_LOGS];
  return inMemoryLogs;
}

function saveStoredLogs(logs: PanelActivityLog[]) {
  inMemoryLogs = logs;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.warn('Could not save activity logs to localStorage', e);
  }
}

/**
 * Record a user operation in the audit trail.
 * Silent, non-intrusive recording designed for supervisory and auditing reporting.
 */
export function logPanelActivity(
  data: Omit<PanelActivityLog, 'id' | 'timestamp' | 'date' | 'time'> & {
    customDate?: string;
    customTime?: string;
  }
): PanelActivityLog {
  const logs = loadStoredLogs();
  
  const now = new Date();
  const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;
  
  const newLog: PanelActivityLog = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: now.toISOString(),
    date: data.customDate || '۱۴۰۳/۰۵/۲۲',
    time: data.customTime || timeString,
    userId: data.userId,
    userName: data.userName,
    userRoleFa: data.userRoleFa,
    userPersonnelCode: data.userPersonnelCode,
    userDepartment: data.userDepartment,
    actionType: data.actionType,
    actionTitleFa: data.actionTitleFa,
    detailsFa: data.detailsFa,
    equipmentId: data.equipmentId,
    equipmentCode: data.equipmentCode,
    equipmentName: data.equipmentName,
    department: data.department,
    metadata: data.metadata,
    isAuditOnly: data.isAuditOnly ?? true,
  };

  const updatedLogs = [newLog, ...logs];
  saveStoredLogs(updatedLogs);
  return newLog;
}

/**
 * Retrieve all activity logs with optional filtering.
 */
export function getPanelActivityLogs(filter?: {
  equipmentId?: string;
  equipmentCode?: string;
  userId?: string;
  actionType?: string;
  department?: string;
}): PanelActivityLog[] {
  const allLogs = loadStoredLogs();
  if (!filter) return allLogs;

  return allLogs.filter((log) => {
    if (filter.equipmentId && log.equipmentId !== filter.equipmentId) return false;
    if (
      filter.equipmentCode &&
      log.equipmentCode?.toLowerCase() !== filter.equipmentCode.toLowerCase()
    )
      return false;
    if (filter.userId && log.userId !== filter.userId) return false;
    if (filter.actionType && log.actionType !== filter.actionType) return false;
    if (filter.department && log.department !== filter.department) return false;
    return true;
  });
}

/**
 * Returns human readable badge styling for action types.
 */
export function getActionTypeBadge(type: ActivityActionType): {
  label: string;
  colorClass: string;
} {
  switch (type) {
    case 'daily_care_completed':
      return {
        label: 'تکمیل چک‌لیست روزانه',
        colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'daily_checklist_customized':
      return {
        label: 'شخصی‌سازی چک‌لیست',
        colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      };
    case 'fault_reported':
      return {
        label: 'اعلام خرابی',
        colorClass: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    case 'repair_completed':
      return {
        label: 'تعمیر و سرویس بیومدیکال',
        colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    case 'calibration_completed':
      return {
        label: 'کالیبراسیون و QC',
        colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    case 'equipment_assigned':
      return {
        label: 'تخصیص و تحویل اموال',
        colorClass: 'bg-purple-50 text-purple-700 border-purple-200',
      };
    case 'asset_transferred':
      return {
        label: 'جابجایی و انتقال اموال',
        colorClass: 'bg-sky-50 text-sky-700 border-sky-200',
      };
    case 'qr_label_printed':
      return {
        label: 'چاپ پلاک فیزیکی',
        colorClass: 'bg-slate-100 text-slate-700 border-slate-300',
      };
    case 'inventory_registered':
      return {
        label: 'ثبت قطعی در کاردکس',
        colorClass: 'bg-teal-50 text-teal-700 border-teal-200',
      };
    case 'draft_finalized':
      return {
        label: 'تکمیل شناسنامه پیش‌نویس',
        colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    case 'comment_added':
      return {
        label: 'ثبت بازخورد کاربری',
        colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
      };
    case 'stock_restocked':
      return {
        label: 'شارژ موجودی انبار',
        colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    default:
      return {
        label: 'عملیات در سامانه',
        colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
      };
  }
}
