import React, { useState } from 'react';
import {
  X,
  UserCheck,
  UserPlus,
  Search,
  Calendar,
  Clock,
  Shield,
  FileText,
  AlertCircle,
  CheckCircle2,
  Building,
  History,
  Tag,
} from 'lucide-react';
import { EquipmentItem, AppUser, EquipmentAssignmentRecord } from '../../types';
import { MOCK_USERS } from '../../data/mockData';

interface EquipmentAssignmentModalProps {
  equipment: EquipmentItem;
  currentUser?: AppUser;
  usersList?: AppUser[];
  onSaveAssignment: (
    equipmentId: string,
    assignment: {
      userId: string;
      userName: string;
      userRoleFa: string;
      userPersonnelCode?: string;
      department: string;
      assignedDate: string;
      endDate?: string;
      status: 'active' | 'temporary' | 'ended' | 'transferred';
      notes?: string;
      authorizedOperators?: string[];
    }
  ) => void;
  onClose: () => void;
}

export const EquipmentAssignmentModal: React.FC<EquipmentAssignmentModalProps> = ({
  equipment,
  currentUser,
  usersList = MOCK_USERS,
  onSaveAssignment,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>(
    equipment.assignedOperatorId || ''
  );
  const [assignmentStatus, setAssignmentStatus] = useState<'active' | 'temporary' | 'ended' | 'transferred'>(
    equipment.assignmentStatus || 'active'
  );
  const [assignedDate, setAssignedDate] = useState<string>(
    equipment.assignmentDate || '۱۴۰۳/۰۵/۲۲'
  );
  const [endDate, setEndDate] = useState<string>(equipment.assignmentEndDate || '');
  const [notes, setNotes] = useState<string>(equipment.assignmentNotes || '');
  const [selectedAuthOperators, setSelectedAuthOperators] = useState<string[]>(
    equipment.authorizedOperators || []
  );

  // Check if current user has permission to assign
  const canAssign =
    currentUser?.role === 'hospital_admin' ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'asset_manager' ||
    currentUser?.role === 'dept_head' ||
    currentUser?.role === 'biomedical_engineer';

  // Filter users
  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.roleFa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.personnelCode && u.personnelCode.includes(searchTerm))
  );

  const selectedUser = usersList.find((u) => u.id === selectedUserId);

  const toggleAuthOperator = (userName: string) => {
    setSelectedAuthOperators((prev) =>
      prev.includes(userName)
        ? prev.filter((name) => name !== userName)
        : [...prev, userName]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    onSaveAssignment(equipment.id, {
      userId: selectedUser.id,
      userName: selectedUser.name,
      userRoleFa: selectedUser.roleFa,
      userPersonnelCode: selectedUser.personnelCode,
      department: selectedUser.department,
      assignedDate,
      endDate: endDate || undefined,
      status: assignmentStatus,
      notes,
      authorizedOperators: selectedAuthOperators,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[80] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden dir-rtl my-8 text-right font-sans">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                تخصیص و تعیین مسئولیت دستگاه
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                {equipment.faName} ({equipment.code}) • {equipment.department}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current State Summary Banner */}
        <div className="bg-slate-50 border-b border-slate-200/80 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500">مسئول فعلی اموال:</span>
            <strong className="text-slate-800">{equipment.owner || 'مدیریت اموال'}</strong>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#2b64f6]" />
            <span className="text-slate-500">اپراتور تخصیص‌یافته کنونی:</span>
            <strong className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
              {equipment.assignedOperator || 'تخصیص نیافته'}
            </strong>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {!canAssign && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                توجه: تغییر و ثبت تخصیص نیازمند دسترسی مدیریت اموال، رئیس بخش یا ادمین است.
              </span>
            </div>
          )}

          {/* User Selection Section */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-800">
              انتخاب اپراتور یا مسئول مستقیم استفاده <span className="text-rose-500">*</span>
            </label>
            
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="جستجو در بین کارکنان، پرستاران و اپراتورها براساس نام، نقش یا کد پرسنلی..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* User List Radio/Cards */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  کاربری با این مشخصات یافت نشد
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUserId === user.id;
                  return (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-400 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{user.name}</span>
                            <span className="text-[10px] font-normal text-slate-500 px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200">
                              {user.roleFa}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>بخش: {user.department}</span>
                            {user.personnelCode && (
                              <span>• کد: {user.personnelCode}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#2b64f6] shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Dates & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                وضعیت تخصیص <span className="text-rose-500">*</span>
              </label>
              <select
                value={assignmentStatus}
                onChange={(e) => setAssignmentStatus(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500"
              >
                <option value="active">فعال و تحویل دائم</option>
                <option value="temporary">تخصیص موقت / شیفت مشخص</option>
                <option value="transferred">در حال انتقال به کاربر دیگر</option>
                <option value="ended">پایان تخصیص / عودت به انبار</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                تاریخ شروع تخصیص <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
                <input
                  type="text"
                  value={assignedDate}
                  onChange={(e) => setAssignedDate(e.target.value)}
                  placeholder="۱۴۰۳/۰۵/۲۲"
                  className="w-full pl-2.5 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                تاریخ پایان تخصیص (اختیاری)
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="اختیاری یا انتهای سال"
                  className="w-full pl-2.5 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Authorized Secondary Operators */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              سایر اپراتورهای مجاز (همکاران شیفت و پشتیبان)
            </label>
            <div className="flex flex-wrap gap-2">
              {['مریم حسینی (پرستار شیفت)', 'علی باقری (تکنسین ICU)', 'زهرا کریمی (پرستار ویژه)', 'مهندس محمدی (کارشناس بالینی)'].map(
                (op) => {
                  const isAuth = selectedAuthOperators.includes(op);
                  return (
                    <button
                      type="button"
                      key={op}
                      onClick={() => toggleAuthOperator(op)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isAuth
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Tag className="w-3 h-3" />
                      <span>{op}</span>
                      {isAuth && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Assignment Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              توضیحات و شرایط تحویل دستگاه
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="نکات مربوط به تحویل سلامت، پروتکل کاربری، لوازم جانبی تحویل داده شده و..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={!selectedUser}
              className="px-5 py-2 text-xs font-black rounded-xl bg-[#2b64f6] hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ثبت تخصیص و تحویل دستگاه</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
