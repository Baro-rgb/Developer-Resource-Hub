// src/services/api.js
import axios from 'axios';

/**
 * API Service
 * Quản lý tất cả HTTP requests tới backend
 * 
 * Base URL: http://localhost:4000/api
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Tạo axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * ==========================================
 * RESOURCE ENDPOINTS
 * ==========================================
 */

// Lấy danh sách resources
export const getResources = async (params = {}) => {
  try {
    const response = await apiClient.get('/resources', { params });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Lấy chi tiết resource
export const getResourceById = async (id) => {
  try {
    const response = await apiClient.get(`/resources/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Tạo resource mới
export const createResource = async (resourceData) => {
  try {
    const response = await apiClient.post('/resources', resourceData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Update resource
export const updateResource = async (id, resourceData) => {
  try {
    const response = await apiClient.put(`/resources/${id}`, resourceData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Xóa resource
export const deleteResource = async (id) => {
  try {
    const response = await apiClient.delete(`/resources/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Lấy danh sách sources
export const getSources = async () => {
  try {
    const response = await apiClient.get('/resources/sources');
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Auth endpoints
export const register = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/register', credentials);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getProfile = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Categories endpoints
export const getCategories = async (params = {}) => {
  try {
    const response = await apiClient.get('/categories', { params });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await apiClient.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await apiClient.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Admin endpoints
export const getAdminUsers = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateAdminUser = async (id, userData) => {
  try {
    const response = await apiClient.put(`/admin/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteAdminUser = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getAdminResources = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/resources', { params });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateAdminResource = async (id, resourceData) => {
  try {
    const response = await apiClient.put(`/admin/resources/${id}`, resourceData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteAdminResource = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/resources/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Error handler
 * @param {Error} error - Error object từ axios
 */
const handleError = (error) => {
  if (error.response) {
    // Server responded with error
    return {
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'No response from server',
      status: 0,
    };
  } else {
    // Error in request setup
    return {
      message: error.message,
      status: 0,
    };
  }
};

export default apiClient;
