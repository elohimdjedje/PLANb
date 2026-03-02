import axios from 'axios';
import { axiosConfig } from '../config/api';

// Créer une instance Axios
const api = axios.create(axiosConfig);

// Intercepteur pour ajouter le token JWT à toutes les requêtes
api.interceptors.request.use(
  async (config) => {
    // TODO: Récupérer le token du AsyncStorage
    // const token = await AsyncStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erreur de réponse du serveur
      console.error('API Error:', error.response.data);
      
      // Si 401, déconnecter l'utilisateur
      if (error.response.status === 401) {
        // TODO: Déconnexion et redirection vers login
      }
    } else if (error.request) {
      // Pas de réponse du serveur
      console.error('Network Error:', error.request);
    } else {
      // Autre erreur
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

// Services API

/**
 * Service d'authentification
 */
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { username: email, password });
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

/**
 * Service des annonces
 */
export const listingsAPI = {
  getListings: async (params = {}) => {
    const response = await api.get('/listings', { params });
    return response.data;
  },
  
  getListing: async (id) => {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  },
  
  getMyListings: async () => {
    const response = await api.get('/users/my-listings');
    return response.data;
  },
  
  createListing: async (listingData) => {
    const response = await api.post('/listings', listingData);
    return response.data;
  },
  
  updateListing: async (id, listingData) => {
    const response = await api.put(`/listings/${id}`, listingData);
    return response.data;
  },
  
  deleteListing: async (id) => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  },
};

/**
 * Service de recherche
 */
export const searchAPI = {
  search: async (query, filters = {}) => {
    const response = await api.get('/search', {
      params: { q: query, ...filters },
    });
    return response.data;
  },
};

/**
 * Service des catégories
 */
export const categoriesAPI = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
};
