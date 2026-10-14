import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getAdminBootstrap } from './api';

type AdminData = {
  branches: any[];
  users: any[];
  services: any[];
  specialists: any[];
  bookings: any[];
  courses: any[];
  enrollments: any[];
  notifications: any[];
  treatmentPlans: any[];
  generatedAt?: string;
};

const emptyData: AdminData = { branches: [], users: [], services: [], specialists: [], bookings: [], courses: [], enrollments: [], notifications: [], treatmentPlans: [] };
const AdminDataContext = createContext({ data: emptyData, loading: true, error: '', refresh: async () => {} });

export const AdminDataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [data, setData] = useState<AdminData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = async () => {
    setLoading(true);
    try { setData(await getAdminBootstrap()); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, []);
  const value = useMemo(() => ({ data, loading, error, refresh }), [data, loading, error]);
  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
};

export const useAdminData = () => useContext(AdminDataContext);
