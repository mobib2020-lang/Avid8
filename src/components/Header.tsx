import React, { useState } from 'react';
import {
  Search,
  Bell,
  User,
  Bot,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Building,
  LogOut,
  UserCheck,
  Package,
  Info,
  CalendarCheck,
  CheckSquare,
  Sparkles,
  MessageSquare,
  Plus,
  Users,
  QrCode,
} from 'lucide-react';
import { AppUser, EquipmentItem, PageId, TaskEvent, HospitalConversation } from '../types';
import { getNotificationsFromTasksAndEvents } from '../utils/workgroupHelpers';

interface HeaderProps {
  currentUser: AppUser;
  allUsers: AppUser[];
  onSwitchUser: (user: AppUser) => void;
  onLogout?: () => void;
  collapsed: boolean;
  onOpenAIChat: () => void;
  equipmentList: EquipmentItem[];
  tasksList?: TaskEvent[];
  conversations?: HospitalConversation[];
  setActivePage: (page: PageId) => void;
  onSelectEquipment: (equipment: EquipmentItem) => void;
  onOpenQrScanner?: () => void;
  onOpenPassportModal?: (equipment: EquipmentItem) => void;
  onSelectConversation?: (convId: string) => void;
  onOpenNewMessageModal?: () => void;
  onNavigateToInventoryWithAction?: (params: {
    initialTab?: 'drafts' | 'inventory';
    initialLayout?: 'grouped' | 'individual' | 'tree';
    initialStatusFilter?: string;
    actionGuidance?: {
      type: 'draft_tagging' | 'low_stock' | 'asset_transfer' | 'purchase_approval';
      title: string;
      description: string;
      targetDraftId?: string;
    } | null;
    openAssetTransferModal?: boolean;
    openQuickRestockModal?: boolean;
  }) => void;
  onUpdateUser?: (updatedUser: AppUser) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers = [],
  onSwitchUser,
  onLogout,
  collapsed = false,
  onOpenAIChat,
  equipmentList = [],
  tasksList = [],
  conversations = [],
  setActivePage,
  onSelectEquipment,
  onOpenQrScanner,
  onOpenPassportModal,
  onSelectConversation,
  onOpenNewMessageModal,
  onNavigateToInventoryWithAction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showMsgDropdown, setShowMsgDropdown] = useState(false);
  const [msgSearchQuery, setMsgSearchQuery] = useState('');

  const userName = currentUser?.name || 'کاربر';
  const roleFa = currentUser?.roleFa || 'کاربر';
  const role = currentUser?.role;

  // Filter user authorized conversations for header
  const userConversations = (conversations || []).filter((c) => {
    if (!currentUser) return false;
    if (currentUser.role === 'hospital_admin') return true;
    if (c.allowedUserIds && c.allowedUserIds.includes(currentUser.id)) return true;
    if (c.type === 'direct' && c.targetUserId === currentUser.id) return true;
    return false;
  });

  const totalUnreadMessages = userConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const filteredHeaderConversations = userConversations.filter(
    (c) =>
      c.title.includes(msgSearchQuery) ||
      (c.lastMessage && c.lastMessage.includes(msgSearchQuery))
  );

  // Search filter
  const searchResults = searchQuery.trim()
    ? equipmentList.filter(
        (eq) =>
          eq.faName.includes(searchQuery) ||
          eq.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          eq.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          eq.department.includes(searchQuery)
      )
    : [];

  // Notifications dynamically derived 100% from real Tasks, Events, and Draft Actions
  const notificationsList = getNotificationsFromTasksAndEvents(
    currentUser,
    tasksList,
    equipmentList
  );

  const notifHeaderTitle =
    role === 'asset_manager'
      ? 'اعلان‌ها و رویدادهای کارگروه اموال و انبار'
      : role === 'finance_manager'
      ? 'اعلان‌ها و رویدادهای کارگروه مالی و بودجه'
      : role === 'procurement_officer'
      ? 'اعلان‌ها و رویدادهای بازرگانی و خرید'
      : role === 'biomedical_engineer' || role === 'support_tech'
      ? 'اعلان‌ها و رویدادهای مهندسی پزشکی'
      : 'اعلان‌ها و رویدادهای کاری بیمارستان';

  return (
    <header
      style={{
        paddingLeft: '24px',
        paddingRight: '24px',
        height: '68px',
      }}
      className={`fixed top-0 left-0 bg-[#f0f4fd]/90 backdrop-blur-md border-b border-slate-200 z-20 transition-all duration-300 flex items-center justify-between shadow-2xs ${
        collapsed ? 'right-20' : 'right-72'
      }`}
    >
      {/* Search Input & Quick Results */}
      <div className="relative w-72 sm:w-96">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute right-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی همه‌چیز (تجهیزات، بخش‌ها، کد اموال)..."
            className="w-full pr-11 pl-4 py-2.5 text-xs font-medium rounded-full bg-white text-slate-800 shadow-xs border border-slate-200/80 focus:border-[#2b64f6] focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Search Results Popover */}
        {searchQuery.trim() && (
          <div className="absolute right-0 top-12 w-full bg-white rounded-3xl shadow-2xl border border-slate-200 p-2 z-50 max-h-80 overflow-y-auto">
            <div className="text-[11px] font-black text-slate-400 px-3 py-1.5 border-b border-slate-100 flex justify-between">
              <span>نتایج جستجو</span>
              <span className="font-mono">{searchResults.length} مورد</span>
            </div>
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectEquipment(item);
                    setActivePage('inventory');
                    setSearchQuery('');
                  }}
                  className="w-full text-right p-2.5 rounded-2xl hover:bg-blue-50/50 flex items-start gap-3 transition-colors border-b border-slate-50 last:border-none cursor-pointer"
                >
                  <div className="p-2 bg-blue-50 text-[#2b64f6] rounded-xl shrink-0 mt-0.5 border border-blue-100">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-black text-xs text-slate-800 truncate">
                        {item.faName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                        {item.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.brand} | {item.department}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center py-4 text-xs text-slate-400">
                تجهیزی با این مشخصات یافت نشد.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right User Actions & Simple Status Display */}
      <div className="flex items-center gap-2.5">
        {/* QR Code Scanner & Quick Passport Lookup Trigger */}
        {onOpenQrScanner && (
          <button
            type="button"
            onClick={onOpenQrScanner}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 hover:text-[#2b64f6] border border-slate-200 shadow-xs transition-all cursor-pointer text-xs font-bold"
            title="اسکنر QR و شناسنامه هوشمند تجهیزات"
          >
            <QrCode className="w-4 h-4 text-[#2b64f6]" />
            <span className="hidden md:inline">اسکن پلاک QR</span>
          </button>
        )}

        {/* AI Assistant Quick Trigger */}
        <button
          onClick={onOpenAIChat}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#2b64f6] to-[#1d52d8] hover:from-[#1d52d8] hover:to-[#1e40af] text-white text-xs font-black shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer border border-blue-400/30"
          title="دستیار هوشمند AI آوید"
        >
          <Bot className="w-4 h-4 text-sky-200" />
          <span className="hidden sm:inline">دستیار هوشمند AI</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </button>

        {/* Messaging Quick-Access Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowMsgDropdown(!showMsgDropdown);
              setShowNotifDropdown(false);
            }}
            className="relative p-2.5 rounded-2xl text-slate-600 hover:bg-white hover:text-slate-900 bg-white/70 border border-slate-200/80 shadow-xs transition-all cursor-pointer flex items-center justify-center"
            title="پیام‌ها و گفت‌وگوهای سازمانی"
          >
            <MessageSquare className="w-4.5 h-4.5 text-slate-600" />
            {totalUnreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-sky-600 text-white rounded-full ring-2 ring-white text-[9px] font-black flex items-center justify-center shadow-xs pointer-events-none">
                {totalUnreadMessages > 9 ? '+۹' : totalUnreadMessages.toLocaleString('fa-IR')}
              </span>
            )}
          </button>

          {showMsgDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMsgDropdown(false)}
              />
              <div className="absolute left-0 top-12 w-88 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-right dir-rtl">
                {/* Dropdown Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#2b64f6] border border-sky-100 flex items-center justify-center font-black">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-black text-xs text-slate-800 block">
                        پیام‌ها و هماهنگی عملیاتی
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {totalUnreadMessages > 0 ? `${totalUnreadMessages} پیام خوانده‌نشده` : 'کلیه پیام‌ها مشاهده شده‌اند'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowMsgDropdown(false);
                      if (onOpenNewMessageModal) {
                        onOpenNewMessageModal();
                      } else {
                        setActivePage('messages');
                      }
                    }}
                    className="p-1.5 rounded-xl bg-sky-50 text-[#2b64f6] hover:bg-sky-100 border border-sky-100 text-xs font-black flex items-center gap-1 cursor-pointer transition-colors"
                    title="شروع پیام جدید"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="text-[10px]">پیام جدید</span>
                  </button>
                </div>

                {/* Search in Dropdown */}
                <div className="relative mb-3">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={msgSearchQuery}
                    onChange={(e) => setMsgSearchQuery(e.target.value)}
                    placeholder="جستجو در پیام‌ها و همکاران..."
                    className="w-full pr-8 pl-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#2b64f6]"
                  />
                </div>

                {/* Recent Conversations List */}
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {filteredHeaderConversations.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 space-y-1">
                      <MessageSquare className="w-6 h-6 text-slate-300 mx-auto" />
                      <p className="text-xs font-black text-slate-600">مکالمه‌ای یافت نشد</p>
                      <p className="text-[10px] text-slate-400">روی «پیام جدید» کلیک فرمایید.</p>
                    </div>
                  ) : (
                    filteredHeaderConversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => {
                          setShowMsgDropdown(false);
                          if (onSelectConversation) {
                            onSelectConversation(conv.id);
                          }
                          setActivePage('messages');
                        }}
                        className={`w-full text-right p-2.5 rounded-2xl border transition-all flex items-start gap-2.5 cursor-pointer group ${
                          conv.unreadCount > 0
                            ? 'bg-sky-50/60 border-sky-200 hover:bg-sky-50'
                            : 'bg-slate-50/70 border-slate-200/60 hover:bg-slate-100/70'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          {conv.type === 'workgroup' ? (
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                              <Users className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-[#2b64f6] text-white flex items-center justify-center text-xs font-black overflow-hidden ring-2 ring-blue-100">
                              {conv.avatar ? (
                                <img src={conv.avatar} alt={conv.title} className="w-full h-full object-cover" />
                              ) : (
                                conv.title.charAt(0)
                              )}
                            </div>
                          )}
                          {conv.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>

                        {/* Title & Preview */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-black text-slate-800 truncate">
                              {conv.title}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold shrink-0">
                              {conv.lastMessageTime}
                            </span>
                          </div>
                          <p className={`text-[11px] truncate mt-0.5 ${conv.unreadCount > 0 ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                            {conv.lastMessage || 'مکالمه بدون پیام'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Dropdown Footer: View All Messages */}
                <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-black">
                  <button
                    onClick={() => {
                      setShowMsgDropdown(false);
                      setActivePage('messages');
                    }}
                    className="text-[#2b64f6] hover:text-[#1d52d8] font-black cursor-pointer text-xs"
                  >
                    مشاهده تمام گفت‌وگوها و پیام‌ها ❯
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              setShowMsgDropdown(false);
            }}
            className="relative p-2.5 rounded-2xl text-slate-600 hover:bg-white hover:text-slate-900 bg-white/70 border border-slate-200/80 shadow-xs transition-all cursor-pointer flex items-center justify-center"
            title={notifHeaderTitle}
          >
            <Bell className="w-4.5 h-4.5 text-slate-600" />
            {notificationsList.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white rounded-full ring-2 ring-white text-[9px] font-black flex items-center justify-center shadow-xs pointer-events-none">
                {notificationsList.length > 9 ? '+۹' : notificationsList.length.toLocaleString('fa-IR')}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifDropdown(false)}
              />
              <div className="absolute left-0 top-12 w-88 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2b64f6] border border-blue-100 flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-black text-xs text-slate-800 block">
                        {notifHeaderTitle}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        مشتق‌شده از وظایف و رویدادهای زنده سیستم
                      </span>
                    </div>
                  </div>
                  <span
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-[10px] text-slate-400 hover:text-slate-700 font-bold cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100"
                  >
                    بستن
                  </span>
                </div>

                <div className="space-y-2.5 max-h-96 overflow-y-auto">
                  {notificationsList.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 space-y-1">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                      <p className="text-xs font-black text-slate-600">تمامی وظایف و رویدادها انجام شده‌اند</p>
                      <p className="text-[11px] text-slate-400">هیچ اعلان یا وظیفه بازی برای کارگروه شما وجود ندارد.</p>
                    </div>
                  ) : (
                    notificationsList.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          setShowNotifDropdown(false);
                          if (n.sourceType === 'draft') {
                            if (onNavigateToInventoryWithAction) {
                              onNavigateToInventoryWithAction({
                                initialTab: 'drafts',
                                actionGuidance: {
                                  type: 'draft_tagging',
                                  title: 'تکمیل پیش‌نویس ناقص اقلام انبار',
                                  description: 'این قلم فاقد اطلاعات کامل یا سریال است. لطفاً فرم پیش‌نویس را تکمیل و نهایی فرمایید.',
                                  targetDraftId: n.targetEquipmentId || n.draftId,
                                },
                              });
                            } else {
                              setActivePage('inventory');
                            }
                          } else if (n.sourceType === 'task') {
                            const taskType = n.task?.type;
                            if (taskType === 'draft_completion' || taskType === 'tagging') {
                              if (onNavigateToInventoryWithAction) {
                                onNavigateToInventoryWithAction({
                                  initialTab: 'drafts',
                                  actionGuidance: {
                                    type: 'draft_tagging',
                                    title: n.title,
                                    description: n.desc,
                                    targetDraftId: n.task?.equipmentCode,
                                  },
                                });
                              } else {
                                setActivePage('inventory');
                              }
                            } else if (taskType === 'stock_check' || taskType === 'inventory_audit') {
                              if (onNavigateToInventoryWithAction) {
                                onNavigateToInventoryWithAction({
                                  initialTab: 'inventory',
                                  initialLayout: 'grouped',
                                });
                              } else {
                                setActivePage('inventory');
                              }
                            } else if (taskType === 'purchase') {
                              setActivePage('purchase_requests');
                            } else if (taskType === 'calibration') {
                              setActivePage('calibration');
                            } else {
                              setActivePage('tasks');
                            }
                          } else {
                            setActivePage('tasks');
                          }
                        }}
                        className={`w-full text-right p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer group ${
                          n.sourceType === 'draft'
                            ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/80'
                            : n.type === 'danger'
                            ? 'bg-rose-50/60 border-rose-200 hover:bg-rose-100/60'
                            : n.type === 'warning'
                            ? 'bg-amber-50/60 border-amber-200 hover:bg-amber-100/60'
                            : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/80'
                        }`}
                      >
                        {n.sourceType === 'draft' ? (
                          <Package className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                        ) : n.type === 'danger' ? (
                          <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                        ) : n.type === 'warning' ? (
                          <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <CheckSquare className="w-4.5 h-4.5 text-[#2b64f6] shrink-0 mt-0.5" />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-black text-slate-800 line-clamp-1">
                              {n.title}
                            </span>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-md font-black shrink-0 ${
                                n.sourceType === 'draft'
                                  ? 'bg-amber-100 text-amber-800'
                                  : n.sourceType === 'task'
                                  ? 'bg-blue-100 text-[#2b64f6]'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {n.sourceType === 'draft'
                                ? 'پیش‌نویس اموال'
                                : n.sourceType === 'task'
                                ? 'وظیفه باز'
                                : 'رویداد'}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                            {n.desc}
                          </p>

                          <div className="mt-2.5 flex items-center justify-between text-[10px]">
                            <span className="text-[#2b64f6] font-black group-hover:underline flex items-center gap-1">
                              <span>انجام اقدام</span>
                              <span className="dir-ltr font-mono">❮</span>
                            </span>
                            <span className="text-slate-400 font-medium">{n.time}</span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <button
                    onClick={() => {
                      setShowNotifDropdown(false);
                      setActivePage('tasks');
                    }}
                    className="text-[#2b64f6] hover:text-[#1d52d8] font-black cursor-pointer"
                  >
                    مشاهده تقویم و فهرست کامل وظایف ❯
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Role Indicator & Switcher in Top Bar */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white hover:bg-slate-50 transition-all border border-slate-200/80 shadow-xs cursor-pointer"
            title="تغییر نقش کاربری / وضعیت حساب"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2b64f6] to-[#1d52d8] text-white flex items-center justify-center font-black text-xs shrink-0 ring-2 ring-blue-100 overflow-hidden">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <span>{userName.charAt(0)}</span>
              )}
            </div>
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-black text-slate-800 leading-tight">
                {userName}
              </span>
              <span className="text-[10px] text-[#2b64f6] font-bold">
                {roleFa}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Quick Role Switch Dropdown */}
          {showRoleDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowRoleDropdown(false)}
              />
              <div className="absolute left-0 top-12 w-72 bg-white rounded-3xl shadow-2xl border border-slate-200 p-3.5 z-50 text-right dir-rtl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
                  <span className="text-xs font-black text-slate-800">نقش‌های کاربری</span>
                  <span className="text-[10px] text-slate-400 font-bold">تغییر حساب</span>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-right p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        u.id === currentUser.id
                          ? 'bg-blue-50 text-[#2b64f6] font-black border border-blue-100'
                          : 'hover:bg-slate-50 text-slate-700 font-bold'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold">{u.name}</span>
                        <span className="text-[10px] text-slate-500">{u.roleFa}</span>
                      </div>
                      {u.id === currentUser.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#2b64f6] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {onLogout && (
                  <div className="pt-2.5 border-t border-slate-100 mt-2.5">
                    <button
                      onClick={() => {
                        setShowRoleDropdown(false);
                        onLogout();
                      }}
                      className="w-full p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-black flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>خروج از حساب</span>
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Direct Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 text-xs font-bold transition-all cursor-pointer"
            title="خروج از حساب کاربری"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">خروج</span>
          </button>
        )}
      </div>
    </header>
  );
};
