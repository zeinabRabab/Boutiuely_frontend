import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('boutiquely_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('boutiquely_token');
      localStorage.removeItem('boutiquely_user');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

export const usersAPI = {
  me: () => api.get('/users/me'),
  list: () => api.get('/users/'),
  create: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/users/', data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

export const productsAPI = {
  list: (params?: { search?: string; category?: string; skip?: number; limit?: number }) =>
    api.get('/products/', { params }),
  get: (id: number) => api.get(`/products/${id}`),
  create: (data: object) => api.post('/products/', data),
  update: (id: number, data: object) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  lowStock: () => api.get('/products/low-stock'),
  bulkImport: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/products/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const ordersAPI = {
  place: (items: { product_id: number; quantity: number }[]) =>
    api.post('/orders/', { items }),
  mine: (params?: { status?: string; skip?: number; limit?: number }) =>
    api.get('/orders/my', { params }),
  all: (params?: { status?: string; skip?: number; limit?: number }) =>
    api.get('/orders/', { params }),
  updateStatus: (id: number, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
};

export const analyticsAPI = {
  dashboard: () => api.get('/analytics/dashboard'),
  topProducts: (limit = 10) => api.get('/analytics/top-products', { params: { limit } }),
  revenueTrend: (days = 30) => api.get('/analytics/revenue-trend', { params: { days } }),
  orderStatus: () => api.get('/analytics/order-status'),
  categoryBreakdown: () => api.get('/analytics/category-breakdown'),
  userGrowth: (days = 30) => api.get('/analytics/user-growth', { params: { days } }),
  inventory: () => api.get('/analytics/inventory'),
  analyze: () => api.get('/analytics/analyze'),
};

export const recommendationsAPI = {
  get: (productId: number, topN = 6) =>
    api.get(`/recommendations/${productId}`, { params: { top_n: topN } }),
};

export const reportsAPI = {
  downloadCSV: () =>
    api.get('/reports/download/csv', { responseType: 'blob' }),
  downloadPDF: () =>
    api.get('/reports/download/pdf', { responseType: 'blob' }),
};

export const monitoringAPI = {
  systemReport: () => api.get('/system-report/'),
};

export default api;
