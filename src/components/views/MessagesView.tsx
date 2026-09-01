import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Send,
  Paperclip,
  FileText,
  Package,
  ShoppingCart,
  AlertTriangle,
  Award,
  ListTodo,
  BookOpen,
  Users,
  User,
  Star,
  Check,
  CheckCheck,
  Phone,
  Mail,
  Info,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  FileSpreadsheet,
  Film,
  Download,
  Eye,
  Building,
  Shield,
  Clock,
  Pin,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  FileCheck2,
} from 'lucide-react';
import {
  AppUser,
  PageId,
  HospitalConversation,
  HospitalMessage,
  MessageRecordAttachment,
  MessageFileAttachment,
  EquipmentItem,
  PurchaseRequest,
  FailureReport,
  CalibrationRecord,
  TaskEvent,
} from '../../types';
import { RecordPickerModal } from '../messages/RecordPickerModal';
import { NewMessageModal } from '../messages/NewMessageModal';
import { FilePreviewModal } from '../messages/FilePreviewModal';

interface MessagesViewProps {
  currentUser: AppUser;
  allUsers: AppUser[];
  conversations: HospitalConversation[];
  messages: HospitalMessage[];
  onSendMessage: (conversationId: string, text: string, recordAttachment?: MessageRecordAttachment, fileAttachment?: MessageFileAttachment) => void;
  onToggleStarMessage: (messageId: string) => void;
  onMarkAsRead: (conversationId: string) => void;
  onStartNewConversation: (target: { type: 'direct' | 'workgroup'; targetUserId?: string; workgroupId?: string; title: string; department?: string; initialRecord?: MessageRecordAttachment }) => string;
  onNavigateToRecord: (targetPage: PageId, recordId?: string) => void;
  selectedConversationId?: string;
  equipmentList?: EquipmentItem[];
  purchaseRequests?: PurchaseRequest[];
  failureReports?: FailureReport[];
  calibrations?: CalibrationRecord[];
  tasksList?: TaskEvent[];
  initialRecordToAttach?: MessageRecordAttachment | null;
  onClearInitialRecord?: () => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  currentUser,
  allUsers = [],
  conversations = [],
  messages = [],
  onSendMessage,
  onToggleStarMessage,
  onMarkAsRead,
  onStartNewConversation,
  onNavigateToRecord,
  selectedConversationId,
  equipmentList = [],
  purchaseRequests = [],
  failureReports = [],
  calibrations = [],
  tasksList = [],
  initialRecordToAttach,
  onClearInitialRecord,
}) => {
  // State
  const [activeConvId, setActiveConvId] = useState<string>(
    selectedConversationId || (conversations.length > 0 ? conversations[0].id : '')
  );
  const [conversationFilter, setConversationFilter] = useState<'all' | 'workgroups' | 'direct' | 'unread' | 'starred'>('all');
  const [convSearchQuery, setConvSearchQuery] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [onlyStarredInChat, setOnlyStarredInChat] = useState(false);

  // Modals & Drawers
  const [showNewMsgModal, setShowNewMsgModal] = useState(false);
  const [showRecordPicker, setShowRecordPicker] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [previewFile, setPreviewFile] = useState<MessageFileAttachment | null>(null);

  // Message Composer State
  const [messageInput, setMessageInput] = useState('');
  const [attachedRecord, setAttachedRecord] = useState<MessageRecordAttachment | null>(
    initialRecordToAttach || null
  );
  const [attachedFile, setAttachedFile] = useState<MessageFileAttachment | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When initialRecordToAttach changes from outside (e.g. contextual messaging)
  useEffect(() => {
    if (initialRecordToAttach) {
      setAttachedRecord(initialRecordToAttach);
      if (onClearInitialRecord) {
        onClearInitialRecord();
      }
    }
  }, [initialRecordToAttach, onClearInitialRecord]);

  // When selectedConversationId changes from outside
  useEffect(() => {
    if (selectedConversationId && selectedConversationId !== activeConvId) {
      setActiveConvId(selectedConversationId);
    }
  }, [selectedConversationId]);

  // Mark as read when active conversation changes
  useEffect(() => {
    if (activeConvId) {
      onMarkAsRead(activeConvId);
    }
  }, [activeConvId]);

  // Scroll to bottom of message list on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConvId]);

  // Filter conversations for the current user (respecting access permissions)
  const userAllowedConversations = conversations.filter((c) => {
    // Hospital admin sees all
    if (currentUser.role === 'hospital_admin') return true;
    // Check allowedUserIds
    if (c.allowedUserIds && c.allowedUserIds.includes(currentUser.id)) return true;
    // For direct chats, if targetUserId is current user or user created it
    if (c.type === 'direct' && c.targetUserId === currentUser.id) return true;
    return false;
  });

  // Filter conversations by category tab & search query
  const filteredConversations = userAllowedConversations.filter((c) => {
    // Search match
    const matchesSearch =
      c.title.includes(convSearchQuery) ||
      (c.lastMessage && c.lastMessage.includes(convSearchQuery)) ||
      (c.targetUserDepartment && c.targetUserDepartment.includes(convSearchQuery)) ||
      (c.targetUserRoleFa && c.targetUserRoleFa.includes(convSearchQuery));

    if (!matchesSearch) return false;

    if (conversationFilter === 'workgroups') return c.type === 'workgroup';
    if (conversationFilter === 'direct') return c.type === 'direct';
    if (conversationFilter === 'unread') return c.unreadCount > 0;
    if (conversationFilter === 'starred') {
      // check if has starred messages
      return messages.some((m) => m.conversationId === c.id && m.isStarred);
    }
    return true;
  });

  const activeConversation = userAllowedConversations.find((c) => c.id === activeConvId);

  // Messages of the active conversation
  const activeMessages = messages
    .filter((m) => m.conversationId === activeConvId)
    .filter((m) => {
      if (onlyStarredInChat && !m.isStarred) return false;
      if (chatSearchQuery.trim()) {
        const query = chatSearchQuery.toLowerCase();
        const inText = m.text.toLowerCase().includes(query);
        const inRecord = m.recordAttachment?.title.toLowerCase().includes(query) || m.recordAttachment?.code?.toLowerCase().includes(query);
        const inFile = m.fileAttachment?.name.toLowerCase().includes(query);
        return inText || inRecord || inFile;
      }
      return true;
    });

  // Shared files in active conversation
  const sharedFilesInActiveConv = messages
    .filter((m) => m.conversationId === activeConvId && m.fileAttachment)
    .map((m) => ({ file: m.fileAttachment!, sender: m.senderName, date: m.createdAt }));

  // Starred messages in active conversation
  const starredInActiveConv = messages.filter(
    (m) => m.conversationId === activeConvId && m.isStarred
  );

  // Shared records in active conversation
  const sharedRecordsInActiveConv = messages
    .filter((m) => m.conversationId === activeConvId && m.recordAttachment)
    .map((m) => ({ record: m.recordAttachment!, sender: m.senderName, date: m.createdAt }));

  // Handle Send Message
  const handleSend = () => {
    if (!messageInput.trim() && !attachedRecord && !attachedFile) return;
    if (!activeConvId) return;

    onSendMessage(
      activeConvId,
      messageInput.trim(),
      attachedRecord || undefined,
      attachedFile || undefined
    );

    setMessageInput('');
    setAttachedRecord(null);
    setAttachedFile(null);
  };

  // Handle KeyDown on textarea (Enter to send, Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle Mock File Attachment from input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let type: MessageFileAttachment['type'] = 'other';
      if (ext === 'pdf') type = 'pdf';
      else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) type = 'image';
      else if (['mp4', 'mkv', 'avi'].includes(ext || '')) type = 'video';
      else if (['mp3', 'wav', 'ogg'].includes(ext || '')) type = 'audio';
      else if (['doc', 'docx'].includes(ext || '')) type = 'doc';
      else if (['xls', 'xlsx'].includes(ext || '')) type = 'sheet';

      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setAttachedFile({
        id: `att-${Date.now()}`,
        name: file.name,
        size: `${sizeMB} مگابایت`,
        type,
      });
    }
  };

  // Quick preset sample attachment if user clicks attach file button
  const handleQuickAttachPreset = (type: 'pdf' | 'doc' | 'sheet' | 'image') => {
    const presets: Record<string, MessageFileAttachment> = {
      pdf: {
        id: `att-${Date.now()}`,
        name: 'Service_Manual_Puritan_Bennett_840.pdf',
        size: '۴.۲ مگابایت',
        type: 'pdf',
      },
      doc: {
        id: `att-${Date.now()}`,
        name: 'SOP_Calibration_Protocol_Avid.docx',
        size: '۱.۱ مگابایت',
        type: 'doc',
      },
      sheet: {
        id: `att-${Date.now()}`,
        name: 'ICU_Equipment_Maintenance_Checklist.xlsx',
        size: '۶۵۰ کیلوبایت',
        type: 'sheet',
      },
      image: {
        id: `att-${Date.now()}`,
        name: 'Ventilator_Oxygen_Regulator_Error_Photo.jpg',
        size: '۲.۴ مگابایت',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
      },
    };
    setAttachedFile(presets[type]);
  };

  // Helper for record icon
  const getRecordIcon = (type: MessageRecordAttachment['type']) => {
    switch (type) {
      case 'equipment':
      case 'inventory':
        return <Package className="w-4 h-4 text-sky-600" />;
      case 'failure':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'purchase_request':
        return <ShoppingCart className="w-4 h-4 text-emerald-600" />;
      case 'calibration':
        return <Award className="w-4 h-4 text-amber-600" />;
      case 'task':
        return <ListTodo className="w-4 h-4 text-indigo-600" />;
      case 'education':
        return <BookOpen className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  // Helper for record color theme
  const getRecordBadgeClass = (color?: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'rose':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'purple':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-sky-50 text-sky-800 border-sky-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-100px)] space-y-3 pb-1 dir-rtl overflow-hidden">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1d52d8] via-[#2b64f6] to-sky-700 rounded-2xl p-3.5 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-inner shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight">پیام‌ها و هماهنگی عملیاتی بیمارستان</h1>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                ارتباطات یکپارچه سازمانی
              </span>
            </div>
            <p className="text-[11px] text-sky-100/90 mt-0.5 line-clamp-1">
              گفت‌وگو با همکاران و کارگروه‌ها، اشتراک‌گذاری اسناد فنی و ارجاع مستقیم به رکوردهای تجهیزات، خرید و خرابی
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowNewMsgModal(true)}
          className="px-3.5 py-2 bg-white text-[#1d52d8] hover:bg-sky-50 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>شروع پیام جدید</span>
        </button>
      </div>

      {/* Main Two-Column Messenger Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-1 min-h-0">
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* LEFT COLUMN: CONVERSATION LIST & SEARCH              */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="w-80 md:w-96 border-l border-slate-200 flex flex-col bg-slate-50/70 shrink-0 h-full overflow-hidden">
          {/* Top Search & Filter Bar */}
          <div className="p-3.5 border-b border-slate-200 space-y-2.5 bg-white shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={convSearchQuery}
                onChange={(e) => setConvSearchQuery(e.target.value)}
                placeholder="جستجو در گفت‌وگوها، کارگروه‌ها..."
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              {[
                { id: 'all', label: 'همه' },
                { id: 'workgroups', label: 'کارگروه‌ها' },
                { id: 'direct', label: 'افراد' },
                { id: 'unread', label: 'خوانده‌نشده' },
                { id: 'starred', label: 'نشان‌دار' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setConversationFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    conversationFilter === tab.id
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1.5 space-y-0.5">
            {filteredConversations.length === 0 ? (
              <div className="py-16 text-center text-slate-400 p-4">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">گفت‌وگویی یافت نشد</p>
                <p className="text-[11px] text-slate-400 mt-0.5">برای آغاز مکاتبه روی «شروع پیام جدید» کلیک کنید.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                const isWorkgroup = conv.type === 'workgroup';

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 relative ${
                      isActive
                        ? 'bg-sky-50/90 border border-sky-200/80 shadow-xs'
                        : 'hover:bg-white border border-transparent'
                    }`}
                  >
                    {/* Avatar / Icon */}
                    <div className="relative shrink-0">
                      {isWorkgroup ? (
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          <Users className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-600 to-[#1d52d8] text-white flex items-center justify-center font-bold text-sm overflow-hidden ring-2 ring-white shadow-xs">
                          {conv.avatar ? (
                            <img src={conv.avatar} alt={conv.title} className="w-full h-full object-cover" />
                          ) : (
                            conv.title.charAt(0)
                          )}
                        </div>
                      )}
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full ring-2 ring-white text-[9px] font-black flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Content Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`text-xs truncate ${isActive ? 'font-black text-sky-950' : 'font-bold text-slate-800'}`}>
                            {conv.title}
                          </span>
                          {conv.isPinned && <Pin className="w-3 h-3 text-sky-600 shrink-0 rotate-45" />}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      {/* Subtitle / Role */}
                      <p className="text-[10px] text-sky-700 font-medium truncate mb-1">
                        {isWorkgroup ? `${conv.workgroupMembersCount} عضو فعال` : `${conv.targetUserRoleFa || ''} • ${conv.targetUserDepartment || ''}`}
                      </p>

                      {/* Last message text preview */}
                      <p className={`text-[11px] truncate leading-tight ${conv.unreadCount > 0 ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                        {conv.lastMessage || 'مکالمه شروع شده است...'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* RIGHT COLUMN: ACTIVE CHAT & COMPOSER                 */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col bg-white min-w-0 h-full overflow-hidden min-h-0 relative">
            {/* Active Conversation Top Bar */}
            <div className="p-3.5 px-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  {activeConversation.type === 'workgroup' ? (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      <Users className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-600 to-[#1d52d8] text-white flex items-center justify-center font-bold text-sm overflow-hidden ring-2 ring-sky-100 shadow-xs">
                      {activeConversation.avatar ? (
                        <img src={activeConversation.avatar} alt={activeConversation.title} className="w-full h-full object-cover" />
                      ) : (
                        activeConversation.title.charAt(0)
                      )}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-slate-800 truncate">{activeConversation.title}</h2>
                    {activeConversation.type === 'workgroup' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 shrink-0">
                        کارگروه سازمانی
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 shrink-0">
                        {activeConversation.targetUserRoleFa}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {activeConversation.type === 'workgroup'
                      ? `${activeConversation.department} • ${activeConversation.workgroupMembersCount} عضو مجاز`
                      : `${activeConversation.targetUserDepartment} • کد پرسنلی: ${activeConversation.targetUserPersonnelCode || '-'}`}
                  </p>
                </div>
              </div>

              {/* Chat Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Starred filter button */}
                <button
                  onClick={() => setOnlyStarredInChat(!onlyStarredInChat)}
                  title={onlyStarredInChat ? 'نمایش همه پیام‌ها' : 'نمایش فقط پیام‌های مهم و نشان‌دار'}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    onlyStarredInChat
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Star className={`w-4 h-4 ${onlyStarredInChat ? 'fill-amber-500 text-amber-500' : ''}`} />
                </button>

                {/* Search in chat toggle */}
                <button
                  onClick={() => setShowChatSearch(!showChatSearch)}
                  title="جستجو در این گفت‌وگو"
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    showChatSearch
                      ? 'bg-sky-100 border-sky-300 text-sky-800'
                      : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Search className="w-4 h-4" />
                </button>

                {/* Info Panel toggle */}
                <button
                  onClick={() => setShowInfoPanel(!showInfoPanel)}
                  title="اطلاعات و فایل‌های گفت‌وگو"
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    showInfoPanel
                      ? 'bg-sky-600 border-sky-600 text-white'
                      : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat In-Line Search Bar (Expandable) */}
            {showChatSearch && (
              <div className="p-2.5 px-4 bg-sky-50/80 border-b border-sky-100 flex items-center gap-2 animate-in slide-in-from-top-2 duration-150">
                <Search className="w-4 h-4 text-sky-600 shrink-0" />
                <input
                  type="text"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  placeholder="جستجو در متن پیام‌ها، نام فایل‌ها و رکوردهای این گفت‌وگو..."
                  className="flex-1 bg-white border border-sky-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  autoFocus
                />
                {chatSearchQuery && (
                  <button
                    onClick={() => setChatSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <span className="text-[10px] font-bold text-sky-800 shrink-0">
                  {activeMessages.length} نتیجه
                </span>
              </div>
            )}

            {/* Message Stream Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/40">
              {activeMessages.length === 0 ? (
                <div className="py-24 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-600">هنوز پیامی در این بخش ثبت نشده است.</p>
                  <p className="text-[11px] text-slate-400 mt-1">اولین پیام خود را ارسال فرمایید.</p>
                </div>
              ) : (
                activeMessages.map((msg) => {
                  const isMine = msg.senderId === currentUser.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 items-start group ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Sender Avatar */}
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 overflow-hidden ring-2 ring-white shadow-2xs">
                        {msg.senderAvatar ? (
                          <img src={msg.senderAvatar} alt={msg.senderName} className="w-full h-full object-cover" />
                        ) : (
                          msg.senderName.charAt(0)
                        )}
                      </div>

                      {/* Message Bubble Container */}
                      <div className={`max-w-[80%] md:max-w-[70%] space-y-1.5 ${isMine ? 'items-end text-left' : 'items-start text-right'}`}>
                        {/* Sender info (Shown in workgroup chats or other user messages) */}
                        {!isMine && (
                          <div className="flex items-center gap-1.5 px-1 text-right">
                            <span className="text-[11px] font-black text-slate-800">{msg.senderName}</span>
                            <span className="text-[9px] font-semibold text-sky-700 bg-sky-50 border border-sky-100 px-1.5 py-0.2 rounded-md">
                              {msg.senderRoleFa}
                            </span>
                          </div>
                        )}

                        {/* Bubble Body */}
                        <div
                          className={`p-3.5 rounded-3xl text-xs leading-relaxed shadow-xs relative transition-all ${
                            isMine
                              ? 'bg-sky-600 text-white rounded-tl-xs'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-tr-xs'
                          }`}
                        >
                          {/* Text message */}
                          {msg.text && (
                            <p className="whitespace-pre-wrap font-medium dir-rtl text-right">
                              {msg.text}
                            </p>
                          )}

                          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                          {/* SYSTEM RECORD PREVIEW CARD (COMPACT LINKED REFERENCE) */}
                          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                          {msg.recordAttachment && (
                            <div
                              className={`mt-2.5 p-3 rounded-2xl border transition-all text-right dir-rtl ${
                                isMine
                                  ? 'bg-white/10 border-white/20 text-white'
                                  : 'bg-slate-50 border-slate-200/90 text-slate-800 hover:border-sky-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isMine ? 'bg-white/20 text-white' : 'bg-white text-sky-600 shadow-2xs'}`}>
                                    {getRecordIcon(msg.recordAttachment.type)}
                                  </div>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    isMine ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700 font-mono'
                                  }`}>
                                    {msg.recordAttachment.code || 'رکورد سیستمی'}
                                  </span>
                                </div>

                                {msg.recordAttachment.statusFa && (
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                    isMine
                                      ? 'bg-white/20 text-white'
                                      : getRecordBadgeClass(msg.recordAttachment.statusColor)
                                  }`}>
                                    {msg.recordAttachment.statusFa}
                                  </span>
                                )}
                              </div>

                              <h4 className="text-xs font-black mb-0.5 line-clamp-1">
                                {msg.recordAttachment.title}
                              </h4>

                              {msg.recordAttachment.subtitle && (
                                <p className={`text-[11px] line-clamp-1 mb-1.5 ${isMine ? 'text-sky-100' : 'text-slate-500'}`}>
                                  {msg.recordAttachment.subtitle}
                                </p>
                              )}

                              {msg.recordAttachment.additionalInfo && (
                                <p className={`text-[10px] mb-2 ${isMine ? 'text-sky-200' : 'text-slate-400'}`}>
                                  {msg.recordAttachment.additionalInfo}
                                </p>
                              )}

                              {/* Direct Jump to System Record Action Button */}
                              <button
                                onClick={() => {
                                  if (msg.recordAttachment) {
                                    onNavigateToRecord(
                                      msg.recordAttachment.targetPage,
                                      msg.recordAttachment.targetRecordId
                                    );
                                  }
                                }}
                                className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                  isMine
                                    ? 'bg-white text-sky-800 hover:bg-sky-50 shadow-xs'
                                    : 'bg-sky-600 text-white hover:bg-sky-700 shadow-xs'
                                }`}
                              >
                                <span>{msg.recordAttachment.actionLabel}</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                          {/* FILE ATTACHMENT CARD                                 */}
                          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                          {msg.fileAttachment && (
                            <div
                              onClick={() => setPreviewFile(msg.fileAttachment || null)}
                              className={`mt-2 p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                                isMine
                                  ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
                                  : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isMine ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600'}`}>
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 text-right">
                                  <p className="text-xs font-bold truncate">{msg.fileAttachment.name}</p>
                                  <span className={`text-[10px] ${isMine ? 'text-sky-200' : 'text-slate-400'}`}>
                                    {msg.fileAttachment.size} • پیش‌نمایش و دانلود
                                  </span>
                                </div>
                              </div>
                              <Eye className="w-4 h-4 shrink-0 opacity-75" />
                            </div>
                          )}

                          {/* Bubble Footer (Time & Read Status & Star Action) */}
                          <div className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] ${isMine ? 'text-sky-200' : 'text-slate-400'}`}>
                            <span>{msg.createdAt}</span>

                            {isMine && (
                              <span>
                                {msg.status === 'read' ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-sky-100 inline" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-sky-300 inline" />
                                )}
                              </span>
                            )}

                            {/* Star Toggle Button */}
                            <button
                              onClick={() => onToggleStarMessage(msg.id)}
                              className={`p-0.5 rounded hover:bg-black/10 transition-colors cursor-pointer ${
                                msg.isStarred ? 'text-amber-300' : 'opacity-0 group-hover:opacity-100'
                              }`}
                              title={msg.isStarred ? 'حذف از پیام‌های مهم' : 'نشان‌دار کردن به عنوان پیام مهم'}
                            >
                              <Star className={`w-3.5 h-3.5 ${msg.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* ATTACHMENT STAGING PREVIEW STRIP (BEFORE SENDING)    */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {(attachedRecord || attachedFile) && (
              <div className="px-4 py-2 bg-sky-50 border-t border-sky-200/80 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 min-w-0">
                  {attachedRecord ? (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-sky-300 text-xs font-bold text-slate-800 shadow-2xs">
                      {getRecordIcon(attachedRecord.type)}
                      <span className="text-sky-700 font-mono text-[10px]">{attachedRecord.code}</span>
                      <span className="truncate max-w-[280px]">{attachedRecord.title}</span>
                      <button
                        onClick={() => setAttachedRecord(null)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                        title="حذف ضمیمه"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : null}

                  {attachedFile ? (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-sky-300 text-xs font-bold text-slate-800 shadow-2xs">
                      <FileText className="w-4 h-4 text-rose-500" />
                      <span className="truncate max-w-[240px]">{attachedFile.name}</span>
                      <span className="text-[10px] text-slate-400">({attachedFile.size})</span>
                      <button
                        onClick={() => setAttachedFile(null)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                        title="حذف فایل"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : null}
                </div>

                <span className="text-[10px] font-bold text-sky-800 shrink-0">
                  ضمیمه آماده ارسال با پیام
                </span>
              </div>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* MESSAGE COMPOSER BAR                                 */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="p-3.5 border-t border-slate-200 bg-white shrink-0">
              <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-sky-500 focus-within:bg-white transition-all shadow-2xs">
                {/* Attach System Record Button */}
                <button
                  onClick={() => setShowRecordPicker(true)}
                  title="الصاق رکورد سیستمی (تجهیزات، درخواست خرید، گزارش خرابی، کالیبراسیون، وظیفه، آموزش)"
                  className="p-2 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  <FileCheck2 className="w-5 h-5" />
                </button>

                {/* Attach File Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="الصاق فایل یا سند (PDF, Word, Excel, عکس، ویدیو)"
                  className="p-2 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* Text Area */}
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`ارسال پیام به ${activeConversation.title}... (Enter برای ارسال، Shift+Enter برای خط جدید)`}
                  rows={1}
                  className="flex-1 max-h-32 bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none py-1.5 px-2"
                />

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={!messageInput.trim() && !attachedRecord && !attachedFile}
                  className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                    messageInput.trim() || attachedRecord || attachedFile
                      ? 'bg-sky-600 text-white hover:bg-sky-700 shadow-xs'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  title="ارسال پیام"
                >
                  <Send className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50/50">
            <div className="w-16 h-16 rounded-3xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-slate-700">یک گفت‌وگو را انتخاب نمایید</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              از ستون سمت راست مکالمه مورد نظر خود را باز کنید یا از طریق دکمه «شروع پیام جدید» با کارگروه‌ها و همکاران ارتباط برقرار نمایید.
            </p>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* COLLAPSIBLE SIDE INFO DRAWER (THIRD PANEL)           */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {showInfoPanel && activeConversation && (
          <div className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col overflow-y-auto animate-in slide-in-from-left-4 duration-200 shrink-0">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <span className="text-xs font-black text-slate-800">اطلاعات و مستندات گفت‌وگو</span>
              <button
                onClick={() => setShowInfoPanel(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile / Details Header */}
            <div className="p-5 text-center bg-white border-b border-slate-200">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-600 to-[#1d52d8] text-white flex items-center justify-center font-bold text-xl mx-auto mb-2.5 shadow-md overflow-hidden ring-4 ring-sky-50">
                {activeConversation.type === 'workgroup' ? (
                  <Users className="w-8 h-8" />
                ) : activeConversation.avatar ? (
                  <img src={activeConversation.avatar} alt={activeConversation.title} className="w-full h-full object-cover" />
                ) : (
                  activeConversation.title.charAt(0)
                )}
              </div>
              <h3 className="text-sm font-black text-slate-800">{activeConversation.title}</h3>
              <p className="text-xs text-sky-700 font-bold mt-0.5">
                {activeConversation.type === 'workgroup' ? activeConversation.department : activeConversation.targetUserRoleFa}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeConversation.type === 'workgroup' ? 'کارگروه رسمی بیمارستان' : activeConversation.targetUserDepartment}
              </p>
            </div>

            {/* Workgroup Members List (If Workgroup) */}
            {activeConversation.type === 'workgroup' && (
              <div className="p-4 bg-white border-b border-slate-200 space-y-2">
                <span className="text-xs font-black text-slate-800 block">اعضای مجاز کارگروه ({activeConversation.workgroupMembersCount} نفر)</span>
                <div className="space-y-1.5">
                  {allUsers
                    .filter((u) => activeConversation.workgroupMemberIds?.includes(u.id))
                    .map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block leading-tight">{member.name}</span>
                            <span className="text-[10px] text-slate-400">{member.roleFa}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Shared Files in this conversation */}
            <div className="p-4 space-y-2 border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800">فایل‌های تبادل‌شده</span>
                <span className="text-[10px] text-slate-400">{sharedFilesInActiveConv.length} فایل</span>
              </div>

              {sharedFilesInActiveConv.length === 0 ? (
                <p className="text-[11px] text-slate-400 py-3 text-center">هنوز فایلی در این مکالمه مبادله نشده است.</p>
              ) : (
                <div className="space-y-1.5">
                  {sharedFilesInActiveConv.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setPreviewFile(item.file)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-200 transition-all cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-800 truncate">{item.file.name}</p>
                          <span className="text-[9px] text-slate-400">{item.file.size} • {item.date}</span>
                        </div>
                      </div>
                      <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Important / Starred Messages */}
            <div className="p-4 space-y-2 bg-white flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800">پیام‌های مهم و ستاره‌دار</span>
                <span className="text-[10px] text-slate-400">{starredInActiveConv.length} مورد</span>
              </div>

              {starredInActiveConv.length === 0 ? (
                <p className="text-[11px] text-slate-400 py-3 text-center">پیام مهمی نشان‌دار نشده است.</p>
              ) : (
                <div className="space-y-1.5">
                  {starredInActiveConv.map((m) => (
                    <div key={m.id} className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-right space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-amber-900">{m.senderName}</span>
                        <span className="text-amber-700">{m.createdAt}</span>
                      </div>
                      <p className="text-[11px] text-slate-800 leading-snug line-clamp-2">{m.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <RecordPickerModal
        isOpen={showRecordPicker}
        onClose={() => setShowRecordPicker(false)}
        onSelectRecord={(rec) => setAttachedRecord(rec)}
        equipmentList={equipmentList}
        purchaseRequests={purchaseRequests}
        failureReports={failureReports}
        calibrations={calibrations}
        tasksList={tasksList}
      />

      <NewMessageModal
        isOpen={showNewMsgModal}
        onClose={() => setShowNewMsgModal(false)}
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUserRecipient={(user) => {
          const convId = onStartNewConversation({
            type: 'direct',
            targetUserId: user.id,
            title: user.name,
            department: user.department,
          });
          setActiveConvId(convId);
        }}
        onSelectWorkgroupRecipient={(wg) => {
          const convId = onStartNewConversation({
            type: 'workgroup',
            workgroupId: wg.id,
            title: wg.title,
            department: wg.department,
          });
          setActiveConvId(convId);
        }}
      />

      <FilePreviewModal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
      />
    </div>
  );
};
