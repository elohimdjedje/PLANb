/**
 * App.jsx - Version Refactorisée
 * 
 * Structure des fichiers extraits:
 * ├── components/
 * │   ├── ui/
 * │   │   ├── AnimatedCounter.jsx
 * │   │   ├── ListingCard.jsx
 * │   │   ├── OnboardingTour.jsx
 * │   │   └── index.js
 * │   ├── layout/
 * │   │   └── Header.jsx
 * │   └── modals/
 * │       ├── SaveSearchModal.jsx
 * │       └── index.js
 * ├── pages/
 * │   ├── HomePage.jsx
 * │   ├── AnnoncesPage.jsx
 * │   ├── ListingDetailPage.jsx
 * │   ├── CategoryPage.jsx
 * │   ├── SellerProfilePage.jsx
 * │   ├── MessagesPage.jsx
 * │   ├── NotificationsPage.jsx
 * │   ├── MyListingsPage.jsx
 * │   ├── MyReservationsPage.jsx
 * │   ├── MyPaymentsPage.jsx
 * │   ├── FavoritesPage.jsx
 * │   ├── StatsPage.jsx
 * │   ├── ProfileSettingsPage.jsx
 * │   ├── UpgradePage.jsx
 * │   ├── PublishPage.jsx
 * │   ├── AuthPage.jsx
 * │   ├── MapPage.jsx
 * │   ├── AdminPage.jsx
 * │   ├── AboutPage.jsx
 * │   ├── ContactPage.jsx
 * │   ├── TermsPage.jsx
 * │   └── index.js
 * └── utils/
 *     └── helpers.js
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';

// Layout Components (statiques - nécessaires à chaque route)
import Header from './components/layout/Header';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Layout Components - Lazy (non-critiques au rendu initial)
const OnboardingTour = lazy(() => import('./components/ui/OnboardingTour'));
const InstallPrompt = lazy(() => import('./components/pwa/InstallPrompt'));

// Pages - Lazy loaded (code splitting)
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));
const HomePage = lazy(() => import('./pages/HomePage'));

// Pages - Lazy loaded for code splitting
const AnnoncesPage = lazy(() => import('./pages/AnnoncesPage'));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const SellerProfilePage = lazy(() => import('./pages/SellerProfilePage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const MyListingsPage = lazy(() => import('./pages/MyListingsPage'));
const MyReservationsPage = lazy(() => import('./pages/MyReservationsPage'));
const MyPaymentsPage = lazy(() => import('./pages/MyPaymentsPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const ProfileSettingsPage = lazy(() => import('./pages/ProfileSettingsPage'));
const UpgradePage = lazy(() => import('./pages/UpgradePage'));
const PublishPage = lazy(() => import('./pages/PublishPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentCancelPage = lazy(() => import('./pages/PaymentCancelPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AdvancedSearchPage = lazy(() => import('./pages/AdvancedSearchPage'));
const ListingStatsPage = lazy(() => import('./pages/ListingStatsPage'));
const VerificationPage = lazy(() => import('./pages/VerificationPage'));
const TwoFactorVerifyPage = lazy(() => import('./pages/TwoFactorVerifyPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const SecureDepositsPage = lazy(() => import('./pages/SecureDepositsPage'));
const DepositDetailPage = lazy(() => import('./pages/DepositDetailPage'));
const PayDepositPage = lazy(() => import('./pages/PayDepositPage'));
const CGUCautionPage = lazy(() => import('./pages/CGUCautionPage'));
const ContractDetailPage = lazy(() => import('./pages/contracts/ContractDetailPage'));

// Loading component for Suspense fallback
function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
            </div>
        </div>
    );
}

// App Content with routing
function AppContent() {
    const location = useLocation();
    const hideHeader = ['/', '/login', '/register', '/admin', '/verify-2fa', '/verify-email'].includes(location.pathname);

    return (
        <>
            {!hideHeader && <Header />}
            <OnboardingTour />
            <InstallPrompt />
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/annonces" element={<AnnoncesPage />} />
                    <Route path="/category/:categoryName" element={<CategoryPage />} />
                    <Route path="/listing/:id" element={<ListingDetailPage />} />
                    <Route path="/seller/:sellerId" element={<SellerProfilePage />} />
                    <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
                    <Route path="/reservations" element={<ProtectedRoute><MyReservationsPage /></ProtectedRoute>} />
                    <Route path="/payments" element={<ProtectedRoute><MyPaymentsPage /></ProtectedRoute>} />
                    <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                    <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} />
                    <Route path="/upgrade" element={<ProtectedRoute><UpgradePage /></ProtectedRoute>} />
                    <Route path="/publish" element={<ProtectedRoute><PublishPage /></ProtectedRoute>} />
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/register" element={<AuthPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/verify-2fa" element={<TwoFactorVerifyPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/search" element={<AdvancedSearchPage />} />
                    <Route path="/verification" element={<ProtectedRoute><VerificationPage /></ProtectedRoute>} />
                    <Route path="/listing/:id/stats" element={<ProtectedRoute><ListingStatsPage /></ProtectedRoute>} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/payments/success" element={<PaymentSuccessPage />} />
                    <Route path="/payments/cancel" element={<PaymentCancelPage />} />
                    <Route path="/escrow" element={<ProtectedRoute><SecureDepositsPage /></ProtectedRoute>} />
                    <Route path="/escrow/:id" element={<ProtectedRoute><DepositDetailPage /></ProtectedRoute>} />
                    <Route path="/escrow/pay/:listingId" element={<ProtectedRoute><PayDepositPage /></ProtectedRoute>} />
                    <Route path="/cgu-caution" element={<CGUCautionPage />} />
                    <Route path="/contracts/:id" element={<ProtectedRoute><ContractDetailPage /></ProtectedRoute>} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </>
    );
}

// Main App component
function App() {
    return (
        <Router>
            <AppContent />
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </Router>
    );
}

export default App;
