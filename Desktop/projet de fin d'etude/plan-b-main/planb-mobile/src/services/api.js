// Service API principal pour Plan B Mobile
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, API_CONFIG, getHeaders } from '../config/api';

// Fonction de requête générique
const request = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('token');
  
  const config = {
    method: options.method || 'GET',
    headers: getHeaders(token),
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, message: data.message || 'Erreur serveur', data };
    }

    return data;
  } catch (error) {
    console.error('[API Error]', endpoint, error);
    throw error;
  }
};

// ==================== AUTH ====================
export const authAPI = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  getMe: () => request('/auth/me'),
  updateProfile: (data) => request('/users/profile', { method: 'PUT', body: data }),
  changePassword: (passwords) => request('/users/password', { method: 'PUT', body: passwords }),
};

// ==================== LISTINGS ====================
export const listingsAPI = {
  getListings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/listings${queryString ? `?${queryString}` : ''}`);
  },
  getListing: (id) => request(`/listings/${id}`),
  getMyListings: () => request('/users/my-listings'),
  createListing: (data) => request('/listings', { method: 'POST', body: data }),
  updateListing: (id, data) => request(`/listings/${id}`, { method: 'PUT', body: data }),
  deleteListing: (id) => request(`/listings/${id}`, { method: 'DELETE' }),
  getRecentListings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/listings/recent${queryString ? `?${queryString}` : ''}`);
  },
  getProListings: (limit = 10) => request(`/listings/pro?limit=${limit}`),
  searchListings: (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters }).toString();
    return request(`/search?${params}`);
  },
  incrementContacts: (id) => request(`/listings/${id}/contact`, { method: 'POST' }),
};

// ==================== FAVORITES ====================
export const favoritesAPI = {
  getAll: () => request('/favorites'),
  add: (listingId) => request(`/favorites/${listingId}`, { method: 'POST' }),
  remove: (listingId) => request(`/favorites/${listingId}`, { method: 'DELETE' }),
  check: (listingId) => request(`/favorites/check/${listingId}`),
};

// ==================== CONVERSATIONS ====================
export const conversationsAPI = {
  getAll: () => request('/conversations'),
  getById: (id) => request(`/conversations/${id}`),
  start: (listingId) => request(`/conversations/start/${listingId}`, { method: 'POST' }),
};

// ==================== MESSAGES ====================
export const messagesAPI = {
  getByConversation: (conversationId) => request(`/conversations/${conversationId}/messages`),
  send: (conversationId, content) => request(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: { content },
  }),
};

// ==================== NOTIFICATIONS ====================
export const notificationsAPI = {
  getAll: (status = null, limit = 50) => {
    const params = new URLSearchParams({ limit });
    if (status) params.append('status', status);
    return request(`/notifications?${params.toString()}`);
  },
  getUnreadCount: () => request('/notifications/unread-count'),
  markAsRead: (id) => request(`/notifications/${id}/read`, { method: 'POST' }),
  markAllAsRead: () => request('/notifications/read-all', { method: 'POST' }),
};

// ==================== REVIEWS ====================
export const reviewsAPI = {
  getByListing: (listingId) => request(`/listings/${listingId}/reviews`),
  getByUser: (userId) => request(`/users/${userId}/reviews`),
  create: (listingId, data) => request(`/listings/${listingId}/reviews`, { method: 'POST', body: data }),
};

// ==================== USERS ====================
export const usersAPI = {
  getProfile: (id) => request(`/users/${id}`),
  getPublicProfile: (id) => request(`/users/${id}/public`),
};

// ==================== CATEGORIES ====================
export const categoriesAPI = {
  getAll: () => request('/categories'),
};

export default {
  auth: authAPI,
  listings: listingsAPI,
  favorites: favoritesAPI,
  conversations: conversationsAPI,
  messages: messagesAPI,
  notifications: notificationsAPI,
  reviews: reviewsAPI,
  users: usersAPI,
  categories: categoriesAPI,
};
