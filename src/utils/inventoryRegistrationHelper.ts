import { AppUser, EquipmentItem, AssetRequirementField, FieldContribution } from '../types';

export interface RoleFieldDef {
  key: string;
  labelFa: string;
  responsibleRole: string;
  responsibleRoleTitleFa: string;
  required: boolean;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  categorySection: 'purchasing' | 'warehouse' | 'asset' | 'technical';
  categorySectionTitleFa: string;
  placeholder?: string;
  options?: string[];
  helperText?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. STANDARD FIELD ROLES & METADATA TAXONOMY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const STANDARD_INVENTORY_BASE_FIELDS: RoleFieldDef[] = [
  // Purchasing / تدارکات و خرید
  {
    key: 'price',
    labelFa: 'ارزش دفتری / قیمت خرید (ریال)',
    responsibleRole: 'procurement_officer',
    responsibleRoleTitleFa: 'مسئول خرید و تدارکات',
    required: true,
    type: 'number',
    categorySection: 'purchasing',
    categorySectionTitleFa: 'اطلاعات خرید و بازرگانی',
    placeholder: 'مثلاً: ۲۸۰,۰۰۰,۰۰۰',
    helperText: 'قیمت مندرج در فاکتور رسمی خرید یا برآورد قیمت کارشناسی',
  },
  {
    key: 'supplier',
    labelFa: 'شرکت تأمین‌کننده / فروشنده',
    responsibleRole: 'procurement_officer',
    responsibleRoleTitleFa: 'مسئول خرید و تدارکات',
    required: true,
    type: 'text',
    categorySection: 'purchasing',
    categorySectionTitleFa: 'اطلاعات خرید و بازرگانی',
    placeholder: 'مثلاً: شرکت مهندسی پزشکی آریا تدبیر',
    helperText: 'نام پیمانکار یا فروشنده رسمی تجهیز',
  },
  {
    key: 'purchaseDate',
    labelFa: 'تاریخ خرید / صدور فاکتور',
    responsibleRole: 'procurement_officer',
    responsibleRoleTitleFa: 'مسئول خرید و تدارکات',
    required: true,
    type: 'text',
    categorySection: 'purchasing',
    categorySectionTitleFa: 'اطلاعات خرید و بازرگانی',
    placeholder: '۱۴۰۳/۰۵/۲۲',
    helperText: 'تاریخ رسید نهایی یا سند خرید',
  },
  {
    key: 'batchNo',
    labelFa: 'شماره فاکتور / حواله / Batch No',
    responsibleRole: 'procurement_officer',
    responsibleRoleTitleFa: 'مسئول خرید و تدارکات',
    required: false,
    type: 'text',
    categorySection: 'purchasing',
    categorySectionTitleFa: 'اطلاعات خرید و بازرگانی',
    placeholder: 'INV-1403-9082',
    helperText: 'شماره پیگیری فاکتور مالی یا بارنامه',
  },

  // Warehouse / انبار و نگهداری
  {
    key: 'quantity',
    labelFa: 'تعداد موجودی فیزیکی',
    responsibleRole: 'warehouse_keeper',
    responsibleRoleTitleFa: 'انباردار تجهیزات',
    required: true,
    type: 'number',
    categorySection: 'warehouse',
    categorySectionTitleFa: 'اطلاعات انبارداری و تحویل فیزیکی',
    placeholder: '1',
    helperText: 'شمارش دقیق فیزیکی اقلام تحویل‌شده به انبار',
  },
  {
    key: 'unit',
    labelFa: 'واحد سنجش کالا',
    responsibleRole: 'warehouse_keeper',
    responsibleRoleTitleFa: 'انباردار تجهیزات',
    required: true,
    type: 'text',
    categorySection: 'warehouse',
    categorySectionTitleFa: 'اطلاعات انبارداری و تحویل فیزیکی',
    placeholder: 'دستگاه / عدد / بسته',
    helperText: 'واحد شمارش رسمی در کاردکس انبار',
  },
  {
    key: 'department',
    labelFa: 'دپارتمان / انبار مقصد',
    responsibleRole: 'warehouse_keeper',
    responsibleRoleTitleFa: 'انباردار تجهیزات',
    required: true,
    type: 'select',
    categorySection: 'warehouse',
    categorySectionTitleFa: 'اطلاعات انبارداری و تحویل فیزیکی',
    options: [
      'انبار مرکزی تجهیزات',
      'بخش مراقبت‌های ویژه (ICU)',
      'بخش مراقبت‌های قلبی (CCU)',
      'اتاق عمل و جراحی',
      'اورژانس و فوریت‌ها',
      'بخش بستری داخلی و جراحی',
      'تصویربرداری و رادیولوژی',
      'آزمایشگاه و پاتولوژی',
      'واحد دندانپزشکی',
      'تأسیسات و نگهداری عمومی',
    ],
    helperText: 'بخش بیمارستانی یا انبار نگه‌دارنده',
  },
  {
    key: 'location',
    labelFa: 'محل استقرار دقیق فیزیکی',
    responsibleRole: 'warehouse_keeper',
    responsibleRoleTitleFa: 'انباردار تجهیزات',
    required: true,
    type: 'text',
    categorySection: 'warehouse',
    categorySectionTitleFa: 'اطلاعات انبارداری و تحویل فیزیکی',
    placeholder: 'مثلاً: قفسه B-12 انبار یا تخت ۴ اورژانس',
    helperText: 'موقعیت فیزیکی قابل رؤیت کالا',
  },
  {
    key: 'expiryDate',
    labelFa: 'تاریخ انقضا (در صورت مصرفی / دارویی)',
    responsibleRole: 'warehouse_keeper',
    responsibleRoleTitleFa: 'انباردار تجهیزات',
    required: false,
    type: 'text',
    categorySection: 'warehouse',
    categorySectionTitleFa: 'اطلاعات انبارداری و تحویل فیزیکی',
    placeholder: '۱۴۰۶/۰۵/۲۲',
    helperText: 'الزامی برای اقلام مصرفی و استریل',
  },

  // Asset Management & Tagging / امین اموال و پلاک‌کوبی
  {
    key: 'faName',
    labelFa: 'نام فارسی کالا / تجهیز',
    responsibleRole: 'asset_manager',
    responsibleRoleTitleFa: 'امین اموال و پلاک‌کوبی',
    required: true,
    type: 'text',
    categorySection: 'asset',
    categorySectionTitleFa: 'اطلاعات هویتی و پلاک اموال',
    placeholder: 'مثلاً: دستگاه الکتروشوک بای‌فازیک',
    helperText: 'عنوان استاندارد تجهیز طبق کاتالوگ و رده‌بندی',
  },
  {
    key: 'brand',
    labelFa: 'برند / شرکت سازنده',
    responsibleRole: 'asset_manager',
    responsibleRoleTitleFa: 'امین اموال و پلاک‌کوبی',
    required: true,
    type: 'text',
    categorySection: 'asset',
    categorySectionTitleFa: 'اطلاعات هویتی و پلاک اموال',
    placeholder: 'مثلاً: Nihon Kohden یا Mindray',
    helperText: 'کمپانی سازنده اصلی',
  },
  {
    key: 'model',
    labelFa: 'مدل دستگاه',
    responsibleRole: 'asset_manager',
    responsibleRoleTitleFa: 'امین اموال و پلاک‌کوبی',
    required: true,
    type: 'text',
    categorySection: 'asset',
    categorySectionTitleFa: 'اطلاعات هویتی و پلاک اموال',
    placeholder: 'مثلاً: CardioLife TEC-5631',
    helperText: 'کد مدل تجاری مندرج بر روی پلاک کارخانه',
  },
  {
    key: 'code',
    labelFa: 'کد دائم اموال / شماره پلاک',
    responsibleRole: 'asset_manager',
    responsibleRoleTitleFa: 'امین اموال و پلاک‌کوبی',
    required: true,
    type: 'text',
    categorySection: 'asset',
    categorySectionTitleFa: 'اطلاعات هویتی و پلاک اموال',
    placeholder: 'EQ-1403-1045',
    helperText: 'کد یکتای پلاک فلزی ثبت‌شده در دفتر اموال بیمارستان',
  },
  {
    key: 'serialNumber',
    labelFa: 'شماره سریال کارخانه (Serial No)',
    responsibleRole: 'asset_manager',
    responsibleRoleTitleFa: 'امین اموال و پلاک‌کوبی',
    required: true,
    type: 'text',
    categorySection: 'asset',
    categorySectionTitleFa: 'اطلاعات هویتی و پلاک اموال',
    placeholder: 'SN-NK-89210',
    helperText: 'شماره سریال حک‌شده روی بدنه یا شاسی دستگاه',
  },
  {
    key: 'owner',
    labelFa: 'امین اموال / مسئول تحویل‌گیرنده',
    responsibleRole: 'asset_manager',
    responsibleRoleTitleFa: 'امین اموال و پلاک‌کوبی',
    required: false,
    type: 'text',
    categorySection: 'asset',
    categorySectionTitleFa: 'اطلاعات هویتی و پلاک اموال',
    placeholder: 'نام امین اموال یا مسئول تحویل کالا',
    helperText: 'شخص صاحب‌امضا و مسئول حقوقی نگهداری',
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. PERMISSION CHECK FUNCTION (Requirement 1 & 17)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Checks whether the user has permission to perform «ثبت موجودی».
 * Access is controlled by Administrator via Users & Access / Permissions system.
 * By default:
 *  - Only warehouse_keeper, procurement_officer, asset_manager (and hospital_admin) have access.
 *  - biomedical_engineer, operator/nurse, finance_manager and other roles do NOT have access by default.
 *  - Administrator can override permission per individual user.
 */
export const hasInventoryRegistrationPermission = (user?: AppUser | null): boolean => {
  if (!user) return false;

  // Hospital Admin always has access
  if (user.role === 'hospital_admin') return true;

  // 1. Check individual user override explicitly (highest precedence)
  if (user.individualOverrides && user.individualOverrides['register_inventory'] !== undefined) {
    return Boolean(user.individualOverrides['register_inventory']);
  }

  // 2. Check if user's direct permissions array contains 'register_inventory'
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.includes('register_inventory');
  }

  // 3. Fallback for roles that have standard registration responsibility if permissions array is missing
  if (
    user.role === 'warehouse_keeper' ||
    user.role === 'asset_manager' ||
    user.role === 'procurement_officer'
  ) {
    return true;
  }

  return false;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. FIELD VALIDITY & COMPLETION CHECKERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const isFieldValidAndFilled = (key: string, val: any): boolean => {
  if (val === undefined || val === null) return false;
  if (typeof val === 'number') {
    if (isNaN(val)) return false;
    if (key === 'price') return val > 0;
    if (key === 'quantity') return val >= 1;
    return true;
  }
  const str = String(val).trim();
  if (str === '') return false;
  if (str === '-' || str === '--') return false;
  if (key === 'code' && (str.toUpperCase().includes('DRAFT') || str.includes('پیش‌نویس') || str.includes('نامشخص'))) return false;
  if (key === 'serialNumber' && (str.toUpperCase().includes('DRAFT') || str.includes('نامشخص') || str.includes('تعیین‌نشده') || str.includes('پیش‌نویس'))) return false;
  if ((key === 'brand' || key === 'model') && (str.includes('نامشخص') || str.includes('تعیین‌نشده') || str === 'برند' || str === 'مدل')) return false;
  if (key === 'location' && (str.includes('انبار موقت') || str.includes('تحویل نگرفته') || str.includes('تعیین‌نشده') || str.includes('ورودی اولیه'))) return false;
  if (key === 'supplier' && (str.includes('نیازمند استعلام') || str.includes('نامشخص') || str.includes('تعیین‌نشده') || str.includes('ورودی متن خام'))) return false;
  if (key === 'owner' && (str.includes('تعیین‌نشده') || str.includes('نامشخص'))) return false;
  return true;
};

export const canUserEditField = (
  fieldResponsibleRole: string | undefined,
  currentUser?: AppUser | null
): boolean => {
  if (!currentUser) return false;
  if (currentUser.role === 'hospital_admin') return true;
  if (!hasInventoryRegistrationPermission(currentUser)) return false;

  if (!fieldResponsibleRole) return true;

  // Match role codes
  if (currentUser.role === fieldResponsibleRole) return true;

  // Asset manager can edit basic asset and warehouse fields if needed
  if (currentUser.role === 'asset_manager' && (fieldResponsibleRole === 'warehouse_keeper' || fieldResponsibleRole === 'asset_manager')) {
    return true;
  }

  return false;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. COMPLETION STATUS & MULTI-USER PROGRESS SUMMARY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface FieldStatusReport {
  key: string;
  nameFa: string;
  isFilled: boolean;
  value: any;
  required: boolean;
  responsibleRole: string;
  responsibleRoleTitleFa: string;
  categorySection: 'purchasing' | 'warehouse' | 'asset' | 'technical';
  categorySectionTitleFa: string;
  isMyRoleResponsible: boolean;
  canEdit: boolean;
}

export interface SectionCompletionReport {
  sectionKey: 'purchasing' | 'warehouse' | 'asset' | 'technical';
  sectionTitleFa: string;
  responsibleRole: string;
  responsibleRoleTitleFa: string;
  totalRequired: number;
  completedRequired: number;
  isComplete: boolean;
  completedFields: string[];
  missingFields: string[];
}

export interface RoleCompletionGroup {
  roleCode: string;
  roleTitleFa: string;
  categoryTitleFa: string;
  categorySection: 'purchasing' | 'warehouse' | 'asset' | 'technical';
  totalRequired: number;
  completedRequired: number;
  isComplete: boolean;
  percentage: number;
  missingFieldNames: string[];
  completedFieldNames: string[];
  fields: FieldStatusReport[];
}

export interface InventoryCompletionAnalysis {
  item: EquipmentItem;
  totalRequiredCount: number;
  totalCompletedCount: number;
  overallPercentage: number;
  isFullyComplete: boolean;
  registrationProgressStatus: 'draft' | 'in_progress' | 'ready_to_finalize' | 'finalized';

  // Section-by-Section Structural Breakdown
  sections: SectionCompletionReport[];

  // Current User's Specific Metrics
  myRoleCode: string;
  myRoleTitleFa: string;
  myRoleTotalRequired: number;
  myRoleCompletedRequired: number;
  isMyRoleComplete: boolean;
  myRolePercentage: number;
  myRoleMissingFieldNames: string[];

  // Role-by-Role Breakdown
  roleGroups: RoleCompletionGroup[];

  // All Missing Required Fields
  allMissingFields: {
    key: string;
    labelFa: string;
    responsibleRole: string;
    responsibleRoleTitleFa: string;
    sectionTitleFa: string;
  }[];

  // All Completed Required Fields
  allCompletedFields: {
    key: string;
    labelFa: string;
    responsibleRole: string;
    responsibleRoleTitleFa: string;
    sectionTitleFa: string;
  }[];
}

/**
 * Calculates deep completion status for an inventory item,
 * distinguishing between "My fields complete" and "Whole inventory complete".
 */
export const calculateInventoryCompletionAnalysis = (
  item: Partial<EquipmentItem>,
  currentUser?: AppUser | null,
  customTaxonomyFields: AssetRequirementField[] = []
): InventoryCompletionAnalysis => {
  const allFields: FieldStatusReport[] = [];

  // 1. Process Base Fields
  STANDARD_INVENTORY_BASE_FIELDS.forEach((f) => {
    const rawVal = (item as any)[f.key];
    const isFilled = isFieldValidAndFilled(f.key, rawVal);

    const isMyRole = currentUser
      ? currentUser.role === 'hospital_admin' || currentUser.role === f.responsibleRole
      : false;

    allFields.push({
      key: f.key,
      nameFa: f.labelFa,
      isFilled,
      value: rawVal,
      required: f.required,
      responsibleRole: f.responsibleRole,
      responsibleRoleTitleFa: f.responsibleRoleTitleFa,
      categorySection: f.categorySection,
      categorySectionTitleFa: f.categorySectionTitleFa,
      isMyRoleResponsible: isMyRole,
      canEdit: canUserEditField(f.responsibleRole, currentUser),
    });
  });

  // 2. Process Custom Inherited Taxonomy Fields
  if (customTaxonomyFields && customTaxonomyFields.length > 0) {
    customTaxonomyFields.forEach((cf) => {
      const specVal = item.specs?.[cf.name];
      const isFilled = isFieldValidAndFilled(cf.name, specVal);
      const responsible = cf.assignedRole || 'biomedical_engineer';
      const responsibleFa = cf.assignedRoleTitleFa || 'مهندس پزشکی و فنی';

      const isMyRole = currentUser
        ? currentUser.role === 'hospital_admin' || currentUser.role === responsible
        : false;

      allFields.push({
        key: `spec_${cf.id || cf.name}`,
        nameFa: cf.name,
        isFilled,
        value: specVal,
        required: cf.required,
        responsibleRole: responsible,
        responsibleRoleTitleFa: responsibleFa,
        categorySection: 'technical',
        categorySectionTitleFa: 'مشخصات فنی و استانداردهای تخصصی',
        isMyRoleResponsible: isMyRole,
        canEdit: canUserEditField(responsible, currentUser),
      });
    });
  }

  // Aggregate Metrics
  const requiredFields = allFields.filter((f) => f.required);
  const totalRequiredCount = requiredFields.length;
  const completedRequiredCount = requiredFields.filter((f) => f.isFilled).length;
  const overallPercentage = totalRequiredCount > 0
    ? Math.round((completedRequiredCount / totalRequiredCount) * 100)
    : 100;
  const isFullyComplete = completedRequiredCount >= totalRequiredCount && totalRequiredCount > 0;

  // Group by Role
  const roleMap = new Map<string, RoleCompletionGroup>();
  allFields.forEach((field) => {
    if (!roleMap.has(field.responsibleRole)) {
      roleMap.set(field.responsibleRole, {
        roleCode: field.responsibleRole,
        roleTitleFa: field.responsibleRoleTitleFa,
        categoryTitleFa: field.categorySectionTitleFa,
        categorySection: field.categorySection,
        totalRequired: 0,
        completedRequired: 0,
        isComplete: true,
        percentage: 100,
        missingFieldNames: [],
        completedFieldNames: [],
        fields: [],
      });
    }

    const group = roleMap.get(field.responsibleRole)!;
    group.fields.push(field);
    if (field.required) {
      group.totalRequired += 1;
      if (field.isFilled) {
        group.completedRequired += 1;
        group.completedFieldNames.push(field.nameFa);
      } else {
        group.missingFieldNames.push(field.nameFa);
      }
    }
  });

  const roleGroups: RoleCompletionGroup[] = Array.from(roleMap.values()).map((g) => {
    const isComplete = g.missingFieldNames.length === 0;
    const percentage = g.totalRequired > 0
      ? Math.round((g.completedRequired / g.totalRequired) * 100)
      : 100;
    return {
      ...g,
      isComplete,
      percentage,
    };
  });

  // Section-by-Section Structural Overview
  const sectionDefs: { key: 'purchasing' | 'warehouse' | 'asset' | 'technical'; titleFa: string; role: string; roleTitleFa: string }[] = [
    { key: 'asset', titleFa: 'اطلاعات هویتی و پلاک اموال', role: 'asset_manager', roleTitleFa: 'امین اموال' },
    { key: 'purchasing', titleFa: 'اطلاعات خرید و بازرگانی', role: 'procurement_officer', roleTitleFa: 'مسئول خرید' },
    { key: 'warehouse', titleFa: 'اطلاعات انبارداری و تحویل', role: 'warehouse_keeper', roleTitleFa: 'انباردار' },
    { key: 'technical', titleFa: 'مشخصات فنی و استانداردهای تخصصی', role: 'biomedical_engineer', roleTitleFa: 'مهندس پزشکی' },
  ];

  const sections: SectionCompletionReport[] = sectionDefs.map((sDef) => {
    const sectionFields = allFields.filter((f) => f.categorySection === sDef.key && f.required);
    const completedFields = sectionFields.filter((f) => f.isFilled).map((f) => f.nameFa);
    const missingFields = sectionFields.filter((f) => !f.isFilled).map((f) => f.nameFa);
    const isComplete = missingFields.length === 0;

    return {
      sectionKey: sDef.key,
      sectionTitleFa: sDef.titleFa,
      responsibleRole: sDef.role,
      responsibleRoleTitleFa: sDef.roleTitleFa,
      totalRequired: sectionFields.length,
      completedRequired: completedFields.length,
      isComplete,
      completedFields,
      missingFields,
    };
  });

  // Current User Role Analysis
  const currentRoleCode = currentUser?.role || 'biomedical_engineer';
  const currentRoleTitle = currentUser?.roleFa || 'کاربر سیستم';
  const myGroup = roleGroups.find((g) => g.roleCode === currentRoleCode);

  let myRoleTotalRequired = myGroup ? myGroup.totalRequired : 0;
  let myRoleCompletedRequired = myGroup ? myGroup.completedRequired : 0;
  let isMyRoleComplete = myGroup ? myGroup.isComplete : true;
  let myRolePercentage = myGroup ? myGroup.percentage : 100;
  let myRoleMissingFieldNames = myGroup ? myGroup.missingFieldNames : [];

  if (currentUser?.role === 'hospital_admin') {
    myRoleTotalRequired = totalRequiredCount;
    myRoleCompletedRequired = completedRequiredCount;
    isMyRoleComplete = isFullyComplete;
    myRolePercentage = overallPercentage;
    myRoleMissingFieldNames = requiredFields.filter((f) => !f.isFilled).map((f) => f.nameFa);
  }

  // All Missing Fields across entire system
  const allMissingFields = requiredFields
    .filter((f) => !f.isFilled)
    .map((f) => ({
      key: f.key,
      labelFa: f.nameFa,
      responsibleRole: f.responsibleRole,
      responsibleRoleTitleFa: f.responsibleRoleTitleFa,
      sectionTitleFa: f.categorySectionTitleFa,
    }));

  const allCompletedFields = requiredFields
    .filter((f) => f.isFilled)
    .map((f) => ({
      key: f.key,
      labelFa: f.nameFa,
      responsibleRole: f.responsibleRole,
      responsibleRoleTitleFa: f.responsibleRoleTitleFa,
      sectionTitleFa: f.categorySectionTitleFa,
    }));

  // Determine Lifecycle Registration Progress Status
  let registrationProgressStatus: 'draft' | 'in_progress' | 'ready_to_finalize' | 'finalized' = 'draft';
  if (!item.isDraft && item.status !== 'draft') {
    registrationProgressStatus = 'finalized';
  } else if (isFullyComplete) {
    registrationProgressStatus = 'ready_to_finalize';
  } else if (completedRequiredCount > 0) {
    registrationProgressStatus = 'in_progress';
  } else {
    registrationProgressStatus = 'draft';
  }

  return {
    item: item as EquipmentItem,
    totalRequiredCount,
    totalCompletedCount: completedRequiredCount,
    overallPercentage,
    isFullyComplete,
    registrationProgressStatus,
    sections,

    myRoleCode: currentRoleCode,
    myRoleTitleFa: currentRoleTitle,
    myRoleTotalRequired,
    myRoleCompletedRequired,
    isMyRoleComplete,
    myRolePercentage,
    myRoleMissingFieldNames,

    roleGroups,
    allMissingFields,
    allCompletedFields,
  };
};

/**
 * Strict Atomic Finalization Validator.
 * Performs rigorous evaluation of completeness and user permission.
 */
export const validateInventoryForFinalization = (
  item: Partial<EquipmentItem>,
  currentUser?: AppUser | null,
  customTaxonomyFields: AssetRequirementField[] = []
): {
  canFinalize: boolean;
  errorMessage?: string;
  analysis: InventoryCompletionAnalysis;
} => {
  const analysis = calculateInventoryCompletionAnalysis(item, currentUser, customTaxonomyFields);

  // 1. Check user permission
  if (!hasInventoryRegistrationPermission(currentUser)) {
    return {
      canFinalize: false,
      errorMessage: 'شما مجوز ثبت نهایی موجودی را ندارید. این دسترسی باید توسط مدیر ارشد بیمارستان در بخش مدیریت دسترسی‌ها فعال گردد.',
      analysis,
    };
  }

  // 2. Check full completeness across all required fields
  if (!analysis.isFullyComplete || analysis.allMissingFields.length > 0) {
    return {
      canFinalize: false,
      errorMessage: 'این موجودی هنوز تکمیل نشده است. ثبت نهایی و صدور پلاک QR Code تنها پس از تکمیل ۱۰۰٪ تمامی فیلدهای الزامی توسط همه نقش‌های مسئول امکان‌پذیر است.',
      analysis,
    };
  }

  return {
    canFinalize: true,
    analysis,
  };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. CONTRIBUTION LOGGING HELPER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const recordFieldContribution = (
  existingContributions: FieldContribution[] = [],
  fieldName: string,
  fieldLabel: string,
  value: any,
  responsibleRole: string,
  responsibleRoleTitleFa: string,
  currentUser: AppUser
): FieldContribution[] => {
  const newEntry: FieldContribution = {
    id: `fc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    fieldName,
    fieldLabel,
    value,
    responsibleRole,
    responsibleRoleTitleFa,
    completedByUserId: currentUser.id,
    completedByUserName: currentUser.name,
    completedByUserRoleFa: currentUser.roleFa,
    completedAt: new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date()),
  };

  return [newEntry, ...existingContributions.filter((c) => c.fieldName !== fieldName)];
};
