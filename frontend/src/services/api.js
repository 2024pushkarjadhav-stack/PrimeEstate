import axios from 'axios';

const rawApiUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

// Normalize URL: trim trailing slash and ensure /api endpoint path is present
const cleanUrl = rawApiUrl.replace(/\/+$/, '');
const API_BASE_URL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to automatically add JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('primeestate_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for response sanitization
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, token might be invalid or expired
    if (error.response && error.response.status === 401) {
      // Allow caller to handle
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Property Services
export const propertyService = {
  getAll: async (params) => {
    const response = await api.get('/properties', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },
  create: async (propertyData) => {
    const response = await api.post('/properties', propertyData);
    return response.data;
  },
  update: async (id, propertyData) => {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },
};

// Lead Services
export const leadService = {
  getAll: async () => {
    const response = await api.get('/leads');
    return response.data;
  },
  create: async (leadData) => {
    const response = await api.post('/leads', leadData);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/leads/${id}`, { status });
    return response.data;
  },
};

// Appointment Services
export const appointmentService = {
  getAll: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },
  create: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },
  updateStatus: async (id, status, notes) => {
    const response = await api.put(`/appointments/${id}`, { status, notes });
    return response.data;
  },
};

export default api;
