import React, { useState } from 'react';
import { X, FolderSymlink, Folder, ChevronLeft, Check } from 'lucide-react';
import { EducationItem } from '../../types';

interface EducationMoveModalProps {
  item: EducationItem;
  allItems: EducationItem[];
  onClose: () => void;
  onMove: (itemId: string, targetFolderId: string | null) => void;
}

export const EducationMoveModal: React.FC<EducationMoveModalProps> = ({
  item,
  allItems,
  onClose,
  onMove,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(item.parentId);

  // Available folders: exclude the item itself (if it's a folder) and its descendants
  const folderList = allItems.filter((i) => i.type === 'folder' && i.id !== item.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onMove(item.id, selectedFolderId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 dir-rtl font-sans animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-right">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
              <FolderSymlink className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">انتقال و جابجایی</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-xs">{item.name}</p>
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
            <label className="block text-xs font-bold text-slate-700 mb-2">
              پوشه مقصد را انتخاب فرمایید:
            </label>
            <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-2xl p-2 space-y-1 bg-slate-50">
              {/* Root Directory */}
              <button
                type="button"
                onClick={() => setSelectedFolderId(null)}
                className={`w-full text-right p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedFolderId === null
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-amber-400" />
                  <span>پوشه ریشه (صفحه اصلی آموزش)</span>
                </div>
                {selectedFolderId === null && <Check className="w-4 h-4" />}
              </button>

              {/* Other folders */}
              {folderList.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFolderId(f.id)}
                  className={`w-full text-right p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedFolderId === f.id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="truncate">{f.name}</span>
                  </div>
                  {selectedFolderId === f.id && <Check className="w-4 h-4 shrink-0" />}
                </button>
              ))}
            </div>
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
              تایید انتقال
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
