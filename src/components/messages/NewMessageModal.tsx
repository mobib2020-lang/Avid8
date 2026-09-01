import React, { useState } from 'react';
import {
  X,
  Search,
  Users,
  User,
  Shield,
  Building,
  CheckCircle2,
  ChevronLeft,
  Sparkles,
  MessageSquarePlus,
} from 'lucide-react';
import { AppUser, HospitalConversation } from '../../types';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  allUsers: AppUser[];
  onSelectUserRecipient: (targetUser: AppUser) => void;
  onSelectWorkgroupRecipient: (workgroup: { id: string; title: string; department: string }) => void;
}

export const NewMessageModal: React.FC<NewMessageModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers = [],
  onSelectUserRecipient,
  onSelectWorkgroupRecipient,
}) => {
  const [activeTab, setActiveTab] = useState<'colleagues' | 'workgroups'>('colleagues');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Workgroups list authorized for current user
  const workgroupsList = [
    {
      id: 'wg-biomed',
      title: 'کارگروه مهندسی پزشکی و تجهیزات',
      department: 'مهندسی پزشکی و تجهیزات',
      description: 'هماهنگی تعمیرات، آزمون‌های ایمنی، کالیبراسیون و چک‌لیست‌های تجهیزات پزشکی',
      membersCount: 4,
      allowedRoles: ['biomedical_engineer', 'support_tech', 'hospital_admin', 'asset_manager'],
    },
    {
      id: 'wg-procurement',
      title: 'کارگروه بازرگانی و خرید',
      department: 'واحد بازرگانی و خرید',
      description: 'پیگیری پیش‌فاکتورها، استعلام‌های IRC، تامین کالا و قراردادهای خرید',
      membersCount: 4,
      allowedRoles: ['procurement_officer', 'procurement_expert', 'finance_manager', 'hospital_admin'],
    },
    {
      id: 'wg-asset',
      title: 'کارگروه اموال و انبار مرکزی',
      department: 'مدیریت اموال و انبار',
      description: 'پلاک‌کوبی، انبارگردانی، نظارت بر کاردکس و تحویل اقلام سرمایه‌ای و مصرفی',
      membersCount: 4,
      allowedRoles: ['asset_manager', 'warehouse_keeper', 'hospital_admin', 'procurement_officer'],
    },
    {
      id: 'wg-icu',
      title: 'کارگروه بخش مراقبت‌های ویژه (ICU)',
      department: 'بخش مراقبت‌های ویژه (ICU)',
      description: 'پایش تجهیزات حیاتی، آلارم‌های بالینی و تحویل شیفت پرستاری',
      membersCount: 3,
      allowedRoles: ['dept_head', 'nurse_operator', 'biomedical_engineer', 'hospital_admin'],
    },
  ].filter((wg) => {
    if (currentUser.role === 'hospital_admin') return true;
    return (
      wg.allowedRoles.includes(currentUser.role) ||
      currentUser.department?.includes(wg.department)
    );
  });

  // Filter colleagues (excluding current user, and respecting permission boundary)
  const allowedColleagues = allUsers.filter((u) => {
    if (u.id === currentUser.id) return false;
    // Hospital admin can message anyone
    if (currentUser.role === 'hospital_admin') return true;
    // Subordinates or supervisor
    if (u.supervisorId === currentUser.id || currentUser.supervisorId === u.id) return true;
    // Same department
    if (currentUser.department && u.department && currentUser.department === u.department) return true;
    // Cross-functional collaboration (Biomed, Procurement, Asset, Dept Heads)
    const collaboratingRoles = [
      'hospital_admin',
      'asset_manager',
      'procurement_officer',
      'biomedical_engineer',
      'dept_head',
      'finance_manager',
      'nurse_operator',
    ];
    return collaboratingRoles.includes(currentUser.role) && collaboratingRoles.includes(u.role);
  });

  const filteredColleagues = allowedColleagues.filter(
    (u) =>
      u.name.includes(searchQuery) ||
      u.roleFa.includes(searchQuery) ||
      u.department.includes(searchQuery) ||
      u.personnelCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWorkgroups = workgroupsList.filter(
    (wg) =>
      wg.title.includes(searchQuery) ||
      wg.department.includes(searchQuery) ||
      wg.description.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 dir-rtl">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">شروع پیام و گفت‌وگوی جدید</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                یک همکار مجاز یا کارگروه کاری را برای ارسال پیام انتخاب نمایید.
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

        {/* Tabs & Search */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
          <div className="flex border-b border-slate-200 bg-slate-100/70 rounded-2xl p-1">
            <button
              onClick={() => setActiveTab('colleagues')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'colleagues'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>همکاران و پرسنل ({filteredColleagues.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('workgroups')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'workgroups'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>کارگروه‌های مجاز ({filteredWorkgroups.length})</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بر اساس نام پرسنل، نقش، دپارتمان یا کد پرسنلی..."
              className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* List Body */}
        <div className="p-4 overflow-y-auto max-h-[420px] space-y-2 bg-slate-50/50 flex-1">
          {activeTab === 'colleagues' ? (
            filteredColleagues.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <User className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold">کاربری با این مشخصات یافت نشد.</p>
              </div>
            ) : (
              filteredColleagues.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    onSelectUserRecipient(user);
                    onClose();
                  }}
                  className="p-3 bg-white rounded-2xl border border-slate-200/80 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden ring-2 ring-sky-50">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 truncate">{user.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {user.personnelCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-sky-700 font-semibold mt-0.5 truncate">
                        {user.roleFa} • <span className="text-slate-500 font-normal">{user.department}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2.5 py-1 bg-sky-50 text-sky-700 group-hover:bg-sky-600 group-hover:text-white rounded-xl font-bold transition-colors">
                      ارسال پیام
                    </span>
                  </div>
                </div>
              ))
            )
          ) : (
            filteredWorkgroups.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold">کارگروهی یافت نشد.</p>
              </div>
            ) : (
              filteredWorkgroups.map((wg) => (
                <div
                  key={wg.id}
                  onClick={() => {
                    onSelectWorkgroupRecipient({
                      id: wg.id,
                      title: wg.title,
                      department: wg.department,
                    });
                    onClose();
                  }}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 truncate">{wg.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                          {wg.membersCount} عضو
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 leading-relaxed">
                        {wg.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] px-2.5 py-1 bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white rounded-xl font-bold transition-colors shrink-0">
                    ورود به گفت‌وگو
                  </span>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};
