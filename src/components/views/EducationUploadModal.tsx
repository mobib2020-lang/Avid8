import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Tag,
  Building2,
  User,
} from 'lucide-react';
import { EducationFileType, EducationItem, AppUser } from '../../types';

interface EducationUploadModalProps {
  currentFolderName: string;
  currentFolderId: string | null;
  currentUser?: AppUser;
  onClose: () => void;
  onUpload: (newItem: Omit<EducationItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const EducationUploadModal: React.FC<EducationUploadModalProps> = ({
  currentFolderName,
  currentFolderId,
  currentUser,
  onClose,
  onUpload,
}) => {
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<EducationFileType>('pdf');
  const [department, setDepartment] = useState(currentUser?.department || 'مهندسی پزشکی');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('آموزش، راهنما');
  const [customContent, setCustomContent] = useState('');
  const [duration, setDuration] = useState('');
  const [fileSize, setFileSize] = useState('4.2 MB');
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleNativeFileSelect = (file: File) => {
    setSelectedFileObj(file);
    const cleanName = file.name;
    setFileName(cleanName);
    
    // Auto-detect type
    const ext = cleanName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') setFileType('pdf');
    else if (['mp4', 'mkv', 'avi', 'mov'].includes(ext)) setFileType('video');
    else if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) setFileType('audio');
    else if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) setFileType('image');
    else setFileType('document');

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(`${sizeMb} MB`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleNativeFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      setError('لطفاً عنوان یا نام فایل را مشخص فرمایید.');
      return;
    }

    setIsSimulatingUpload(true);
    let current = 0;
    const interval = setInterval(() => {
      current += 25;
      setUploadProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          const tags = tagsInput
            .split(/[,،]/)
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

          let extension = '.pdf';
          if (fileType === 'video') extension = '.mp4';
          else if (fileType === 'audio') extension = '.mp3';
          else if (fileType === 'image') extension = '.png';
          else if (fileType === 'document') extension = '.docx';

          onUpload({
            name: fileName.includes('.') ? fileName : `${fileName}${extension}`,
            type: fileType,
            parentId: currentFolderId,
            size: fileSize,
            extension,
            author: currentUser?.name || 'کاربر سیستم',
            authorRole: currentUser?.roleFa || 'کارشناس بیمارستان',
            department,
            description: description.trim() || undefined,
            tags,
            content: customContent.trim() || undefined,
            duration: duration.trim() || (fileType === 'pdf' ? '۱۲ صفحه' : '۱۵:۰۰'),
            viewCount: 1,
            downloadCount: 0,
            starred: false,
          });
          onClose();
        }, 300);
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 dir-rtl font-sans animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-right max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">بارگذاری محتوای آموزشی جدید</h3>
              <p className="text-[11px] text-slate-500">مسیر مقصد: {currentFolderName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSimulatingUpload ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto animate-pulse">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">در حال بارگذاری و نمایه‌سازی فایل...</h4>
              <p className="text-xs text-slate-500 mt-1">{uploadProgress}% انجام شد</p>
            </div>
            <div className="w-64 mx-auto bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sky-600 h-full transition-all duration-150 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-4 text-center transition-colors cursor-pointer ${
                isDragOver ? 'border-sky-500 bg-sky-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70'
              }`}
              onClick={() => document.getElementById('native-file-picker')?.click()}
            >
              <input
                id="native-file-picker"
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleNativeFileSelect(e.target.files[0]);
                  }
                }}
              />
              <UploadCloud className="w-8 h-8 text-sky-600 mx-auto mb-2" />
              <p className="font-bold text-slate-700">
                {selectedFileObj ? `فایل انتخاب‌شده: ${selectedFileObj.name}` : 'فایل مورد نظر را اینجا رها کنید یا کلیک نمایید'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                پشتیبانی از PDF، فیلم‌های آموزشی MP4، فایل صوتی MP3، تصاویر و اسناد متنی
              </p>
            </div>

            {/* Title / Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                عنوان یا نام فایل <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="مثال: دستورالعمل کاربری ونتیلاتور..."
                value={fileName}
                onChange={(e) => {
                  setFileName(e.target.value);
                  if (error) setError('');
                }}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-hidden text-slate-800 font-medium"
              />
              {error && <span className="text-[11px] text-rose-600 font-bold mt-1 block">{error}</span>}
            </div>

            {/* File Type & Department Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع فایل</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as EducationFileType)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-hidden text-slate-800"
                >
                  <option value="pdf">کتابچه یا سند PDF</option>
                  <option value="video">ویدیو و فیلم آموزشی (MP4)</option>
                  <option value="audio">فایل صوتی و پادکست (MP3)</option>
                  <option value="image">تصویر و پوستر آموزشی</option>
                  <option value="document">سند متنی و دستورالعمل</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">دپارتمان / بخش</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-hidden text-slate-800"
                >
                  <option value="مهندسی پزشکی">مهندسی پزشکی</option>
                  <option value="آموزش بالینی">آموزش بالینی</option>
                  <option value="پرستاری">پرستاری</option>
                  <option value="بهداشت و ایمنی">بهداشت و ایمنی</option>
                  <option value="کنترل عفونت">کنترل عفونت</option>
                  <option value="انبار و اموال">انبار و اموال</option>
                  <option value="عمومی بیمارستان">عمومی بیمارستان</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">توضیحات و خلاصه مبحث</label>
              <textarea
                rows={2}
                placeholder="خلاصه‌ای از مباحث ارائه شده در این فایل جهت راهنمایی کاربران..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-hidden text-slate-800"
              />
            </div>

            {/* Tags & Custom Content */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">برچسب‌ها (با ویرگول جدا کنید)</label>
                <input
                  type="text"
                  placeholder="ونتیلاتور، ایمنی، احیا"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-hidden text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مدت زمان یا تعداد صفحات</label>
                <input
                  type="text"
                  placeholder="مثال: ۱۵:۰۰ یا ۲۴ صفحه"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-hidden text-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Full text content (optional) */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                متن کامل محتوا (جهت امکان مطالعه مستقیم در مرورگر)
              </label>
              <textarea
                rows={3}
                placeholder="متن دستورالعمل یا سرفصل‌های آموزشی را اینجا وارد کنید..."
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-hidden text-slate-800 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                بارگذاری و انتشار
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
