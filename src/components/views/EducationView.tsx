import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderPlus,
  UploadCloud,
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  BookOpen,
  Search,
  Grid,
  List as ListIcon,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Home,
  CornerUpLeft,
  Star,
  Download,
  Trash2,
  Edit3,
  FolderSymlink,
  HardDrive,
  Eye,
  Info,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckSquare,
  Square,
  MoreVertical,
  Layers,
  FileSpreadsheet,
  FileBox,
  FileCheck,
  Plus,
} from 'lucide-react';
import { AppUser, EducationItem, EducationFileType } from '../../types';
import { INITIAL_EDUCATION_ITEMS } from '../../data/educationData';
import { EducationFileViewerModal } from './EducationFileViewerModal';
import { EducationNewFolderModal } from './EducationNewFolderModal';
import { EducationUploadModal } from './EducationUploadModal';
import { EducationRenameModal } from './EducationRenameModal';
import { EducationMoveModal } from './EducationMoveModal';
import { toPersianNumber } from '../../utils/taxonomyAnalytics';
import { downloadEducationFile } from '../../utils/downloadHelpers';

interface EducationViewProps {
  currentUser?: AppUser;
}

export const EducationView: React.FC<EducationViewProps> = ({ currentUser }) => {
  // State
  const [items, setItems] = useState<EducationItem[]>(INITIAL_EDUCATION_ITEMS);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [historyStack, setHistoryStack] = useState<(string | null)[]>([null]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [quickFilter, setQuickFilter] = useState<'all' | 'starred' | 'video' | 'pdf' | 'audio'>('all');

  // Modals state
  const [viewingItem, setViewingItem] = useState<EducationItem | null>(null);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [renamingItem, setRenamingItem] = useState<EducationItem | null>(null);
  const [movingItem, setMovingItem] = useState<EducationItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<EducationItem | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Privileged user role check
  const isManagerOrEditor = useMemo(() => {
    if (!currentUser) return true;
    const role = currentUser.role;
    return (
      role === 'hospital_admin' ||
      role === 'biomedical_engineer' ||
      role === 'dept_head' ||
      role === 'asset_manager'
    );
  }, [currentUser]);

  // Current folder object
  const currentFolder = useMemo(() => {
    if (!currentFolderId) return null;
    return items.find((i) => i.id === currentFolderId && i.type === 'folder') || null;
  }, [items, currentFolderId]);

  // Breadcrumbs calculation
  const breadcrumbs = useMemo(() => {
    const crumbs: { id: string | null; name: string }[] = [
      { id: null, name: 'درایو آموزش بیمارستان (D:)' },
    ];

    if (!currentFolderId) return crumbs;

    const pathItems: { id: string; name: string }[] = [];
    let curr: EducationItem | undefined = items.find((i) => i.id === currentFolderId);

    while (curr) {
      pathItems.unshift({ id: curr.id, name: curr.name });
      if (curr.parentId) {
        curr = items.find((i) => i.id === curr?.parentId);
      } else {
        break;
      }
    }

    return [...crumbs, ...pathItems];
  }, [items, currentFolderId]);

  // Navigation handlers
  const navigateToFolder = (folderId: string | null) => {
    if (folderId === currentFolderId) return;
    const newStack = historyStack.slice(0, historyIndex + 1);
    newStack.push(folderId);
    setHistoryStack(newStack);
    setHistoryIndex(newStack.length - 1);
    setCurrentFolderId(folderId);
    setSelectedItemIds([]);
    setActiveMenuId(null);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentFolderId(historyStack[newIndex]);
      setSelectedItemIds([]);
    }
  };

  const handleForward = () => {
    if (historyIndex < historyStack.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentFolderId(historyStack[newIndex]);
      setSelectedItemIds([]);
    }
  };

  const handleUpOneLevel = () => {
    if (currentFolder) {
      navigateToFolder(currentFolder.parentId);
    }
  };

  // Filtered & Sorted items in current view
  const displayedItems = useMemo(() => {
    let list = items;

    // If searching, search across all items in whole LMS drive
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.author?.toLowerCase().includes(q) ||
          item.department?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q))
      );
    } else if (quickFilter !== 'all') {
      // Quick filters across the whole LMS or current view
      if (quickFilter === 'starred') {
        list = list.filter((i) => i.starred);
      } else if (quickFilter === 'video') {
        list = list.filter((i) => i.type === 'video');
      } else if (quickFilter === 'pdf') {
        list = list.filter((i) => i.type === 'pdf' || i.type === 'document');
      } else if (quickFilter === 'audio') {
        list = list.filter((i) => i.type === 'audio');
      }
    } else {
      // Normal folder hierarchy filtering
      list = list.filter((i) => i.parentId === currentFolderId);
    }

    // Sort items: folders always first, then files
    return list.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;

      let compareVal = 0;
      if (sortBy === 'name') {
        compareVal = a.name.localeCompare(b.name, 'fa');
      } else if (sortBy === 'date') {
        compareVal = (a.updatedAt || '').localeCompare(b.updatedAt || '', 'fa');
      } else if (sortBy === 'size') {
        compareVal = (a.sizeBytes || 0) - (b.sizeBytes || 0);
      } else if (sortBy === 'type') {
        compareVal = a.type.localeCompare(b.type);
      }

      return sortOrder === 'asc' ? compareVal : -compareVal;
    });
  }, [items, currentFolderId, searchQuery, quickFilter, sortBy, sortOrder]);

  // Selection handlers
  const handleToggleSelect = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItemIds.length === displayedItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(displayedItems.map((i) => i.id));
    }
  };

  // Actions
  const handleToggleStar = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, starred: !item.starred } : item))
    );
  };

  const handleCreateFolder = (name: string, description?: string) => {
    const newFolder: EducationItem = {
      id: `f-${Date.now()}`,
      name,
      type: 'folder',
      parentId: currentFolderId,
      createdAt: '۱۴۰۴/۰۲/۲۸',
      updatedAt: '۱۴۰۴/۰۲/۲۸',
      author: currentUser?.name || 'کاربر سیستم',
      authorRole: currentUser?.roleFa || 'کارشناس',
      department: currentUser?.department || 'مهندسی پزشکی',
      description,
      itemCount: 0,
    };
    setItems((prev) => [newFolder, ...prev]);
  };

  const handleUploadFile = (newItem: Omit<EducationItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const fileItem: EducationItem = {
      ...newItem,
      id: `doc-${Date.now()}`,
      createdAt: '۱۴۰۴/۰۲/۲۸',
      updatedAt: '۱۴۰۴/۰۲/۲۸',
    };
    setItems((prev) => [fileItem, ...prev]);
  };

  const handleRename = (id: string, newName: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: newName, updatedAt: '۱۴۰۴/۰۲/۲۸' } : item))
    );
  };

  const handleMove = (id: string, targetFolderId: string | null) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, parentId: targetFolderId, updatedAt: '۱۴۰۴/۰۲/۲۸' } : item
      )
    );
    setSelectedItemIds([]);
  };

  const handleDelete = (id: string) => {
    // Delete item and all its children if it's a folder
    setItems((prev) => {
      const idsToDelete = new Set<string>([id]);
      let addedMore = true;
      while (addedMore) {
        addedMore = false;
        prev.forEach((item) => {
          if (item.parentId && idsToDelete.has(item.parentId) && !idsToDelete.has(item.id)) {
            idsToDelete.add(item.id);
            addedMore = true;
          }
        });
      }
      return prev.filter((item) => !idsToDelete.has(item.id));
    });
    setSelectedItemIds((prev) => prev.filter((item) => item !== id));
    setDeleteConfirmItem(null);
  };

  const handleDownload = (item: EducationItem) => {
    downloadEducationFile(item);
  };

  // Helper for File Type Icon
  const renderItemIcon = (type: EducationFileType, sizeClass = 'w-6 h-6') => {
    switch (type) {
      case 'folder':
        return <Folder className={`${sizeClass} text-amber-500 fill-amber-400/30`} />;
      case 'pdf':
        return <FileText className={`${sizeClass} text-rose-600`} />;
      case 'video':
        return <Video className={`${sizeClass} text-indigo-600`} />;
      case 'audio':
        return <Music className={`${sizeClass} text-amber-600`} />;
      case 'image':
        return <ImageIcon className={`${sizeClass} text-emerald-600`} />;
      default:
        return <BookOpen className={`${sizeClass} text-sky-600`} />;
    }
  };

  // Stats calculation
  const totalFilesCount = items.filter((i) => i.type !== 'folder').length;
  const totalFoldersCount = items.filter((i) => i.type === 'folder').length;

  return (
    <div className="space-y-4 font-sans text-right dir-rtl pb-12">
      {/* Top Banner / Breadcrumb & Controls Window */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
        {/* Title and Permission Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-800">
                  آموزش و توانمندسازی (LMS داخلی)
                </h1>
                <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-md text-[10px] font-extrabold">
                  سامانه مدیریت اسناد آموزشی
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                مخزن فایل‌های استاندارد کاربری تجهیزات، پروتکل‌های ایمنی، ویدیوهای بالینی، کنترل عفونت و چک‌لیست‌های بیمارستان
              </p>
            </div>
          </div>

          {/* Right Status Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600">سطح دسترسی:</span>
              <span className="font-bold text-slate-800">
                {isManagerOrEditor ? 'مدیریت و بارگذاری' : 'مشاهده و مطالعه'}
              </span>
            </div>
          </div>
        </div>

        {/* Windows Explorer Style Navigation & Path Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
          {/* Back, Forward, Up, Home Buttons */}
          <div className="flex items-center gap-1 shrink-0 bg-slate-50 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={handleBack}
              disabled={historyIndex === 0}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                historyIndex > 0
                  ? 'hover:bg-slate-200 text-slate-700'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
              title="بازگشت (Back)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleForward}
              disabled={historyIndex >= historyStack.length - 1}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                historyIndex < historyStack.length - 1
                  ? 'hover:bg-slate-200 text-slate-700'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
              title="جلو (Forward)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleUpOneLevel}
              disabled={!currentFolderId}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                currentFolderId
                  ? 'hover:bg-slate-200 text-slate-700'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
              title="یک سطح بالاتر (Up)"
            >
              <CornerUpLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateToFolder(null)}
              className="p-2 rounded-xl hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="صفحه اصلی آموزش (Home)"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>

          {/* Breadcrumb Path Address Bar */}
          <div className="flex-1 flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl overflow-x-auto text-xs">
            <HardDrive className="w-4 h-4 text-sky-600 shrink-0" />
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-300 select-none">/</span>}
                <button
                  onClick={() => navigateToFolder(crumb.id)}
                  className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    idx === breadcrumbs.length - 1
                      ? 'font-extrabold text-slate-900 bg-white shadow-2xs border border-slate-200/80'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Live Search Input */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در تمام آموزش‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:border-sky-500 focus:bg-white transition-all text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[10px] text-slate-400 hover:text-slate-600 absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action Toolbar Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Action Buttons (New Folder, Upload, Batch actions) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {isManagerOrEditor && (
              <>
                <button
                  onClick={() => setIsNewFolderOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>پوشه جدید</span>
                </button>

                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>بارگذاری فایل</span>
                </button>
              </>
            )}

            {/* Selection actions if items selected */}
            {selectedItemIds.length > 0 && (
              <div className="flex items-center gap-1 bg-sky-50 border border-sky-200 px-2 py-1 rounded-xl">
                <span className="text-[11px] font-bold text-sky-800 px-1">
                  {toPersianNumber(selectedItemIds.length)} قلم انتخاب شده
                </span>

                {selectedItemIds.length === 1 && (
                  <>
                    <button
                      onClick={() => {
                        const target = items.find((i) => i.id === selectedItemIds[0]);
                        if (target) {
                          if (target.type === 'folder') navigateToFolder(target.id);
                          else setViewingItem(target);
                        }
                      }}
                      className="p-1.5 hover:bg-white rounded-lg text-sky-700 cursor-pointer"
                      title="مشاهده / باز کردن"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {isManagerOrEditor && (
                      <>
                        <button
                          onClick={() => {
                            const target = items.find((i) => i.id === selectedItemIds[0]);
                            if (target) setRenamingItem(target);
                          }}
                          className="p-1.5 hover:bg-white rounded-lg text-indigo-700 cursor-pointer"
                          title="تغییر نام"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            const target = items.find((i) => i.id === selectedItemIds[0]);
                            if (target) setMovingItem(target);
                          }}
                          className="p-1.5 hover:bg-white rounded-lg text-sky-700 cursor-pointer"
                          title="انتقال"
                        >
                          <FolderSymlink className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </>
                )}

                {isManagerOrEditor && (
                  <button
                    onClick={() => {
                      if (selectedItemIds.length === 1) {
                        const target = items.find((i) => i.id === selectedItemIds[0]);
                        if (target) setDeleteConfirmItem(target);
                      } else {
                        // Batch delete
                        setItems((prev) => prev.filter((i) => !selectedItemIds.includes(i.id)));
                        setSelectedItemIds([]);
                      }
                    }}
                    className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-600 cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setSelectedItemIds([])}
                  className="text-[10px] text-slate-500 hover:text-slate-800 px-1 cursor-pointer font-bold"
                >
                  لغو انتخاب
                </button>
              </div>
            )}
          </div>

          {/* View Switcher, Sort and Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick type filter */}
            <div className="flex items-center bg-slate-50 border border-slate-200 p-0.5 rounded-xl text-[11px] font-bold">
              <button
                onClick={() => setQuickFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  quickFilter === 'all' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                }`}
              >
                همه
              </button>
              <button
                onClick={() => setQuickFilter('starred')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  quickFilter === 'starred' ? 'bg-amber-50 text-amber-800 shadow-2xs' : 'text-slate-500'
                }`}
              >
                <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                <span>نشان‌دار</span>
              </button>
              <button
                onClick={() => setQuickFilter('video')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  quickFilter === 'video' ? 'bg-indigo-50 text-indigo-800 shadow-2xs' : 'text-slate-500'
                }`}
              >
                ویدیوها
              </button>
              <button
                onClick={() => setQuickFilter('pdf')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  quickFilter === 'pdf' ? 'bg-rose-50 text-rose-800 shadow-2xs' : 'text-slate-500'
                }`}
              >
                اسناد و PDF
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl text-xs text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-hidden text-slate-800 font-bold cursor-pointer"
              >
                <option value="name">نام قلم</option>
                <option value="date">تاریخ ویرایش</option>
                <option value="size">حجم فایل</option>
                <option value="type">نوع فایل</option>
              </select>
              <button
                onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                className="px-1 text-[10px] text-slate-500 font-bold hover:text-slate-900 cursor-pointer"
                title={sortOrder === 'asc' ? 'صعودی' : 'نزولی'}
              >
                {sortOrder === 'asc' ? '▲' : '▼'}
              </button>
            </div>

            {/* Grid / List Mode */}
            <div className="flex items-center bg-slate-50 border border-slate-200 p-0.5 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-2xs text-sky-600'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="نمای شبکه‌ای (آیکون‌های بزرگ)"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white shadow-2xs text-sky-600'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="نمای لیستی (جدول تفصیلی)"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Explorer Workspace: Left Sidebar + File Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
        {/* Side Tree & Quick Access Panel */}
        <div className="lg:col-span-1 flex flex-col">
          {/* Quick Access Menu Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between h-full">
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                <HardDrive className="w-4 h-4 text-sky-600" />
                <span>پوشه‌های اصلی آموزش</span>
              </h3>

              <div className="space-y-1 text-xs overflow-y-auto max-h-[380px] scrollbar-thin">
                {/* Root Directory Button */}
                <button
                  onClick={() => navigateToFolder(null)}
                  className={`w-full text-right p-2 rounded-xl font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    currentFolderId === null
                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-sky-600" />
                    <span>صفحه اصلی (درایو D:)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {toPersianNumber(items.filter((i) => i.parentId === null).length)}
                  </span>
                </button>

                {/* Level 1 Folders list */}
                {items
                  .filter((i) => i.type === 'folder' && i.parentId === null)
                  .map((folder) => {
                    const isSelected = currentFolderId === folder.id;
                    const childCount = items.filter((child) => child.parentId === folder.id).length;
                    return (
                      <button
                        key={folder.id}
                        onClick={() => navigateToFolder(folder.id)}
                        className={`w-full text-right p-2 rounded-xl text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{folder.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {toPersianNumber(childCount)}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Storage Quota Widget */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5 mt-4">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">فضای دیسک آموزش:</span>
                <span className="font-bold text-slate-800 font-mono">۱.۴ GB / ۱۰ GB</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full w-[14%] rounded-full" />
              </div>
              <span className="text-[10px] text-slate-400 block text-left font-mono dir-ltr">
                ۱۴٪ استفاده‌شده (۸.۶ GB آزاد)
              </span>
            </div>
          </div>
        </div>

        {/* Right Main File/Folder Explorer Canvas */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-4 sm:p-6 min-h-[460px] flex flex-col justify-between h-full">
            {/* Header info inside current directory */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  {searchQuery ? `نتایج جستجو برای: «${searchQuery}»` : currentFolder?.name || 'ریشه درایو آموزش'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ({toPersianNumber(displayedItems.length)} قلم)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-[11px] text-sky-700 hover:text-sky-900 font-bold cursor-pointer"
                >
                  {selectedItemIds.length === displayedItems.length && displayedItems.length > 0
                    ? 'لغو انتخاب همه'
                    : 'انتخاب همه'}
                </button>
              </div>
            </div>

            {/* Empty State */}
            {displayedItems.length === 0 ? (
              <div className="py-16 text-center space-y-3 my-auto">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Folder className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">این پوشه خالی است</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  هنوز فایلی در این شاخه بارگذاری نشده است. می‌توانید با استفاده از دکمه‌های بالا پوشه یا محتوای جدید اضافه کنید.
                </p>
                {isManagerOrEditor && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => setIsUploadOpen(true)}
                      className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-500 transition-all cursor-pointer shadow-xs"
                    >
                      بارگذاری فایل در این پوشه
                    </button>
                  </div>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              /* ========================================================================= */
              /* GRID VIEW (Desktop Icons Experience) */
              /* ========================================================================= */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 mb-auto">
                {displayedItems.map((item) => {
                  const isSelected = selectedItemIds.includes(item.id);
                  const isFolder = item.type === 'folder';

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isFolder) navigateToFolder(item.id);
                        else setViewingItem(item);
                      }}
                      className={`group relative rounded-2xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between gap-3 select-none ${
                        isSelected
                          ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-200 shadow-sm'
                          : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Top row: Checkbox, Icon, Star & Actions */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => handleToggleSelect(item.id, e)}
                            className="text-slate-400 hover:text-sky-600 transition-colors cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-sky-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                            )}
                          </button>

                          <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
                            {renderItemIcon(item.type, 'w-5 h-5')}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStar(item.id);
                            }}
                            className="p-1 text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
                            title={item.starred ? 'حذف از نشان‌دارها' : 'نشان‌دار کردن'}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                item.starred ? 'text-amber-400 fill-amber-400' : ''
                              }`}
                            />
                          </button>

                          {/* Quick context dropdown */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === item.id ? null : item.id);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenuId === item.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute left-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-20 space-y-0.5 text-xs text-right animate-in fade-in zoom-in-95 duration-100"
                              >
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    if (isFolder) navigateToFolder(item.id);
                                    else setViewingItem(item);
                                  }}
                                  className="w-full text-right p-2 rounded-xl hover:bg-slate-100 font-bold text-slate-700 flex items-center gap-2 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-sky-600" />
                                  <span>{isFolder ? 'باز کردن پوشه' : 'مشاهده و مطالعه'}</span>
                                </button>

                                {!isFolder && (
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      handleDownload(item);
                                    }}
                                    className="w-full text-right p-2 rounded-xl hover:bg-slate-100 font-bold text-slate-700 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>دانلود فایل</span>
                                  </button>
                                )}

                                {isManagerOrEditor && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        setRenamingItem(item);
                                      }}
                                      className="w-full text-right p-2 rounded-xl hover:bg-slate-100 font-bold text-slate-700 flex items-center gap-2 cursor-pointer"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                                      <span>تغییر نام</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        setMovingItem(item);
                                      }}
                                      className="w-full text-right p-2 rounded-xl hover:bg-slate-100 font-bold text-slate-700 flex items-center gap-2 cursor-pointer"
                                    >
                                      <FolderSymlink className="w-3.5 h-3.5 text-sky-600" />
                                      <span>انتقال / جابجایی</span>
                                    </button>

                                    <div className="border-t border-slate-100 my-1"></div>

                                    <button
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        setDeleteConfirmItem(item);
                                      }}
                                      className="w-full text-right p-2 rounded-xl hover:bg-rose-50 font-bold text-rose-600 flex items-center gap-2 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                      <span>حذف قلم</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Title & Description */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                          {item.name}
                        </h4>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Bottom Footer Row of Card */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-mono">
                          {isFolder
                            ? `${toPersianNumber(items.filter((i) => i.parentId === item.id).length)} قلم`
                            : item.size || 'سند'}
                        </span>

                        <span className="font-sans text-slate-500 truncate max-w-[110px]">
                          {item.department || item.author}
                        </span>

                        <span className="font-mono">{item.updatedAt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ========================================================================= */
              /* LIST / TABLE VIEW (Detailed View) */
              /* ========================================================================= */
              <div className="overflow-x-auto mb-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedItemIds.length === displayedItems.length && displayedItems.length > 0}
                          onChange={handleSelectAll}
                          className="rounded text-sky-600 cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-3 min-w-[240px]">نام قلم / فایل</th>
                      <th className="py-2.5 px-3 min-w-[100px]">نوع</th>
                      <th className="py-2.5 px-3 min-w-[90px] text-center">حجم</th>
                      <th className="py-2.5 px-3 min-w-[110px] text-center">تاریخ ویرایش</th>
                      <th className="py-2.5 px-3 min-w-[130px]">ایجادکننده / بخش</th>
                      <th className="py-2.5 px-3 min-w-[80px] text-center">بازدید</th>
                      <th className="py-2.5 px-3 min-w-[100px] text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedItems.map((item) => {
                      const isSelected = selectedItemIds.includes(item.id);
                      const isFolder = item.type === 'folder';

                      return (
                        <tr
                          key={item.id}
                          onClick={() => {
                            if (isFolder) navigateToFolder(item.id);
                            else setViewingItem(item);
                          }}
                          className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                            isSelected ? 'bg-sky-50/60' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleToggleSelect(item.id)}
                              className="rounded text-sky-600 cursor-pointer"
                            />
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="shrink-0">{renderItemIcon(item.type, 'w-4 h-4')}</div>
                              <span className="font-bold text-slate-800 line-clamp-1">{item.name}</span>
                              {item.starred && (
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-slate-500">
                            {isFolder ? 'پوشه' : item.type === 'pdf' ? 'کتابچه PDF' : item.type === 'video' ? 'ویدیو' : item.type === 'audio' ? 'صوت' : 'سند'}
                          </td>

                          <td className="py-3 px-3 text-center font-mono text-slate-500 text-[11px]">
                            {isFolder
                              ? `${toPersianNumber(items.filter((i) => i.parentId === item.id).length)} قلم`
                              : item.size || '—'}
                          </td>

                          <td className="py-3 px-3 text-center font-mono text-slate-500 text-[11px]">
                            {item.updatedAt}
                          </td>

                          <td className="py-3 px-3 text-slate-600">
                            <div className="truncate max-w-[140px]" title={item.author}>
                              <span className="font-bold">{item.author}</span>
                              <span className="text-[10px] text-slate-400 block">{item.department}</span>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center font-mono text-slate-500 text-[11px]">
                            {toPersianNumber(item.viewCount || 0)}
                          </td>

                          <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  if (isFolder) navigateToFolder(item.id);
                                  else setViewingItem(item);
                                }}
                                className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                                title="مشاهده"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {!isFolder && (
                                <button
                                  onClick={() => handleDownload(item)}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                                  title="دانلود"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {isManagerOrEditor && (
                                <button
                                  onClick={() => setDeleteConfirmItem(item)}
                                  className="p-1 hover:bg-rose-50 rounded text-rose-600 cursor-pointer"
                                  title="حذف"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom Explorer Status Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span>
                  مجموع: {toPersianNumber(totalFoldersCount)} پوشه و {toPersianNumber(totalFilesCount)} فایل آموزشی
                </span>
                <span>•</span>
                <span>
                  در این شاخه: {toPersianNumber(displayedItems.length)} قلم
                </span>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <span>سامانه آموزشی آوید • Avid MedEquip LMS Explorer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. File / Document Viewer Modal */}
      {viewingItem && (
        <EducationFileViewerModal
          item={viewingItem}
          onClose={() => setViewingItem(null)}
          onToggleStar={handleToggleStar}
        />
      )}

      {/* 2. New Folder Modal */}
      {isNewFolderOpen && (
        <EducationNewFolderModal
          currentFolderName={currentFolder?.name || 'صفحه اصلی آموزش'}
          onClose={() => setIsNewFolderOpen(false)}
          onCreateFolder={handleCreateFolder}
        />
      )}

      {/* 3. Upload File Modal */}
      {isUploadOpen && (
        <EducationUploadModal
          currentFolderName={currentFolder?.name || 'صفحه اصلی آموزش'}
          currentFolderId={currentFolderId}
          currentUser={currentUser}
          onClose={() => setIsUploadOpen(false)}
          onUpload={handleUploadFile}
        />
      )}

      {/* 4. Rename Modal */}
      {renamingItem && (
        <EducationRenameModal
          item={renamingItem}
          onClose={() => setRenamingItem(null)}
          onRename={handleRename}
        />
      )}

      {/* 5. Move Modal */}
      {movingItem && (
        <EducationMoveModal
          item={movingItem}
          allItems={items}
          onClose={() => setMovingItem(null)}
          onMove={handleMove}
        />
      )}

      {/* 6. Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 dir-rtl font-sans animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-right">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-800">حذف قلم آموزشی</h3>
              <p className="text-xs text-slate-500">
                آیا از حذف «{deleteConfirmItem.name}» اطمینان دارید؟
                {deleteConfirmItem.type === 'folder' && ' تمام فایل‌ها و زیرپوشه‌های درون آن نیز حذف خواهند شد.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmItem.id)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                تایید و حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
