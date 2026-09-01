import { EducationItem, MessageFileAttachment, EquipmentItem } from '../types';

/**
 * Universal browser file trigger helper
 */
export function triggerFileDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Download real file for Education (LMS) items
 */
export function downloadEducationFile(item: EducationItem) {
  if (item.type === 'folder') return;

  const fileName = item.name.includes('.') 
    ? item.name 
    : `${item.name}.${item.extension || (item.type === 'pdf' ? 'pdf' : item.type === 'image' ? 'png' : 'txt')}`;

  let mimeType = 'text/plain;charset=utf-8';
  let fileContent = item.content || '';

  if (item.type === 'pdf') {
    mimeType = 'application/pdf';
    if (!fileContent) {
      fileContent = `%PDF-1.4\n% Avicenna Hospital LMS Document: ${item.name}\nDepartment: ${item.department || 'General'}\nAuthor: ${item.author}\nDate: ${item.updatedAt}\n\n${item.description || 'پروتکل آموزشی استاندارد بیمارستان آوید'}`;
    }
  } else if (item.type === 'image') {
    mimeType = 'image/svg+xml;charset=utf-8';
    if (!fileContent.startsWith('<svg') && !fileContent.startsWith('data:image')) {
      fileContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect width="800" height="600" fill="#0f172a"/>
        <rect x="40" y="40" width="720" height="520" rx="24" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <text x="400" y="260" fill="#38bdf8" font-size="28" font-family="sans-serif" font-weight="bold" text-anchor="middle">بیمارستان تخصصی و فوق‌تخصصی آوید</text>
        <text x="400" y="320" fill="#ffffff" font-size="20" font-family="sans-serif" text-anchor="middle">${item.name}</text>
        <text x="400" y="370" fill="#94a3b8" font-size="14" font-family="sans-serif" text-anchor="middle">دپارتمان: ${item.department || 'مهندسی پزشکی'} | تاریخ: ${item.updatedAt}</text>
      </svg>`;
    }
  } else if (item.type === 'video' || item.type === 'audio') {
    mimeType = 'text/plain;charset=utf-8';
    fileContent = `[Avid Hospital Educational Media Package]\nعنوان فایل: ${item.name}\nنوع رسانه: ${item.type.toUpperCase()}\nدپارتمان: ${item.department || 'آموزش و توانمندسازی'}\nمدرس/تهیه‌کننده: ${item.author} (${item.authorRole || 'کارشناس'})\nمدت زمان: ${item.duration || '۱۵ دقیقه'}\nتاریخ به‌روزرسانی: ${item.updatedAt}\n\nخلاصه مباحث آموزشی:\n${item.description || 'دستورالعمل‌های استاندارد عملیاتی و کاربری بالینی تجهیزات بیمارستانی'}\n\nمتن و مستندات پیوست:\n${item.content || 'فایل ویدیویی/صوتی استاندارد درون‌سازمانی بیمارستان'}`;
  } else {
    // Document / text / spreadsheet
    fileContent = `سامانه آموزش و توانمندسازی کارکنان بیمارستان آوید (LMS)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nنام سند: ${item.name}\nدپارتمان: ${item.department || 'مهندسی پزشکی و ایمنی'}\nمؤلف: ${item.author} (${item.authorRole || 'کارشناس'})\nتاریخ ثبت: ${item.createdAt}\nتاریخ آخرین ویرایش: ${item.updatedAt}\n\nتوضیحات و دستورالعمل:\n${item.description || ''}\n\nمحتوای تخصصی:\n${item.content || 'این سند حاوی استانداردها و چک‌لیست‌های آموزشی معتبر بیمارستان است.'}`;
  }

  const blob = new Blob([fileContent], { type: mimeType });
  triggerFileDownload(blob, fileName);
}

/**
 * Download real file for Messages attachments
 */
export function downloadMessageAttachmentFile(file: MessageFileAttachment, senderName?: string, sentAt?: string) {
  const fileName = file.name || `attachment-${file.id}.txt`;
  
  let mimeType = 'text/plain;charset=utf-8';
  let content = '';

  if (file.type === 'pdf') {
    mimeType = 'application/pdf';
    content = `%PDF-1.4\n% Avid Hospital Workplace Message Document: ${file.name}\nSender: ${senderName || 'Hospital User'}\nSent At: ${sentAt || 'Recorded in System'}\nSize: ${file.size}\n\nپیوست رسمی سامانه ارتباطات و مکاتبات سازمانی بیمارستان آوید`;
  } else if (file.type === 'sheet') {
    mimeType = 'text/csv;charset=utf-8';
    content = `\uFEFFردیف,کد پیوست,عنوان سند,ارسال‌کننده,زمان ارسال,حجم\n۱,${file.id},"${file.name}","${senderName || 'کاربر سیستم'}","${sentAt || 'امروز'}","${file.size}"\n`;
  } else if (file.type === 'image') {
    mimeType = 'image/svg+xml;charset=utf-8';
    content = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" fill="#0284c7"/>
      <rect x="20" y="20" width="560" height="360" rx="16" fill="#ffffff"/>
      <text x="300" y="160" fill="#0284c7" font-size="22" font-family="sans-serif" font-weight="bold" text-anchor="middle">پیوست تصویری پیام سازمانی</text>
      <text x="300" y="210" fill="#334155" font-size="16" font-family="sans-serif" text-anchor="middle">${file.name}</text>
      <text x="300" y="250" fill="#64748b" font-size="12" font-family="sans-serif" text-anchor="middle">ارسال‌کننده: ${senderName || 'پرسنل'} | زمان: ${sentAt || '-'}</text>
    </svg>`;
  } else {
    mimeType = 'text/plain;charset=utf-8';
    content = `مکاتبات سازمانی و کارگروه‌های تخصصی بیمارستان آوید\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nنام فایل پیوست: ${file.name}\nشناسه پیوست: ${file.id}\nارسال‌کننده: ${senderName || 'نامشخص'}\nزمان ارسال: ${sentAt || 'نامشخص'}\nحجم فایل: ${file.size}\nنوع فایل: ${file.type}\n\nاین فایل به عنوان ضمیمه رسمی در مکالمات سازمانی ثبت و تأیید گردیده است.`;
  }

  const blob = new Blob([content], { type: mimeType });
  triggerFileDownload(blob, fileName);
}

/**
 * Generate and download standard UTF-8 BOM CSV Excel-compatible inventory report
 */
export function downloadInventoryCSV(items: EquipmentItem[], customFileName?: string) {
  const headers = [
    'ردیف',
    'کد کالا/دستگاه',
    'نام فارسی کالا',
    'نام لاتین / مدل',
    'برند سازنده',
    'دسته‌بندی اصلی',
    'زیردسته',
    'بخش / دپارتمان',
    'محل استقرار دقیق',
    'تعداد موجودی',
    'واحد سنجش',
    'کد اموال',
    'شماره سریال',
    'وضعیت عملیاتی',
    'نام تأمین‌کننده',
    'تاریخ خرید / ورود',
    'تاریخ انقضا',
    'موعد کالیبراسیون بعدی',
    'وضعیت گارانتی',
    'کلاس خطر و ریسک',
    'قیمت واحد (ریال)',
    'توضیحات و مشخصات فنی'
  ];

  const escapeCSV = (val: any) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const getStatusFa = (status: string) => {
    switch (status) {
      case 'active': return 'فعال و آماده به کار';
      case 'in_use': return 'در حال استفاده';
      case 'in_stock': return 'موجود در انبار';
      case 'under_maintenance': return 'در حال تعمیر / نقص';
      case 'calibrating': return 'در حال کالیبراسیون';
      case 'near_expiry': return 'نزدیک به انقضا';
      case 'expired': return 'منقضی شده';
      case 'low_stock': return 'کمبود موجودی';
      case 'out_of_stock': return 'ناموجود / صفر';
      case 'decommissioned': return 'اسقاط / خارج از رده';
      case 'draft': return 'پیش‌نویس';
      default: return status;
    }
  };

  const rows = items.map((item, index) => {
    const specsStr = item.specs ? Object.entries(item.specs).map(([k, v]) => `${k}: ${v}`).join(' | ') : '-';
    return [
      index + 1,
      item.code || '-',
      item.faName || '-',
      item.enName || item.model || '-',
      item.brand || '-',
      item.category || '-',
      item.subcategory || '-',
      item.department || '-',
      item.location || '-',
      item.quantity ?? 1,
      item.unit || 'عدد',
      item.code || '-',
      item.serialNumber || '-',
      getStatusFa(item.status),
      item.supplier || '-',
      item.purchaseDate || '-',
      item.expiryDate || '-',
      item.nextCalibrationDate || '-',
      item.warrantyExpiry ? `تا ${item.warrantyExpiry}` : '-',
      item.safetyScore ? `امتیاز ایمنی: ${item.safetyScore}` : '-',
      item.price ? Number(item.price).toLocaleString('fa-IR') : '-',
      specsStr
    ].map(escapeCSV).join(',');
  });

  // UTF-8 BOM prefix (\uFEFF) ensures Excel and Persian text render perfectly without encoding issues
  const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
  const fileName = customFileName || `گزارش_جامع_موجودی_انبار_بیمارستان_آوید_${today}.csv`;
  
  triggerFileDownload(blob, fileName);
}
