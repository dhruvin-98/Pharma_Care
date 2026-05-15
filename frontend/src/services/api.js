// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}`;
const API_URL = `${API_BASE_URL}/api`;


// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Inventory API
export const inventoryAPI = {
  getMedicines: (params) => api.get('/inventory', { params }),
  getMedicineById: (id) => api.get(`/inventory/${id}`),
  createMedicine: (medicineData) => api.post('/inventory', medicineData),
  updateMedicine: (id, medicineData) => api.put(`/inventory/${id}`, medicineData),
  deleteMedicine: (id) => api.delete(`/inventory/${id}`),
  getCategories: () => api.get('/inventory/categories'),
};

export { API_URL, API_BASE_URL };
export default api;