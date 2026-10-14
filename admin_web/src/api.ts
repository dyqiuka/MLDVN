const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api').replace(/\/$/, '');

export async function getAdminBootstrap() {
  const response = await fetch(`${API_BASE_URL}/admin/bootstrap`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Không thể tải dữ liệu quản trị');
  return response.json();
}

export async function apiRequest(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Thao tác không thành công');
  return data;
}

export { API_BASE_URL };
