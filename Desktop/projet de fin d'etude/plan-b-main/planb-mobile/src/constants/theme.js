// Thème et constantes de style pour Plan B Mobile

export const COLORS = {
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  primaryLight: '#FF8A5C',
  
  secondary: '#2D3748',
  secondaryLight: '#4A5568',
  
  success: '#48BB78',
  warning: '#ECC94B',
  error: '#F56565',
  info: '#4299E1',
  
  background: '#F7FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  text: '#1A202C',
  textSecondary: '#718096',
  textLight: '#A0AEC0',
  textInverse: '#FFFFFF',
  
  border: '#E2E8F0',
  borderLight: '#EDF2F7',
  
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const CATEGORIES = [
  { id: 'immobilier', label: 'Immobilier', icon: 'home' },
  { id: 'vehicule', label: 'Véhicules', icon: 'car' },
  { id: 'vacance', label: 'Vacances', icon: 'umbrella-beach' },
];

export const TRANSACTION_TYPES = [
  { id: 'vente', label: 'Vente' },
  { id: 'location', label: 'Location' },
];

export default {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  CATEGORIES,
  TRANSACTION_TYPES,
};
