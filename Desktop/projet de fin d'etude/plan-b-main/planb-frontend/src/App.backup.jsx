import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';
import SplashScreen from './components/animations/SplashScreen';
import RequireAuth from './components/auth/RequireAuth';
import RequireAdmin from './components/auth/RequireAdmin';
import Layout from './components/layout/LayoutMinimal';
import { initializeSubscription } from './utils/subscription';
import pushNotificationService from './services/pushNotification';
import pwaService from './services/pwa';
// Store auth commenté temporairement pour debug
// import './store/authStore';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// Routes principales (chargement immédiat pour performance)
import Home from './pages/HomeAfrique';
import ListingDetail from './pages/ListingDetail';
import Auth from './pages/Auth';


// Routes secondaires (lazy loading pour optimisation)
const SearchResults = lazy(() => import('./pages/SearchResults'));
const Publish = lazy(() => import('./pages/Publish'));
const Profile = lazy(() => import('./pages/Profile'));
const Favorites = lazy(() => import('./pages/Favorites'));
const FavoritesList = lazy(() => import('./pages/FavoritesList'));
const RegisterWithOTP = lazy(() => import('./pages/RegisterWithOTP'));
const UpgradePlan = lazy(() => import('./pages/UpgradePlan'));
const WavePayment = lazy(() => import('./pages/WavePayment'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentCancel = lazy(() => import('./pages/PaymentCancel'));
const Settings = lazy(() => import('./pages/Settings'));
const AnimationDemo = lazy(() => import('./pages/AnimationDemo'));
const SellerProfile = lazy(() => import('./pages/SellerProfile'));
const MySubscription = lazy(() => import('./pages/MySubscription'));
const EditListing = lazy(() => import('./pages/EditListing'));
const EditListingPayment = lazy(() => import('./pages/EditListingPayment'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Map = lazy(() => import('./pages/Map'));
const Stats = lazy(() => import('./pages/Stats'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const DebugAuth = lazy(() => import('./pages/DebugAuth'));
const BookingRequest = lazy(() => import('./pages/BookingRequest'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const BookingDetail = lazy(() => import('./pages/BookingDetail'));
const Availability = lazy(() => import('./pages/Availability'));
const PushNotificationPrompt = lazy(() => import('./components/notifications/PushNotificationPrompt'));
const InstallPrompt = lazy(() => import('./components/pwa/InstallPrompt'));
const OfflineIndicator = lazy(() => import('./components/pwa/OfflineIndicator'));

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Vérifier l'expiration de l'abonnement au chargement
  useEffect(() => {
    initializeSubscription();

    // Initialiser PWA
    pwaService.initialize();

    // Initialiser les notifications push
    const initPush = async () => {
      try {
        await pushNotificationService.initialize();
        // Vérifier si déjà abonné
        const isSubscribed = await pushNotificationService.isSubscribed();
        if (!isSubscribed && pushNotificationService.getPermission() === 'default') {
          // La permission sera demandée via un composant dédié
          console.log('Push notifications available but not subscribed');
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };
    initPush();

    // Synchroniser le token au démarrage
    if (window.useAuthStore) {
      const store = window.useAuthStore.getState();
      if (typeof store.hydrateToken === 'function') {
        store.hydrateToken();
      }
    }
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Layout>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(249, 115, 22, 0.2)',
                },
              }}
            />

            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<Home />} />

                <Route path="/search" element={<SearchResults />} />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/seller/:userId" element={<SellerProfile />} />
                <Route path="/map" element={<Map />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/login" element={<Auth />} />
                <Route path="/auth/register" element={<Auth />} />
                <Route path="/auth/register-otp" element={<RegisterWithOTP />} />
                <Route path="/animations" element={<AnimationDemo />} />
                <Route path="/debug-auth" element={<DebugAuth />} />

                {/* Routes protégées - nécessitent une connexion */}
                <Route path="/publish" element={<RequireAuth><Publish /></RequireAuth>} />
                <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                <Route path="/my-subscription" element={<RequireAuth><MySubscription /></RequireAuth>} />
                <Route path="/edit-listing/:id" element={<RequireAuth><EditListing /></RequireAuth>} />
                <Route path="/payment/edit-listing" element={<RequireAuth><EditListingPayment /></RequireAuth>} />
                <Route path="/favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
                <Route path="/favorites-new" element={<RequireAuth><FavoritesList /></RequireAuth>} />
                <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
                <Route path="/upgrade" element={<RequireAuth><UpgradePlan /></RequireAuth>} />
                <Route path="/payment/wave" element={<RequireAuth><WavePayment /></RequireAuth>} />
                <Route path="/payment/success" element={<RequireAuth><PaymentSuccess /></RequireAuth>} />
                <Route path="/payment/cancel" element={<RequireAuth><PaymentCancel /></RequireAuth>} />
                <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
                <Route path="/stats" element={<RequireAuth><Stats /></RequireAuth>} />

                {/* Routes réservations */}
                <Route path="/booking/:id" element={<RequireAuth><BookingRequest /></RequireAuth>} />
                <Route path="/bookings" element={<RequireAuth><MyBookings /></RequireAuth>} />
                <Route path="/bookings/:id" element={<RequireAuth><BookingDetail /></RequireAuth>} />

                {/* Route disponibilités (visites) */}
                <Route path="/availability" element={<RequireAuth><Availability /></RequireAuth>} />

                {/* Route Admin - nécessite ROLE_ADMIN (double protection) */}
                <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
              </Routes>
            </Suspense>

            {/* Prompt d'installation PWA */}
            <Suspense fallback={null}>
              <InstallPrompt />
            </Suspense>

            {/* Indicateur hors ligne */}
            <Suspense fallback={null}>
              <OfflineIndicator />
            </Suspense>
          </Layout>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
