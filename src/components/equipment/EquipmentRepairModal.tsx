import React, { useState, useRef } from 'react';
import {
  X,
  Wrench,
  Printer,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Plus,
  Trash2,
  QrCode,
  Building,
  Check,
  Paperclip,
  Activity,
  ArrowRight,
} from 'lucide-react';
import {
  EquipmentItem,
  FailureReport,
  EquipmentRepairRecord,
  RepairPartItem,
  FinalEquipmentStatus,
  AppUser,
} from '../../types';

interface EquipmentRepairModalProps {
  equipment: EquipmentItem;
  faultReport?: FailureReport | null;
  existingRepairRecord?: EquipmentRepairRecord | null;
  currentUser?: AppUser;
  onSaveRepairRecord: (
    equipmentId: string,
    repairRecord: EquipmentRepairRecord,
    updatedEquipmentStatus?: FinalEquipmentStatus
  ) => void;
  onClose: () => void;
}

export const EquipmentRepairModal: React.FC<EquipmentRepairModalProps> = ({
  equipment,
  faultReport,
  existingRepairRecord,
  currentUser,
  onSaveRepairRecord,
  onClose,
}) => {
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'digital' | 'print' | 'upload'>('digital');

  // Technical Diagnosis
  const [probableCause, setProbableCause] = useState<string>(
    existingRepairRecord?.probableCause ||
      'سوختگی فیوز ورودی مدار تغذیه و استهلاک سنسور اکسیژن ناشی از نوسان برق'
  );
  const [finalDiagnosis, setFinalDiagnosis] = useState<string>(
    existingRepairRecord?.finalDiagnosis ||
      'خرابی قطعه منبع تغذیه (Power Board) و افت خروجی سلول گالوانیک O2'
  );
  const [severity, setSeverity] = useState<'minor' | 'moderate' | 'critical' | 'overhaul'>(
    existingRepairRecord?.severity || 'moderate'
  );
  const [deliveryCondition, setDeliveryCondition] = useState<string>(
    existingRepairRecord?.deliveryCondition || 'تجهیز همراه با کابل برق و سنسور به کارگاه مهندسی تحویل شد'
  );

  // Actions Performed
  const [actionsDescription, setActionsDescription] = useState<string>(
    existingRepairRecord?.actionsDescription ||
      'تعمیر برد تغذیه، تعویض خازن‌های فیلتر، تعویض سلول اکسیژن، شست‌وشوی مجاری پنوماتیک و کالیبراسیون آزمون خروجی'
  );
  const [repairedComponents, setRepairedComponents] = useState<string>(
    existingRepairRecord?.repairedComponents || 'برد اصلی پاور، اتصالات کانکتور ورودی'
  );
  const [replacedComponents, setReplacedComponents] = useState<string>(
    existingRepairRecord?.replacedComponents || 'سلول سنسور O2 (مدل Max-250)، خازن ۴۷۰ میکروفاراد ۴۰۰ ولت'
  );
  const [calibrationsAndAdjustments, setCalibrationsAndAdjustments] = useState<string>(
    existingRepairRecord?.calibrationsAndAdjustments ||
      'تنظیم صفر و اسپن سنسور اکسیژن در غلظت‌های ۲۱٪ و ۱۰۰٪، کالیبراسیون سنسور فلو'
  );
  const [testsPerformed, setTestsPerformed] = useState<string>(
    existingRepairRecord?.testsPerformed ||
      'تست پیوستگی ارت، اندازه‌گیری جریان نشتی بدنه، تست عملکرد مداوم ۴ ساعته تحت ریه مصنوعی'
  );
  const [toolsUsed, setToolsUsed] = useState<string>(
    existingRepairRecord?.toolsUsed || 'آنالایزر ونتیلاتور Fluke VT650، تستر ایمنی الکتریکی Rigel 288+'
  );

  // Parts List
  const [partsList, setPartsList] = useState<RepairPartItem[]>(
    existingRepairRecord?.partsList || [
      {
        id: 'p1',
        partName: 'سلول اکسیژن اورجینال (O2 Sensor Cell)',
        partNumber: 'OX-MAX-250',
        condition: 'مستهلک',
        action: 'تعویض شد',
        quantity: 1,
        cost: 14500000,
        notes: 'تامین از انبار قطعات بیومد',
      },
      {
        id: 'p2',
        partName: 'خازن و فیوز محافظ برد سوئیچینگ',
        partNumber: 'CAP-470UF-400V',
        condition: 'معیوب',
        action: 'تعویض شد',
        quantity: 2,
        cost: 850000,
        notes: 'تعویض با نمونه ژاپنی صنعتی',
      },
    ]
  );

  // Parts table new entry inputs
  const [newPartName, setNewPartName] = useState('');
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newPartAction, setNewPartAction] = useState<'تعویض شد' | 'تعمیر شد' | 'تنظیم و سرویس شد' | 'کالیبره شد'>('تعویض شد');
  const [newPartNotes, setNewPartNotes] = useState('');

  const addPartItem = () => {
    if (!newPartName.trim()) return;
    setPartsList((prev) => [
      ...prev,
      {
        id: `part-${Date.now()}`,
        partName: newPartName.trim(),
        partNumber: newPartNumber.trim() || undefined,
        condition: 'معیوب',
        action: newPartAction,
        quantity: 1,
        notes: newPartNotes.trim() || undefined,
      },
    ]);
    setNewPartName('');
    setNewPartNumber('');
    setNewPartNotes('');
  };

  const removePartItem = (id: string) => {
    setPartsList((prev) => prev.filter((p) => p.id !== id));
  };

  // Engineer & Dates
  const [engineerName, setEngineerName] = useState<string>(
    existingRepairRecord?.engineerName || currentUser?.name || 'مهندس امین رضایی'
  );
  const [startDate, setStartDate] = useState<string>(
    existingRepairRecord?.startDate || '۱۴۰۳/۰۵/۲۲'
  );
  const [endDate, setEndDate] = useState<string>(
    existingRepairRecord?.endDate || '۱۴۰۳/۰۵/۲۲'
  );
  const [returnToServiceDate, setReturnToServiceDate] = useState<string>(
    existingRepairRecord?.returnToServiceDate || '۱۴۰۳/۰۵/۲۲'
  );

  // Final Results
  const [finalStatus, setFinalStatus] = useState<FinalEquipmentStatus>(
    existingRepairRecord?.finalStatus || 'ready_for_service'
  );
  const [finalTestResult, setFinalTestResult] = useState<'pass' | 'conditional_pass' | 'failed' | 'pending'>(
    existingRepairRecord?.finalTestResult || 'pass'
  );
  const [functionalTestNotes, setFunctionalTestNotes] = useState<string>(
    existingRepairRecord?.functionalTestNotes ||
      'کلیه مدهای کاری تنفسی با موفقیت آزمایش شد و پارامترها با خطای کمتر از ۱٪ ثبت گردید.'
  );
  const [electricalSafetyTestNotes, setElectricalSafetyTestNotes] = useState<string>(
    existingRepairRecord?.electricalSafetyTestNotes ||
      'تست جریان نشتی زمین و محفظه طبق استاندارد IEC 60601-1 پاس شد.'
  );
  const [engineerRemarks, setEngineerRemarks] = useState<string>(
    existingRepairRecord?.engineerRemarks ||
      'دستگاه کاملاً آماده بهره‌برداری بالینی است. چک‌لیست پایش روزانه به سرپرست بخش تحویل داده شد.'
  );

  // Scanned Upload File State
  const [uploadedFileName, setUploadedFileName] = useState<string>(
    existingRepairRecord?.uploadedDocumentName || ''
  );
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>(
    existingRepairRecord?.uploadedDocumentUrl || ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Print Form ref
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setUploadedFileUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const repairRecordNo = existingRepairRecord?.repairNo || `SRV-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRecord: EquipmentRepairRecord = {
      id: existingRepairRecord?.id || `rep-${Date.now()}`,
      repairNo: repairRecordNo,
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.faName,
      brand: equipment.brand,
      model: equipment.model,
      serialNumber: equipment.serialNumber,
      location: equipment.location,
      assignedOperator: equipment.assignedOperator || faultReport?.reporterName,
      department: equipment.department,

      faultReportId: faultReport?.id,
      faultReportNo: faultReport?.reportNo,
      faultReportDate: faultReport?.reportDate,
      faultType: faultReport?.faultType,
      faultDescription: faultReport?.defectDescription,
      faultObservedConditions: faultReport?.observedConditions,
      faultInitialActions: faultReport?.initialActionsTaken,
      faultReporterName: faultReport?.reporterName,

      probableCause,
      finalDiagnosis,
      severity,
      deliveryCondition,

      actionsDescription,
      repairedComponents,
      replacedComponents,
      calibrationsAndAdjustments,
      testsPerformed,
      toolsUsed,
      partsList,

      engineerId: currentUser?.id || 'usr-4',
      engineerName,
      startDate,
      endDate,
      returnToServiceDate: finalStatus === 'ready_for_service' ? returnToServiceDate : undefined,

      finalStatus,
      finalTestResult,
      functionalTestNotes,
      electricalSafetyTestNotes,
      engineerRemarks,

      completionType: uploadedFileName ? (activeWorkflowTab === 'upload' ? 'scanned_upload' : 'both') : 'digital',
      printedFormGeneratedAt: '۱۴۰۳/۰۵/۲۲',
      uploadedDocumentName: uploadedFileName || undefined,
      uploadedDocumentUrl: uploadedFileUrl || undefined,
      uploadedAt: uploadedFileName ? '۱۴۰۳/۰۵/۲۲ - ۱۱:۳۰' : undefined,
    };

    onSaveRepairRecord(equipment.id, newRecord, finalStatus);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[80] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden dir-rtl my-8 text-right font-sans flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">
                  فرم تعمیرات و سرویس فنی مهندسی پزشکی
                </h2>
                <span className="text-[10px] font-mono font-bold bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded border border-blue-400/30">
                  {existingRepairRecord?.repairNo || 'شناسه پرونده تعمیر جدید'}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                {equipment.faName} ({equipment.code}) • برند: {equipment.brand} • مدل: {equipment.model}
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

        {/* Workflow Switcher Tabs */}
        <div className="bg-slate-50 border-b border-slate-200/90 px-6 py-2 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveWorkflowTab('digital')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeWorkflowTab === 'digital'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>تکمیل دیجیتال در سامانه</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveWorkflowTab('print')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeWorkflowTab === 'print'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>چاپ فرم رسمی بیمارستان</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveWorkflowTab('upload')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeWorkflowTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>بارگذاری اسکن فرم امضاشده</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-bold hidden sm:block">
            گردش کار جامع: تجهیز → گزارش نقص → عیب‌یابی و سرویس → آزمون نهایی → بازگشت به خدمت
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* TAB 1: DIGITAL COMPLETION FORM */}
          {activeWorkflowTab === 'digital' && (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Originating Fault Summary if linked */}
              {faultReport && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5 text-amber-800">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ارجاع‌شده از گزارش خرابی #{faultReport.reportNo} (ثبت توسط {faultReport.reporterName})
                    </span>
                    <span className="text-[11px] font-mono text-amber-700">تاریخ اعلام: {faultReport.reportDate}</span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    <strong>شرح نقص اعلامی اپراتور:</strong> {faultReport.defectDescription}
                  </p>
                  {faultReport.initialActionsTaken && (
                    <p className="text-slate-500 text-[10px]">
                      اقدام اولیه اپراتور: {faultReport.initialActionsTaken}
                    </p>
                  )}
                </div>
              )}

              {/* 1. TECHNICAL DIAGNOSIS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#2b64f6] flex items-center justify-center text-xs font-bold">
                    ۱
                  </span>
                  <h3 className="text-sm font-black text-slate-900">تشخیص فنی و علل خرابی</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      علت احتمالی خرابی <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={probableCause}
                      onChange={(e) => setProbableCause(e.target.value)}
                      placeholder="مانند نوسان ولتاژ، استهلاک باتری، پارگی واشر، نفوذ مایعات..."
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      تشخیص نهایی کارشناس بیومدیکال <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={finalDiagnosis}
                      onChange={(e) => setFinalDiagnosis(e.target.value)}
                      placeholder="تشخیص قطعی پس از باز کردن و تست آزمایشگاهی"
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      شدت نقص فنی
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="minor">خفیف (تنظیم جزئی یا تعویض اتصالات بیرونی)</option>
                      <option value="moderate">متوسط (تعمیر برد، تعویض سنسور یا قطعه استاندارد)</option>
                      <option value="critical">بحرانی (خرابی هسته سیستم / نیازمند ابزار تخصصی)</option>
                      <option value="overhaul">اساسی / اورهال کامل دستگاه</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      وضعیت فیزیکی دستگاه هنگام تحویل
                    </label>
                    <input
                      type="text"
                      value={deliveryCondition}
                      onChange={(e) => setDeliveryCondition(e.target.value)}
                      placeholder="شامل کابل‌ها، پروب‌ها، جعبه و متعلقات..."
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. ACTIONS PERFORMED */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#2b64f6] flex items-center justify-center text-xs font-bold">
                    ۲
                  </span>
                  <h3 className="text-sm font-black text-slate-900">اقدامات انجام‌شده و مداخلات فنی</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      شرح کامل اقدامات انجام‌شده <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={actionsDescription}
                      onChange={(e) => setActionsDescription(e.target.value)}
                      placeholder="اقدامات عیب‌یابی، لحیم‌کاری، شست‌وشوی پنوماتیک، تست مدارها و..."
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        قطعات تعمیرشده
                      </label>
                      <input
                        type="text"
                        value={repairedComponents}
                        onChange={(e) => setRepairedComponents(e.target.value)}
                        placeholder="قطعاتی که بازسازی یا سرویس شدند"
                        className="w-full p-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        قطعات تعویض‌شده
                      </label>
                      <input
                        type="text"
                        value={replacedComponents}
                        onChange={(e) => setReplacedComponents(e.target.value)}
                        placeholder="قطعات جدید نصب شده"
                        className="w-full p-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        تنظیمات و کالیبراسیون‌های انجام‌شده
                      </label>
                      <input
                        type="text"
                        value={calibrationsAndAdjustments}
                        onChange={(e) => setCalibrationsAndAdjustments(e.target.value)}
                        placeholder="تنظیم زیرو، اسپن، گین، فلو یا ولتاژها"
                        className="w-full p-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        تجهیزات مرجع و ابزار مورد استفاده
                      </label>
                      <input
                        type="text"
                        value={toolsUsed}
                        onChange={(e) => setToolsUsed(e.target.value)}
                        placeholder="تستر ایمنی، شبیه‌ساز بیمار، فشارسنج دیجیتال..."
                        className="w-full p-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. PARTS MANAGEMENT TABLE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#2b64f6] flex items-center justify-center text-xs font-bold">
                      ۳
                    </span>
                    <h3 className="text-sm font-black text-slate-900">جدول قطعات، لوازم جانبی و مصرفی‌های سرویس</h3>
                  </div>
                  <span className="text-[11px] text-slate-500">{partsList.length} ردیف قطعه</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">نام قطعه / شرح</th>
                        <th className="p-2.5">پارت نامبر / کد</th>
                        <th className="p-2.5">اقدام انجام‌شده</th>
                        <th className="p-2.5">توضیحات</th>
                        <th className="p-2.5 text-center w-12">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {partsList.map((part) => (
                        <tr key={part.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{part.partName}</td>
                          <td className="p-2.5 font-mono text-slate-500">{part.partNumber || '-'}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">
                              {part.action}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-500">{part.notes || '-'}</td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => removePartItem(part.id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Add Part Row Inline Form */}
                  <div className="bg-slate-50 p-2.5 border-t border-slate-200 flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="نام قطعه یا ماژول..."
                      value={newPartName}
                      onChange={(e) => setNewPartName(e.target.value)}
                      className="text-xs p-2 rounded-lg border border-slate-200 bg-white grow"
                    />
                    <input
                      type="text"
                      placeholder="پارت‌نامبر..."
                      value={newPartNumber}
                      onChange={(e) => setNewPartNumber(e.target.value)}
                      className="text-xs p-2 rounded-lg border border-slate-200 bg-white w-32"
                    />
                    <select
                      value={newPartAction}
                      onChange={(e) => setNewPartAction(e.target.value as any)}
                      className="text-xs p-2 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="تعویض شد">تعویض شد</option>
                      <option value="تعمیر شد">تعمیر شد</option>
                      <option value="تنظیم و سرویس شد">تنظیم و سرویس شد</option>
                      <option value="کالیبره شد">کالیبره شد</option>
                    </select>
                    <input
                      type="text"
                      placeholder="ملاحظات قطعه..."
                      value={newPartNotes}
                      onChange={(e) => setNewPartNotes(e.target.value)}
                      className="text-xs p-2 rounded-lg border border-slate-200 bg-white grow"
                    />
                    <button
                      type="button"
                      onClick={addPartItem}
                      className="px-3 py-2 text-xs font-bold bg-[#2b64f6] text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>افزودن</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. FINAL TEST & STATUS DECISION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#2b64f6] flex items-center justify-center text-xs font-bold">
                    ۴
                  </span>
                  <h3 className="text-sm font-black text-slate-900">نتیجه آزمون‌ها، ایمنی و وضعیت نهایی دستگاه</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      وضعیت نهایی دستگاه (خروجی سرویس فنی) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={finalStatus}
                      onChange={(e) => setFinalStatus(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-xl border border-blue-400 bg-blue-50/50 font-bold text-blue-950 focus:outline-hidden focus:border-blue-600"
                    >
                      <option value="ready_for_service">آماده به کار و بازگشت به بخش (Serviceable)</option>
                      <option value="ready_with_limitation">آماده به کار با محدودیت کاربری (Conditional)</option>
                      <option value="needs_further_repair">نیازمند تعمیر بیشتر در کارگاه</option>
                      <option value="needs_parts_procurement">نیازمند تأمین قطعه یدکی از بازار / شرکت</option>
                      <option value="out_of_service">خارج از سرویس موقت</option>
                      <option value="decommissioned">غیرقابل استفاده / اسقاط قطعی</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      نتیجه تست نهایی عملکرد
                    </label>
                    <select
                      value={finalTestResult}
                      onChange={(e) => setFinalTestResult(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-bold focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="pass">پاس کامل کلیه تست‌های بالینی و ایمنی (Pass)</option>
                      <option value="conditional_pass">پاس مشروط با پایش مداوم</option>
                      <option value="failed">مردود در تست عملکردی</option>
                      <option value="pending">در انتظار تست نهایی با بیمار فرضی</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      تست عملکرد و نتایج آن
                    </label>
                    <input
                      type="text"
                      value={functionalTestNotes}
                      onChange={(e) => setFunctionalTestNotes(e.target.value)}
                      placeholder="پارامترهای عملکردی تست‌شده..."
                      className="w-full p-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      تست ایمنی الکتریکی و مکانیکی
                    </label>
                    <input
                      type="text"
                      value={electricalSafetyTestNotes}
                      onChange={(e) => setElectricalSafetyTestNotes(e.target.value)}
                      placeholder="نتایج آزمون ارت، نشتی و بدنه..."
                      className="w-full p-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Engineer and Return Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      نام مهندس مسئول تعمیر
                    </label>
                    <input
                      type="text"
                      value={engineerName}
                      onChange={(e) => setEngineerName(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      تاریخ پایان تعمیر
                    </label>
                    <input
                      type="text"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      تاریخ بازگشت رسمی به سرویس
                    </label>
                    <input
                      type="text"
                      value={returnToServiceDate}
                      onChange={(e) => setReturnToServiceDate(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    توضیحات و توصیه‌های تکمیلی به اپراتور بخش
                  </label>
                  <textarea
                    rows={2}
                    value={engineerRemarks}
                    onChange={(e) => setEngineerRemarks(e.target.value)}
                    placeholder="نکات نگهداری، پروتکل روشن/خاموش کردن، پرهیز از کشیدگی کابل و..."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveWorkflowTab('print')}
                    className="px-4 py-2 text-xs font-bold rounded-xl border border-blue-200 text-[#2b64f6] bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>پیش‌نمایش چاپ</span>
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-black rounded-xl bg-[#2b64f6] hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ثبت سابقه تعمیر و بازگشت به چرخه خدمت</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: PRINTABLE OFFICIAL HOSPITAL FORM */}
          {activeWorkflowTab === 'print' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-50 p-3.5 rounded-2xl border border-blue-200 text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-[#2b64f6]" />
                  <span>
                    این فرم رسمی قابل چاپ است و شامل بارکد ردیابی و محل امضای مهندس بیومدیکال و تحویل‌گیرنده بخش می‌باشد.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-1.5 bg-[#2b64f6] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>ارسال به چاپگر (Print)</span>
                </button>
              </div>

              {/* Official Printable Sheet Container */}
              <div
                ref={printRef}
                className="bg-white border-2 border-slate-800 p-8 rounded-xl shadow-lg space-y-6 text-black text-right dir-rtl font-sans print:m-0 print:border-none print:shadow-none"
              >
                {/* Hospital Header Banner */}
                <div className="border-b-2 border-slate-800 pb-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <h1 className="text-base font-black text-slate-900">
                      بیمارستان تخصصی و فوق‌تخصصی آوید مدیکال
                    </h1>
                    <p className="text-xs text-slate-600">
                      معاونت درمان • اداره مهندسی پزشکی و مدیریت تجهیزات و اموال
                    </p>
                    <h2 className="text-sm font-black text-blue-900 mt-2 bg-slate-100 px-3 py-1 rounded inline-block">
                      برگه رسمی تعمیرات، سرویس فنی و آزمون کنترل کیفی تجهیزات
                    </h2>
                  </div>

                  <div className="text-left space-y-1 text-[11px] font-mono">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-slate-500 font-sans">شماره فرم:</span>
                      <strong className="font-bold">{existingRepairRecord?.repairNo || 'SRV-88421'}</strong>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-slate-500 font-sans">تاریخ صدور:</span>
                      <span>{endDate}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-slate-500 font-sans">کد رهگیری QR:</span>
                      <QrCode className="w-8 h-8 text-slate-900" />
                    </div>
                  </div>
                </div>

                {/* Equipment & Department Metadata Table */}
                <div className="border border-slate-400 rounded-lg overflow-hidden text-xs">
                  <div className="bg-slate-100 p-2 font-black border-b border-slate-400 text-slate-800">
                    الف) مشخصات شناسنامه‌ای تجهیز
                  </div>
                  <div className="grid grid-cols-4 p-2.5 gap-2 border-b border-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">نام دستگاه:</span>
                      <strong className="font-bold">{equipment.faName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">کد اموال / شناسنامه:</span>
                      <strong className="font-mono">{equipment.code}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">سازنده و برند:</span>
                      <span>{equipment.brand}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">مدل و تیپ:</span>
                      <span>{equipment.model}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 p-2.5 gap-2 bg-slate-50/50">
                    <div>
                      <span className="text-slate-500 block text-[10px]">شماره سریال سازنده:</span>
                      <span className="font-mono">{equipment.serialNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">بخش استقرار:</span>
                      <span>{equipment.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">اتاق / موقعیت فیزیکی:</span>
                      <span>{equipment.location || 'اتاق ۱'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">اپراتور مسئول:</span>
                      <span>{equipment.assignedOperator || 'اپراتور شیفت'}</span>
                    </div>
                  </div>
                </div>

                {/* Fault Summary */}
                <div className="border border-slate-400 rounded-lg overflow-hidden text-xs">
                  <div className="bg-slate-100 p-2 font-black border-b border-slate-400 text-slate-800">
                    ب) شرح عیب اعلامی اولیه و تشخیص کارشناس
                  </div>
                  <div className="p-3 space-y-2">
                    <p>
                      <strong>گزارش نقص اولیه اپراتور:</strong> {faultReport?.defectDescription || 'نقص در مدار پاور و آلارم سنسور O2'}
                    </p>
                    <p>
                      <strong>تشخیص نهایی مهندسی پزشکی:</strong> {finalDiagnosis}
                    </p>
                    <p>
                      <strong>علت ریشه‌ای خرابی:</strong> {probableCause}
                    </p>
                  </div>
                </div>

                {/* Actions Performed & Parts */}
                <div className="border border-slate-400 rounded-lg overflow-hidden text-xs">
                  <div className="bg-slate-100 p-2 font-black border-b border-slate-400 text-slate-800">
                    ج) شرح اقدامات، قطعات تعویض‌شده و تنظیمات
                  </div>
                  <div className="p-3 space-y-2">
                    <p>
                      <strong>اقدامات انجام‌شده:</strong> {actionsDescription}
                    </p>
                    <p>
                      <strong>قطعات تعویضی:</strong> {replacedComponents}
                    </p>
                    <p>
                      <strong>کالیبراسیون و تنظیمات:</strong> {calibrationsAndAdjustments}
                    </p>
                  </div>
                </div>

                {/* Final Test Results & Equipment Status */}
                <div className="border border-slate-400 rounded-lg overflow-hidden text-xs">
                  <div className="bg-slate-100 p-2 font-black border-b border-slate-400 text-slate-800">
                    د) نتیجه آزمون‌های نهایی، ایمنی الکتریکی و وضعیت مجاز بهره‌برداری
                  </div>
                  <div className="grid grid-cols-2 p-3 gap-3">
                    <div>
                      <p>
                        <strong>وضعیت نهایی دستگاه:</strong>{' '}
                        <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          {finalStatus === 'ready_for_service'
                            ? 'آماده به کار و بهره‌برداری بالینی کامل'
                            : finalStatus === 'ready_with_limitation'
                            ? 'آماده با محدودیت'
                            : 'نیازمند پیگیری و سرویس'}
                        </span>
                      </p>
                      <p className="mt-2">
                        <strong>تست عملکردی:</strong> {functionalTestNotes}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>تست ایمنی الکتریکی/مکانیکی:</strong> {electricalSafetyTestNotes}
                      </p>
                      <p className="mt-2">
                        <strong>تاریخ بازگشت رسمی به خدمت:</strong> {returnToServiceDate}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Official Signatures Block */}
                <div className="grid grid-cols-3 gap-4 pt-6 text-center text-xs border-t border-slate-300">
                  <div className="space-y-12">
                    <p className="font-bold text-slate-800">کارشناس مهندسی پزشکی</p>
                    <p className="text-[11px] text-slate-600 font-bold">{engineerName}</p>
                    <div className="border-b border-dashed border-slate-400 w-32 mx-auto" />
                    <span className="text-[10px] text-slate-400">امضا و تاریخ</span>
                  </div>

                  <div className="space-y-12">
                    <p className="font-bold text-slate-800">مسئول / اپراتور تحویل‌گیرنده بخش</p>
                    <p className="text-[11px] text-slate-600 font-bold">{equipment.assignedOperator || 'پرستار مسئول'}</p>
                    <div className="border-b border-dashed border-slate-400 w-32 mx-auto" />
                    <span className="text-[10px] text-slate-400">امضا و تاریخ تحویل</span>
                  </div>

                  <div className="space-y-12">
                    <p className="font-bold text-slate-800">رئیس دپارتمان / مدیر تجهیزات</p>
                    <p className="text-[11px] text-slate-600 font-bold">دکتر کاظمی / مهندس محمدی</p>
                    <div className="border-b border-dashed border-slate-400 w-32 mx-auto" />
                    <span className="text-[10px] text-slate-400">مهر و تایید نهایی</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD SCANNED COMPLETED SIGNED FORM */}
          {activeWorkflowTab === 'upload' && (
            <div className="space-y-5">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
                <h4 className="font-black text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#2b64f6]" />
                  <span>بارگذاری فرم دستی امضاشده (یکپارچه‌سازی با همین پرونده)</span>
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  اگر فرم را به صورت چاپی تکمیل و امضا کرده‌اید، می‌توانید تصویر اسکن‌شده یا فایل PDF آن را در اینجا بارگذاری کنید. این سند مستقیماً به همین پرونده تعمیراتی ({existingRepairRecord?.repairNo || 'جاری'}) متصل خواهد شد و از دوباره‌کاری و سوابق متفرقه جلوگیری می‌گردد.
                </p>
              </div>

              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-3xl p-8 text-center cursor-pointer transition-all space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,image/*"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2b64f6] flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    جهت انتخاب فایل اسکن برگه تعمیرات (PDF یا تصویر) کلیک کنید
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">حداکثر حجم فایل: ۲۰ مگابایت</p>
                </div>
              </div>

              {/* Uploaded File Preview */}
              {uploadedFileName && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-emerald-950">{uploadedFileName}</h5>
                      <span className="text-[10px] text-emerald-700">آماده الصاق به پرونده تعمیراتی دستگاه</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFileName('');
                      setUploadedFileUrl('');
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    حذف و انتخاب مجدد
                  </button>
                </div>
              )}

              {/* Save with upload */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveWorkflowTab('digital')}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  بازگشت به فرم دیجیتال
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 text-xs font-black rounded-xl bg-[#2b64f6] hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تایید و ذخیره پرونده با سند پیوست</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
