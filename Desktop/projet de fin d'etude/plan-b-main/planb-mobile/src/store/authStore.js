// Store d'authentification pour Plan B Mobile
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  // Initialiser l'auth depuis le storage
  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true, isLoading: false });
        
        // Vérifier que le token est toujours valide
        try {
          const freshUser = await authAPI.getMe();
          set({ user: freshUser });
          await AsyncStorage.setItem('user', JSON.stringify(freshUser));
        } catch (error) {
          // Token invalide, déconnecter
          await get().logout();
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Erreur initialisation auth:', error);
      set({ isLoading: false });
    }
  },

  // Connexion
  login: async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response;
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      set({ token, user, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Erreur de connexion' };
    }
  },

  // Inscription
  register: async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response;
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      set({ token, user, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Erreur d\'inscription' };
    }
  },

  // Déconnexion
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  // Mettre à jour le profil
  updateProfile: async (data) => {
    try {
      const updatedUser = await authAPI.updateProfile(data);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Rafraîchir les données utilisateur
  refreshUser: async () => {
    try {
      const user = await authAPI.getMe();
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error('Erreur refresh user:', error);
    }
  },
}));

export default useAuthStore;
