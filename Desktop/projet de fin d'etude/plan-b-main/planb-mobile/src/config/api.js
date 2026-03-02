// Configuration API pour l'application mobile Plan B
import { Platform } from 'react-native';

// Adresse IP locale du serveur backend
// ⚠️ IMPORTANT: Remplacez par votre adresse IP locale
const LOCAL_IP = '192.168.1.176';

// URL de base de l'API
export const API_URL = `http://${LOCAL_IP}:8000/api/v1`;

// URL du frontend web (pour les images)
export const WEB_URL = `http://${LOCAL_IP}:5173`;

// Configuration des timeouts
export const API_CONFIG = {
  timeout: 30000, // 30 secondes
  retryAttempts: 3,
};

// Headers par défaut
export const getHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export default {
  API_URL,
  WEB_URL,
  API_CONFIG,
  getHeaders,
};
