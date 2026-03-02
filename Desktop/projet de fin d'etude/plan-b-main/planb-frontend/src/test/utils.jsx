import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'

// Wrapper pour les tests avec providers
const AllProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  )
}

// Render personnalisé avec tous les providers
export const renderWithProviders = (ui, options = {}) => {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Mock d'un utilisateur connecté
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phone: '+225 0700000000',
  accountType: 'standard',
  roles: ['ROLE_USER'],
}

// Mock d'un utilisateur PRO
export const mockProUser = {
  ...mockUser,
  accountType: 'pro',
  subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
}

// Mock d'une annonce
export const mockListing = {
  id: 1,
  title: 'Appartement 3 pièces',
  description: 'Bel appartement à Cocody',
  price: 150000,
  priceUnit: 'mois',
  category: 'appartement',
  transactionType: 'location',
  city: 'Abidjan',
  district: 'Cocody',
  images: ['/images/test.jpg'],
  user: mockUser,
  createdAt: new Date().toISOString(),
}

// Re-export tout de testing-library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
