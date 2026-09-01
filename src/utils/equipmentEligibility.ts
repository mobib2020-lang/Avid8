import { EquipmentItem, ItemKind } from '../types';

/**
 * Checks whether an item is technically a serviceable device/equipment
 * that can reasonably experience technical malfunction and requires fault reporting,
 * repair, maintenance, daily care, or equipment assignment.
 * 
 * Rules:
 * - Consumables (gloves, masks, gauzes, syringes, sutures, reagents, raw materials, etc.) CANNOT report fault.
 * - Single-use accessories, spare parts, and non-device supplies CANNOT report fault.
 * - Medical devices, laboratory instruments, hospital systems, and electromechanical equipment CAN report fault.
 */
export function isEligibleForFaultReport(
  item:
    | EquipmentItem
    | {
        category?: string;
        subcategory?: string;
        type?: string;
        classificationPath?: string;
        faName?: string;
        enName?: string;
        itemKind?: ItemKind;
      }
    | null
    | undefined
): boolean {
  if (!item) return false;

  // 1. Explicit consumable kind
  if (item.itemKind === 'consumable') {
    return false;
  }

  const combinedText = [
    item.type || '',
    item.subcategory || '',
    item.category || '',
    item.classificationPath || '',
    item.faName || '',
    item.enName || '',
  ]
    .join(' ')
    .toLowerCase();

  // 2. Definitive consumable keywords & patterns
  const consumableKeywords = [
    'مصرفی',
    'مصرفیهای',
    'مصرفی‌های',
    'یکبارمصرف',
    'یکبار مصرف',
    'یک‌بار مصرف',
    'دستکش',
    'ماسک',
    'گاز استریل',
    'گاز غیر استریل',
    'گاز وازلینه',
    'گاز بیهوشی', // Unless system
    'پانسمان',
    'سرنگ',
    'سرسوزن',
    'آنژیوکت',
    'کتتر',
    'کاتتر',
    'سوند',
    'چسب ضد حساسیت',
    'چسب حصیری',
    'چسب لوکوپلاست',
    'نخ بخیه',
    'باند کشی',
    'باند گچی',
    'باند استریل',
    'تیغ بیستوری',
    'تیغ جراحی',
    'معرف',
    'reagent',
    'reagents',
    'کیت آزمایشگاهی',
    'کیت الایزا',
    'کیت رپید',
    'مواد اولیه',
    'ایمپلنت',
    'پروتز دندانی',
    'بیو مواد',
    'ژل سونوگرافی',
    'ژل الکترود',
    'پودر استخوان',
    'غشای جراحی',
    'سمان دندانپزشکی',
    'گوتاپرکا',
    'کن کاغذی',
    'کامپوزیت دندانپزشکی',
    'آمالگام',
    'فرز دندانپزشکی',
    'لوله آزمایش',
    'لوله خونگیری',
    'پلیت کشت',
    'محیط کشت',
    'کاغذ کرپ',
    'فیلم بسته بندی',
    'کاغذ بسته بندی',
    'قطعات یدکی',
    'spare part',
    'قطعه یدکی',
    'لوازم مصرفی',
    'استنت قلبی',
    'فیلتر تنفسی',
    'فیلتر hme',
    'آمپول',
    'ویال',
    'سرم شستشو',
    'پد الکلی',
    'الکترود یکبارمصرف',
    'کاندوم شیت',
    'لانست خونگیری',
    'شیت شریانی',
    'اسکالپ وین',
    'گایدوایر',
    'تروکار یکبارمصرف',
    'استپلر یکبارمصرف',
    'رابط تزریق',
    'کیسه ادرار',
    'کیسه خون',
    'کانولای بینی',
    'لوله تراشه',
    'ماسک اکسیژن',
    'شان جراحی',
    'گان جراحی',
    'کاور کفش',
    'چشم بند فتوتراپی',
    'ست سرم',
    'ست خون',
    'میکروست',
    'محلول ضدعفونی',
  ];

  // Check if it clearly matches consumable keywords
  const isConsumableMatch = consumableKeywords.some((kw) => combinedText.includes(kw));

  // Check if it contains strong device/system indicators
  const deviceIndicators = [
    'دستگاه',
    'دستگاه‌های',
    'دستگاههای',
    'سیستم',
    'سیستمها',
    'سیستم‌های',
    'ماشین',
    'ماشین‌های',
    'یونیت',
    'instrument',
    'instruments',
    'analyzer',
    'ونتیلاتور',
    'ventilator',
    'مانیتور',
    'monitor',
    'الکتروشوک',
    'دفیبریلاتور',
    'defibrillator',
    'پمپ سرنگ',
    'پمپ انفوزیون',
    'کوتر',
    'الکتروسرجری',
    'cautery',
    'اتوکلاو',
    'autoclave',
    'سانتریفیوژ',
    'centrifuge',
    'انکوباتور',
    'وارمر',
    'فتوتراپی',
    'میکروسکوپ',
    'اسپیرومتر',
    'اکوکاردیوگراف',
    'سونوگرافی',
    'رادیولوژی',
    'سی تی اسکن',
    'ام آر آی',
    'اکسیژن ساز',
    'هوای مدیکال',
    'وکیوم مرکزی',
    'ساکشن',
    'چراغ سیالتیک',
    'تخت بیمارستانی',
    'تخت جراحی',
    'تخت بستری',
    'پالس اکسیمتر',
    'نبولایزر',
    'دیالیز',
    'پیزواسکیلر',
    'لایت کیور',
    'توربین دندانپزشکی',
    'آنگل',
    'فسفرپلیت',
    'ژنراتور',
    'یو پی اس',
    'چیلر',
    'سرور',
  ];

  const hasStrongDeviceWord = deviceIndicators.some((di) => combinedText.includes(di));

  // If matches consumable and doesn't have an explicit device identity, it is consumable
  if (isConsumableMatch && !hasStrongDeviceWord) {
    return false;
  }

  // If it is in consumables subcategories or types
  if (
    item.type?.startsWith('مصرفی') ||
    item.type?.includes('مواد اولیه') ||
    item.type?.includes('قطعات یدکی') ||
    item.type?.includes('معرف') ||
    item.type?.includes('Reagents') ||
    item.type?.includes('کاغذ') ||
    item.type?.includes('فیلم')
  ) {
    return false;
  }

  // Otherwise, if it has device characteristics or is marked device
  if (item.itemKind === 'device' || hasStrongDeviceWord) {
    return true;
  }

  // Default to true for medical & hospital categories unless flagged as consumable
  if (
    item.category?.includes('تجهیزات') ||
    item.category?.includes('اموال') ||
    item.category?.includes('دستگاه')
  ) {
    return !isConsumableMatch;
  }

  return false;
}

/**
 * Checks whether an item technically requires Periodic Calibration and Metrology Quality Control.
 * 
 * Rules:
 * - An item must FIRST be a serviceable device (`isEligibleForFaultReport === true`).
 * - Calibration is STRICTLY for measurement/monitoring devices, dosing/energy output systems,
 *   and precision diagnostic equipment (e.g. ventilators, vital signs monitors, defibrillators,
 *   infusion pumps, anesthesia vaporizers, electrosurgical units, CT/X-ray, autoclaves with pressure/temp sensors,
 *   laboratory autoanalyzers, spectrophotometers, centrifuges with timer/RPM calibration, infant incubators).
 * - General devices without measuring/dosing sensors (e.g. manual beds, examination lamps, stretchers,
 *   general suction bottles, PC cases, office UPS) DO NOT require metrological calibration.
 * - Consumables NEVER require calibration.
 */
export function isEligibleForCalibration(
  item:
    | EquipmentItem
    | {
        category?: string;
        subcategory?: string;
        type?: string;
        classificationPath?: string;
        faName?: string;
        enName?: string;
        itemKind?: ItemKind;
      }
    | null
    | undefined
): boolean {
  if (!item) return false;

  // Must first be a technically serviceable device
  if (!isEligibleForFaultReport(item)) {
    return false;
  }

  const combinedText = [
    item.type || '',
    item.subcategory || '',
    item.category || '',
    item.classificationPath || '',
    item.faName || '',
    item.enName || '',
  ]
    .join(' ')
    .toLowerCase();

  const calibrationKeywords = [
    // Respiratory & Anesthesia
    'ونتیلاتور',
    'ventilator',
    'بیهوشی',
    'anesthesia',
    'vaporizer',
    'تبخیرکننده',
    'بای پپ',
    'سی پپ',
    'bipap',
    'cpap',
    'اکسیژن ساز',
    'oxygen concentrator',
    'فلومتر',
    'اسپیرومتر',
    'spirometer',
    'pft',

    // Patient Monitoring & Diagnostics
    'مانیتور علائم حیاتی',
    'مانیتورینگ',
    'vital signs',
    'patient monitor',
    'الکتروکاردیوگراف',
    'ecg',
    'eeg',
    'emg',
    'هولتر',
    'holter',
    'پالس اکسیمتر',
    'pulse oximeter',
    'کاپنوگراف',
    'capnograph',
    'اکوکاردیوگراف',
    'سونوگرافی',
    'ultrasound',
    'داپلر',
    'doppler',
    'فتال مانیتورینگ',
    'fetal monitor',

    // Critical Care & Therapy
    'الکتروشوک',
    'دفیبریلاتور',
    'defibrillator',
    'پمپ سرنگ',
    'syringe pump',
    'پمپ انفوزیون',
    'infusion pump',
    'الکتروسرجری',
    'کوتر',
    'cautery',
    'electrosurgical',
    'وارمر نوزاد',
    'انکوباتور نوزاد',
    'infant incubator',
    'فتوتراپی نوزاد',
    'دیالیز',
    'همودیالیز',
    'dialysis',

    // Radiology & Radiation
    'رادیولوژی',
    'x-ray',
    'xray',
    'سی تی اسکن',
    'ct scan',
    'ام آر آی',
    'mri',
    'ماموگرافی',
    'mammography',
    'سی آرم',
    'c-arm',
    'فلوروسکوپی',
    'رادیوتراپی',
    'شتاب دهنده خطی',
    'پزشکی هستهای',
    'پت اسکن',
    'pet scan',
    'اسپکت',
    'spect',
    'دزیمتر',
    'dosimeter',
    'کالیبراتور دوز',

    // Sterilization with pressure / temperature sensors
    'اتوکلاو',
    'autoclave',
    'استریلایزر پلاسما',
    'واشردیس اینفکتور',
    'فور استریل',

    // Laboratory Quantitative Instruments
    'clinical chemistry instrument',
    'molecular genetic instruments',
    'microbiology instruments culture',
    'hhc instruments',
    'general laboratory instruments',
    'immunology instruments',
    'سیستمها و دستگاههای آزمایشگاهی تحقیقاتی',
    'اتوآنالایزر',
    'autoanalyzer',
    'اسپکتروفتومتر',
    'spectrophotometer',
    'الایزا ریدر',
    'elisa reader',
    'سل کانتر',
    'cell counter',
    'سانتریفیوژ',
    'centrifuge',
    'پی اچ متر',
    'ph meter',
    'پیپت اتوماتیک',
    'ترازو آزمایشگاهی',
    'ترازو پزشکی',
    'انکوباتور آزمایشگاهی',

    // Measuring & Sensor Medical Devices
    'فشارسنج',
    'sphygmomanometer',
    'ترمومتر پزشکی',
    'دماسنج پزشکی',
    'تب سنج',
    'اپکس لوکیتور',
    'رادیوگرافی دندانپزشکی',
    'لایت کیور',
  ];

  return calibrationKeywords.some((kw) => combinedText.includes(kw));
}

/**
 * Returns a comprehensive technical profile for an inventory item.
 */
export function getEquipmentTechnicalProfile(item: EquipmentItem | null | undefined) {
  const canReportFault = isEligibleForFaultReport(item);
  const canRequireCalibration = isEligibleForCalibration(item);
  const isConsumable = item?.itemKind === 'consumable' || !canReportFault;

  return {
    canReportFault,
    canRequireCalibration,
    isServiceableDevice: canReportFault,
    isConsumable,
    categoryRoleText: isConsumable
      ? 'کالای مصرفی / غیرسرمایه‌ای'
      : canRequireCalibration
      ? 'دستگاه تشخیصی و درمانی (نیازمند کالیبراسیون و پایش)'
      : 'تجهیز و سیستم عمومی بیمارستانی',
  };
}
