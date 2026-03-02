import { Platform } from 'react-native';
import Constants from 'expo-constants';

// L'IP locale est détectée automatiquement en mode Expo Dev
// Sinon, définissez la variable d'environnement API_BASE_URL
const getLocalIp = () => {
  // Expo fournit l'IP du serveur dev via le manifest
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  if (debuggerHost) {
    return debuggerHost.split(':')[0];
  }
  return 'localhost';
};

// Configuration de l'API selon l'environnement
const API_BASE_URL = __DEV__
  ? `http://${getLocalIp()}:8000/api/v1`  // Développement : IP détectée automatiquement
  : (process.env.API_BASE_URL || 'https://votre-domaine.com/api/v1');  // Production

export default {
  API_BASE_URL,
  TIMEOUT: 10000,  // Timeout de 10 secondes
  
  // Endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    
    // Listings
    LISTINGS: '/listings',
    MY_LISTINGS: '/users/my-listings',
    
    // Categories
    CATEGORIES: '/categories',
    
    // Search
    SEARCH: '/search',
  },
};

// Helper pour construire les URLs complètes
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Configuration Axios
export const axiosConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
