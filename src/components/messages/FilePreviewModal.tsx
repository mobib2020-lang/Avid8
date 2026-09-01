import React from 'react';
import {
  X,
  FileText,
  Download,
  Eye,
  FileSpreadsheet,
  Film,
  Music,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { MessageFileAttachment } from '../../types';
import { downloadMessageAttachmentFile } from '../../utils/downloadHelpers';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: MessageFileAttachment | null;
  senderName?: string;
  sentAt?: string;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  file,
  senderName,
  sentAt,
}) => {
  if (!isOpen || !file) return null;

  const getFileIcon = () => {
    switch (file.type) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-rose-500" />;
      case 'sheet':
        return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
      case 'video':
        return <Film className="w-8 h-8 text-indigo-500" />;
      case 'audio':
        return <Music className="w-8 h-8 text-amber-500" />;
      case 'image':
        return <ImageIcon className="w-8 h-8 text-sky-500" />;
      default:
        return <FileText className="w-8 h-8 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 dir-rtl">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center">
              {getFileIcon()}
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 line-clamp-1">{file.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                حجم: {file.size} {senderName ? `• ارسال‌کننده: ${senderName}` : ''} {sentAt ? `• زمان: ${sentAt}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-200/80 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Preview Area */}
        <div className="p-6 bg-slate-100/60 flex-1 overflow-y-auto flex flex-col items-center justify-center min-h-[300px]">
          {file.type === 'image' ? (
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
              <img
                src={file.url || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80'}
                alt={file.name}
                className="w-full h-auto rounded-xl object-contain max-h-[360px]"
              />
              <p className="text-xs text-slate-500 mt-2 font-medium">{file.name}</p>
            </div>
          ) : file.type === 'video' ? (
            <div className="bg-slate-900 text-white rounded-2xl overflow-hidden shadow-md max-w-md w-full p-4 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <Film className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold">{file.name}</p>
              <p className="text-xs text-slate-400">ویدیوی آموزشی فنی و عملیاتی بیمارستان</p>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-1/3 rounded-full" />
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto border border-sky-100">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">{file.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  سند استاندارد سازمانی با فرمت رسمی بیمارستان آوید. برای مطالعه کامل می‌توانید فایل را ذخیره فرمایید.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-right text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">نوع سند:</span>
                  <span className="font-bold">{file.type.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">حجم پرونده:</span>
                  <span className="font-bold font-mono">{file.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">وضعیت ایمنی:</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> اسکن‌شده و ایمن
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <span className="text-xs text-slate-400">شناسه پرونده: {file.id}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                downloadMessageAttachmentFile(file, senderName, sentAt);
              }}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>دانلود فایل</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
