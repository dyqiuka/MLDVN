import React, { useMemo, useState } from 'react';
import { Calendar, GraduationCap, Receipt, Search, Sparkles, Wallet } from 'lucide-react';
import { useAdminData } from '../AdminDataContext';

interface OverviewTabProps { onNavigateTab: (tab: string) => void }
const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`;
const dayKey = (value: string) => new Date(value).toLocaleDateString('vi-VN');

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigateTab }) => {
  const { data, loading, refresh } = useAdminData();
  const [query, setQuery] = useState('');
  const [branchId, setBranchId] = useState('all');
  const paid = data.invoices.filter(item => item.status === 'paid');
  const visibleBookings = data.bookings.filter(item => branchId === 'all' || item.branchId === branchId);
  const visiblePlans = data.treatmentPlans.filter(item => branchId === 'all' || item.branch?.id === branchId);
  const visibleInvoices = paid.filter(item => {
    if (branchId === 'all') return true;
    const branch = data.branches.find(value => value.id === branchId);
    return !item.description || item.description.includes(branch?.name || '');
  });
  const revenue = visibleInvoices.reduce((sum, item) => sum + Number(item.finalAmount), 0);
  const refunded = data.invoices.filter(item => item.status === 'refunded').reduce((sum, item) => sum + Number(item.finalAmount), 0);
  const upcoming = visibleBookings.filter(item => item.status === 'pending' || item.status === 'confirmed');
  const activePlans = visiblePlans.filter(item => item.status === 'active');
  const remainingSessions = activePlans.reduce((sum, item) => sum + Number(item.remainingSessions || 0), 0);
  const activeEnrollments = data.enrollments.filter(item => ['pending', 'confirmed'].includes(item.status));
  const daily = useMemo(() => {
    const values = new Map<string, number>();
    visibleInvoices.forEach(item => { const key = dayKey(item.paidAt || item.createdAt); values.set(key, (values.get(key) || 0) + Number(item.finalAmount)); });
    return [...values.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-8);
  }, [visibleInvoices]);
  const maxRevenue = Math.max(1, ...daily.map(([, value]) => value));
  const serviceRevenue = visibleInvoices.filter(item => item.bookingId).reduce((sum, item) => sum + Number(item.finalAmount), 0);
  const courseRevenue = visibleInvoices.filter(item => item.enrollmentId).reduce((sum, item) => sum + Number(item.finalAmount), 0);
  const treatmentRevenue = Math.max(0, revenue - serviceRevenue - courseRevenue);
  const categories = [['Dịch vụ', serviceRevenue, '#E5D5C5'], ['Liệu trình', treatmentRevenue, '#8B4513'], ['Học phí', courseRevenue, '#C88A4B']] as const;
  const searchResults = query.trim() ? [...data.bookings.filter(item => `${item.code} ${item.userName} ${item.serviceTitle}`.toLowerCase().includes(query.toLowerCase())), ...data.enrollments.filter(item => `${item.code} ${item.studentName} ${item.courseTitle}`.toLowerCase().includes(query.toLowerCase()))].slice(0, 6) : [];

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold">Tổng quan vận hành</h1><p className="mt-1 text-xs text-stone-500">Dữ liệu PostgreSQL cập nhật lúc {data.generatedAt ? new Date(data.generatedAt).toLocaleString('vi-VN') : '--'}</p></div><div className="flex gap-2"><button onClick={refresh} className="rounded-lg border bg-white px-4 py-2.5 text-xs font-semibold">Làm mới dữ liệu</button><button onClick={()=>onNavigateTab('revenue_report')} className="rounded-lg bg-[#8B4513] px-4 py-2.5 text-xs font-semibold text-white">Xem báo cáo doanh thu</button></div></div>
    <div className="grid gap-3 rounded-lg border bg-white p-3 md:grid-cols-[1fr_280px]"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-stone-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm khách hàng, lịch hẹn, khóa học..." className="h-10 w-full rounded-lg border bg-stone-50 pl-9 pr-3 text-xs outline-none"/>{searchResults.length>0&&<div className="absolute z-20 mt-1 w-full rounded-lg border bg-white p-2 shadow-xl">{searchResults.map((item:any)=><button key={item.id} onClick={()=>onNavigateTab(item.serviceTitle?'appointments':'students')} className="block w-full rounded px-3 py-2 text-left text-xs hover:bg-stone-50"><strong>{item.code}</strong> · {item.userName||item.studentName} · {item.serviceTitle||item.courseTitle}</button>)}</div>}</div><select value={branchId} onChange={e=>setBranchId(e.target.value)} className="h-10 rounded-lg border bg-stone-50 px-3 text-xs"><option value="all">Tất cả chi nhánh</option>{data.branches.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[
      ['Thực thu', money(revenue), `${visibleInvoices.length} hóa đơn đã thu`, Wallet, 'cashier'],
      ['Giao dịch đã thanh toán', visibleInvoices.length, `Hoàn tiền: ${money(refunded)}`, Receipt, 'cashier'],
      ['Lịch hẹn đang xử lý', upcoming.length, `${visibleBookings.length} lịch trong hệ thống`, Calendar, 'appointments'],
      ['Liệu trình đang dùng', activePlans.length, `${remainingSessions} buổi còn lại`, Sparkles, 'treatments'],
      ['Khóa đã ghi danh', data.enrollments.length, `${activeEnrollments.length} đang học/chờ xác nhận`, GraduationCap, 'students'],
    ].map(([label,value,note,Icon,tab]:any)=><button key={label} onClick={()=>onNavigateTab(tab)} className="rounded-lg border bg-white p-4 text-left shadow-sm hover:border-[#8B4513]"><div className="flex justify-between text-xs text-stone-500"><span>{label}</span><Icon className="h-4 w-4 text-[#8B4513]"/></div><div className="mt-2 text-xl font-bold">{value}</div><div className="mt-1 text-[11px] text-stone-400">{note}</div></button>)}</div>
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]"><section className="rounded-lg border bg-white p-5"><h2 className="text-sm font-bold">Thực thu theo ngày</h2><p className="mt-1 text-[11px] text-stone-400">Tính từ hóa đơn có trạng thái đã thanh toán</p><div className="mt-8 flex h-56 items-end gap-3">{daily.map(([date,value])=><div key={date} className="flex h-full min-w-0 flex-1 flex-col justify-end text-center"><span className="mb-1 truncate text-[10px] font-bold text-[#8B4513]">{money(value)}</span><div className="min-h-1 rounded-t bg-[#8B4513]" style={{height:`${Math.max(4,value/maxRevenue*170)}px`}}/><span className="mt-2 text-[10px] text-stone-400">{date}</span></div>)}{!daily.length&&<div className="m-auto text-xs text-stone-400">Chưa có giao dịch đã thanh toán.</div>}</div></section><section className="rounded-lg border bg-white p-5"><h2 className="text-sm font-bold">Cơ cấu khoản đã thu</h2><div className="mt-5 space-y-5">{categories.map(([label,value,color])=>{const percent=revenue?value/revenue*100:0;return <div key={label}><div className="mb-1 flex justify-between text-xs"><span>{label}</span><strong>{money(value)} · {percent.toFixed(1)}%</strong></div><div className="h-2.5 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full" style={{width:`${percent}%`,backgroundColor:color}}/></div></div>})}</div></section></div>
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]"><section className="overflow-hidden rounded-lg border bg-white"><div className="border-b px-5 py-4"><h2 className="text-sm font-bold">Đối chiếu chi nhánh</h2></div><table className="w-full text-left text-xs"><thead className="bg-[#F5EBE1]"><tr><th className="px-4 py-3">Chi nhánh</th><th className="px-4 py-3">Lịch hẹn</th><th className="px-4 py-3">Liệu trình</th><th className="px-4 py-3">Thực thu nhận diện được</th></tr></thead><tbody className="divide-y">{data.branches.map(branch=>{const bookings=data.bookings.filter(item=>item.branchId===branch.id);const plans=data.treatmentPlans.filter(item=>item.branch?.id===branch.id);const branchRevenue=visibleInvoices.filter(item=>item.description?.includes(branch.name)).reduce((sum,item)=>sum+Number(item.finalAmount),0);return <tr key={branch.id}><td className="px-4 py-3 font-semibold">{branch.name}<div className="mt-1 font-normal text-stone-400">{branch.address}</div></td><td className="px-4 py-3">{bookings.length}</td><td className="px-4 py-3">{plans.length}</td><td className="px-4 py-3 font-bold text-[#8B4513]">{money(branchRevenue)}</td></tr>})}</tbody></table></section><section className="rounded-lg border border-[#E5D5C5] bg-[#F5EBE1] p-5"><h2 className="text-sm font-bold">Cần xử lý</h2><div className="mt-4 space-y-3"><button onClick={()=>onNavigateTab('appointments')} className="w-full rounded-lg border bg-white p-3 text-left text-xs"><strong>{upcoming.length} lịch hẹn đang chờ/đã xác nhận</strong><p className="mt-1 text-stone-500">Mở danh sách để kiểm tra lịch và chuyên viên.</p></button><button onClick={()=>onNavigateTab('cashier')} className="w-full rounded-lg border bg-white p-3 text-left text-xs"><strong>{Math.max(0, data.bookings.length-data.invoices.filter(item=>item.bookingId).length)} lịch chưa có hóa đơn</strong><p className="mt-1 text-stone-500">Mở thu ngân để ghi nhận thanh toán.</p></button></div></section></div>
    {loading&&<div className="fixed bottom-5 right-5 rounded-lg bg-stone-900 px-4 py-3 text-xs text-white">Đang đồng bộ dữ liệu...</div>}
  </div>;
};
