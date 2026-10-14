import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Calendar,
  Sparkles,
  CreditCard,
  UserPlus,
  Monitor,
  GraduationCap,
  BookOpen,
  BarChart3,
  HelpCircle,
  ClipboardList,
  BriefcaseMedical,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const spaOperations = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'appointments', label: 'Lịch hẹn', icon: ClipboardList },
    { id: 'branches', label: 'Chi nhánh', icon: Building2 },
    { id: 'customers', label: 'Khách hàng', icon: Users },
    { id: 'staff_schedule', label: 'Lịch kỹ thuật viên', icon: Calendar },
    { id: 'treatments', label: 'Liệu trình', icon: Sparkles },
    { id: 'services', label: 'Dịch vụ', icon: BriefcaseMedical },
    { id: 'cashier', label: 'Thu ngân', icon: CreditCard },
  ];

  const academySections = [
    { id: 'admissions', label: 'Tuyển sinh', icon: UserPlus },
    { id: 'instructors', label: 'Giảng viên', icon: Monitor },
    { id: 'students', label: 'Học viên', icon: GraduationCap },
    { id: 'training_ops', label: 'Vận hành đào tạo', icon: BookOpen },
    { id: 'courses', label: 'Khóa học', icon: BookOpen },
  ];

  const analysisSections = [
    { id: 'users', label: 'Người dùng & phân quyền', icon: ShieldCheck },
    { id: 'revenue_report', label: 'Báo cáo doanh thu', icon: BarChart3 },
  ];

  const renderNavItems = (items: typeof spaOperations) => {
    return items.map((item) => {
      const Icon = item.icon;
      const isActive = currentTab === item.id;
      return (
        <button
          key={item.id}
          onClick={() => onSelectTab(item.id)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isActive
              ? 'bg-[#F5EBE1] text-[#8B4513] font-semibold shadow-sm'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <Icon className={`w-4 h-4 ${isActive ? 'text-[#8B4513]' : 'text-stone-400'}`} />
          <span>{item.label}</span>
        </button>
      );
    });
  };

  return (
    <aside className="w-64 bg-white flex flex-col border-r border-stone-200 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-stone-100">
        <div className="border border-[#C88A4B] rounded-2xl p-3 bg-white flex items-center gap-2.5 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#10B981] flex items-center justify-center text-white font-bold text-sm shadow">
            MLD
          </div>
          <div>
            <div className="font-extrabold text-[#0284C7] text-base leading-tight tracking-tight">
              MLD Vietnam
            </div>
            <div className="text-[9px] text-stone-500 font-medium leading-none mt-0.5">
              CỘNG ĐỒNG DẪN LƯU BẠCH HUYẾT
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-stone-400 uppercase">
            VẬN HÀNH SPA
          </div>
          <div className="space-y-1">{renderNavItems(spaOperations)}</div>
        </div>

        <div>
          <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-stone-400 uppercase">
            HỌC VIỆN
          </div>
          <div className="space-y-1">{renderNavItems(academySections)}</div>
        </div>

        <div>
          <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-stone-400 uppercase">
            PHÂN TÍCH
          </div>
          <div className="space-y-1">{renderNavItems(analysisSections)}</div>
        </div>
      </nav>

      {/* Footer Support */}
      <div className="p-4 border-t border-stone-100">
        <button
          onClick={() => alert('Trung tâm hỗ trợ MLD Vietnam: 1900 6868')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-stone-500 hover:bg-stone-50 transition-all"
        >
          <HelpCircle className="w-4 h-4 text-stone-400" />
          <span>Cần hỗ trợ?</span>
        </button>
      </div>
    </aside>
  );
};
