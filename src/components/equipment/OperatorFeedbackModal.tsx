import React, { useState } from 'react';
import {
  X,
  MessageSquarePlus,
  Send,
  Upload,
  Calendar,
  Clock,
  User,
  Building,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Paperclip,
  Trash2,
  Stethoscope,
  Sparkles,
  HelpCircle,
  Wrench,
  Activity,
  ThumbsUp,
  Volume2,
  Eye,
  Brush,
  Lightbulb,
} from 'lucide-react';
import {
  EquipmentItem,
  AppUser,
  OperatorFeedbackItem,
  OperatorFeedbackOverallCondition,
  OperatorFeedbackType,
} from '../../types';

interface OperatorFeedbackModalProps {
  equipment: EquipmentItem;
  currentUser?: AppUser;
  onSubmitFeedback: (equipmentId: string, feedback: OperatorFeedbackItem) => void;
  onSwitchToFaultReport?: (equipment: EquipmentItem) => void;
  onClose: () => void;
}

export const OperatorFeedbackModal: React.FC<OperatorFeedbackModalProps> = ({
  equipment,
  currentUser,
  onSubmitFeedback,
  onSwitchToFaultReport,
  onClose,
}) => {
  const [overallCondition, setOverallCondition] = useState<OperatorFeedbackOverallCondition>('normal');
  const [feedbackType, setFeedbackType] = useState<OperatorFeedbackType>('performance_optimal');
  const [comment, setComment] = useState('');
  const [feedbackDate, setFeedbackDate] = useState('۱۴۰۵/۰۵/۲۲');
  const [feedbackTime, setFeedbackTime] = useState('۱۰:۳۰');
  const [attachedFileName, setAttachedFileName] = useState('');
  const [attachedFileType, setAttachedFileType] = useState<'image' | 'file'>('image');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const conditionOptions: {
    value: OperatorFeedbackOverallCondition;
    label: string;
    description: string;
    color: string;
    bg: string;
    border: string;
  }[] = [
    {
      value: 'optimal',
      label: 'عالی و پایدار',
      description: 'دستگاه در بالاترین سطح آمادگی و عملکرد قرار دارد',
      color: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    {
      value: 'normal',
      label: 'عادی و مطلوب',
      description: 'عملکرد عادی مطابق استانداردهای بالینی بخش',
      color: 'text-sky-700 dark:text-sky-300',
      bg: 'bg-sky-50 dark:bg-sky-950/30',
      border: 'border-sky-200 dark:border-sky-800',
    },
    {
      value: 'needs_attention',
      label: 'نیازمند پایش و بررسی',
      description: 'کارکرد دارد اما نیازمند توجه و مراقبت ویژه است',
      color: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800',
    },
    {
      value: 'needs_cleaning',
      label: 'نیازمند نظافت و ضدعفونی',
      description: 'سطوح، اتصالات یا بدنه نیازمند پاک‌سازی است',
      color: 'text-purple-700 dark:text-purple-300',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      border: 'border-purple-200 dark:border-purple-800',
    },
    {
      value: 'degraded_performance',
      label: 'افت کارایی / عملکرد ضعیف',
      description: 'سرعت، دقت یا کیفیت کارکرد کاهش یافته است',
      color: 'text-orange-700 dark:text-orange-300',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      border: 'border-orange-200 dark:border-orange-800',
    },
  ];

  const presetFeedbackTypes: {
    type: OperatorFeedbackType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    defaultCondition: OperatorFeedbackOverallCondition;
  }[] = [
    {
      type: 'performance_optimal',
      label: 'عملکرد دستگاه مناسب است',
      icon: ThumbsUp,
      defaultCondition: 'optimal',
    },
    {
      type: 'performance_degraded',
      label: 'عملکرد دستگاه ضعیف شده',
      icon: Activity,
      defaultCondition: 'degraded_performance',
    },
    {
      type: 'abnormal_noise',
      label: 'دستگاه صدای غیرعادی دارد',
      icon: Volume2,
      defaultCondition: 'needs_attention',
    },
    {
      type: 'needs_inspection',
      label: 'دستگاه نیاز به بررسی دارد',
      icon: Eye,
      defaultCondition: 'needs_attention',
    },
    {
      type: 'poor_appearance',
      label: 'وضعیت ظاهری مناسب نیست',
      icon: AlertTriangle,
      defaultCondition: 'needs_attention',
    },
    {
      type: 'needs_cleaning',
      label: 'نیاز به نظافت دارد',
      icon: Brush,
      defaultCondition: 'needs_cleaning',
    },
    {
      type: 'unusual_observation',
      label: 'یک مورد غیرعادی مشاهده شده',
      icon: HelpCircle,
      defaultCondition: 'needs_attention',
    },
    {
      type: 'usage_suggestion',
      label: 'پیشنهاد یا توضیح برای استفاده بهتر',
      icon: Lightbulb,
      defaultCondition: 'normal',
    },
  ];

  const handleSelectFeedbackType = (item: (typeof presetFeedbackTypes)[0]) => {
    setFeedbackType(item.type);
    setOverallCondition(item.defaultCondition);
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedFileName(file.name);
      setAttachedFileType(file.type.startsWith('image/') ? 'image' : 'file');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);

    const activeTypeObj = presetFeedbackTypes.find((p) => p.type === feedbackType);
    const feedbackTypeLabel = activeTypeObj ? activeTypeObj.label : 'سایر موارد';

    const newFeedback: OperatorFeedbackItem = {
      id: `fb-op-${Date.now()}`,
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.faName,
      operatorId: currentUser?.id || 'usr-7',
      operatorName: currentUser?.name || 'نسرین کریمی',
      operatorRole: currentUser?.roleFa || 'اپراتور بخش',
      operatorDepartment: currentUser?.department || equipment.department,
      date: feedbackDate,
      time: feedbackTime,
      overallCondition,
      feedbackType,
      feedbackTypeLabel,
      comment: comment.trim(),
      attachmentName: attachedFileName || undefined,
      attachmentType: attachedFileName ? attachedFileType : undefined,
    };

    setTimeout(() => {
      onSubmitFeedback(equipment.id, newFeedback);
      setIsSubmitting(false);
      onClose();
    }, 200);
  };

  return (
    <div
      id="operator-feedback-modal-backdrop"
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="operator-feedback-modal-card"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                ثبت نظر / گزارش وضعیت تجهیز
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ثبت مشاهدات، کیفیت عملکرد روزمره و پیشنهادات کاربری در پرونده تجهیز
              </p>
            </div>
          </div>
          <button
            id="close-feedback-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Guidance & Distinction from Fault Report */}
        <div className="px-6 pt-4 pb-2">
          <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-teal-800 dark:text-teal-200">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <span>
                این فرم برای ثبت نظرات کاربری، بررسی عملکرد عادی، نظافت و مشاهدات عمومی است و پرونده
                تاریخچه تجهیز را به‌روز می‌کند.
              </span>
            </div>
            {onSwitchToFaultReport && (
              <button
                id="switch-to-fault-report-btn"
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToFaultReport(equipment);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/50 hover:bg-rose-200 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-medium whitespace-nowrap transition-colors border border-rose-200 dark:border-rose-800"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>نیاز به ثبت خرابی فنی دارید؟</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-3 space-y-5 flex-1 text-sm">
          {/* Equipment Snapshot Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/20">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{equipment.faName}</span>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {equipment.code}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{equipment.brand} - {equipment.model}</span>
                  <span>•</span>
                  <span>{equipment.location}</span>
                </div>
              </div>
            </div>
            <div className="text-left shrink-0">
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                وضعیت: {equipment.status === 'in_use' ? 'در حال استفاده' : equipment.status === 'active' ? 'آماده به کار' : equipment.status === 'under_maintenance' ? 'تحت تعمیر' : 'پایدار'}
              </span>
            </div>
          </div>

          {/* 1. Overall Condition Assessment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              ۱. ارزیابی وضعیت کلی عملکرد تجهیز:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {conditionOptions.map((opt) => {
                const isSelected = overallCondition === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setOverallCondition(opt.value)}
                    className={`p-2.5 rounded-xl text-right transition-all border ${
                      isSelected
                        ? `${opt.bg} ${opt.border} ring-2 ring-teal-500/30 font-medium`
                        : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? opt.color : 'text-slate-800 dark:text-slate-200'}`}>
                        {opt.label}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Feedback Category / Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              ۲. موضوع و نوع بازخورد / برچسب گزارش:
            </label>
            <div className="flex flex-wrap gap-2">
              {presetFeedbackTypes.map((item) => {
                const isSelected = feedbackType === item.type;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleSelectFeedbackType(item)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all border ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm font-medium'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/50 dark:hover:bg-teal-950/20'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Detailed Comment Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="feedback-comment-textarea" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                ۳. توضیحات، مشاهدات بالینی یا پیشنهادات: <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {comment.length} کاراکتر
              </span>
            </div>
            <textarea
              id="feedback-comment-textarea"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              placeholder="مشاهدات خود را درباره نحوه کارکرد، کیفیت خروجی، صدای دستگاه، سهولت استفاده یا نیاز به نظافت یادداشت فرمایید..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm leading-relaxed"
            />
          </div>

          {/* 4. Date & Time + Operator Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                تاریخ ثبت:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={feedbackDate}
                  onChange={(e) => setFeedbackDate(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                زمان ثبت:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={feedbackTime}
                  onChange={(e) => setFeedbackTime(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-left font-mono"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                اپراتور ثبت‌کننده:
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="font-medium truncate">{currentUser?.name || 'نسرین کریمی'}</span>
              </div>
            </div>
          </div>

          {/* 5. Attachment Upload (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              تصویر یا فایل ضمیمه (اختیاری):
            </label>
            {attachedFileName ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Paperclip className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {attachedFileName}
                    </p>
                    <p className="text-[11px] text-teal-600 dark:text-teal-400">
                      پیوست آماده ثبت در پرونده تجهیز
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFileName('')}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="feedback-attachment-input"
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-teal-50/20 dark:hover:bg-teal-950/10 transition-colors cursor-pointer"
              >
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  برای افزودن عکس از مانیتور دستگاه یا فایل گزارش کلیک کنید
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  فرمت‌های مجاز: JPG, PNG, PDF (حداکثر ۱۰ مگابایت)
                </span>
                <input
                  id="feedback-attachment-input"
                  type="file"
                  onChange={handleSimulatedFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <button
            id="cancel-feedback-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            انصراف
          </button>
          <button
            id="submit-feedback-btn"
            type="button"
            disabled={!comment.trim() || isSubmitting}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-sm shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-3.5 h-3.5 rotate-180" />
            <span>{isSubmitting ? 'در حال ثبت در شناسنامه...' : 'ثبت و ذخیره گزارش در شناسنامه تجهیز'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
