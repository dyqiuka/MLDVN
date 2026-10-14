import React, { useMemo, useState } from 'react';
import { Calendar, ListOrdered, RefreshCw, Search, Sparkles } from 'lucide-react';
import { useAdminData } from '../AdminDataContext';

const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString('vi-VN') : '--';

export const TreatmentsTab: React.FC = () => {
  const { data, loading, refresh } = useAdminData();
  const [query, setQuery] = useState('');
  const plans = useMemo(() => data.treatmentPlans.filter((plan) =>
    `${plan.name} ${plan.branch?.name || ''}`.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi'))
  ), [data.treatmentPlans, query]);
  const active = data.treatmentPlans.filter((plan) => plan.status === 'active');
  const remaining = active.reduce((sum, plan) => sum + plan.remainingSessions, 0);
  const used = data.treatmentPlans.reduce((sum, plan) => sum + plan.usedSessions, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Quản lý liệu trình</h1>
          <p className="mt-1 text-xs text-stone-500">Gói và lịch sử buổi chăm sóc đồng bộ từ database.</p>
        </div>
        <button onClick={refresh} className="flex h-10 items-center gap-2 rounded-lg bg-[#8B4513] px-4 text-xs font-semibold text-white">
          <RefreshCw className="h-4 w-4" /> Làm mới
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          ['Gói đang sử dụng', active.length, Sparkles],
          ['Buổi còn lại', remaining, Calendar],
          ['Buổi đã sử dụng', used, ListOrdered],
        ].map(([label, value, Icon]: any) => (
          <div key={label} className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-4">
            <div><p className="text-xs text-stone-500">{label}</p><p className="mt-1 text-2xl font-bold text-stone-900">{value}</p></div>
            <Icon className="h-6 w-6 text-[#8B4513]" />
          </div>
        ))}
      </div>

      <label className="flex h-10 max-w-xl items-center gap-2 rounded-lg border border-stone-200 bg-white px-3">
        <Search className="h-4 w-4 text-stone-400" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm gói hoặc chi nhánh..." className="w-full text-xs outline-none" />
      </label>

      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead className="bg-[#F5EBE1] text-stone-700"><tr><th className="px-4 py-3">Gói liệu trình</th><th className="px-4 py-3">Cơ sở</th><th className="px-4 py-3">Thời hạn</th><th className="px-4 py-3">Tiến độ</th><th className="px-4 py-3">Trạng thái</th></tr></thead>
            <tbody className="divide-y divide-stone-100">
              {plans.map((plan) => <React.Fragment key={plan.id}>
                <tr>
                  <td className="px-4 py-3"><strong>{plan.name}</strong><div className="mt-1 text-stone-500">{plan.totalSessions} buổi</div></td>
                  <td className="px-4 py-3">{plan.branch?.name || '--'}</td>
                  <td className="px-4 py-3">{formatDate(plan.purchaseDate)} - {formatDate(plan.expiryDate)}</td>
                  <td className="px-4 py-3"><strong>{plan.usedSessions}/{plan.totalSessions}</strong><div className="mt-1 h-2 w-28 overflow-hidden rounded-full bg-stone-100"><div className="h-full bg-[#8B4513]" style={{ width: `${plan.progressPercent}%` }} /></div></td>
                  <td className="px-4 py-3"><span className="rounded bg-[#F5EBE1] px-2 py-1 font-semibold text-[#8B4513]">{plan.status === 'active' ? 'Đang sử dụng' : plan.status}</span></td>
                </tr>
                <tr className="bg-stone-50/60"><td colSpan={5} className="px-4 py-3"><div className="flex flex-wrap gap-2">{plan.sessions.length ? plan.sessions.map((session: any) => <span key={session.id} className="rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-[11px]">Buổi {session.sessionNumber}: {session.title} · {session.status === 'completed' ? 'Hoàn thành' : 'Đã xếp lịch'}</span>) : <span className="text-stone-400">Chưa có lịch sử buổi.</span>}</div></td></tr>
              </React.Fragment>)}
              {!loading && plans.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-stone-400">Không có gói liệu trình phù hợp.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
