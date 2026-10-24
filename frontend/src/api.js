import axios from 'axios';

// Base API URL: Uses relative '/api' path for Vite proxy by default, or VITE_API_URL override
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: automatically attaches the JWT token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: handles global error scenarios (such as token expiry)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If we are not on the login endpoint and get 401, clear credentials
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('username');
        window.dispatchEvent(new Event('auth-logout'));
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password });
    if (response.data && response.data.jwtToken) {
      localStorage.setItem('jwtToken', response.data.jwtToken);
      localStorage.setItem('username', response.data.username || username);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    window.dispatchEvent(new Event('auth-logout'));
  },
  getCurrentUser: () => {
    return localStorage.getItem('username') || 'Admin';
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('jwtToken');
  },
  getToken: () => {
    return localStorage.getItem('jwtToken');
  },
};

export const employeeApi = {
  getPaged: async ({ page = 0, size = 10, search = '', department = '', status = '', employmentType = '', sortBy = 'id', sortDir = 'asc' } = {}) => {
    const params = { page, size, sortBy, sortDir };
    if (search && search.trim()) params.search = search.trim();
    if (department && department !== 'ALL') params.department = department;
    if (status && status !== 'ALL') params.status = status;
    if (employmentType && employmentType !== 'ALL') params.employmentType = employmentType;

    const response = await apiClient.get('/employees', { params });
    return response.data;
  },
  getAll: async (searchTerm = '') => {
    const params = {};
    if (searchTerm && searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    const response = await apiClient.get('/employees', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  },
  create: async (employeeData) => {
    const response = await apiClient.post('/employees', employeeData);
    return response.data;
  },
  update: async (id, employeeData) => {
    const response = await apiClient.put(`/employees/${id}`, employeeData);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
  },
  bulkDelete: async (ids) => {
    const response = await apiClient.delete('/employees/bulk', { data: { ids } });
    return response.data;
  },
  bulkUpdateStatus: async (ids, status) => {
    const response = await apiClient.patch('/employees/bulk-status', { ids, status });
    return response.data;
  },
  getStats: async () => {
    const response = await apiClient.get('/employees/stats');
    return response.data;
  },
  getDepartments: async () => {
    const response = await apiClient.get('/employees/departments');
    return response.data;
  },
  exportCsv: async ({ search = '', department = '', status = '', employmentType = '' } = {}) => {
    const params = {};
    if (search && search.trim()) params.search = search.trim();
    if (department && department !== 'ALL') params.department = department;
    if (status && status !== 'ALL') params.status = status;
    if (employmentType && employmentType !== 'ALL') params.employmentType = employmentType;

    const response = await apiClient.get('/employees/export', {
      params,
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bharattech-workforce-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default apiClient;
