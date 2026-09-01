import React, { useState } from 'react';
import { X, FolderPlus, Folder } from 'lucide-react';

interface EducationNewFolderModalProps {
  currentFolderName: string;
  onClose: () => void;
  onCreateFolder: (name: string, description?: string) => void;
}

export const EducationNewFolderModal: React.FC<EducationNewFolderModalProps> = ({
  currentFolderName,
  onClose,
  onCreateFolder,
}) => {
  const [folderName, setFolderName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      setError('لطفاً نام پوشه را وارد فرمایید.');
      return;
    }
    onCreateFolder(folderName.trim(), description.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 dir-rtl font-sans animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-right">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">ایجاد پوشه جدید</h3>
              <p className="text-[11px] text-slate-500">مسیر ذخیره: {currentFolderName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              نام پوشه <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Folder className="w-4 h-4 text-amber-500 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="مثال: مستندات آموزشی ICU و CCU..."
                value={folderName}
                onChange={(e) => {
                  setFolderName(e.target.value);
                  if (error) setError('');
                }}
                className="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all font-medium text-slate-800"
              />
            </div>
            {error && <span className="text-[11px] text-rose-600 font-bold mt-1 block">{error}</span>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              شرح یا توضیحات پوشه (اختیاری)
            </label>
            <textarea
              rows={2}
              placeholder="توضیح کوتاه درباره محتویات این پوشه..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all text-slate-800"
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
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              ایجاد پوشه
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
