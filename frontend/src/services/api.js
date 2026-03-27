import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const IMAGE_BASE_URL = 'http://localhost:8001';

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}${path}`;
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lxi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lxi_token');
      localStorage.removeItem('lxi_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================
// AUTHENTICATION
// ============================================================

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// ============================================================
// USER PROFILE
// ============================================================

export const userService = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (data) => api.put('/users/profile', data),
};

// ============================================================
// PRODUCTS
// ============================================================

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getAllAdmin: () => api.get('/admin/products'),
  getById: (productId) => api.get(`/products/${encodeURIComponent(productId)}`),
  getBySlug: (slug) => api.get(`/products/slug/${encodeURIComponent(slug)}`),
  create: (data) => api.post('/admin/products', data),
  update: (productId, data) => api.put(`/admin/products/${productId}`, data),
  delete: (productId) => api.delete(`/admin/products/${productId}`),
};

// ============================================================
// WISHLIST
// ============================================================

export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  addItem: (productId) => api.post(`/wishlist/${productId}`),
  removeItem: (productId) => api.delete(`/wishlist/${productId}`),
};

// ============================================================
// REVIEWS
// ============================================================

export const reviewService = {
  create: (data) => api.post('/reviews', data),
  getByProduct: (productId, params) => api.get(`/products/${productId}/reviews`, { params }),
  update: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

// ============================================================
// ORDERS
// ============================================================

export const orderService = {
  createCheckout: (data) => api.post('/checkout/create-session', data),
  createPayPalCheckout: (data) => api.post('/checkout/create-paypal-order', data),
  capturePayPalOrder: (orderId) => api.post('/checkout/capture-paypal-order', { order_id: orderId }),
  getStatus: (sessionId) => api.get(`/checkout/status/${sessionId}`),
  getOrders: () => api.get('/orders'),
  getMyOrders: () => api.get('/orders'),
  getOrder: (sessionId) => api.get(`/orders/${sessionId}`),
};

// ============================================================
// NEWSLETTER
// ============================================================

export const newsletterService = {
  subscribe: (email) => api.post('/newsletter/subscribe', { email }),
};

// ============================================================
// ADMIN
// ============================================================

export const adminService = {
  getAllOrders: () => api.get('/admin/orders'),
  getSubscribers: () => api.get('/admin/newsletter/subscribers'),
  getIntegrationStatus: () => api.get('/admin/integrations/status'),
  getHomeContent: () => api.get('/admin/site-content/home'),
  getGlobalContent: () => api.get('/admin/site-content/global'),
  getPhilosophyContent: () => api.get('/admin/site-content/philosophy'),
  updateHomeContent: (data) => api.put('/admin/site-content/home', data),
  updateGlobalContent: (data) => api.put('/admin/site-content/global', data),
  updatePhilosophyContent: (data) => api.put('/admin/site-content/philosophy', data),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/admin/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  syncPrintful: () => api.post('/admin/sync-products-printful'),
  importPrintfulCatalog: () => api.post('/admin/import-printful-catalog'),
  getStats: () => api.get('/admin/stats'),
};

export const siteContentService = {
  getHomeContent: () => api.get('/site-content/home'),
  getGlobalContent: () => api.get('/site-content/global'),
  getPhilosophyContent: () => api.get('/site-content/philosophy'),
};

export default api;
