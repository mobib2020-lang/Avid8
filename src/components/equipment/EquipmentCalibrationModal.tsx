import React, { useState, useRef } from 'react';
import {
  X,
  Award,
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
  FileCheck,
} from 'lucide-react';
import {
  EquipmentItem,
  CalibrationRecord,
  CalibrationMeasurementParam,
  FinalCalibrationResult,
  AppUser,
} from '../../types';

interface EquipmentCalibrationModalProps {
  equipment: EquipmentItem;
  existingRecord?: CalibrationRecord | null;
  currentUser?: AppUser;
  onSaveCalibrationRecord: (
    equipmentId: string,
    record: CalibrationRecord,
    updatedNextDate?: string
  ) => void;
  onClose: () => void;
}

export const EquipmentCalibrationModal: React.FC<EquipmentCalibrationModalProps> = ({
  equipment,
  existingRecord,
  currentUser,
  onSaveCalibrationRecord,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'digital' | 'print' | 'upload'>('digital');

  // Calibration Info
  const [certNumber, setCertNumber] = useState<string>(
    existingRecord?.certNumber || `CAL-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [issueDate, setIssueDate] = useState<string>(
    existingRecord?.issueDate || '۱۴۰۳/۰۵/۲۲'
  );
  const [expiryDate, setExpiryDate] = useState<string>(
    existingRecord?.expiryDate || '۱۴۰۴/۰۵/۲۲'
  );
  const [previousDate, setPreviousDate] = useState<string>(
    existingRecord?.previousCalibrationDate || '۱۴۰۲/۰۵/۲۰'
  );
  const [reason, setReason] = useState<'periodic' | 'post_repair' | 'clinical_request' | 'annual'>(
    existingRecord?.reason || 'periodic'
  );
  const [calibrationInterval, setCalibrationInterval] = useState<string>(
    existingRecord?.calibrationInterval || '۱۲ ماهه (سالانه)'
  );
  const [calibrationStandard, setCalibrationStandard] = useState<string>(
    existingRecord?.calibrationMethodStandard || 'استاندارد ملی INSO-7925 / IEC 60601-1'
  );
  const [agency, setAgency] = useState<string>(
    existingRecord?.agency || 'آزمایشگاه مرجع کالیبراسیون و کنترل کیفی طب‌آزما'
  );
  const [inspector, setInspector] = useState<string>(
    existingRecord?.inspector || 'مهندس کامران رستمی (آزمون‌گر ارشد)'
  );

  // Measurement Parameters
  const [measurements, setMeasurements] = useState<CalibrationMeasurementParam[]>(
    existingRecord?.measurements || [
      {
        id: 'm1',
        parameter: 'دقت حجم جاری تنفسی (Tidal Volume @ 500ml)',
        beforeValue: '482 ml (-3.6%)',
        referenceValue: '500 ml ± 2%',
        afterValue: '499 ml (-0.2%)',
        tolerance: '± 10 ml',
        result: 'قبول',
      },
      {
        id: 'm2',
        parameter: 'غلظت اکسیژن خروجی (FiO2 @ 60%)',
        beforeValue: '56.4%',
        referenceValue: '60.0% ± 2%',
        afterValue: '60.1%',
        tolerance: '± 2.0%',
        result: 'قبول',
      },
      {
        id: 'm3',
        parameter: 'فشار مثبت انتهای بازدم (PEEP @ 10 cmH2O)',
        beforeValue: '9.3 cmH2O',
        referenceValue: '10.0 cmH2O',
        afterValue: '10.0 cmH2O',
        tolerance: '± 0.5 cmH2O',
        result: 'قبول',
      },
      {
        id: 'm4',
        parameter: 'آزمون ایمنی الکتریکی نشتی بدنه (Chassis Leakage)',
        beforeValue: '45 µA',
        referenceValue: '< 100 µA (IEC 60601)',
        afterValue: '42 µA',
        tolerance: '< 100 µA',
        result: 'قبول',
      },
    ]
  );

  // Measurement table inline form state
  const [newParam, setNewParam] = useState('');
  const [newBefore, setNewBefore] = useState('');
  const [newRef, setNewRef] = useState('');
  const [newAfter, setNewAfter] = useState('');
  const [newTol, setNewTol] = useState('');
  const [newRes, setNewRes] = useState<'قبول' | 'مردود' | 'نیاز به تنظیم'>('قبول');

  const addMeasurement = () => {
    if (!newParam.trim()) return;
    setMeasurements((prev) => [
      ...prev,
      {
        id: `meas-${Date.now()}`,
        parameter: newParam.trim(),
        beforeValue: newBefore.trim() || '-',
        referenceValue: newRef.trim() || 'استاندارد',
        afterValue: newAfter.trim() || '-',
        tolerance: newTol.trim() || '±2%',
        result: newRes,
      },
    ]);
    setNewParam('');
    setNewBefore('');
    setNewRef('');
    setNewAfter('');
    setNewTol('');
  };

  const removeMeasurement = (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  // Final Result
  const [finalResult, setFinalResult] = useState<FinalCalibrationResult>(
    existingRecord?.finalResult || 'pass'
  );
  const [safetyNotes, setSafetyNotes] = useState<string>(
    existingRecord?.safetyNotes ||
      'دستگاه تمامی آزمون‌های ایمنی الکتریکی و صحت عملکرد فلومتری و فشار را با موفقیت گذراند.'
  );
  const [operatorFeedback, setOperatorFeedback] = useState<string>(
    existingRecord?.operatorFeedback ||
      'تجهیز در شرایط بهینه کالیبره شد و برای ۱۲ ماه آینده دارای گواهی معتبر است.'
  );

  // Upload state
  const [uploadedFileName, setUploadedFileName] = useState<string>(
    existingRecord?.uploadedFormName || ''
  );
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>(
    existingRecord?.uploadedFormUrl || ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setUploadedFileUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const record: CalibrationRecord = {
      id: existingRecord?.id || `cal-${Date.now()}`,
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.faName,
      brand: equipment.brand,
      model: equipment.model,
      serialNumber: equipment.serialNumber,
      location: equipment.location,
      assignedOperator: equipment.assignedOperator,
      department: equipment.department,

      certNumber,
      issueDate,
      expiryDate,
      status: finalResult === 'pass' || finalResult === 'conditional_pass' ? 'valid' : 'expired',
      reason,
      calibrationInterval,
      previousCalibrationDate: previousDate,
      nextCalibrationDate: expiryDate,
      calibrationMethodStandard: calibrationStandard,
      agency,
      inspector,

      measurements,
      finalResult,
      safetyNotes,
      operatorFeedback,

      completionType: uploadedFileName ? (activeTab === 'upload' ? 'scanned_upload' : 'both') : 'digital',
      uploadedFormName: uploadedFileName || undefined,
      uploadedFormUrl: uploadedFileUrl || undefined,
      isSigned: true,
    };

    onSaveCalibrationRecord(equipment.id, record, expiryDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[80] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden dir-rtl my-8 text-right font-sans flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">
                  فرم و گواهی کالیبراسیون و کنترل کیفی (QC)
                </h2>
                <span className="text-[10px] font-mono font-bold bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded border border-indigo-400/30">
                  {certNumber}
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                {equipment.faName} ({equipment.code}) • {equipment.department}
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

        {/* Tab Switcher */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('digital')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'digital'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ثبت دیجیتال آزمون و متغیرها</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('print')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'print'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>چاپ گواهینامه کالیبراسیون</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>بارگذاری گواهی اسکن‌شده</span>
            </button>
          </div>

          <span className="text-[11px] font-bold text-slate-500 hidden sm:block">
            فرم تخصصی کالیبراسیون و انطباق استاندارد INSO / IEC
          </span>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {activeTab === 'digital' && (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    شماره گواهینامه / رفرنس <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={certNumber}
                    onChange={(e) => setCertNumber(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    علت انجام آزمون کالیبراسیون
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="periodic">آزمون دوره‌ای و برنامه‌ریزی‌شده</option>
                    <option value="post_repair">پس از تعمیر اساسی و تعویض سنسور</option>
                    <option value="clinical_request">به درخواست پزشک / سرپرست بخش</option>
                    <option value="annual">کنترل کیفی جامع سالانه</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    دوره آزمون بعدی
                  </label>
                  <input
                    type="text"
                    value={calibrationInterval}
                    onChange={(e) => setCalibrationInterval(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تاریخ صدور آزمون <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تاریخ سررسید اعتبار بعدی <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 font-bold text-indigo-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    روش و استاندارد مرجع آزمون
                  </label>
                  <input
                    type="text"
                    value={calibrationStandard}
                    onChange={(e) => setCalibrationStandard(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    آزمایشگاه / شرکت مرجع ارائه‌دهنده
                  </label>
                  <input
                    type="text"
                    value={agency}
                    onChange={(e) => setAgency(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نام کارشناس و بازرس آزمون‌گر
                  </label>
                  <input
                    type="text"
                    value={inspector}
                    onChange={(e) => setInspector(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تاریخ آزمون دوره قبل
                  </label>
                  <input
                    type="text"
                    value={previousDate}
                    onChange={(e) => setPreviousDate(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 text-slate-500"
                  />
                </div>
              </div>

              {/* STRUCTURED MEASUREMENTS TABLE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-black text-slate-900">
                      جدول داده‌های اندازه‌گیری و مقایسه با استاندارد مرجع
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500">{measurements.length} متغیر آزمون‌شده</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">پارامتر / متغیر سنجش</th>
                        <th className="p-2.5">مقدار اولیه (Before)</th>
                        <th className="p-2.5">مقدار استاندارد مرجع</th>
                        <th className="p-2.5">مقدار پس از کالیبراسیون (After)</th>
                        <th className="p-2.5">رواداری مجاز (Tolerance)</th>
                        <th className="p-2.5 text-center">نتیجه</th>
                        <th className="p-2.5 text-center w-10">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {measurements.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{m.parameter}</td>
                          <td className="p-2.5 font-mono text-slate-600">{m.beforeValue}</td>
                          <td className="p-2.5 font-mono text-indigo-700 font-bold">{m.referenceValue}</td>
                          <td className="p-2.5 font-mono text-emerald-700 font-bold">{m.afterValue}</td>
                          <td className="p-2.5 font-mono text-slate-400">{m.tolerance || '-'}</td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                m.result === 'قبول'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : m.result === 'مردود'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {m.result}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeMeasurement(m.id)}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Add Measurement Inline Row */}
                  <div className="bg-slate-50 p-2.5 border-t border-slate-200 flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="نام پارامتر..."
                      value={newParam}
                      onChange={(e) => setNewParam(e.target.value)}
                      className="text-xs p-2 rounded-lg border border-slate-200 bg-white grow"
                    />
                    <input
                      type="text"
                      placeholder="قبل..."
                      value={newBefore}
                      onChange={(e) => setNewBefore(e.target.value)}
                      className="text-xs p-2 rounded-lg border border-slate-200 bg-white w-24"
                    />
                    <input
                      type="text"
                      placeholder="مرجع..."
                      value={newRef}
                      onChange={(e) => setNewRef(e.target.value)}
                      className="text-xs p-2 rounded-lg border border-slate-200 bg-white w-28"
                    />
                    <input
                      type="text"
                      placeholder="بعد..."
                      value={newAfter}
                      onChange={(e) => setNewAfter(e.target.value)}
                      className="text-xs p-2 rounded-lg border border-slate-200 bg-white w-24"
                    />
                    <input
                      type="text"
                      placeholder="رواداری..."
                      value={newTol}
                      onChange={(e) => setNewTol(e.target.value)}
                      className="text-xs p-2 rounded-lg border border-slate-200 bg-white w-20"
                    />
                    <select
                      value={newRes}
                      onChange={(e) => setNewRes(e.target.value as any)}
                      className="text-xs p-2 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="قبول">قبول</option>
                      <option value="مردود">مردود</option>
                      <option value="نیاز به تنظیم">نیاز به تنظیم</option>
                    </select>
                    <button
                      type="button"
                      onClick={addMeasurement}
                      className="px-3 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>افزودن</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Final Assessment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    نتیجه نهایی گواهی کالیبراسیون <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={finalResult}
                    onChange={(e) => setFinalResult(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-indigo-400 bg-indigo-50/50 font-bold text-indigo-950"
                  >
                    <option value="pass">قبول قطعی و انطباق با استاندارد (Pass)</option>
                    <option value="conditional_pass">قبول با محدودیت یا پایش دوره‌ای</option>
                    <option value="failed">مردود / غیرمجاز جهت استفاده بالینی</option>
                    <option value="needs_adjustment_repair">نیازمند تعمیر و تنظیم مجدد</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ملاحظات ایمنی و کنترل کیفیت
                  </label>
                  <input
                    type="text"
                    value={safetyNotes}
                    onChange={(e) => setSafetyNotes(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  توصیه‌ها و گزارش فنی به اپراتور بخش
                </label>
                <textarea
                  rows={2}
                  value={operatorFeedback}
                  onChange={(e) => setOperatorFeedback(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  انصراف
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('print')}
                    className="px-4 py-2 text-xs font-bold rounded-xl border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>چاپ گواهینامه</span>
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-black rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ثبت و تمدید تاریخ کالیبراسیون</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: PRINTABLE CALIBRATION CERTIFICATE */}
          {activeTab === 'print' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-indigo-50 p-3.5 rounded-2xl border border-indigo-200 text-xs text-indigo-900">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>
                    گواهی رسمی کالیبراسیون و کنترل کیفی بیمارستان با کد QR اختصاصی
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>چاپ گواهینامه (Print)</span>
                </button>
              </div>

              {/* Printable Certificate Layout */}
              <div className="bg-white border-4 border-double border-indigo-950 p-8 rounded-xl shadow-lg space-y-6 text-black text-right dir-rtl font-sans print:m-0 print:border-none">
                <div className="border-b-2 border-indigo-950 pb-4 flex items-center justify-between">
                  <div>
                    <h1 className="text-base font-black text-slate-900">
                      بیمارستان تخصصی و فوق‌تخصصی آوید مدیکال
                    </h1>
                    <p className="text-xs text-slate-600">
                      مرکز جامع آزمون‌های کنترل کیفی و کالیبراسیون تجهیزات پزشکی
                    </p>
                    <h2 className="text-sm font-black text-indigo-950 mt-2 bg-indigo-50 px-3 py-1 rounded inline-block border border-indigo-200">
                      گواهی انطباق و صحت عملکرد کالیبراسیون (Calibration Certificate)
                    </h2>
                  </div>
                  <div className="text-left text-xs font-mono space-y-1">
                    <div>شماره گواهی: <strong>{certNumber}</strong></div>
                    <div>تاریخ آزمون: <strong>{issueDate}</strong></div>
                    <div>انقضا: <strong>{expiryDate}</strong></div>
                    <QrCode className="w-8 h-8 text-indigo-950 mt-1" />
                  </div>
                </div>

                {/* Device Info */}
                <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-300 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">دستگاه:</span>
                    <strong>{equipment.faName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">کد شناسنامه:</span>
                    <strong className="font-mono">{equipment.code}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">برند / مدل:</span>
                    <span>{equipment.brand} • {equipment.model}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">سریال ساخت:</span>
                    <span className="font-mono">{equipment.serialNumber}</span>
                  </div>
                </div>

                {/* Measurements Table */}
                <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-right">
                    <thead className="bg-indigo-900 text-white font-bold">
                      <tr>
                        <th className="p-2">پارامتر ارزیابی</th>
                        <th className="p-2">مقدار مرجع</th>
                        <th className="p-2">مقدار قبل</th>
                        <th className="p-2">مقدار نهایی پس از تنظیم</th>
                        <th className="p-2 text-center">نتیجه</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {measurements.map((m) => (
                        <tr key={m.id}>
                          <td className="p-2 font-bold">{m.parameter}</td>
                          <td className="p-2 font-mono">{m.referenceValue}</td>
                          <td className="p-2 font-mono">{m.beforeValue}</td>
                          <td className="p-2 font-mono font-bold text-emerald-800">{m.afterValue}</td>
                          <td className="p-2 text-center font-bold">{m.result}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Outcome */}
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-950 flex items-center justify-between">
                  <div>
                    <strong>نتیجه نهایی ارزیابی: </strong>
                    <span>دستگاه با ضریب خطای استاندارد تایید و آماده به کار در بخش مراقبت‌های ویژه می‌باشد.</span>
                  </div>
                  <div className="font-mono font-bold text-emerald-900">PASS (قبول)</div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-6 pt-6 text-center text-xs border-t border-slate-300">
                  <div className="space-y-12">
                    <p className="font-bold">کارشناس آزمون‌گر آزمایشگاه مرجع</p>
                    <p className="text-[11px]">{inspector}</p>
                    <div className="border-b border-dashed border-slate-400 w-32 mx-auto" />
                  </div>
                  <div className="space-y-12">
                    <p className="font-bold">مسئول کنترل کیفیت و مهندسی پزشکی بیمارستان</p>
                    <p className="text-[11px]">{currentUser?.name || 'مهندس امین رضایی'}</p>
                    <div className="border-b border-dashed border-slate-400 w-32 mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD SCANNED FORM */}
          {activeTab === 'upload' && (
            <div className="space-y-5">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
                <h4 className="font-black text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>بارگذاری گواهی فیزیکی شرکت کالیبراسیون</span>
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  گواهی اصلی ممهور و امضاشده توسط شرکت آزمایشگاه همکار را در اینجا بارگذاری فرمایید تا مستقیماً به همین رکورد کالیبراسیون ({certNumber}) متصل گردد.
                </p>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/30 rounded-3xl p-8 text-center cursor-pointer transition-all space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,image/*"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    جهت انتخاب فایل گواهی کالیبراسیون کلیک کنید
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">فرمت PDF، JPG یا PNG</p>
                </div>
              </div>

              {uploadedFileName && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-emerald-950">{uploadedFileName}</h5>
                      <span className="text-[10px] text-emerald-700">آماده ثبت به عنوان گواهینامه معتبر</span>
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

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('digital')}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  بازگشت به فرم دیجیتال
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 text-xs font-black rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تایید و ذخیره گواهینامه</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
