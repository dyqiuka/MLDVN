const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api').replace(/\/$/, '');

export async function getAdminBootstrap() {
  const response = await fetch(`${API_BASE_URL}/admin/bootstrap`);
  if (!response.ok) throw new Error('Không thể tải dữ liệu quản trị');
  return response.json();
}

export { API_BASE_URL };
