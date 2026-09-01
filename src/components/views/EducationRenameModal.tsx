import React, { useState } from 'react';
import { X, Edit3 } from 'lucide-react';
import { EducationItem } from '../../types';

interface EducationRenameModalProps {
  item: EducationItem;
  onClose: () => void;
  onRename: (id: string, newName: string) => void;
}

export const EducationRenameModal: React.FC<EducationRenameModalProps> = ({
  item,
  onClose,
  onRename,
}) => {
  const [newName, setNewName] = useState(item.name);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError('نام نمی‌تواند خالی باشد.');
      return;
    }
    onRename(item.id, newName.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 dir-rtl font-sans animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-right">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">تغییر نام</h3>
              <p className="text-[11px] text-slate-500">
                {item.type === 'folder' ? 'پوشه انتخابی' : 'فایل انتخابی'}
              </p>
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
              نام جدید <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (error) setError('');
              }}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 focus:bg-white text-slate-800 font-bold"
            />
            {error && <span className="text-[11px] text-rose-600 font-bold mt-1 block">{error}</span>}
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
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              ذخیره نام
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
