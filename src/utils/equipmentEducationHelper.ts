import { EquipmentItem, EducationItem } from '../types';
import { isEligibleForCalibration, isEligibleForFaultReport } from './equipmentEligibility';

export interface EquipmentTrainingMaterial {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'sop' | 'troubleshoot' | 'checklist';
  description: string;
  durationOrPages?: string;
  author: string;
  role: string;
  date: string;
  url?: string;
  downloadName?: string;
  keyTopics?: string[];
  tags: string[];
}

/**
 * Returns tailored education & training materials for any equipment or inventory item.
 * Strictly adapts to the item's nature:
 * - Medical devices get clinical manuals, video guides, error codes, and calibration SOPs.
 * - Consumables get sterile usage guidelines, storage conditions, and infection control/disposal protocols.
 */
export function getEducationMaterialsForEquipment(item: EquipmentItem): EquipmentTrainingMaterial[] {
  const isDevice = isEligibleForFaultReport(item);
  const requiresCalib = isEligibleForCalibration(item);
  const name = item.faName || '';
  const brand = item.brand || '';
  const model = item.model || '';
  const category = item.category || '';

  if (!isDevice) {
    // Consumable training & usage guidelines
    return [
      {
        id: `edu-cons-${item.id}-1`,
        title: `دستورالعمل استاندارد مصرف، بهداشت و استفاده ایمن: ${name}`,
        type: 'sop',
        description: `پروتکل مصوب کمیته کنترل عفونت بیمارستان جهت نحوه بازگشایی، مصرف بالینی، رعایت شرایط استریلیزاسیون و پیشگیری از آلودگی متقاطع.`,
        durationOrPages: 'سند ۲ صفحه‌ای (SOP مصوب)',
        author: 'کمیته کنترل عفونت و ایمنی بیمار',
        role: 'دبیرخانه کنترل عفونت',
        date: '۱۴۰۳/۱۰/۱۵',
        downloadName: `SOP_Usage_${item.code}.pdf`,
        keyTopics: [
          'شرایط بازگشایی و بررسی سلامت بسته‌بندی استریل',
          'رعایت استانداردهای بهداشت دست قبل و حین استفاده',
          'دمای نگهداری استاندارد در قفسه‌های بخش (۱۵ الی ۲۵ درجه)',
          'عدم استفاده مجدد در اقلام یکبار مصرف (Single Use)',
        ],
        tags: ['کنترل عفونت', 'مصرفی', 'استریل', 'بهداشت'],
      },
      {
        id: `edu-cons-${item.id}-2`,
        title: `راهنمای تفکیک پسماند و امحای بهداشتی پس از مصرف`,
        type: 'checklist',
        description: `نحوه صحیح دفع اقلام مصرفی پزشکی پس از اتمام کار، تفکیک زباله‌های عفونی در سطل‌های زرد رنگ و رعایت استانداردهای زیست‌محیطی بیمارستان.`,
        durationOrPages: 'چک‌لیست ایمنی',
        author: 'واحد بهداشت محیط بیمارستان',
        role: 'کارشناس بهداشت محیط',
        date: '۱۴۰۳/۱۱/۰۲',
        downloadName: `Disposal_Guide_${item.code}.pdf`,
        keyTopics: [
          'تفکیک فوری در مبدأ تولید پسماند',
          'ممنوعیت قرار دادن در سطل زباله معمولی (خانگی)',
          'رعایت پروتکل انتقال ایمن به محل امحا و اتوکلاو پسماند',
        ],
        tags: ['پسماند عفونی', 'بهداشت محیط', 'امحا'],
      },
      {
        id: `edu-cons-${item.id}-3`,
        title: `برگه مشخصات فنی و ایمنی کالا (MSDS / Technical Data Sheet)`,
        type: 'pdf',
        description: `مشخصات متریال سازنده، تست‌های زیست‌سازگاری (Biocompatibility ISO 10993)، تأییدیه اداره کل تجهیزات پزشکی (IMED) و شرایط انبارداری.`,
        durationOrPages: '۴ صفحه PDF',
        author: `شرکت ${brand || 'سازنده'}`,
        role: 'واحد تضمین کیفیت',
        date: '۱۴۰۲/۰۶/۲۰',
        downloadName: `MSDS_${item.code}.pdf`,
        keyTopics: [
          'استانداردهای گرید پزشکی و عدم ایجاد حساسیت پوستی',
          'رطوبت مجاز نگهداری (زیر ۶۰٪)',
          'تاریخ مصرف بر اساس پایداری ماده اولیه',
        ],
        tags: ['MSDS', 'تأییدیه IMED', 'تضمین کیفیت'],
      },
    ];
  }

  // Medical Device / Complex System Trainings
  const materials: EquipmentTrainingMaterial[] = [
    {
      id: `edu-dev-${item.id}-1`,
      title: `راهنمای جامع کاربری بالینی و اپراتوری ${name} (${brand} ${model})`,
      type: 'pdf',
      description: `دفترچه راهنمای رسمی مصوب فارسی شامل نحوه راه‌اندازی اولیه، اتصال متعلقات، تنظیم پارامترهای حیاتی، مدهای کاری و هشدارهای ایمنی.`,
      durationOrPages: 'فایل PDF (۲۴ صفحه به همراه تصاویر راهنما)',
      author: 'مهندسی پزشکی و شرکت پشتیبان',
      role: 'سرپرست آموزش مهندسی پزشکی',
      date: '۱۴۰۳/۰۹/۱۰',
      downloadName: `User_Manual_${item.code}.pdf`,
      keyTopics: [
        'روشن‌سازی و Self-Test خودکار دستگاه',
        'نحوه کالیبره کردن سنسورها قبل از اتصال به بیمار',
        'تنظیم حدود هشدار (Alarm Limits) بر اساس شرایط بالینی',
        'مراقبت‌های بهداشتی، فیلترگذاری و تمیزکاری سطح دستگاه',
      ],
      tags: ['منوال کاربری', 'اپراتوری', 'تجهیزات پزشکی', brand],
    },
    {
      id: `edu-dev-${item.id}-2`,
      title: `کارگاه ویدیویی آموزش عملی کار با ${name} در بالین بیمار`,
      type: 'video',
      description: `فیلم آموزشی کوتاه و کاربردی ضبط‌شده در بخش مراقبت‌های ویژه شامل راه‌اندازی گام‌به‌گام، کدهای هشدار رایج و تکنیک‌های اتصال سریع.`,
      durationOrPages: 'ویدیو آموزشی (۱۲ دقیقه با کیفیت HD)',
      author: 'سوپروایزر آموزشی بالینی',
      role: 'مدیریت آموزش پرستاری',
      date: '۱۴۰۳/۱۰/۲۲',
      downloadName: `Video_Tutorial_${item.code}.mp4`,
      keyTopics: [
        'مرور کلی پنل کنترل و کلیدهای میانبر',
        'نحوه واکنش سریع هنگام فعال شدن آلارم‌های صوتی و نوری',
        'تست وضعیت باتری پشتیبان در شرایط انتقال بیمار',
      ],
      tags: ['ویدیو بالینی', 'آموزش پرستاری', 'کارگاه عملی'],
    },
    {
      id: `edu-dev-${item.id}-3`,
      title: `راهنمای عیب‌یابی سریع و رفع کدهای خطای متداول (Troubleshooting Matrix)`,
      type: 'troubleshoot',
      description: `جدول جامع کدهای خطای دستگاه به همراه علت احتمالی و اقدامات اصلاحی فوری توسط اپراتور قبل از تماس با واحد مهندسی پزشکی.`,
      durationOrPages: 'ماتریس راهنمای سریع (Quick Sheet)',
      author: 'واحد نگهداری و تعمیرات مهندسی پزشکی',
      role: 'کارشناس ارشد تعمیرات',
      date: '۱۴۰۳/۱۱/۰۵',
      downloadName: `Troubleshooting_${item.code}.pdf`,
      keyTopics: [
        'خطای عدم تشخیص سنسور یا قطع لیدها',
        'خطای افت فشار گاز یا نشتی در مدار تنفسی/انفوزیون',
        'خطای باتری و مشکلات سیستم شارژ',
        'زمانبندی و شرایط ارجاع رسمی به مهندسی پزشکی',
      ],
      tags: ['عیب‌یابی', 'کدهای خطا', 'سرویس', 'ایمنی'],
    },
  ];

  if (requiresCalib) {
    materials.push({
      id: `edu-dev-${item.id}-4`,
      title: `پروتکل کنترل کیفی، آزمون‌های ایمنی الکتریکی و الزامات کالیبراسیون`,
      type: 'sop',
      description: `چک‌لیست استانداردهای آزمون‌های دوره‌ای مطابق سنجه‌های اعتباربخشی وزارت بهداشت، IEC 60601 و الزامات آزمونگرهای مجاز.`,
      durationOrPages: 'سند استاندارد QC',
      author: 'کمیته کالیبراسیون و اعتباربخشی',
      role: 'ممیز کنترل کیفیت',
      date: '۱۴۰۳/۰۸/۱۸',
      downloadName: `Calibration_Protocol_${item.code}.pdf`,
      keyTopics: [
        'فاصله‌های زمانی مجاز آزمون کالیبراسیون (سالانه / ۶ ماهه)',
        'تلرانس خطای مجاز پارامترهای اندازه‌گیری',
        'نحوه نگهداری برچسب و گواهینامه معتبر کالیبراسیون روی بدنه دستگاه',
      ],
      tags: ['کالیبراسیون', 'کنترل کیفی', 'اعتباربخشی', 'IEC 60601'],
    });
  }

  return materials;
}
