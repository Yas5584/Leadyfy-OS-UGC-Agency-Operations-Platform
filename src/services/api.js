// Clean up BASE_URL and ensure proper formatting
let rawBase = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
if (rawBase.startsWith('http') && !rawBase.endsWith('/api')) {
  rawBase += '/api';
}
const BASE_URL = rawBase;

const request = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const res = await fetch(`${BASE_URL}${cleanUrl}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.message || 'API Error');
  return data;
};

const api = {
  get: (url) => request(url),
  post: (url, data) => request(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url, data) => request(url, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (url, data) => request(url, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (url) => request(url, { method: 'DELETE' })
};

// Build query string from params object
const qs = (params) => {
  const filtered = Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== '');
  return filtered.length ? '?' + new URLSearchParams(filtered).toString() : '';
};

// ─── Auth Service ────────────────────────────────────────
export const authService = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ─── Dashboard Service ───────────────────────────────────
export const dashboardService = {
  get: () => api.get('/dashboard'),
};

// ─── Client Service ──────────────────────────────────────
export const clientService = {
  getAll: (params) => api.get(`/clients${qs(params)}`),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

// ─── Order Service ───────────────────────────────────────
export const orderService = {
  getAll: (params) => api.get(`/orders${qs(params)}`),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
};

// ─── Order Request Service ───────────────────────────────
export const orderRequestService = {
  getAll: (params) => api.get(`/order-requests${qs(params)}`),
  getById: (id) => api.get(`/order-requests/${id}`),
  create: (data) => api.post('/order-requests', data),
  update: (id, data) => api.put(`/order-requests/${id}`, data),
  review: (id, data) => api.patch(`/order-requests/${id}/review`, data),
  approve: (id, data) => api.post(`/order-requests/${id}/approve`, data),
};

// ─── Script Service ──────────────────────────────────────
export const scriptService = {
  getAll: (params) => api.get(`/scripts${qs(params)}`),
  getById: (id) => api.get(`/scripts/${id}`),
  create: (data) => api.post('/scripts', data),
  update: (id, data) => api.put(`/scripts/${id}`, data),
  updateStatus: (id, data) => api.patch(`/scripts/${id}/status`, data),
};

// ─── Creator Service ─────────────────────────────────────
export const creatorService = {
  getAll: (params) => api.get(`/creators${qs(params)}`),
  getById: (id) => api.get(`/creators/${id}`),
  create: (data) => api.post('/creators', data),
  update: (id, data) => api.put(`/creators/${id}`, data),
};

// ─── Shoot Service ───────────────────────────────────────
export const shootService = {
  getAll: (params) => api.get(`/shoots${qs(params)}`),
  getById: (id) => api.get(`/shoots/${id}`),
  create: (data) => api.post('/shoots', data),
  update: (id, data) => api.put(`/shoots/${id}`, data),
};

// ─── Video Service ───────────────────────────────────────
export const videoService = {
  getAll: (params) => api.get(`/videos${qs(params)}`),
  getById: (id) => api.get(`/videos/${id}`),
  create: (data) => api.post('/videos', data),
  update: (id, data) => api.put(`/videos/${id}`, data),
  updateStatus: (id, data) => api.patch(`/videos/${id}/status`, data),
  addFeedback: (id, data) => api.post(`/videos/${id}/feedback`, data),
};

// ─── Payment Service ─────────────────────────────────────
export const paymentService = {
  getAll: (params) => api.get(`/payments${qs(params)}`),
  create: (data) => api.post('/payments', data),
};

// ─── Expense Service ─────────────────────────────────────
export const expenseService = {
  getAll: (params) => api.get(`/expenses${qs(params)}`),
  create: (data) => api.post('/expenses', data),
};

// ─── Payout Service ──────────────────────────────────────
export const payoutService = {
  getAll: (params) => api.get(`/creator-payouts${qs(params)}`),
  create: (data) => api.post('/creator-payouts', data),
};

// ─── Task Service ────────────────────────────────────────
export const taskService = {
  getAll: (params) => api.get(`/tasks${qs(params)}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
};

// ─── Ticket Service ──────────────────────────────────────
export const ticketService = {
  getAll: (params) => api.get(`/tickets${qs(params)}`),
  create: (data) => api.post('/tickets', data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
};

// ─── Notification Service ────────────────────────────────
export const notificationService = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// ─── Activity Log Service ────────────────────────────────
export const activityService = {
  getAll: (params) => api.get(`/activity-logs${qs(params)}`),
};

// ─── Employee Service ────────────────────────────────────
export const employeeService = {
  getAll: (params) => api.get(`/employees${qs(params)}`),
};

export default api;
