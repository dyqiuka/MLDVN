import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { BranchesTab } from './components/BranchesTab';
import { CustomersTab } from './components/CustomersTab';
import { StaffScheduleTab } from './components/StaffScheduleTab';
import { TreatmentsTab } from './components/TreatmentsTab';
import { SpecialistsTab } from './components/SpecialistsTab';
import { CashierTab } from './components/CashierTab';
import { AdmissionsTab } from './components/AdmissionsTab';
import { InstructorsTab } from './components/InstructorsTab';
import { StudentsTab } from './components/StudentsTab';
import { TrainingOpsTab } from './components/TrainingOpsTab';
import { RevenueReportTab } from './components/RevenueReportTab';
import { AppointmentsTab } from './components/AppointmentsTab';
import { ServicesTab } from './components/ServicesTab';
import { CoursesTab } from './components/CoursesTab';
import { UsersTab } from './components/UsersTab';
import { useAdminData } from './AdminDataContext';
import { AdminAppointment, AdminCourse, AdminService, AdminUser, AppointmentStatus, PaymentStatus, UserRole } from './types';
import { CheckCircle2, X } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { data, loading, error, refresh } = useAdminData();
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    const nativeAlert = window.alert;
    window.alert = (message?: any) => setActionMessage(String(message || 'Thao tác đã được ghi nhận.').replace(/\s*\(minh họa\)\s*/gi, ''));
    return () => { window.alert = nativeAlert; };
  }, []);

  useEffect(() => {
    setAppointments(data.bookings.map((item: any) => ({ id: item.id, ticketCode: item.code, patientName: item.customerName || item.user?.name || 'Khách hàng', patientPhone: item.phone || item.user?.phone || '', doctorName: item.specialistName || item.specialist?.name || 'Trung tâm sắp xếp', serviceName: item.serviceTitle || item.service?.name || '', date: item.date || String(item.scheduledAt || '').slice(0, 10), timeSlot: item.timeSlot || String(item.scheduledAt || '').slice(11, 16), amount: Number(item.totalAmount || 0), status: String(item.status || 'pending').toLowerCase() as AppointmentStatus, paymentStatus: (String(item.status).toLowerCase() === 'completed' ? 'paid' : 'unpaid') as PaymentStatus, paymentMethod: 'Tại cơ sở' })));
    setServices(data.services.map((item: any) => ({ id: item.id, name: item.name, category: item.category, price: Number(item.price), durationMinutes: item.durationMinutes, rating: Number(item.rating || 0), doctorCount: item.specialists?.length || 0, status: item.isActive ? 'active' : 'inactive' })));
    setCourses(data.courses.map((item: any) => ({ id: item.id, title: item.title, category: item.category, instructor: item.instructor, tuitionFee: Number(item.price), studentsCount: item.enrollments?.length || 0, totalLessons: 20, totalHours: 60, status: item.isActive ? 'published' : 'draft' })));
    setUsers(data.users.map((item: any) => ({ id: item.id, name: item.name, email: item.email || '', phone: item.phone || '', role: item.role === 'ADMIN' ? 'admin' : item.role === 'STUDENT' ? 'student' : 'patient', status: 'active', avatar: item.avatar || '', createdAt: item.createdAt, extraInfo: item.tier })));
  }, [data]);

  const getBreadcrumb = (tab: string) => {
    switch (tab) {
      case 'overview':
        return 'Quản trị / Tổng quan vận hành';
      case 'branches':
        return 'Quản trị / Quản lý chi nhánh';
      case 'appointments': return 'Quản trị / Lịch hẹn';
      case 'services': return 'Quản trị / Dịch vụ';
      case 'courses': return 'Quản trị / Khóa học';
      case 'users': return 'Quản trị / Người dùng & phân quyền';
      case 'customers':
        return 'Quản trị / Khách hàng';
      case 'specialists': return 'Quản trị / Đội ngũ chuyên viên';
      case 'staff_schedule':
        return 'Quản trị / Lịch kỹ thuật viên';
      case 'treatments':
        return 'Quản trị / Quản lý liệu trình';
      case 'cashier':
        return 'Quản trị / Thu ngân';
      case 'admissions':
        return 'Quản trị / Tuyển sinh';
      case 'instructors':
        return 'Quản trị / Giảng viên';
      case 'students':
        return 'Quản trị / Học viên';
      case 'training_ops':
        return 'Quản trị / Vận hành đào tạo';
      case 'revenue_report':
        return 'Quản trị / Báo cáo doanh thu';
      default:
        return 'Quản trị / Tổng quan vận hành';
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'overview':
        return <OverviewTab onNavigateTab={setCurrentTab} />;
      case 'branches':
        return <BranchesTab />;
      case 'appointments':
        return <AppointmentsTab appointments={appointments} onUpdateStatus={(id, status: AppointmentStatus) => setAppointments((current) => current.map((item) => item.id === id ? { ...item, status } : item))} />;
      case 'services':
        return <ServicesTab services={services} onAddService={(item) => setServices((current) => [...current, { ...item, id: `service-${Date.now()}` }])} onToggleStatus={(id) => setServices((current) => current.map((item) => item.id === id ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' } : item))} onDeleteService={(id) => setServices((current) => current.filter((item) => item.id !== id))} />;
      case 'courses':
        return <CoursesTab courses={courses} onAddCourse={(item) => setCourses((current) => [...current, { ...item, id: `course-${Date.now()}` }])} onToggleStatus={(id) => setCourses((current) => current.map((item) => item.id === id ? { ...item, status: item.status === 'published' ? 'draft' : 'published' } : item))} onDeleteCourse={(id) => setCourses((current) => current.filter((item) => item.id !== id))} />;
      case 'users':
        return <UsersTab users={users} onAddUser={(item) => setUsers((current) => [...current, { ...item, id: `user-${Date.now()}`, createdAt: new Date().toISOString() }])} onToggleStatus={(id) => setUsers((current) => current.map((item) => item.id === id ? { ...item, status: item.status === 'active' ? 'suspended' : 'active' } : item))} onChangeRole={(id, role: UserRole) => setUsers((current) => current.map((item) => item.id === id ? { ...item, role } : item))} onDeleteUser={(id) => setUsers((current) => current.filter((item) => item.id !== id))} />;
      case 'customers':
        return <CustomersTab />;
      case 'specialists':
        return <SpecialistsTab />;
      case 'staff_schedule':
        return <StaffScheduleTab onNavigateTab={setCurrentTab} />;
      case 'treatments':
        return <TreatmentsTab />;
      case 'cashier':
        return <CashierTab />;
      case 'admissions':
        return <AdmissionsTab />;
      case 'instructors':
        return <InstructorsTab />;
      case 'students':
        return <StudentsTab />;
      case 'training_ops':
        return <TrainingOpsTab />;
      case 'revenue_report':
        return <RevenueReportTab />;
      default:
        return <OverviewTab onNavigateTab={setCurrentTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#FBF9F7] text-stone-900 overflow-hidden font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          breadcrumb={getBreadcrumb(currentTab)}
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {(loading || error) && <div className={`mb-4 flex items-center justify-between rounded-lg border px-4 py-3 text-xs ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}><span>{loading ? 'Đang đồng bộ dữ liệu PostgreSQL...' : error}</span>{error && <button onClick={refresh} className="font-bold underline">Thử lại</button>}</div>}
            {renderContent()}
          </div>
        </main>
      </div>

      {actionMessage && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6" onMouseDown={() => setActionMessage('')}><div className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h2 className="font-bold text-stone-900">Thông báo quản trị</h2><p className="mt-1 text-sm leading-relaxed text-stone-600">{actionMessage}</p></div><button onClick={() => setActionMessage('')} aria-label="Đóng"><X className="h-5 w-5 text-stone-400" /></button></div><button onClick={() => setActionMessage('')} className="mt-5 h-10 w-full rounded-lg bg-[#8B4513] text-xs font-bold text-white">Đã hiểu</button></div></div>}
    </div>
  );
};
