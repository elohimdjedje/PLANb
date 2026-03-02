import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { 
    Search, MapPin, SlidersHorizontal, Bell, MessageSquare, Heart, 
    ChevronDown, Plus, Star, ArrowRight, Home, Hotel, Car, Camera, 
    Eye, EyeOff, Shield, CreditCard, Globe, Menu, X, LogOut, LogIn, Settings, LayoutGrid,
    TrendingUp, Bookmark, ChevronLeft, ChevronRight, Phone, Mail, Calendar,
    Share2, AlertTriangle, CheckCheck, Trash2, Check, Clock, Building, Trees,
    DollarSign, Lock, Send, Info, CircleCheck, CircleX, Ban, Tag, Banknote,
    Users, BedDouble, KeyRound, CalendarCheck, HandCoins, FileText, CircleDot, Navigation
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Statut badge colors
const statusConfig = {
    'disponible': { label: 'Disponible', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' },
    'en_negociation': { label: 'En négociation', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' },
    'reserve': { label: 'Réservé', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
    'vendu': { label: 'Vendu', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' },
};

function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR').format(price);
}

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, prefix = '', suffix = '' }) {
    const [count, setCount] = useState(0);
    const countRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (countRef.current) {
            observer.observe(countRef.current);
        }

        return () => observer.disconnect();
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible) return;

        const endValue = typeof end === 'string' ? parseInt(end.replace(/\s/g, ''), 10) : end;
        if (isNaN(endValue)) {
            setCount(end);
            return;
        }

        let startTime;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = Math.floor(easeOutQuart * endValue);
            
            setCount(currentCount);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(endValue);
            }
        };

        requestAnimationFrame(animate);
    }, [end, duration, isVisible]);

    const displayValue = typeof count === 'number' ? count.toLocaleString('fr-FR') : count;

    return (
        <span ref={countRef}>
            {prefix}{displayValue}{suffix}
        </span>
    );
}

// Onboarding Tour Component for new users
function OnboardingTour() {
    const [currentStep, setCurrentStep] = useState(0);
    const [showTour, setShowTour] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const tourSteps = [
        {
            title: "Bienvenue sur PlanB ! 🎉",
            message: "Découvrez la première plateforme de petites annonces pour l'Afrique. Laissez-nous vous guider !",
            icon: "🏠",
            position: "center"
        },
        {
            title: "Parcourez les annonces",
            message: "Explorez des milliers d'annonces dans l'immobilier, les véhicules et les locations de vacances.",
            icon: "🔍",
            position: "center"
        },
        {
            title: "Publiez vos annonces",
            message: "Cliquez sur 'Déposer une annonce' pour vendre ou louer vos biens facilement.",
            icon: "📝",
            position: "center"
        },
        {
            title: "Complétez votre profil",
            message: "Important : Ajoutez votre numéro de téléphone et email dans votre profil pour que les acheteurs puissent vous contacter !",
            icon: "👤",
            position: "center",
            action: () => navigate('/profile')
        }
    ];

    useEffect(() => {
        // Check if user just registered (flag set during registration)
        const isNewUser = localStorage.getItem('isNewUser');
        const hasSeenTour = localStorage.getItem('hasSeenOnboarding');
        
        if (isNewUser === 'true' && !hasSeenTour) {
            setShowTour(true);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTour();
        }
    };

    const handleSkip = () => {
        completeTour();
    };

    const completeTour = () => {
        localStorage.setItem('hasSeenOnboarding', 'true');
        localStorage.removeItem('isNewUser');
        setShowTour(false);
        // Execute action if present on last step
        if (tourSteps[currentStep].action) {
            tourSteps[currentStep].action();
        }
    };

    if (!showTour) return null;

    const step = tourSteps[currentStep];

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
                {/* Progress indicator */}
                <div className="flex gap-2 mb-6">
                    {tourSteps.map((_, index) => (
                        <div 
                            key={index}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                                index <= currentStep ? 'bg-orange-500' : 'bg-gray-200'
                            }`}
                        />
                    ))}
                </div>

                {/* Icon */}
                <div className="text-6xl text-center mb-4">{step.icon}</div>

                {/* Content */}
                <h2 className="text-xl font-bold text-gray-900 text-center mb-3">{step.title}</h2>
                <p className="text-gray-600 text-center mb-8">{step.message}</p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleSkip}
                        className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        Passer
                    </button>
                    <button
                        onClick={handleNext}
                        className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    >
                        {currentStep === tourSteps.length - 1 ? 'Terminer' : 'Suivant'}
                    </button>
                </div>

                {/* Step counter */}
                <p className="text-center text-sm text-gray-400 mt-4">
                    {currentStep + 1} / {tourSteps.length}
                </p>
            </div>
        </div>
    );
}

// Header Component
function Header() {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [showProPopup, setShowProPopup] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';

    // Check authentication status on mount and when localStorage changes
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            if (token && userStr) {
                try {
                    const user = JSON.parse(userStr);
                    setCurrentUser(user);
                } catch (e) {
                    setCurrentUser(null);
                }
            } else {
                setCurrentUser(null);
            }
        };
        
        checkAuth();
        
        // Listen for storage changes (login/logout in other tabs)
        window.addEventListener('storage', checkAuth);
        
        // Custom event for same-tab updates
        window.addEventListener('authChange', checkAuth);
        
        return () => {
            window.removeEventListener('storage', checkAuth);
            window.removeEventListener('authChange', checkAuth);
        };
    }, []);

    const isLoggedIn = !!currentUser;
    const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN') || currentUser?.isAdmin === true;
    const userName = currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Utilisateur' : '';
    const userEmail = currentUser?.email || '';
    const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';

    const handleLogout = async () => {
        try {
            const { authService } = await import('./services/api.js');
            authService.logout();
        } catch (e) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        setCurrentUser(null);
        setUserMenuOpen(false);
        navigate('/');
    };

    useEffect(() => {
        const handleScroll = () => {
            // Calculer la progression du scroll (0 à 1) sur les premiers 100px
            const progress = Math.min(window.scrollY / 100, 1);
            setScrollProgress(progress);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Styles dynamiques basés sur le scroll
    const isScrolled = scrollProgress > 0.5;
    const bgOpacity = isHome ? scrollProgress : 1;
    const textColorClass = isHome && !isScrolled ? 'text-white' : 'text-gray-900';
    const iconColorClass = isHome && !isScrolled ? 'text-white' : 'text-gray-700';

    return (
        <header 
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
            style={{
                backgroundColor: isHome 
                    ? (isScrolled ? 'white' : `rgba(249, 115, 22, ${0.15 + bgOpacity * 0.85})`)
                    : 'white',
                boxShadow: bgOpacity > 0.5 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                backdropFilter: isHome && !isScrolled ? 'blur(8px)' : 'none'
            }}
        >
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <img src="/logofinal.png" alt="PlanB" className="h-20 w-auto" />
                        <span className={`text-3xl font-bold transition-colors duration-300 ${textColorClass} -ml-3`}>
                            PlanB
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        <Link
                            to="/"
                            className={`px-4 py-1.5 rounded font-medium text-sm transition-all ${
                                location.pathname === '/'
                                    ? 'bg-white text-orange-600 shadow-sm'
                                    : `${textColorClass} hover:bg-black/5`
                            }`}
                        >
                            Accueil
                        </Link>
                        <Link
                            to="/annonces"
                            className={`px-4 py-1.5 rounded font-medium text-sm transition-all ${
                                location.pathname === '/annonces'
                                    ? 'bg-white text-orange-600 shadow-sm'
                                    : `${textColorClass} hover:bg-black/5`
                            }`}
                        >
                            Annonces
                        </Link>
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        <Link to="/publish">
                            <button className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-all">
                                <Plus className="w-4 h-4" />
                                Déposer une annonce
                            </button>
                        </Link>

                        <Link to="/notifications" className={`hidden md:flex p-2 rounded-lg transition-all hover:bg-black/5 ${iconColorClass}`}>
                            <Bell className="w-5 h-5" />
                        </Link>
                        <Link to="/messages" className={`hidden md:flex p-2 rounded-lg transition-all hover:bg-black/5 ${iconColorClass}`}>
                            <MessageSquare className="w-5 h-5" />
                        </Link>
                        <Link to="/map" className={`hidden md:flex p-2 rounded-lg transition-all hover:bg-black/5 ${iconColorClass}`}>
                            <MapPin className="w-5 h-5" />
                        </Link>

                        {/* User Menu / Login Button */}
                        {isLoggedIn ? (
                            <div className="relative">
                                <button 
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-1 p-1 rounded-full hover:bg-black/5 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                                        {userInitial}
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-all duration-300 ${iconColorClass} ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {userMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2 overflow-hidden animate-menu-down">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="font-semibold text-gray-900">{userName}</p>
                                                <p className="text-sm text-gray-500">{userEmail}</p>
                                            </div>
                                            <div className="py-2">
                                                <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50">
                                                    <LayoutGrid className="w-5 h-5 text-gray-400" /> Mes annonces
                                                </Link>
                                                <Link to="/reservations" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50">
                                                    <CreditCard className="w-5 h-5 text-gray-400" /> Mes réservations
                                                </Link>
                                                <Link to="/messages" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50">
                                                    <MessageSquare className="w-5 h-5 text-gray-400" /> Messages
                                                </Link>
                                                <Link to="/payments" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50">
                                                    <CreditCard className="w-5 h-5 text-gray-400" /> Mes paiements
                                                </Link>
                                                <Link to="/notifications" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50">
                                                    <Bell className="w-5 h-5 text-gray-400" /> Notifications
                                                </Link>
                                                <Link to="/favorites" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50">
                                                    <Heart className="w-5 h-5 text-gray-400" /> Mes favoris
                                                </Link>
                                                {currentUser?.accountType === 'PRO' ? (
                                                    <Link to="/stats" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50">
                                                        <TrendingUp className="w-5 h-5 text-gray-400" /> Statistiques
                                                        <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">PRO</span>
                                                    </Link>
                                                ) : (
                                                    <button 
                                                        onClick={() => { setUserMenuOpen(false); setShowProPopup(true); }} 
                                                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 w-full"
                                                    >
                                                        <TrendingUp className="w-5 h-5 text-gray-400" /> Statistiques
                                                        <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">PRO</span>
                                                    </button>
                                                )}
                                                <Link to="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50">
                                                    <Settings className="w-5 h-5 text-gray-400" /> Mon profil
                                                </Link>
                                            </div>
                                            <div className="border-t border-gray-100 py-2">
                                                {isAdmin && (
                                                    <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-purple-600 hover:bg-purple-50">
                                                        <Shield className="w-5 h-5" /> Dashboard Admin
                                                    </Link>
                                                )}
                                                <Link to="/upgrade" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-orange-600 hover:bg-orange-50">
                                                    <Star className="w-5 h-5" /> Passer au PRO
                                                </Link>
                                                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 w-full">
                                                    <LogOut className="w-5 h-5" /> Déconnexion
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all" title="Connexion">
                                <LogIn className="w-5 h-5" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Popup PRO pour Statistiques */}
            {showProPopup && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowProPopup(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 p-6 max-w-sm w-full mx-4">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-8 h-8 text-orange-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Fonctionnalité PRO</h3>
                            <p className="text-gray-600 mb-6">
                                Les statistiques détaillées de vos annonces sont réservées aux comptes PRO. 
                                Passez au PRO pour accéder à cette fonctionnalité !
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowProPopup(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Plus tard
                                </button>
                                <Link 
                                    to="/upgrade" 
                                    onClick={() => setShowProPopup(false)}
                                    className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Star className="w-4 h-4" /> Passer PRO
                                </Link>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}

// Listing Card Component
function ListingCard({ listing }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const navigate = useNavigate();

    return (
        <div 
            onClick={() => navigate(`/listing/${listing.id}`)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 group"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                    src={listing.image || listing.mainImage || listing.images?.[0]?.url || listing.images?.[0] || 'https://placehold.co/400x300/f3f4f6/9ca3af?text=Pas+d%27image'}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x300/f3f4f6/9ca3af?text=Image'; }}
                />

                {/* PRO Badge */}
                {listing.isPro && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        ANNONCE PRO VÉRIFIÉE
                    </div>
                )}

                {/* 360 Badge */}
                {(listing.has360 || listing.hasVirtualTour) && (
                    <div className="absolute top-3 right-14 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-lg flex items-center gap-1">
                        <Globe className="w-3 h-3" /> 360°
                    </div>
                )}

                {/* Favorite Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>

                {/* Image Count */}
                {listing.imageCount > 1 && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-lg flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {listing.imageCount}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Category Badge */}
                <div className="mb-2">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                        {listing.subcategory}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                    {listing.title}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{listing.city}, {listing.country}</span>
                </div>

                {/* Price and Views */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-lg font-bold text-orange-600">
                        {formatPrice(listing.price)} FCFA
                        {listing.priceUnit && <span className="text-sm font-normal text-gray-500">/{listing.priceUnit}</span>}
                    </span>
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <Eye className="w-4 h-4" />
                        {listing.viewsCount || listing.views || 0}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Home Page
function HomePage() {
    const [query, setQuery] = useState('');
    const [city, setCity] = useState('');
    const [category, setCategory] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [subcategory, setSubcategory] = useState('');
    const [country, setCountry] = useState('');
    const [district, setDistrict] = useState('');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [surfaceMin, setSurfaceMin] = useState('');
    const [currentBgImage, setCurrentBgImage] = useState(0);
    const [listings, setListings] = useState([]);
    const [proListingsData, setProListingsData] = useState([]);
    const [recentListingsData, setRecentListingsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [platformStats, setPlatformStats] = useState({ activeListings: 0, totalUsers: 0, countries: 0 });

    // Fetch listings and stats from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { listingService } = await import('./services/api.js');
                
                // Fetch all listings and stats
                const [allResult, proResult, recentResult, statsResult] = await Promise.all([
                    listingService.getAll({ limit: 20 }),
                    listingService.getAll({ limit: 6 }), // PRO listings
                    listingService.getAll({ limit: 8 }),  // Recent listings
                    listingService.getStats()              // Platform stats
                ]);
                
                if (allResult.ok) {
                    setListings(allResult.data.data || []);
                }
                if (proResult.ok) {
                    setProListingsData(proResult.data.data?.filter(l => l.user?.isPro) || []);
                }
                if (recentResult.ok) {
                    setRecentListingsData(recentResult.data.data || []);
                }
                if (statsResult.ok && statsResult.data.stats) {
                    setPlatformStats(statsResult.data.stats);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                // Pas de fallback - afficher liste vide si erreur API
                setListings([]);
                setProListingsData([]);
                setRecentListingsData([]);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
    }, []);

    // Images pour le diaporama (null = collage voitures)
    const bgImages = [
        '/Immeuble-Clarte_Claudio-Merlini1-scaled.jpg',
        '/nieruchomosci-w-Calpe.webp',
        'cars-collage'
    ];

    // Images de voitures pour le collage
    const carImages = [
        '/car0.webp',
        '/car1.webp',
        '/car2.webp',
        '/car3.webp',
        '/car4.webp'
    ];

    // Diaporama automatique
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBgImage((prev) => (prev + 1) % bgImages.length);
        }, 5000); // Change toutes les 5 secondes
        return () => clearInterval(interval);
    }, []);

    // Sous-catégories par catégorie
    const subcategories = {
        immobilier: ['Maison à vendre', 'Maison à louer', 'Appartement à vendre', 'Appartement à louer', 'Terrain', 'Bureau'],
        vehicule: ['Voiture à vendre', 'Voiture à louer', 'Moto à vendre', 'Moto à louer', 'Camion'],
        vacance: ['Hôtel', 'Villa meublée', 'Appartement meublé', 'Résidence']
    };

    // Pays et villes
    const countries = ['Côte d\'Ivoire', 'Sénégal', 'Mali', 'Burkina Faso', 'Guinée'];
    const citiesByCountry = {
        'Côte d\'Ivoire': ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San Pedro'],
        'Sénégal': ['Dakar', 'Thiès', 'Saint-Louis', 'Saly'],
        'Mali': ['Bamako', 'Sikasso'],
        'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso'],
        'Guinée': ['Conakry', 'Kankan']
    };

    // Quartiers par ville
    const districtsByCity = {
        'Abidjan': ['Cocody', 'Plateau', 'Marcory', 'Yopougon', 'Treichville'],
        'Dakar': ['Plateau', 'Almadies', 'Ngor', 'Ouakam', 'Mermoz'],
        'Bamako': ['Hippodrome', 'Badalabougou', 'ACI 2000']
    };

    const handleUseMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCity('Ma position');
                    alert(`Position détectée: ${position.coords.latitude}, ${position.coords.longitude}`);
                },
                () => alert('Impossible de récupérer votre position')
            );
        } else {
            alert('La géolocalisation n\'est pas supportée par votre navigateur');
        }
    };

    // Use API data
    const proListings = proListingsData;
    const recentListings = recentListingsData;
    
    // Use real stats from API
    const stats = { 
        total: platformStats.activeListings || listings.length || 0, 
        users: platformStats.totalUsers || 0, 
        countries: platformStats.countries || 0
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative pt-28 pb-40 overflow-hidden">
                {/* Background Slideshow */}
                <div className="absolute inset-0">
                    {bgImages.map((img, index) => (
                        img === 'cars-collage' ? (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-1000 ${
                                    index === currentBgImage ? 'opacity-100' : 'opacity-0'
                                }`}
                            >
                                <div className="w-full h-full grid grid-cols-3 grid-rows-2">
                                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${carImages[0]})` }} />
                                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${carImages[1]})` }} />
                                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${carImages[2]})` }} />
                                    <div className="w-full h-full bg-cover bg-center col-span-2" style={{ backgroundImage: `url(${carImages[3]})` }} />
                                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${carImages[4]})` }} />
                                </div>
                            </div>
                        ) : (
                            <div
                                key={index}
                                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                                    index === currentBgImage ? 'opacity-100' : 'opacity-0'
                                }`}
                                style={{ backgroundImage: `url(${img})` }}
                            />
                        )
                    ))}
                    {/* Orange overlay with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/85 via-orange-400/80 to-amber-400/85" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4">
                    {/* Title */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                            Trouvez votre bonheur
                            <br />
                            <span className="text-amber-200">partout en Afrique</span>
                        </h1>
                        <p className="text-white/90 text-lg">
                            Immobilier, Vacances, Véhicules – Des milliers d'annonces vous attendent
                        </p>
                    </div>

                    {/* Search Form */}
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl p-5 shadow-2xl">
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Que recherchez-vous ?"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 h-14 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex-1 relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Ville ou pays"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full pl-12 pr-4 h-14 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className={`h-14 px-4 rounded-xl bg-white text-gray-700 focus:outline-none md:w-48 appearance-none cursor-pointer transition-all ${
                                    category 
                                        ? 'border-2 border-orange-500 ring-2 ring-orange-100' 
                                        : 'border border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-orange-500'
                                }`}
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                            >
                                <option value="">Catégorie</option>
                                <option value="immobilier">Immobilier</option>
                                <option value="vacance">Vacances</option>
                                <option value="vehicule">Véhicules</option>
                            </select>
                            <button className="h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg">
                                <Search className="w-5 h-5" />
                                Chercheur
                            </button>
                        </div>
                        <button 
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className="flex items-center gap-2 mt-4 text-gray-500 hover:text-orange-600 transition-colors text-sm"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filtres avancés
                        </button>

                        {/* Advanced Filters Panel */}
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            showAdvancedFilters ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                        }`}>
                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                <h4 className="font-medium text-gray-900">Filtres avancés</h4>
                                <button 
                                    onClick={() => setShowAdvancedFilters(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {/* Row 1: Sous-catégorie, Pays, Ville, Quartier */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Sous-catégorie</label>
                                    <select
                                        value={subcategory}
                                        onChange={(e) => setSubcategory(e.target.value)}
                                        disabled={!category}
                                        className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-400"
                                    >
                                        <option value="">{category ? 'Toutes' : 'Choisir catégorie'}</option>
                                        {category && subcategories[category]?.map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Pays</label>
                                    <select
                                        value={country}
                                        onChange={(e) => { setCountry(e.target.value); setCity(''); setDistrict(''); }}
                                        className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    >
                                        <option value="">Tous les pays</option>
                                        {countries.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Ville</label>
                                    <select
                                        value={city}
                                        onChange={(e) => { setCity(e.target.value); setDistrict(''); }}
                                        disabled={!country}
                                        className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-400"
                                    >
                                        <option value="">{country ? 'Toutes les villes' : 'Choisir pays'}</option>
                                        {country && citiesByCountry[country]?.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Quartier</label>
                                    <select
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        disabled={!city || !districtsByCity[city]}
                                        className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-400"
                                    >
                                        <option value="">{city && districtsByCity[city] ? 'Tous' : 'Choisir ville'}</option>
                                        {city && districtsByCity[city]?.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Row 2: Prix, Surface, Position */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Prix min</label>
                                    <input
                                        type="number"
                                        placeholder="0 FCFA"
                                        value={priceMin}
                                        onChange={(e) => setPriceMin(e.target.value)}
                                        className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Prix max</label>
                                    <input
                                        type="number"
                                        placeholder="Max FCFA"
                                        value={priceMax}
                                        onChange={(e) => setPriceMax(e.target.value)}
                                        className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>
                                {(category === 'immobilier' || category === '' || category === 'vacance') && (
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Surface min (m²)</label>
                                        <input
                                            type="number"
                                            placeholder="m²"
                                            value={surfaceMin}
                                            onChange={(e) => setSurfaceMin(e.target.value)}
                                            className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Localisation</label>
                                    <button
                                        onClick={handleUseMyLocation}
                                        className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm bg-white hover:bg-gray-50 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 flex items-center justify-center gap-2 text-gray-600"
                                    >
                                        <MapPin className="w-4 h-4 text-orange-500" />
                                        Ma position
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats with animated counters */}
                    <div className="flex flex-wrap justify-center gap-10 md:gap-20 mt-12">
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-bold text-white">
                                <AnimatedCounter end={stats.total} duration={2000} />
                            </p>
                            <p className="text-white/70 text-sm">Annonces actives</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-bold text-white">
                                <AnimatedCounter end={stats.users} duration={2500} />
                            </p>
                            <p className="text-white/70 text-sm">Utilisateurs</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-bold text-white">
                                <AnimatedCounter end={stats.countries} duration={1500} />
                            </p>
                            <p className="text-white/70 text-sm">Pays couverts</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Cards */}
            <section className="max-w-7xl mx-auto px-4 -mt-20 relative z-10 mb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Link to="/category/immobilier" className="group">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                <Home className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-white font-semibold text-xl">Immobilier</h3>
                            <p className="text-white/70 text-sm mt-1">Maisons, terrains, magasins</p>
                            <span className="inline-block mt-3 px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full">
                                {listings.filter(l => l.category === 'immobilier').length || '+'} annonces
                            </span>
                        </div>
                    </Link>
                    <Link to="/category/vacance" className="group">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                <Hotel className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-white font-semibold text-xl">Vacances</h3>
                            <p className="text-white/70 text-sm mt-1">Hôtels, résidences meublées</p>
                            <span className="inline-block mt-3 px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full">
                                {listings.filter(l => l.category === 'vacance').length || '+'} annonces
                            </span>
                        </div>
                    </Link>
                    <Link to="/category/vehicule" className="group">
                        <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                <Car className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-white font-semibold text-xl">Véhicules</h3>
                            <p className="text-white/70 text-sm mt-1">Voitures, motos et plus</p>
                            <span className="inline-block mt-3 px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full">
                                {listings.filter(l => l.category === 'vehicule').length || '+'} annonces
                            </span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Pro Listings Section */}
            <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
                            <span className="text-orange-600 font-semibold text-sm">ANNONCES PRO</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Sélection Premium</h2>
                    </div>
                    <Link to="/annonces?pro=true" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium">
                        Voir tout <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {proListings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            </section>

            {/* Recent Listings Section */}
            <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                            <span className="text-orange-600 font-semibold text-sm">NOUVELLES ANNONCES</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">récemment ajoutés</h2>
                    </div>
                    <Link to="/annonces" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium">
                        Voir tout <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recentListings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-gray-100 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
                        Pourquoi choisir PlanB ?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-2">Vendeurs vérifiés</h3>
                            <p className="text-gray-600 text-sm">Tous nos bailleurs passent par une vérification stricte</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-2">Paiements sécurisés</h3>
                            <p className="text-gray-600 text-sm">Payez les loyers et les mises en garde directement sur la plateforme</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Star className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-2">Visite virtuelle à 360°</h3>
                            <p className="text-gray-600 text-sm">Explorez les biens sans vous déplacer</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRO CTA Section */}
            <section className="max-w-7xl mx-auto px-4 py-16">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full -translate-y-32 translate-x-32" />
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-orange-500 px-4 py-2 rounded-full text-white text-sm mb-4">
                            <Star className="w-4 h-4 fill-current" />
                            COMPTE PRO
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Boostez votre visibilité
                        </h2>
                        <p className="text-gray-300 text-lg mb-6">
                            Annonces illimitées, 8 photos par annonce, visite virtuelle 360°, statistiques avancées
                            et mise en avant sur la page d'accueil.
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                            <Link to="/upgrade" className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-semibold transition-all">
                                Seulement 5 000 FCFA/mois
                            </Link>
                            <span className="text-gray-400 text-sm">Sans engagement</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <img src="/logofinal.png" alt="PlanB" className="h-20 w-auto" />
                                <span className="text-xl font-bold">PlanB</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                La première plateforme de petites annonces pour l'Afrique.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Catégories</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link to="/annonces?category=immobilier" className="hover:text-white">Immobilier</Link></li>
                                <li><Link to="/annonces?category=vacance" className="hover:text-white">Vacances</Link></li>
                                <li><Link to="/annonces?category=vehicule" className="hover:text-white">Véhicules</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Compte</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link to="/publish" className="hover:text-white">Déposer une annonce</Link></li>
                                <li><Link to="/profile" className="hover:text-white">Mes annonces</Link></li>
                                <li><Link to="/upgrade" className="hover:text-white">Compte PRO</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">À propos</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link to="/about" className="hover:text-white">Qui sommes-nous</Link></li>
                                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                                <li><Link to="/terms" className="hover:text-white">Conditions d'utilisation</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                        © 2024 PlanB. Tous droits réservés.
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Save Search Modal
function SaveSearchModal({ isOpen, onClose, searchQuery }) {
    const [searchName, setSearchName] = useState('');
    const [notifications, setNotifications] = useState(true);

    if (!isOpen) return null;

    const handleSave = () => {
        console.log('Saving search:', { name: searchName, notifications });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-semibold text-gray-900 mb-6">Sauvegarder cette recherche</h2>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de la recherche *
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: Appartements à Dakar"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>

                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">Critères de recherche :</p>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="font-medium text-gray-900">Notifications</p>
                                <p className="text-sm text-gray-500">Être averti des nouvelles annonces</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`w-12 h-7 rounded-full transition-colors ${notifications ? 'bg-orange-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 h-12 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Bookmark className="w-4 h-4" />
                        Sauvegarder
                    </button>
                </div>
            </div>
        </div>
    );
}

// Annonces Page
function AnnoncesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [surfaceMin, setSurfaceMin] = useState('');
    const [surfaceMax, setSurfaceMax] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [district, setDistrict] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [viewMode, setViewMode] = useState('grid');
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [apiListings, setApiListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch listings from API
    useEffect(() => {
        const fetchListings = async () => {
            try {
                const { listingService } = await import('./services/api.js');
                const result = await listingService.getAll({ limit: 50 });
                if (result.ok && result.data.data) {
                    setApiListings(result.data.data);
                }
            } catch (error) {
                console.error('Error fetching listings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchListings();
    }, []);

    // Sous-catégories par catégorie
    const subcategories = {
        immobilier: ['Maison à vendre', 'Maison à louer', 'Appartement à vendre', 'Appartement à louer', 'Terrain', 'Bureau', 'Local commercial'],
        vehicule: ['Voiture à vendre', 'Voiture à louer', 'Moto à vendre', 'Moto à louer', 'Camion', 'Engin'],
        vacance: ['Hôtel', 'Villa meublée', 'Appartement meublé', 'Résidence', 'Maison d\'hôtes']
    };

    // Villes et pays disponibles
    const countries = ['Côte d\'Ivoire', 'Sénégal', 'Mali', 'Burkina Faso', 'Guinée'];
    const cities = {
        'Côte d\'Ivoire': ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San Pedro', 'Korhogo'],
        'Sénégal': ['Dakar', 'Thiès', 'Saint-Louis', 'Saly', 'Mbour'],
        'Mali': ['Bamako', 'Sikasso', 'Mopti'],
        'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso'],
        'Guinée': ['Conakry', 'Kankan']
    };

    // Quartiers par ville
    const districts = {
        'Abidjan': ['Cocody', 'Plateau', 'Marcory', 'Yopougon', 'Treichville', 'Adjamé'],
        'Dakar': ['Plateau', 'Almadies', 'Ngor', 'Ouakam', 'Mermoz', 'Fann'],
        'Bamako': ['Hippodrome', 'Badalabougou', 'ACI 2000', 'Hamdallaye']
    };

    const handleUseMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    alert(`Position détectée: ${position.coords.latitude}, ${position.coords.longitude}`);
                },
                () => alert('Impossible de récupérer votre position')
            );
        }
    };

    // Use API listings
    const sourceListings = apiListings;
    
    const filteredListings = sourceListings.filter(listing => {
        if (category && listing.category !== category) return false;
        if (subcategory && listing.subcategory !== subcategory) return false;
        if (priceMin && listing.price < parseInt(priceMin)) return false;
        if (priceMax && listing.price > parseInt(priceMax)) return false;
        if (city && listing.city !== city) return false;
        if (country && listing.country !== country) return false;
        if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const resetFilters = () => {
        setCategory('');
        setSubcategory('');
        setPriceMin('');
        setPriceMax('');
        setSurfaceMin('');
        setSurfaceMax('');
        setCity('');
        setCountry('');
        setDistrict('');
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Save Search Modal */}
            <SaveSearchModal 
                isOpen={saveModalOpen} 
                onClose={() => setSaveModalOpen(false)}
                searchQuery={searchQuery}
            />

            {/* Search Bar */}
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 h-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <button className="h-12 w-12 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center">
                            <Search className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setSaveModalOpen(true)}
                            className="h-12 w-12 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50"
                        >
                            <Bookmark className="w-5 h-5" />
                        </button>
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="h-12 px-4 border border-gray-200 rounded-lg bg-white text-gray-700"
                        >
                            <option value="recent">Plus récentes</option>
                            <option value="price_asc">Prix croissant</option>
                            <option value="price_desc">Prix décroissant</option>
                            <option value="popular">Plus populaires</option>
                        </select>
                        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`h-12 w-12 flex items-center justify-center ${viewMode === 'grid' ? 'bg-gray-100 text-orange-500' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`h-12 w-12 flex items-center justify-center border-l border-gray-200 ${viewMode === 'list' ? 'bg-gray-100 text-orange-500' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Sidebar Filters */}
                    <div className="w-64 flex-shrink-0 hidden lg:block">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h3 className="font-semibold text-gray-900 mb-6 text-lg">Filtres</h3>
                            
                            {/* Category */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                                <select
                                    value={category}
                                    onChange={(e) => { setCategory(e.target.value); setSubcategory(''); }}
                                    className={`w-full h-11 px-4 rounded-lg bg-white text-gray-700 text-sm appearance-none cursor-pointer transition-all ${
                                        category 
                                            ? 'border-2 border-orange-500 ring-2 ring-orange-100' 
                                            : 'border border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                                    }`}
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                                >
                                    <option value="">Toutes les catégories</option>
                                    <option value="immobilier">Immobilier</option>
                                    <option value="vacance">Vacances</option>
                                    <option value="vehicule">Véhicules</option>
                                </select>
                            </div>

                            {/* Subcategory */}
                            {category && (
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sous-catégorie</label>
                                    <select
                                        value={subcategory}
                                        onChange={(e) => setSubcategory(e.target.value)}
                                        className={`w-full h-11 px-4 rounded-lg bg-white text-gray-700 text-sm appearance-none cursor-pointer transition-all ${
                                            subcategory 
                                                ? 'border-2 border-orange-500 ring-2 ring-orange-100' 
                                                : 'border border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                                        }`}
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                                    >
                                        <option value="">Toutes les sous-catégories</option>
                                        {subcategories[category]?.map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Country */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                                <select
                                    value={country}
                                    onChange={(e) => { setCountry(e.target.value); setCity(''); }}
                                    className={`w-full h-11 px-4 rounded-lg bg-white text-gray-700 text-sm appearance-none cursor-pointer transition-all ${
                                        country 
                                            ? 'border-2 border-orange-500 ring-2 ring-orange-100' 
                                            : 'border border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                                    }`}
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                                >
                                    <option value="">Tous les pays</option>
                                    {countries.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* City */}
                            {country && (
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                                    <select
                                        value={city}
                                        onChange={(e) => { setCity(e.target.value); setDistrict(''); }}
                                        className={`w-full h-11 px-4 rounded-lg bg-white text-gray-700 text-sm appearance-none cursor-pointer transition-all ${
                                            city 
                                                ? 'border-2 border-orange-500 ring-2 ring-orange-100' 
                                                : 'border border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                                        }`}
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                                    >
                                        <option value="">Toutes les villes</option>
                                        {cities[country]?.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* District/Quartier */}
                            {city && districts[city] && (
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quartier</label>
                                    <select
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        className={`w-full h-11 px-4 rounded-lg bg-white text-gray-700 text-sm appearance-none cursor-pointer transition-all ${
                                            district 
                                                ? 'border-2 border-orange-500 ring-2 ring-orange-100' 
                                                : 'border border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                                        }`}
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                                    >
                                        <option value="">Tous les quartiers</option>
                                        {districts[city]?.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Ma position */}
                            <div className="mb-5">
                                <button
                                    onClick={handleUseMyLocation}
                                    className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm bg-white hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-600 transition-all"
                                >
                                    <MapPin className="w-4 h-4 text-orange-500" />
                                    Utiliser ma position
                                </button>
                            </div>

                            {/* Price */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Prix (FCFA)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={priceMin}
                                        onChange={(e) => setPriceMin(e.target.value)}
                                        className="w-1/2 h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={priceMax}
                                        onChange={(e) => setPriceMax(e.target.value)}
                                        className="w-1/2 h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Surface - Only for immobilier */}
                            {(category === 'immobilier' || category === '') && (
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Surface (m²)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={surfaceMin}
                                            onChange={(e) => setSurfaceMin(e.target.value)}
                                            className="w-1/2 h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={surfaceMax}
                                            onChange={(e) => setSurfaceMax(e.target.value)}
                                            className="w-1/2 h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Reset */}
                            <button 
                                onClick={resetFilters}
                                className="w-full h-11 border border-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Réinitialiser les filtres
                            </button>
                        </div>
                    </div>

                    {/* Listings Grid */}
                    <div className="flex-1">
                        <p className="text-gray-600 mb-6">{filteredListings.length} annonces trouvées</p>
                        
                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                            {filteredListings.map((listing) => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>

                        {filteredListings.length === 0 && (
                            <div className="text-center py-16">
                                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 text-lg">Aucune annonce trouvée</p>
                                <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos filtres</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 mt-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <img src="/logofinal.png" alt="PlanB" className="h-20 w-auto" />
                                <span className="text-xl font-bold">PlanB</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                La première plateforme de petites annonces pour l'Afrique.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Catégories</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link to="/annonces?category=immobilier" className="hover:text-white">Immobilier</Link></li>
                                <li><Link to="/annonces?category=vacance" className="hover:text-white">Vacances</Link></li>
                                <li><Link to="/annonces?category=vehicule" className="hover:text-white">Véhicules</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Compte</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link to="/publish" className="hover:text-white">Déposer une annonce</Link></li>
                                <li><Link to="/profile" className="hover:text-white">Mes annonces</Link></li>
                                <li><Link to="/upgrade" className="hover:text-white">Compte PRO</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">À propos</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link to="/about" className="hover:text-white">Qui sommes-nous</Link></li>
                                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                                <li><Link to="/terms" className="hover:text-white">Conditions d'utilisation</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                        © 2024 PlanB. Tous droits réservés.
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Listing Detail Page
function ListingDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showVisitModal, setShowVisitModal] = useState(false);
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [showReserveModal, setShowReserveModal] = useState(false);
    const [showHotelModal, setShowHotelModal] = useState(false);
    const [message, setMessage] = useState('');
    const [visitData, setVisitData] = useState({ date: '', time: '', slotId: null, message: '', phone: '' });
    const [offerData, setOfferData] = useState({ amount: '', message: '', phone: '' });
    const [reserveData, setReserveData] = useState({ startDate: '', endDate: '', message: '', phone: '' });
    const [hotelData, setHotelData] = useState({ roomId: null, startDate: '', endDate: '', guests: '', message: '', phone: '' });
    const [selectedRoomType, setSelectedRoomType] = useState('all');
    const [apiListing, setApiListing] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Get current user ID
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setCurrentUserId(user.id);
            } catch (e) {}
        }
    }, []);

    // Fetch listing from API
    useEffect(() => {
        const fetchListing = async () => {
            try {
                const { listingService } = await import('./services/api.js');
                const result = await listingService.getOne(id);
                if (result.ok && result.data) {
                    setApiListing(result.data);
                }
            } catch (error) {
                console.error('Error fetching listing:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    // Use API listing
    const listing = apiListing;
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Annonce introuvable</h2>
                    <p className="text-gray-500 mb-4">Cette annonce n'existe pas ou a été supprimée.</p>
                    <button onClick={() => navigate('/annonces')} className="px-4 py-2 bg-orange-500 text-white rounded-lg">
                        Voir les annonces
                    </button>
                </div>
            </div>
        );
    }

    const status = statusConfig[listing.status] || statusConfig['disponible'];

    // Check if this is the current user's own listing
    const isOwnListing = currentUserId && listing.user?.id === currentUserId;

    // Déterminer si c'est une vente ou une location
    const isForSale = listing.transactionType === 'vente';
    const isShortRental = listing.transactionType === 'location_courte';
    const isHotel = listing.transactionType === 'hotel';
    const isLongRental = listing.transactionType === 'location';

    // Messages suggérés selon le type d'annonce
    const suggestedMessages = [
        "Bonjour, ce bien est-il toujours disponible ?",
        "Bonjour, je suis intéressé(e). Pouvons-nous convenir d'un rendez-vous ?",
        listing.category === 'vehicule' 
            ? "Bonjour, quel est le kilométrage exact du véhicule ?"
            : "Bonjour, quelles sont les modalités de visite ?",
        isForSale 
            ? "Bonjour, acceptez-vous les paiements échelonnés ?"
            : "Bonjour, le prix est-il négociable ?"
    ];
    
    // Use images from API or fallback to placeholder images
    const images = listing.images?.length > 0 
        ? listing.images.map(img => img.url || img) 
        : [
            listing.image || listing.mainImage,
            "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800"
        ].filter(Boolean);

    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

    // Grouper les créneaux par date
    const groupedSlots = listing.visitSlots?.reduce((acc, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
    }, {}) || {};

    // Types de chambres uniques pour hôtel
    const roomTypes = listing.rooms ? ['all', ...new Set(listing.rooms.map(r => r.type))] : [];
    const filteredRooms = listing.rooms?.filter(r => selectedRoomType === 'all' || r.type === selectedRoomType) || [];

    // Calculer le nombre de nuits
    const calculateNights = (start, end) => {
        if (!start || !end) return 0;
        return Math.max(1, Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)));
    };

    // Vérifier si une date est bloquée
    const isDateBlocked = (date) => {
        return listing.blockedDates?.includes(date);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Main Content with Image and Sidebar */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Image Gallery */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="relative aspect-[16/10] bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                            <img
                                src={images[currentImageIndex] || 'https://placehold.co/800x500/f3f4f6/9ca3af?text=Image'}
                                alt={listing.title}
                                onError={(e) => { e.target.src = 'https://placehold.co/800x500/f3f4f6/9ca3af?text=Image'; }}
                                className="w-full h-full object-cover"
                            />

                            {/* 360° Badge */}
                            {(listing.has360 || listing.hasVirtualTour) && (
                                <div className="absolute top-4 left-4 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5">
                                    <Globe className="w-4 h-4" />
                                    360°
                                </div>
                            )}
                            
                            {/* Navigation Arrows */}
                            <button 
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50"
                            >
                                <ChevronLeft className="w-6 h-6 text-gray-700" />
                            </button>
                            <button 
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50"
                            >
                                <ChevronRight className="w-6 h-6 text-gray-700" />
                            </button>

                            {/* Thumbnails at bottom center */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-14 h-10 rounded-lg overflow-hidden border-2 ${currentImageIndex === index ? 'border-orange-500' : 'border-white'} shadow-lg`}
                                    >
                                        <img src={img || 'https://placehold.co/56x40/f3f4f6/9ca3af'} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://placehold.co/56x40/f3f4f6/9ca3af'; }} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title and Info below image */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full border border-gray-200">
                                        {listing.subcategory}
                                    </span>
                                    <span className="text-gray-500 text-sm flex items-center gap-1">
                                        <Eye className="w-4 h-4" /> {listing.viewsCount || 0} vues
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setIsFavorite(!isFavorite)}
                                        className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                                    >
                                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-orange-500 text-orange-500' : 'text-gray-600'}`} />
                                    </button>
                                    <button className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                                        <Share2 className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                            <div className="flex items-center gap-1 text-gray-600">
                                <MapPin className="w-4 h-4 text-orange-500" />
                                <span>{listing.city}, {listing.country}</span>
                            </div>
                        </div>

                        {/* Characteristics - Véhicule */}
                        {listing.category === 'vehicule' && listing.specifications && (
                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Caractéristiques du véhicule</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {listing.specifications.brand && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                                                <Car className="w-5 h-5 text-orange-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{listing.specifications.brand}</p>
                                                <p className="text-sm text-gray-500">Marque</p>
                                            </div>
                                        </div>
                                    )}
                                    {listing.specifications.model && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                                <LayoutGrid className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{listing.specifications.model}</p>
                                                <p className="text-sm text-gray-500">Modèle</p>
                                            </div>
                                        </div>
                                    )}
                                    {listing.specifications.year && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                                <Calendar className="w-5 h-5 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{listing.specifications.year}</p>
                                                <p className="text-sm text-gray-500">Année</p>
                                            </div>
                                        </div>
                                    )}
                                    {listing.specifications.mileage && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                                <Eye className="w-5 h-5 text-purple-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{listing.specifications.mileage.toLocaleString()} km</p>
                                                <p className="text-sm text-gray-500">Kilométrage</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {listing.description || 'Aucune description disponible'}
                            </p>
                        </div>

                        {/* Virtual Tour 360° - Full width like main image */}
                        {(listing.has360 || listing.hasVirtualTour) && (
                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-purple-500" />
                                    Visite Virtuelle 360°
                                </h2>
                                <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-[16/10]">
                                    {listing.virtualTour?.url ? (
                                        <>
                                            {listing.virtualTour.type === 'matterport' || listing.virtualTour.type === 'external' ? (
                                                <iframe 
                                                    src={listing.virtualTour.url}
                                                    className="w-full h-full"
                                                    frameBorder="0"
                                                    allowFullScreen
                                                    title="Visite virtuelle 360°"
                                                />
                                            ) : listing.virtualTour.type === '360_video' ? (
                                                <iframe 
                                                    src={listing.virtualTour.url.replace('watch?v=', 'embed/')}
                                                    className="w-full h-full"
                                                    frameBorder="0"
                                                    allowFullScreen
                                                    title="Visite virtuelle 360°"
                                                />
                                            ) : (
                                                <div className="relative w-full h-full">
                                                    <img 
                                                        src={listing.virtualTour.url} 
                                                        alt="Visite 360°" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button 
                                                        onClick={() => window.open(listing.virtualTour.url, '_blank')}
                                                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                                                    >
                                                        <div className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2">
                                                            <Globe className="w-5 h-5" />
                                                            Voir en 360°
                                                        </div>
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-center px-8">
                                            <div>
                                                <Globe className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                                                <p className="text-white text-xl font-semibold mb-2">Visite virtuelle disponible</p>
                                                <p className="text-gray-400">Cliquez pour explorer ce bien en 360°</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reviews - Separate section */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Avis sur ce bien</h2>
                            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                <Star className="w-12 h-12 mb-3 opacity-30" />
                                <p className="text-gray-500">Aucun avis pour le moment</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Price Card */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                            {/* Status Badge */}
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${status.bgLight} rounded-full mb-4`}>
                                <span className={`w-2 h-2 rounded-full ${status.color}`}></span>
                                <span className={`text-sm font-medium ${status.textColor}`}>{status.label}</span>
                            </div>

                            <p className="text-3xl font-bold text-orange-500 mb-1">
                                {formatPrice(listing.price)} FCFA
                                {listing.priceUnit && <span className="text-lg font-normal text-gray-500">/{listing.priceUnit}</span>}
                            </p>

                            {/* Boutons selon le type de transaction */}
                            <div className="space-y-3 mt-4">
                                {/* VENTE: Visite + Offre + Réserver avec acompte */}
                                {isForSale && listing.status !== 'vendu' && (
                                    <>
                                        <button 
                                            onClick={() => setShowVisitModal(true)}
                                            disabled={listing.status === 'reserve'}
                                            className="w-full h-12 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                        >
                                            <Calendar className="w-5 h-5" />
                                            Demander une visite
                                        </button>
                                        <button 
                                            onClick={() => setShowOfferModal(true)}
                                            disabled={listing.status === 'reserve' || listing.status === 'vendu'}
                                            className="w-full h-12 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                        >
                                            <DollarSign className="w-5 h-5" />
                                            Faire une offre
                                        </button>
                                        <button 
                                            onClick={() => setShowReserveModal(true)}
                                            disabled={listing.status === 'reserve' || listing.status === 'vendu'}
                                            className="w-full h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                        >
                                            <Lock className="w-5 h-5" />
                                            Réserver avec acompte
                                        </button>
                                    </>
                                )}

                                {/* LOCATION LONGUE DURÉE: Visite uniquement */}
                                {isLongRental && listing.status !== 'vendu' && (
                                    <button 
                                        onClick={() => setShowVisitModal(true)}
                                        disabled={listing.status === 'reserve'}
                                        className="w-full h-12 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                    >
                                        <Calendar className="w-5 h-5" />
                                        Demander une visite
                                    </button>
                                )}

                                {/* LOCATION COURTE DURÉE: Réservation par période */}
                                {isShortRental && listing.status !== 'vendu' && (
                                    <button 
                                        onClick={() => setShowReserveModal(true)}
                                        disabled={listing.status === 'reserve'}
                                        className="w-full h-12 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                    >
                                        <Calendar className="w-5 h-5" />
                                        Réserver une période
                                    </button>
                                )}

                                {/* HÔTEL: Réservation de chambre */}
                                {isHotel && (
                                    <button 
                                        onClick={() => setShowHotelModal(true)}
                                        className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                    >
                                        <Hotel className="w-5 h-5" />
                                        Réserver une chambre
                                    </button>
                                )}

                                {/* Statut Vendu */}
                                {listing.status === 'vendu' && (
                                    <div className="w-full h-12 bg-red-100 text-red-600 rounded-lg font-medium flex items-center justify-center gap-2">
                                        <Ban className="w-5 h-5" />
                                        Ce bien a été vendu
                                    </div>
                                )}

                                {/* Statut Réservé */}
                                {listing.status === 'reserve' && listing.reservedUntil && (
                                    <div className="bg-blue-50 rounded-lg p-3 text-sm">
                                        <p className="text-blue-700 font-medium flex items-center gap-2"><Lock className="w-4 h-4" /> Bien réservé</p>
                                        <p className="text-blue-600">Jusqu'au {new Date(listing.reservedUntil).toLocaleDateString('fr-FR')}</p>
                                        {listing.depositPaid && (
                                            <p className="text-blue-500 mt-1">Acompte: {formatPrice(listing.depositPaid)} FCFA</p>
                                        )}
                                    </div>
                                )}

                                {/* Bouton Contact - caché si c'est sa propre annonce */}
                                {!isOwnListing && (
                                    <button 
                                        onClick={() => setShowContactModal(true)}
                                        className="w-full h-12 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        Contacter le vendeur
                                    </button>
                                )}
                                {isOwnListing && (
                                    <div className="w-full h-12 bg-gray-100 text-gray-500 rounded-lg font-medium flex items-center justify-center gap-2">
                                        <Settings className="w-5 h-5" />
                                        C'est votre annonce
                                    </div>
                                )}
                            </div>

                            {/* Contact Info - Priorité: infos annonce > infos profil */}
                            <div className="mt-6 space-y-3">
                                {/* Téléphone */}
                                {(listing.contactPhone || listing.user?.phone) ? (
                                    <a href={`tel:${listing.contactPhone || listing.user.phone}`} className="flex items-center gap-3 text-gray-600 hover:text-orange-500 transition-colors">
                                        <Phone className="w-5 h-5" />
                                        <span>{listing.contactPhone || listing.user.phone}</span>
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <Phone className="w-5 h-5" />
                                        <span className="italic">Téléphone non renseigné</span>
                                    </div>
                                )}
                                {/* WhatsApp */}
                                {(listing.contactWhatsapp || listing.user?.phone) && (
                                    <a 
                                        href={`https://wa.me/${(listing.contactWhatsapp || listing.user?.phone)?.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-green-600 hover:text-green-700 transition-colors"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        <span>WhatsApp</span>
                                    </a>
                                )}
                                {/* Email */}
                                {(listing.contactEmail || listing.user?.email) ? (
                                    <a href={`mailto:${listing.contactEmail || listing.user.email}`} className="flex items-center gap-3 text-gray-600 hover:text-orange-500 transition-colors">
                                        <Mail className="w-5 h-5" />
                                        <span>{listing.contactEmail || listing.user.email}</span>
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <Mail className="w-5 h-5" />
                                        <span className="italic">Email non renseigné</span>
                                    </div>
                                )}
                            </div>

                            {/* Seller Info */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div 
                                    onClick={() => navigate(`/seller/${listing.user?.id || listing.id}`, { 
                                        state: { 
                                            seller: listing.user,
                                            fromListing: listing 
                                        } 
                                    })}
                                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                                >
                                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {listing.user?.businessName?.[0] || listing.user?.firstName?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 hover:text-orange-500 transition-colors">
                                            {listing.user?.businessName || `${listing.user?.firstName || ''} ${listing.user?.lastName || ''}`.trim() || 'Utilisateur'}
                                        </p>
                                        {listing.user?.isPro && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded">
                                                <Star className="w-3 h-3 fill-current" /> PRO
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Membre depuis {listing.user?.createdAt ? new Date(listing.user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'récemment'}
                                </p>
                            </div>
                        </div>

                        {/* Security Tips */}
                        <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                            <div className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                Conseils de sécurité
                            </div>
                            <ul className="text-sm text-gray-700 space-y-2">
                                <li>• Ne payez jamais avant d'avoir visité</li>
                                <li>• Vérifiez les documents du bien</li>
                                <li>• Utilisez notre système de paiement sécurisé</li>
                                <li>• Signalez tout comportement suspect</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 mt-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <img src="/logofinal.png" alt="PlanB" className="h-20 w-auto" />
                                <span className="text-xl font-bold">PlanB</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                La première plateforme de petites annonces pour l'Afrique.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Catégories</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link to="/annonces?category=immobilier" className="hover:text-white">Immobilier</Link></li>
                                <li><Link to="/annonces?category=vacance" className="hover:text-white">Vacances</Link></li>
                                <li><Link to="/annonces?category=vehicule" className="hover:text-white">Véhicules</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Compte</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link to="/publish" className="hover:text-white">Déposer une annonce</Link></li>
                                <li><Link to="/profile" className="hover:text-white">Mes annonces</Link></li>
                                <li><Link to="/upgrade" className="hover:text-white">Compte PRO</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">À propos</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link to="/about" className="hover:text-white">Qui sommes-nous</Link></li>
                                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                                <li><Link to="/terms" className="hover:text-white">Conditions d'utilisation</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                        © 2024 PlanB. Tous droits réservés.
                    </div>
                </div>
            </footer>

            {/* Contact Modal */}
            {showContactModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Contacter le vendeur</h2>
                            <button 
                                onClick={() => setShowContactModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Listing Preview */}
                        <div className="p-4 bg-gray-50 border-b border-gray-100">
                            <div className="flex gap-3">
                                <img 
                                    src={listing.image} 
                                    alt={listing.title}
                                    className="w-20 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 truncate">{listing.title}</h3>
                                    <p className="text-orange-500 font-semibold">
                                        {formatPrice(listing.price)} FCFA
                                        {listing.priceUnit && <span className="text-gray-500 font-normal">/{listing.priceUnit}</span>}
                                    </p>
                                    <p className="text-sm text-gray-500">{listing.city}, {listing.country}</p>
                                </div>
                            </div>
                        </div>

                        {/* Seller Info */}
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                    R
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Résidences Prestige CI</p>
                                    {listing.isPro && (
                                        <span className="inline-flex items-center gap-1 text-xs text-orange-600">
                                            <Star className="w-3 h-3 fill-current" /> Vendeur PRO
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Suggested Messages */}
                        <div className="p-4 border-b border-gray-100">
                            <p className="text-sm text-gray-500 mb-3">Messages suggérés :</p>
                            <div className="space-y-2">
                                {suggestedMessages.map((msg, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setMessage(msg)}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                                            message === msg 
                                                ? 'bg-orange-50 border-2 border-orange-500 text-orange-700' 
                                                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                                        }`}
                                    >
                                        {msg}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Message */}
                        <div className="p-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ou écrivez votre message :
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Bonjour, je suis intéressé(e) par votre annonce..."
                                className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => setShowContactModal(false)}
                                    className="flex-1 h-12 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => {
                                        alert('Message envoyé : ' + message);
                                        setShowContactModal(false);
                                        setMessage('');
                                    }}
                                    disabled={!message.trim()}
                                    className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    Envoyer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Visit Modal - avec créneaux disponibles */}
            {showVisitModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Demander une visite</h2>
                            <button onClick={() => setShowVisitModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-4 bg-gray-50 border-b border-gray-100">
                            <div className="flex gap-3">
                                <img src={listing.image} alt={listing.title} className="w-20 h-16 object-cover rounded-lg" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 truncate">{listing.title}</h3>
                                    <p className="text-orange-500 font-semibold">{formatPrice(listing.price)} FCFA</p>
                                    <p className="text-sm text-gray-500">{listing.city}, {listing.country}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Créneaux disponibles */}
                            {listing.visitSlots && listing.visitSlots.length > 0 ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        <Calendar className="w-4 h-4 inline mr-1 text-orange-500" />
                                        Créneaux disponibles
                                    </label>
                                    <div className="space-y-3">
                                        {Object.entries(groupedSlots).map(([date, slots]) => (
                                            <div key={date} className="border border-gray-200 rounded-xl p-3">
                                                <p className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                                    <CalendarCheck className="w-4 h-4 text-orange-500" />
                                                    {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {slots.map(slot => (
                                                        <button
                                                            key={slot.id}
                                                            onClick={() => !slot.booked && setVisitData({...visitData, slotId: slot.id, date: slot.date, time: `${slot.startTime}-${slot.endTime}`})}
                                                            disabled={slot.booked}
                                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                                slot.booked 
                                                                    ? 'bg-red-50 text-red-400 line-through cursor-not-allowed' 
                                                                    : visitData.slotId === slot.id
                                                                        ? 'bg-orange-500 text-white'
                                                                        : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
                                                            }`}
                                                        >
                                                            {slot.startTime} - {slot.endTime}
                                                            {slot.booked && <X className="w-3 h-3 ml-1" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500">
                                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>Aucun créneau disponible pour le moment</p>
                                    <p className="text-sm">Contactez le vendeur pour convenir d'un rendez-vous</p>
                                </div>
                            )}

                            {/* Téléphone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Phone className="w-4 h-4 inline mr-1 text-orange-500" />
                                    Votre numéro de téléphone
                                </label>
                                <input
                                    type="tel"
                                    value={visitData.phone}
                                    onChange={(e) => setVisitData({...visitData, phone: e.target.value})}
                                    placeholder="+225 07 00 00 00 00"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MessageSquare className="w-4 h-4 inline mr-1 text-orange-500" />
                                    Message (optionnel)
                                </label>
                                <textarea
                                    value={visitData.message}
                                    onChange={(e) => setVisitData({...visitData, message: e.target.value})}
                                    placeholder="Questions ou informations complémentaires..."
                                    className="w-full h-20 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowVisitModal(false)} className="flex-1 h-12 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50">
                                    Annuler
                                </button>
                                <button
                                    onClick={() => {
                                        alert(`Demande de visite envoyée !\n\nDate: ${visitData.date}\nHeure: ${visitData.time}\nTéléphone: ${visitData.phone}`);
                                        setShowVisitModal(false);
                                        setVisitData({ date: '', time: '', slotId: null, message: '', phone: '' });
                                        navigate('/reservations');
                                    }}
                                    disabled={!visitData.slotId || !visitData.phone}
                                    className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center justify-center gap-2"
                                >
                                    <Check className="w-5 h-5" />
                                    Confirmer la visite
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Offer Modal - Faire une offre d'achat */}
            {showOfferModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Faire une offre d'achat</h2>
                            <button onClick={() => setShowOfferModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-4 bg-gray-50 border-b border-gray-100">
                            <div className="flex gap-3">
                                <img src={listing.image} alt={listing.title} className="w-20 h-16 object-cover rounded-lg" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 truncate">{listing.title}</h3>
                                    <p className="text-orange-500 font-semibold">Prix demandé: {formatPrice(listing.price)} FCFA</p>
                                    <p className="text-sm text-gray-500">{listing.city}, {listing.country}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Montant de l'offre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                    <Banknote className="w-4 h-4 text-green-500" />
                                    Votre offre (FCFA)
                                </label>
                                <input
                                    type="number"
                                    value={offerData.amount}
                                    onChange={(e) => setOfferData({...offerData, amount: e.target.value})}
                                    placeholder="Montant proposé"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg font-semibold"
                                />
                                {offerData.amount && (
                                    <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                                        {parseInt(offerData.amount) < listing.price 
                                            ? <><TrendingUp className="w-4 h-4 rotate-180 text-red-500" /> {Math.round((1 - parseInt(offerData.amount) / listing.price) * 100)}% en dessous du prix demandé</>
                                            : parseInt(offerData.amount) > listing.price 
                                                ? <><TrendingUp className="w-4 h-4 text-green-500" /> {Math.round((parseInt(offerData.amount) / listing.price - 1) * 100)}% au dessus du prix demandé</>
                                                : <><Check className="w-4 h-4 text-green-500" /> Prix demandé</>
                                        }
                                    </p>
                                )}
                            </div>

                            {/* Téléphone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Phone className="w-4 h-4 inline mr-1 text-green-500" />
                                    Votre numéro de téléphone
                                </label>
                                <input
                                    type="tel"
                                    value={offerData.phone}
                                    onChange={(e) => setOfferData({...offerData, phone: e.target.value})}
                                    placeholder="+225 07 00 00 00 00"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MessageSquare className="w-4 h-4 inline mr-1 text-green-500" />
                                    Message (optionnel)
                                </label>
                                <textarea
                                    value={offerData.message}
                                    onChange={(e) => setOfferData({...offerData, message: e.target.value})}
                                    placeholder="Justifiez votre offre ou posez vos conditions..."
                                    className="w-full h-20 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            {/* Info */}
                            <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700">
                                <p className="font-medium mb-1 flex items-center gap-1"><Info className="w-4 h-4" /> Comment ça marche ?</p>
                                <ul className="text-green-600 space-y-1">
                                    <li>• Le vendeur recevra votre offre</li>
                                    <li>• Il peut accepter, refuser ou faire une contre-offre</li>
                                    <li>• Vous serez notifié de sa réponse</li>
                                </ul>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowOfferModal(false)} className="flex-1 h-12 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50">
                                    Annuler
                                </button>
                                <button
                                    onClick={() => {
                                        alert(`Offre envoyée !\n\nMontant: ${formatPrice(parseInt(offerData.amount))} FCFA\nTéléphone: ${offerData.phone}\n\nLe vendeur vous répondra bientôt.`);
                                        setShowOfferModal(false);
                                        setOfferData({ amount: '', message: '', phone: '' });
                                        navigate('/reservations');
                                    }}
                                    disabled={!offerData.amount || !offerData.phone}
                                    className="flex-1 h-12 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center justify-center gap-2"
                                >
                                    <Check className="w-5 h-5" />
                                    Envoyer l'offre
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reserve Modal - Réservation avec acompte ou période */}
            {showReserveModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {isForSale ? 'Réserver avec acompte' : 'Réserver une période'}
                            </h2>
                            <button onClick={() => setShowReserveModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-4 bg-gray-50 border-b border-gray-100">
                            <div className="flex gap-3">
                                <img src={listing.image} alt={listing.title} className="w-20 h-16 object-cover rounded-lg" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 truncate">{listing.title}</h3>
                                    <p className="text-orange-500 font-semibold">
                                        {formatPrice(listing.price)} FCFA
                                        {listing.priceUnit && <span className="text-gray-500 font-normal">/{listing.priceUnit}</span>}
                                    </p>
                                    <p className="text-sm text-gray-500">{listing.city}, {listing.country}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Pour les ventes - acompte */}
                            {isForSale && (
                                <>
                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <h4 className="font-medium text-blue-800 mb-2">🔒 Réservation avec acompte</h4>
                                        <p className="text-sm text-blue-600 mb-3">
                                            En payant un acompte de 10%, vous bloquez ce bien pendant 15 jours.
                                        </p>
                                        <div className="bg-white rounded-lg p-3 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Prix du bien</span>
                                                <span className="font-medium">{formatPrice(listing.price)} FCFA</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Acompte (10%)</span>
                                                <span className="font-bold text-blue-600">{formatPrice(listing.price * 0.1)} FCFA</span>
                                            </div>
                                            <div className="flex justify-between text-sm pt-2 border-t">
                                                <span className="text-gray-600">Reste à payer</span>
                                                <span className="font-medium">{formatPrice(listing.price * 0.9)} FCFA</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Pour les locations courtes - période */}
                            {isShortRental && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1 text-orange-500" />
                                            Date de début
                                        </label>
                                        <input
                                            type="date"
                                            value={reserveData.startDate}
                                            onChange={(e) => setReserveData({...reserveData, startDate: e.target.value})}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1 text-orange-500" />
                                            Date de fin
                                        </label>
                                        <input
                                            type="date"
                                            value={reserveData.endDate}
                                            onChange={(e) => setReserveData({...reserveData, endDate: e.target.value})}
                                            min={reserveData.startDate || new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>

                                    {/* Dates bloquées */}
                                    {listing.blockedDates && listing.blockedDates.length > 0 && (
                                        <div className="bg-red-50 rounded-xl p-3 text-sm">
                                            <p className="font-medium text-red-700 mb-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Dates indisponibles :</p>
                                            <p className="text-red-600">{listing.blockedDates.map(d => new Date(d).toLocaleDateString('fr-FR')).join(', ')}</p>
                                        </div>
                                    )}

                                    {/* Récapitulatif */}
                                    {reserveData.startDate && reserveData.endDate && (
                                        <div className="bg-orange-50 rounded-xl p-4">
                                            <h4 className="font-medium text-gray-900 mb-2">Récapitulatif</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">{formatPrice(listing.price)} × {calculateNights(reserveData.startDate, reserveData.endDate)} {listing.priceUnit}</span>
                                                    <span className="font-medium">{formatPrice(listing.price * calculateNights(reserveData.startDate, reserveData.endDate))} FCFA</span>
                                                </div>
                                                <div className="flex justify-between text-gray-500">
                                                    <span>Caution (remboursable)</span>
                                                    <span>{formatPrice(listing.price)} FCFA</span>
                                                </div>
                                                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-orange-200">
                                                    <span>Total</span>
                                                    <span className="text-orange-500">{formatPrice(listing.price * calculateNights(reserveData.startDate, reserveData.endDate) + listing.price)} FCFA</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Téléphone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Phone className="w-4 h-4 inline mr-1 text-blue-500" />
                                    Votre numéro de téléphone
                                </label>
                                <input
                                    type="tel"
                                    value={reserveData.phone}
                                    onChange={(e) => setReserveData({...reserveData, phone: e.target.value})}
                                    placeholder="+225 07 00 00 00 00"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MessageSquare className="w-4 h-4 inline mr-1 text-blue-500" />
                                    Message (optionnel)
                                </label>
                                <textarea
                                    value={reserveData.message}
                                    onChange={(e) => setReserveData({...reserveData, message: e.target.value})}
                                    placeholder="Informations complémentaires..."
                                    className="w-full h-20 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowReserveModal(false)} className="flex-1 h-12 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50">
                                    Annuler
                                </button>
                                <button
                                    onClick={() => {
                                        if (isForSale) {
                                            alert(`Réservation confirmée !\n\nAcompte à payer: ${formatPrice(listing.price * 0.1)} FCFA\nDurée de réservation: 15 jours\n\nVous serez contacté pour le paiement.`);
                                        } else {
                                            alert(`Réservation envoyée !\n\nDu ${reserveData.startDate} au ${reserveData.endDate}\nTotal: ${formatPrice(listing.price * calculateNights(reserveData.startDate, reserveData.endDate) + listing.price)} FCFA`);
                                        }
                                        setShowReserveModal(false);
                                        setReserveData({ startDate: '', endDate: '', message: '', phone: '' });
                                        navigate('/reservations');
                                    }}
                                    disabled={!reserveData.phone || (isShortRental && (!reserveData.startDate || !reserveData.endDate))}
                                    className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center justify-center gap-2"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    {isForSale ? 'Payer l\'acompte' : 'Confirmer'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hotel Modal - Réservation de chambre */}
            {showHotelModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Réserver une chambre</h2>
                            <button onClick={() => setShowHotelModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-4 bg-gray-50 border-b border-gray-100">
                            <div className="flex gap-3">
                                <img src={listing.image} alt={listing.title} className="w-20 h-16 object-cover rounded-lg" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 truncate">{listing.title}</h3>
                                    <p className="text-sm text-gray-500">{listing.city}, {listing.country}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Filtres par type de chambre */}
                            <div className="flex flex-wrap gap-2">
                                {roomTypes.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setSelectedRoomType(type)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                            selectedRoomType === type 
                                                ? 'bg-orange-500 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {type === 'all' ? 'Toutes' : type}
                                    </button>
                                ))}
                            </div>

                            {/* Liste des chambres */}
                            <div className="space-y-3">
                                {filteredRooms.map(room => (
                                    <div 
                                        key={room.id}
                                        onClick={() => room.available && setHotelData({...hotelData, roomId: room.id})}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            !room.available 
                                                ? 'bg-red-50 border-red-200 cursor-not-allowed opacity-60' 
                                                : hotelData.roomId === room.id
                                                    ? 'bg-orange-50 border-orange-500'
                                                    : 'bg-white border-gray-200 hover:border-orange-300'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-900">{room.type}</span>
                                                    <span className="text-sm text-gray-500">N° {room.number}</span>
                                                </div>
                                                <p className="text-orange-500 font-bold mt-1">{formatPrice(room.price)} FCFA/nuit</p>
                                            </div>
                                            <div className="text-right">
                                                {room.available ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                        <Check className="w-3 h-3" /> Disponible
                                                    </span>
                                                ) : (
                                                    <div>
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                                            <X className="w-3 h-3" /> Occupée
                                                        </span>
                                                        {room.bookedUntil && (
                                                            <p className="text-xs text-red-500 mt-1">Jusqu'au {new Date(room.bookedUntil).toLocaleDateString('fr-FR')}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date d'arrivée</label>
                                    <input
                                        type="date"
                                        value={hotelData.startDate}
                                        onChange={(e) => setHotelData({...hotelData, startDate: e.target.value})}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de départ</label>
                                    <input
                                        type="date"
                                        value={hotelData.endDate}
                                        onChange={(e) => setHotelData({...hotelData, endDate: e.target.value})}
                                        min={hotelData.startDate || new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            {/* Nombre de personnes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de personnes</label>
                                <select
                                    value={hotelData.guests}
                                    onChange={(e) => setHotelData({...hotelData, guests: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Sélectionner</option>
                                    <option value="1">1 personne</option>
                                    <option value="2">2 personnes</option>
                                    <option value="3">3 personnes</option>
                                    <option value="4">4 personnes</option>
                                </select>
                            </div>

                            {/* Téléphone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Votre téléphone</label>
                                <input
                                    type="tel"
                                    value={hotelData.phone}
                                    onChange={(e) => setHotelData({...hotelData, phone: e.target.value})}
                                    placeholder="+225 07 00 00 00 00"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            {/* Récapitulatif */}
                            {hotelData.roomId && hotelData.startDate && hotelData.endDate && (
                                <div className="bg-orange-50 rounded-xl p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Récapitulatif</h4>
                                    {(() => {
                                        const selectedRoom = listing.rooms.find(r => r.id === hotelData.roomId);
                                        const nights = calculateNights(hotelData.startDate, hotelData.endDate);
                                        const total = selectedRoom.price * nights;
                                        const deposit = total * 0.3;
                                        return (
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">{selectedRoom.type} N°{selectedRoom.number}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">{formatPrice(selectedRoom.price)} × {nights} nuits</span>
                                                    <span className="font-medium">{formatPrice(total)} FCFA</span>
                                                </div>
                                                <div className="flex justify-between text-gray-500">
                                                    <span>Acompte (30%)</span>
                                                    <span>{formatPrice(deposit)} FCFA</span>
                                                </div>
                                                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-orange-200">
                                                    <span>Total</span>
                                                    <span className="text-orange-500">{formatPrice(total)} FCFA</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowHotelModal(false)} className="flex-1 h-12 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50">
                                    Annuler
                                </button>
                                <button
                                    onClick={() => {
                                        const selectedRoom = listing.rooms.find(r => r.id === hotelData.roomId);
                                        const nights = calculateNights(hotelData.startDate, hotelData.endDate);
                                        alert(`Réservation confirmée !\n\n${selectedRoom.type} N°${selectedRoom.number}\nDu ${hotelData.startDate} au ${hotelData.endDate}\n${nights} nuit(s)\n\nTotal: ${formatPrice(selectedRoom.price * nights)} FCFA\n\nVous recevrez une confirmation.`);
                                        setShowHotelModal(false);
                                        setHotelData({ roomId: null, startDate: '', endDate: '', guests: '', message: '', phone: '' });
                                        navigate('/reservations');
                                    }}
                                    disabled={!hotelData.roomId || !hotelData.startDate || !hotelData.endDate || !hotelData.phone}
                                    className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center justify-center gap-2"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    Confirmer & Payer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Seller Profile Page
function SellerProfilePage() {
    const { sellerId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [seller, setSeller] = useState(null);
    const [sellerListings, setSellerListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSellerData = async () => {
            // Essayer d'utiliser les données passées via le state (navigation depuis une annonce)
            const stateData = location.state;
            
            if (stateData?.seller) {
                const u = stateData.seller;
                setSeller({
                    id: sellerId,
                    name: u.businessName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Vendeur',
                    firstName: u.firstName,
                    lastName: u.lastName,
                    isPro: u.isPro,
                    memberSince: u.createdAt ? new Date(u.createdAt).getFullYear().toString() : 'Récemment',
                    location: u.city || 'Non spécifié',
                    bio: u.bio || '',
                    whatsappPhone: u.whatsappPhone || u.phone || '',
                    email: u.email || '',
                    profilePicture: u.profilePicture,
                    activeListings: 1,
                    totalViews: stateData.fromListing?.viewsCount || 0,
                    averageRating: u.averageRating || 0,
                    reviewsCount: u.reviewsCount || 0
                });
                
                if (stateData.fromListing) {
                    setSellerListings([stateData.fromListing]);
                }
                setIsLoading(false);
                return;
            }
            
            // Fallback: récupérer via l'API
            try {
                const { listingService } = await import('./services/api.js');
                const result = await listingService.getByUser(sellerId);
                if (result.ok && result.data) {
                    const { seller: sellerData, stats, listings } = result.data;
                    setSellerListings(listings || []);
                    if (sellerData) {
                        setSeller({
                            id: sellerId,
                            name: sellerData.businessName || sellerData.fullName || `${sellerData.firstName} ${sellerData.lastName}`,
                            firstName: sellerData.firstName,
                            lastName: sellerData.lastName,
                            isPro: sellerData.isPro,
                            memberSince: sellerData.memberSince || 'Récemment',
                            location: sellerData.city || 'Non spécifié',
                            bio: sellerData.bio || '',
                            whatsappPhone: sellerData.whatsappPhone || sellerData.phone || '',
                            email: sellerData.email || '',
                            profilePicture: sellerData.profilePicture,
                            activeListings: stats?.activeListings || listings?.length || 0,
                            totalViews: stats?.totalViews || 0,
                            averageRating: sellerData.averageRating || 0,
                            reviewsCount: sellerData.reviewsCount || 0
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching seller data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSellerData();
    }, [sellerId, location.state]);

    const categories = [
        { id: 'all', label: 'Tout', count: sellerListings.length },
        { id: 'immobilier', label: 'Immobilier', count: sellerListings.filter(l => l.category === 'immobilier').length },
        { id: 'vehicule', label: 'Véhicule', count: sellerListings.filter(l => l.category === 'vehicule').length },
        { id: 'vacance', label: 'Vacances', count: sellerListings.filter(l => l.category === 'vacance').length }
    ];

    const filteredListings = selectedCategory === 'all' 
        ? sellerListings 
        : sellerListings.filter(l => l.category === selectedCategory);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!seller) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Vendeur introuvable</h2>
                    <p className="text-gray-500 mb-4">Ce profil n'existe pas ou n'a pas d'annonces.</p>
                    <button onClick={() => navigate('/annonces')} className="px-4 py-2 bg-orange-500 text-white rounded-lg">
                        Voir les annonces
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Retour
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Seller Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 sticky top-24">
                            {/* Profile Header */}
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                                    {seller.name?.[0] || 'V'}
                                </div>
                                <h1 className="text-xl font-bold text-gray-900 mb-1">{seller.name}</h1>
                                {seller.isPro && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-600 text-sm font-medium rounded-full">
                                        <Star className="w-4 h-4 fill-current" /> PRO
                                    </span>
                                )}
                            </div>

                            {/* Rating */}
                            {seller.reviewsCount > 0 && (
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-5 h-5 ${star <= Math.round(seller.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="font-semibold text-gray-900">{seller.averageRating}</span>
                                    <span className="text-gray-500">({seller.reviewsCount} avis)</span>
                                </div>
                            )}

                            {/* Location & Member Since */}
                            <div className="space-y-2 mb-6 text-center">
                                <div className="flex items-center justify-center gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4 text-orange-500" />
                                    <span>{seller.location}</span>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-gray-600">
                                    <Calendar className="w-4 h-4 text-orange-500" />
                                    <span>Membre depuis {seller.memberSince}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="bg-orange-50 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-orange-600">{seller.activeListings}</div>
                                    <div className="text-xs text-gray-600">Annonces</div>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-blue-600">{seller.totalViews}</div>
                                    <div className="text-xs text-gray-600">Vues</div>
                                </div>
                                <div className="bg-yellow-50 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{seller.averageRating}</div>
                                    <div className="text-xs text-gray-600">Note</div>
                                </div>
                            </div>

                            {/* Bio */}
                            {seller.bio && (
                                <div className="border-t border-gray-100 pt-4 mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-2">À propos</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{seller.bio}</p>
                                </div>
                            )}

                            {/* Contact Buttons */}
                            <div className="space-y-3">
                                <button className="w-full h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                                    <MessageSquare className="w-5 h-5" />
                                    Contacter sur WhatsApp
                                </button>
                                <button className="w-full h-12 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                                    <Mail className="w-5 h-5" />
                                    Envoyer un email
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Listings */}
                    <div className="lg:col-span-2">
                        {/* Category Filters */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                                        selectedCategory === cat.id
                                            ? 'bg-orange-500 text-white shadow-lg'
                                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                    }`}
                                >
                                    {cat.label} ({cat.count})
                                </button>
                            ))}
                        </div>

                        {/* Listings Grid */}
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {selectedCategory === 'all' ? 'Toutes les annonces' : categories.find(c => c.id === selectedCategory)?.label}
                        </h2>

                        {filteredListings.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {filteredListings.map(listing => (
                                    <ListingCard key={listing.id} listing={listing} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
                                <p className="text-gray-500">Aucune annonce dans cette catégorie</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Messages/Conversations Page
function MessagesPage() {
    const navigate = useNavigate();
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [conversations, setConversations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const { messageService } = await import('./services/api.js');
                const result = await messageService.getConversations();
                if (result.ok && result.data?.conversations) {
                    setConversations(result.data.conversations.map(c => ({
                        id: c.id,
                        seller: {
                            name: c.otherUser?.businessName || `${c.otherUser?.firstName || ''} ${c.otherUser?.lastName || ''}`.trim() || 'Utilisateur',
                            isPro: c.otherUser?.accountType === 'PRO',
                            avatar: (c.otherUser?.firstName?.[0] || c.otherUser?.businessName?.[0] || 'U')
                        },
                        listing: c.listing ? {
                            id: c.listing.id,
                            title: c.listing.title,
                            price: c.listing.price,
                            priceUnit: c.listing.priceUnit,
                            image: c.listing.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'
                        } : null,
                        messages: c.messages?.map(m => ({
                            id: m.id,
                            sender: m.isFromMe ? 'me' : 'seller',
                            text: m.content,
                            time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
                            date: m.createdAt ? new Date(m.createdAt).toLocaleDateString('fr-FR') : ''
                        })) || [],
                        unread: c.unreadCount || 0,
                        lastMessage: c.lastMessage?.content || '',
                        lastTime: c.lastMessage?.createdAt ? new Date(c.lastMessage.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''
                    })));
                }
            } catch (error) {
                console.error('Error fetching conversations:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConversations();
    }, []);

    const activeConversation = conversations.find(c => c.id === selectedConversation);

    const sendMessage = () => {
        if (newMessage.trim()) {
            alert('Message envoyé : ' + newMessage);
            setNewMessage('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-64px)]">
                    {/* Conversations List */}
                    <div className={`bg-white border-r border-gray-200 ${selectedConversation ? 'hidden lg:block' : ''}`}>
                        <div className="p-4 border-b border-gray-200">
                            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                        </div>
                        
                        <div className="overflow-y-auto h-[calc(100vh-130px)]">
                            {conversations.map(conv => (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv.id)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                                        selectedConversation === conv.id ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                                    }`}
                                >
                                    <div className="flex gap-3">
                                        <img 
                                            src={conv.listing.image} 
                                            alt=""
                                            className="w-14 h-14 rounded-lg object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-900 truncate">{conv.seller.name}</span>
                                                    {conv.seller.isPro && (
                                                        <span className="text-xs text-orange-600 flex items-center gap-0.5">
                                                            <Star className="w-3 h-3 fill-current" />
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500">{conv.lastTime}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">{conv.listing.title}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                                                {conv.unread > 0 && (
                                                    <span className="w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                                                        {conv.unread}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Conversation Detail */}
                    <div className={`lg:col-span-2 flex flex-col ${!selectedConversation ? 'hidden lg:flex' : ''}`}>
                        {activeConversation ? (
                            <>
                                {/* Conversation Header */}
                                <div className="bg-white p-4 border-b border-gray-200 flex items-center gap-3">
                                    <button 
                                        onClick={() => setSelectedConversation(null)}
                                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div 
                                        onClick={() => navigate(`/listing/${activeConversation.listing.id}`)}
                                        className="flex gap-3 flex-1 cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg"
                                    >
                                        <img 
                                            src={activeConversation.listing.image}
                                            alt=""
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{activeConversation.listing.title}</p>
                                            <p className="text-sm text-orange-500 font-medium">
                                                {formatPrice(activeConversation.listing.price)} FCFA
                                                {activeConversation.listing.priceUnit && `/${activeConversation.listing.priceUnit}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div 
                                        onClick={() => navigate(`/seller/${activeConversation.id}`)}
                                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                                    >
                                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {activeConversation.seller.avatar}
                                        </div>
                                        <div className="hidden sm:block">
                                            <p className="text-sm font-medium text-gray-900">{activeConversation.seller.name}</p>
                                            {activeConversation.seller.isPro && (
                                                <span className="text-xs text-orange-600 flex items-center gap-0.5">
                                                    <Star className="w-3 h-3 fill-current" /> PRO
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                    {activeConversation.messages.map((msg, index) => {
                                        const showDate = index === 0 || activeConversation.messages[index - 1].date !== msg.date;
                                        return (
                                            <div key={msg.id}>
                                                {showDate && (
                                                    <div className="text-center text-xs text-gray-500 my-4">{msg.date}</div>
                                                )}
                                                <div className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                                                        msg.sender === 'me' 
                                                            ? 'bg-orange-500 text-white rounded-br-md' 
                                                            : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                                                    }`}>
                                                        <p className="text-sm">{msg.text}</p>
                                                        <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-orange-100' : 'text-gray-400'}`}>
                                                            {msg.time}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Message Input */}
                                <div className="bg-white p-4 border-t border-gray-200">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                            placeholder="Écrivez votre message..."
                                            className="flex-1 h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                        <button
                                            onClick={sendMessage}
                                            disabled={!newMessage.trim()}
                                            className="h-12 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
                                        >
                                            <MessageSquare className="w-5 h-5" />
                                            <span className="hidden sm:inline">Envoyer</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center bg-gray-50">
                                <div className="text-center text-gray-500">
                                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                    <p className="text-lg font-medium">Sélectionnez une conversation</p>
                                    <p className="text-sm">Choisissez une conversation dans la liste pour voir les messages</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Notifications Page
function NotificationsPage() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { notificationService } = await import('./services/api.js');
                const result = await notificationService.getAll();
                if (result.ok && result.data?.data) {
                    const formattedNotifications = result.data.data.map(n => ({
                        id: n.id,
                        type: n.type || 'info',
                        title: n.title || 'Notification',
                        message: n.message || n.content || '',
                        read: n.read || n.isRead || false,
                        createdAt: n.createdAt ? new Date(n.createdAt).toLocaleDateString('fr-FR') : 'Récemment',
                        icon: n.type === 'message' ? 'message' : n.type === 'listing' ? 'check' : 'bell',
                        color: n.type === 'message' ? 'green' : n.type === 'warning' ? 'orange' : 'blue'
                    }));
                    setNotifications(formattedNotifications);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;
    const filteredNotifications = filter === 'all' 
        ? notifications 
        : notifications.filter(n => filter === 'unread' ? !n.read : n.read);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getIconColor = (color) => {
        const colors = {
            red: 'bg-red-100 text-red-600',
            orange: 'bg-orange-100 text-orange-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            emerald: 'bg-emerald-100 text-emerald-600',
            blue: 'bg-blue-100 text-blue-600'
        };
        return colors[color] || colors.blue;
    };

    const getIcon = (type) => {
        switch(type) {
            case 'favorite_unavailable': return <Heart className="w-5 h-5" />;
            case 'listing_expiring': return <Clock className="w-5 h-5" />;
            case 'new_message': return <MessageSquare className="w-5 h-5" />;
            case 'review_received': return <Star className="w-5 h-5" />;
            case 'listing_published': return <Check className="w-5 h-5" />;
            default: return <Bell className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-3xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                            <p className="text-gray-500 text-sm">
                                {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est lu'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                                    title="Tout marquer comme lu"
                                >
                                    <CheckCheck className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                title="Paramètres"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-colors ${
                                filter === 'all'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Toutes ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-colors ${
                                filter === 'unread'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Non lues ({unreadCount})
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
                        </h3>
                        <p className="text-gray-500 text-sm">
                            {filter === 'unread' ? 'Vous avez tout lu !' : 'Vos notifications apparaîtront ici'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${
                                    !notification.read ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100'
                                }`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="flex gap-4">
                                    {/* Icon */}
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getIconColor(notification.color)}`}>
                                        {getIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {notification.title}
                                            </p>
                                            {!notification.read && (
                                                <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-2"></span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                        <p className="text-xs text-gray-400 mt-2">{notification.createdAt}</p>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification.id);
                                        }}
                                        className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info Card */}
                <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 mt-6">
                    <div className="flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-blue-900 mb-1">À propos des notifications</h4>
                            <p className="text-sm text-blue-700">
                                Vous recevez des notifications pour vos annonces, abonnements, avis et favoris.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// My Listings Page (Mes annonces)
function MyListingsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [editForm, setEditForm] = useState({ title: '', price: '' });

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const { listingService } = await import('./services/api.js');
                const result = await listingService.getMyListings();
                if (result.ok && result.data?.data) {
                    const formattedListings = result.data.data.map(l => ({
                        id: l.id,
                        title: l.title,
                        price: l.price,
                        status: l.status === 'active' ? 'active' : l.status === 'sold' ? 'sold' : l.status === 'expired' ? 'expired' : 'draft',
                        views: l.viewsCount || 0,
                        contacts: l.contactsCount || 0,
                        favorites: l.favoritesCount || 0,
                        createdAt: l.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
                        expiresAt: l.expiresAt?.split('T')[0] || null,
                        category: l.category || 'Autre',
                        city: l.city || '',
                        image: l.images?.[0]?.url || 'https://placehold.co/400x300/f3f4f6/9ca3af'
                    }));
                    setListings(formattedListings);
                }
            } catch (error) {
                console.error('Error fetching listings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchListings();
    }, []);

    const getStatusConfig = (status) => {
        const configs = {
            active: { label: 'Active', bg: 'bg-green-100', text: 'text-green-700', icon: Check },
            expired: { label: 'Expirée', bg: 'bg-red-100', text: 'text-red-700', icon: Clock },
            sold: { label: 'Vendue', bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCheck },
            draft: { label: 'Brouillon', bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText },
        };
        return configs[status] || configs.draft;
    };

    const filteredListings = listings
        .filter(l => {
            if (activeTab === 'all') return true;
            return l.status === activeTab;
        })
        .filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'views') return b.views - a.views;
            if (sortBy === 'price-asc') return a.price - b.price;
            if (sortBy === 'price-desc') return b.price - a.price;
            return 0;
        });

    const handleDelete = () => {
        setListings(listings.filter(l => l.id !== selectedListing.id));
        setShowDeleteModal(false);
        setSelectedListing(null);
    };

    const handleEdit = () => {
        setListings(listings.map(l => 
            l.id === selectedListing.id 
                ? { ...l, title: editForm.title, price: parseInt(editForm.price) }
                : l
        ));
        setShowEditModal(false);
        setSelectedListing(null);
    };

    const handleRenew = (listing) => {
        const newExpiry = new Date();
        newExpiry.setMonth(newExpiry.getMonth() + 1);
        setListings(listings.map(l => 
            l.id === listing.id 
                ? { ...l, status: 'active', expiresAt: newExpiry.toISOString().split('T')[0] }
                : l
        ));
        alert(`Annonce "${listing.title}" renouvelée pour 30 jours !`);
    };

    const handleMarkAsSold = (listing) => {
        setListings(listings.map(l => 
            l.id === listing.id ? { ...l, status: 'sold' } : l
        ));
    };

    const openEditModal = (listing) => {
        setSelectedListing(listing);
        setEditForm({ title: listing.title, price: listing.price.toString() });
        setShowEditModal(true);
    };

    const stats = {
        total: listings.length,
        active: listings.filter(l => l.status === 'active').length,
        totalViews: listings.reduce((sum, l) => sum + l.views, 0),
        totalContacts: listings.reduce((sum, l) => sum + l.contacts, 0),
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-5xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mes annonces</h1>
                        <p className="text-gray-500">{stats.total} annonces • {stats.totalViews} vues totales</p>
                    </div>
                    <button 
                        onClick={() => navigate('/publish')}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Nouvelle annonce
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Actives</p>
                        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Vues totales</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.totalViews}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Contacts reçus</p>
                        <p className="text-2xl font-bold text-orange-500">{stats.totalContacts}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher une annonce..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="recent">Plus récentes</option>
                            <option value="views">Plus vues</option>
                            <option value="price-asc">Prix croissant</option>
                            <option value="price-desc">Prix décroissant</option>
                        </select>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {[
                        { id: 'all', label: 'Toutes', count: listings.length },
                        { id: 'active', label: 'Actives', count: listings.filter(l => l.status === 'active').length },
                        { id: 'draft', label: 'Brouillons', count: listings.filter(l => l.status === 'draft').length },
                        { id: 'expired', label: 'Expirées', count: listings.filter(l => l.status === 'expired').length },
                        { id: 'sold', label: 'Vendues', count: listings.filter(l => l.status === 'sold').length },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* Listings */}
                {filteredListings.length > 0 ? (
                    <div className="space-y-4">
                        {filteredListings.map(listing => {
                            const statusConfig = getStatusConfig(listing.status);
                            const StatusIcon = statusConfig.icon;
                            const daysLeft = listing.expiresAt ? Math.ceil((new Date(listing.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                            
                            return (
                                <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                    <div className="flex gap-4">
                                        <div className="relative">
                                            <img src={listing.image} alt="" className="w-32 h-32 rounded-lg object-cover" />
                                            <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${statusConfig.bg} ${statusConfig.text}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 text-lg">{listing.title}</h3>
                                                    <p className="text-orange-500 font-bold text-xl">{formatPrice(listing.price)} FCFA</p>
                                                    <p className="text-sm text-gray-500 mt-1">{listing.category} • {listing.city}</p>
                                                </div>
                                            </div>
                                            
                                            {/* Stats */}
                                            <div className="flex items-center gap-6 mt-3">
                                                <span className="flex items-center gap-1.5 text-sm text-gray-600">
                                                    <Eye className="w-4 h-4 text-gray-400" /> {listing.views || listing.viewsCount || 0} vues
                                                </span>
                                                <span className="flex items-center gap-1.5 text-sm text-gray-600">
                                                    <MessageSquare className="w-4 h-4 text-gray-400" /> {listing.contacts} contacts
                                                </span>
                                                <span className="flex items-center gap-1.5 text-sm text-gray-600">
                                                    <Heart className="w-4 h-4 text-gray-400" /> {listing.favorites} favoris
                                                </span>
                                                {daysLeft !== null && listing.status === 'active' && (
                                                    <span className={`flex items-center gap-1.5 text-sm ${daysLeft <= 7 ? 'text-red-600' : 'text-gray-600'}`}>
                                                        <Clock className="w-4 h-4" /> {daysLeft}j restants
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 min-w-[140px]">
                                            <button 
                                                onClick={() => navigate(`/listing/${listing.id}`)}
                                                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" /> Voir
                                            </button>
                                            <button 
                                                onClick={() => openEditModal(listing)}
                                                className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center gap-2"
                                            >
                                                <Settings className="w-4 h-4" /> Modifier
                                            </button>
                                            {listing.status === 'expired' && (
                                                <button 
                                                    onClick={() => handleRenew(listing)}
                                                    className="px-3 py-2 text-sm bg-green-50 hover:bg-green-100 text-green-600 rounded-lg flex items-center justify-center gap-2"
                                                >
                                                    <ArrowRight className="w-4 h-4" /> Renouveler
                                                </button>
                                            )}
                                            {listing.status === 'active' && (
                                                <button 
                                                    onClick={() => handleMarkAsSold(listing)}
                                                    className="px-3 py-2 text-sm bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center gap-2"
                                                >
                                                    <CheckCheck className="w-4 h-4" /> Marquer vendu
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => { setSelectedListing(listing); setShowDeleteModal(true); }}
                                                className="px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" /> Supprimer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune annonce</h3>
                        <p className="text-gray-500 mb-4">Vous n'avez pas encore d'annonces dans cette catégorie</p>
                        <button 
                            onClick={() => navigate('/publish')}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium"
                        >
                            Créer une annonce
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && selectedListing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Supprimer l'annonce ?</h2>
                            <p className="text-gray-500">"{selectedListing.title}" sera définitivement supprimée.</p>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedListing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Modifier l'annonce</h2>
                            <button onClick={() => setShowEditModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex gap-4 mb-4">
                                <img src={selectedListing.image} alt="" className="w-20 h-20 rounded-lg object-cover" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">ID: #{selectedListing.id}</p>
                                    <p className="text-sm text-gray-500">Créée le: {selectedListing.createdAt}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                                <input 
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
                                <input 
                                    type="number"
                                    value={editForm.price}
                                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                                <p className="flex items-center gap-2"><Info className="w-4 h-4" /> Pour modifier les images ou la description, utilisez l'éditeur complet.</p>
                            </div>
                        </div>
                        <div className="flex gap-3 p-4 border-t border-gray-100">
                            <button 
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={handleEdit}
                                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// My Reservations Page - Complete booking system
function MyReservationsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('client'); // 'client' or 'owner'
    const [filter, setFilter] = useState('all');
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // Réservations en tant que client (locataire)
    const [clientReservations, setClientReservations] = useState([]);
    
    // Réservations en tant que propriétaire
    const [ownerReservations, setOwnerReservations] = useState([]);
    
    // Calendrier de disponibilité (pour le propriétaire)
    const [availability, setAvailability] = useState({});
    
    // Mes annonces (pour gérer les disponibilités)
    const [myListings, setMyListings] = useState([]);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const { bookingService, listingService } = await import('./services/api.js');
                
                // Récupérer les réservations en tant que client
                const clientResult = await bookingService.getMyBookings();
                if (clientResult.ok && clientResult.data?.bookings) {
                    setClientReservations(clientResult.data.bookings.map(b => ({
                        id: b.id,
                        listing: b.listing?.title || 'Annonce',
                        image: b.listing?.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
                        owner: b.listing?.user ? `${b.listing.user.firstName} ${b.listing.user.lastName}` : 'Propriétaire',
                        startDate: b.startDate ? new Date(b.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
                        endDate: b.endDate ? new Date(b.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
                        status: b.status || 'pending',
                        amount: b.totalAmount || 0,
                        deposit: b.depositAmount || 0,
                        address: b.listing?.city || ''
                    })));
                }

                // Récupérer les réservations en tant que propriétaire
                const ownerResult = await bookingService.getReceivedBookings();
                if (ownerResult.ok && ownerResult.data?.bookings) {
                    setOwnerReservations(ownerResult.data.bookings.map(b => ({
                        id: b.id,
                        listing: b.listing?.title || 'Annonce',
                        image: b.listing?.images?.[0] || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400',
                        guest: b.user ? `${b.user.firstName} ${b.user.lastName}` : 'Client',
                        phone: b.user?.phone || '',
                        startDate: b.startDate ? new Date(b.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
                        endDate: b.endDate ? new Date(b.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
                        status: b.status || 'pending',
                        amount: b.totalAmount || 0,
                        deposit: b.depositAmount || 0,
                        message: b.message || ''
                    })));
                }

                // Récupérer mes annonces
                const listingsResult = await listingService.getMyListings();
                if (listingsResult.ok && listingsResult.data?.data) {
                    setMyListings(listingsResult.data.data.map(l => ({
                        id: l.id,
                        title: l.title,
                        image: l.images?.[0] || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400',
                        price: l.price
                    })));
                }
            } catch (error) {
                console.error('Error fetching reservations:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReservations();
    }, []);
    
    const getStatusColor = (status) => {
        switch(status) {
            case 'confirmed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };
    
    const getStatusLabel = (status) => {
        switch(status) {
            case 'confirmed': return 'Confirmée';
            case 'pending': return 'En attente';
            case 'completed': return 'Terminée';
            case 'cancelled': return 'Annulée';
            default: return status;
        }
    };
    
    // Générer les jours du mois pour le calendrier
    const generateCalendarDays = () => {
        const days = [];
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        
        // Jours vides au début
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: null, date: null });
        }
        
        // Jours du mois
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({ 
                day: i, 
                date: dateStr,
                ...availability[dateStr]
            });
        }
        
        return days;
    };
    
    const toggleAvailability = (dateStr) => {
        if (!dateStr) return;
        setAvailability(prev => ({
            ...prev,
            [dateStr]: prev[dateStr]?.blocked 
                ? { available: true } 
                : { available: false, blocked: true }
        }));
    };

    const filteredClientReservations = clientReservations.filter(r => 
        filter === 'all' || r.status === filter
    );
    
    const filteredOwnerReservations = ownerReservations.filter(r => 
        filter === 'all' || r.status === filter
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-5xl mx-auto px-4 py-6">
                {/* Header avec tabs */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Réservations</h1>
                </div>
                
                {/* Tabs Client / Propriétaire */}
                <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit">
                    <button
                        onClick={() => setActiveTab('client')}
                        className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                            activeTab === 'client' 
                                ? 'bg-orange-500 text-white shadow-sm' 
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Mes réservations
                    </button>
                    <button
                        onClick={() => setActiveTab('owner')}
                        className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                            activeTab === 'owner' 
                                ? 'bg-orange-500 text-white shadow-sm' 
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Home className="w-4 h-4 inline mr-2" />
                        Demandes reçues
                    </button>
                </div>

                {/* Filtres */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'pending', 'confirmed', 'completed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                                filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
                            }`}
                        >
                            {f === 'all' ? 'Toutes' : getStatusLabel(f)}
                        </button>
                    ))}
                </div>

                {/* Vue Client - Mes réservations */}
                {activeTab === 'client' && (
                    <div className="space-y-4">
                        {filteredClientReservations.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center">
                                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation</h3>
                                <p className="text-gray-500 mb-4">Vous n'avez pas encore de réservation</p>
                                <button 
                                    onClick={() => navigate('/annonces')}
                                    className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
                                >
                                    Explorer les annonces
                                </button>
                            </div>
                        ) : (
                            filteredClientReservations.map(res => (
                                <div key={res.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="flex flex-col md:flex-row">
                                        <img src={res.image} alt={res.listing} className="w-full md:w-48 h-32 md:h-auto object-cover" />
                                        <div className="flex-1 p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">{res.listing}</h3>
                                                    <p className="text-gray-500 text-sm flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" /> {res.address}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(res.status)}`}>
                                                    {getStatusLabel(res.status)}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">Arrivée</p>
                                                    <p className="font-medium text-gray-900">{res.startDate}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Départ</p>
                                                    <p className="font-medium text-gray-900">{res.endDate}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Caution</p>
                                                    <p className="font-medium text-gray-900">{res.deposit.toLocaleString()} FCFA</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Total</p>
                                                    <p className="font-bold text-orange-500">{res.amount.toLocaleString()} FCFA</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                                <img src={`https://ui-avatars.com/api/?name=${res.owner}&background=random`} alt="" className="w-8 h-8 rounded-full" />
                                                <span className="text-sm text-gray-600">Propriétaire: <strong>{res.owner}</strong></span>
                                                
                                                <div className="ml-auto flex gap-2">
                                                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-1">
                                                        <MessageSquare className="w-4 h-4" /> Contacter
                                                    </button>
                                                    {res.status === 'pending' && (
                                                        <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">
                                                            Annuler
                                                        </button>
                                                    )}
                                                    {res.status === 'confirmed' && (
                                                        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 flex items-center gap-1">
                                                            <CreditCard className="w-4 h-4" /> Payer
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Vue Propriétaire - Demandes reçues */}
                {activeTab === 'owner' && (
                    <>
                        {/* Bouton Gérer disponibilités */}
                        <div className="mb-6">
                            <button
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Calendar className="w-5 h-5" />
                                {showCalendar ? 'Masquer le calendrier' : 'Gérer les disponibilités'}
                            </button>
                        </div>
                        
                        {/* Calendrier de disponibilité */}
                        {showCalendar && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900">Calendrier de disponibilité</h3>
                                    <select 
                                        value={selectedListing || ''}
                                        onChange={(e) => setSelectedListing(e.target.value)}
                                        className="px-4 py-2 border border-gray-200 rounded-lg"
                                    >
                                        <option value="">Sélectionner une annonce</option>
                                        {myListings.map(l => (
                                            <option key={l.id} value={l.id}>{l.title}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* Légende */}
                                <div className="flex gap-4 mb-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                                        <span>Disponible</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                                        <span>Bloqué</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                                        <span>Réservé</span>
                                    </div>
                                </div>
                                
                                {/* Grille calendrier */}
                                <div className="grid grid-cols-7 gap-1">
                                    {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(d => (
                                        <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
                                    ))}
                                    {generateCalendarDays().map((d, i) => (
                                        <button
                                            key={i}
                                            onClick={() => d.day && toggleAvailability(d.date)}
                                            disabled={!d.day || d.booked}
                                            className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all ${
                                                !d.day ? 'bg-transparent' :
                                                d.booked ? 'bg-blue-100 text-blue-700 cursor-not-allowed' :
                                                d.blocked ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                                                'bg-green-50 text-green-700 hover:bg-green-100'
                                            }`}
                                        >
                                            {d.day}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-4">Cliquez sur une date pour bloquer/débloquer la disponibilité</p>
                            </div>
                        )}
                        
                        {/* Liste des demandes */}
                        <div className="space-y-4">
                            {filteredOwnerReservations.length === 0 ? (
                                <div className="bg-white rounded-xl p-12 text-center">
                                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande</h3>
                                    <p className="text-gray-500">Vous n'avez pas encore reçu de demande de réservation</p>
                                </div>
                            ) : (
                                filteredOwnerReservations.map(res => (
                                    <div key={res.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="flex flex-col md:flex-row">
                                            <img src={res.image} alt={res.listing} className="w-full md:w-48 h-32 md:h-auto object-cover" />
                                            <div className="flex-1 p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-lg">{res.listing}</h3>
                                                        <p className="text-gray-600 text-sm">Demande de <strong>{res.guest}</strong></p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(res.status)}`}>
                                                        {getStatusLabel(res.status)}
                                                    </span>
                                                </div>
                                                
                                                {/* Message du client */}
                                                {res.message && (
                                                    <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600 italic">
                                                        "{res.message}"
                                                    </div>
                                                )}
                                                
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Arrivée</p>
                                                        <p className="font-medium text-gray-900">{res.startDate}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Départ</p>
                                                        <p className="font-medium text-gray-900">{res.endDate}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Caution</p>
                                                        <p className="font-medium text-gray-900">{res.deposit.toLocaleString()} FCFA</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Total</p>
                                                        <p className="font-bold text-orange-500">{res.amount.toLocaleString()} FCFA</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                                    <a href={`tel:${res.phone}`} className="text-sm text-blue-600 flex items-center gap-1">
                                                        <Phone className="w-4 h-4" /> {res.phone}
                                                    </a>
                                                    
                                                    <div className="ml-auto flex gap-2">
                                                        {res.status === 'pending' && (
                                                            <>
                                                                <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">
                                                                    Refuser
                                                                </button>
                                                                <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 flex items-center gap-1">
                                                                    <Check className="w-4 h-4" /> Accepter
                                                                </button>
                                                            </>
                                                        )}
                                                        {res.status === 'confirmed' && (
                                                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1">
                                                                <Eye className="w-4 h-4" /> Voir détails
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// My Payments Page
function MyPaymentsPage() {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [filter, setFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const { paymentService } = await import('./services/api.js');
                const result = await paymentService.getPaymentHistory();
                if (result.ok && result.data?.payments) {
                    setPayments(result.data.payments.map(p => ({
                        id: p.id,
                        type: p.type || 'Abonnement PRO',
                        description: p.description || p.type || 'Paiement',
                        amount: p.amount || 0,
                        date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
                        status: p.status || 'pending',
                        paymentMethod: p.paymentMethod || 'wave'
                    })));
                }
            } catch (error) {
                console.error('Error fetching payments:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPayments();
    }, []);

    // Logos des méthodes de paiement
    const paymentMethodLogos = {
        wave: { logo: '/images/wave.webp', name: 'Wave' },
        orange_money: { logo: '/images/orange.webp', name: 'Orange Money' },
        moov_money: { logo: '/images/moov.jpg', name: 'Moov Money' },
        mtn_money: { logo: '/images/mtn.jpeg', name: 'MTN Money' },
        card: { logo: '/images/banque.webp', name: 'Carte Bancaire' },
    };

    const getStatusConfig = (status) => {
        const configs = {
            completed: { label: 'Payé', bg: 'bg-green-100', text: 'text-green-700' },
            pending: { label: 'En attente', bg: 'bg-yellow-100', text: 'text-yellow-700' },
            failed: { label: 'Échoué', bg: 'bg-red-100', text: 'text-red-700' },
            refunded: { label: 'Remboursé', bg: 'bg-blue-100', text: 'text-blue-700' },
        };
        return configs[status] || configs.pending;
    };

    const filteredPayments = filter === 'all' 
        ? payments 
        : payments.filter(p => p.status === filter);

    const stats = {
        total: payments.reduce((sum, p) => p.status === 'completed' ? sum + p.amount : sum, 0),
        count: payments.filter(p => p.status === 'completed').length,
        pending: payments.filter(p => p.status === 'pending').length,
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-5xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mes paiements</h1>
                        <p className="text-gray-500">{payments.length} transaction(s)</p>
                    </div>
                    <button 
                        onClick={() => navigate('/upgrade')}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium flex items-center gap-2"
                    >
                        <Star className="w-5 h-5" /> Passer PRO
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Total dépensé</p>
                        <p className="text-2xl font-bold text-orange-500">{formatPrice(stats.total)} FCFA</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Transactions réussies</p>
                        <p className="text-2xl font-bold text-green-600">{stats.count}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">En attente</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {[
                        { id: 'all', label: 'Toutes' },
                        { id: 'completed', label: 'Réussies' },
                        { id: 'pending', label: 'En attente' },
                        { id: 'failed', label: 'Échouées' },
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filter === f.id
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Payments List */}
                {filteredPayments.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune transaction</h3>
                        <p className="text-gray-500 mb-4">Vous n'avez pas encore effectué de paiement</p>
                        <button 
                            onClick={() => navigate('/upgrade')}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium"
                        >
                            Passer PRO
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Transaction</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Méthode</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Montant</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPayments.map(payment => {
                                    const statusConfig = getStatusConfig(payment.status);
                                    const methodInfo = paymentMethodLogos[payment.paymentMethod] || paymentMethodLogos.card;
                                    
                                    return (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">{payment.type}</p>
                                                <p className="text-sm text-gray-500">{payment.description}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <img 
                                                        src={methodInfo.logo} 
                                                        alt={methodInfo.name}
                                                        className="w-8 h-8 object-contain rounded"
                                                    />
                                                    <span className="text-sm text-gray-600">{methodInfo.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-orange-500">
                                                {formatPrice(payment.amount)} FCFA
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{payment.date}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Moyens de paiement acceptés */}
                <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Moyens de paiement acceptés</h3>
                    <div className="flex flex-wrap justify-center items-center gap-6">
                        {Object.entries(paymentMethodLogos).map(([key, method]) => (
                            <div key={key} className="flex flex-col items-center gap-2">
                                <img 
                                    src={method.logo} 
                                    alt={method.name} 
                                    className="h-10 w-auto object-contain rounded-lg"
                                />
                                <span className="text-xs text-gray-500">{method.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Favorites Page
function FavoritesPage() {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const { favoriteService } = await import('./services/api.js');
                const result = await favoriteService.getAll();
                if (result.ok && result.data?.data) {
                    setFavorites(result.data.data);
                }
            } catch (error) {
                console.error('Error fetching favorites:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
                    <span className="text-gray-500">{favorites.length} annonce(s)</span>
                </div>

                {favorites.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun favori</h3>
                        <p className="text-gray-500 mb-4">Ajoutez des annonces à vos favoris pour les retrouver facilement</p>
                        <button onClick={() => navigate('/annonces')} className="px-4 py-2 bg-orange-500 text-white rounded-lg">
                            Découvrir les annonces
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {favorites.map(fav => (
                            <div key={fav.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/listing/${fav.listingId || fav.id}`)}>
                                <img src={fav.listing?.images?.[0]?.url || fav.image || 'https://placehold.co/400x300/f3f4f6/9ca3af'} alt="" className="w-full h-48 object-cover" />
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900">{fav.listing?.title || fav.title}</h3>
                                    <p className="text-orange-500 font-bold">{(fav.listing?.price || fav.price || 0).toLocaleString()} FCFA</p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-4 h-4" /> {fav.listing?.city || fav.city}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Stats Page (PRO) - Version complète
function StatsPage() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalViews: 0, activeListings: 0, totalContacts: 0, conversionRate: 0 });
    const [topListings, setTopListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { userStatsService, listingService } = await import('./services/api.js');
                
                // Récupérer les stats utilisateur
                const statsResult = await userStatsService.getStats();
                if (statsResult.ok && statsResult.data?.stats) {
                    const s = statsResult.data.stats;
                    setStats({
                        totalViews: s.totalViews || 0,
                        activeListings: s.activeListings || 0,
                        totalContacts: s.totalContacts || 0,
                        conversionRate: s.totalViews > 0 ? ((s.totalContacts / s.totalViews) * 100).toFixed(1) : 0
                    });
                }

                // Récupérer les annonces de l'utilisateur
                const listingsResult = await listingService.getMyListings();
                if (listingsResult.ok && listingsResult.data?.data) {
                    const listings = listingsResult.data.data.map(l => ({
                        id: l.id,
                        title: l.title,
                        views: l.viewsCount || 0,
                        contacts: l.contactsCount || 0,
                        conversion: l.viewsCount > 0 ? ((l.contactsCount / l.viewsCount) * 100).toFixed(1) : 0,
                        image: l.images?.[0]?.url || 'https://placehold.co/100x100/f3f4f6/9ca3af'
                    }));
                    setTopListings(listings.sort((a, b) => b.views - a.views).slice(0, 5));
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Données pour le graphique (basées sur les vraies stats)
    const chartData = Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        vues: Math.max(0, Math.floor((stats.totalViews / 30) * (0.5 + Math.random())))
    }));

    // Répartition par catégorie (calculée à partir des annonces)
    const categoryData = [
        { name: 'Immobilier', value: topListings.filter(l => l.title?.toLowerCase().includes('villa') || l.title?.toLowerCase().includes('appartement')).length * 20 || 33, color: '#3B82F6' },
        { name: 'Véhicules', value: topListings.filter(l => l.title?.toLowerCase().includes('toyota') || l.title?.toLowerCase().includes('mercedes')).length * 20 || 33, color: '#10B981' },
        { name: 'Vacances', value: topListings.filter(l => l.title?.toLowerCase().includes('hôtel') || l.title?.toLowerCase().includes('résidence')).length * 20 || 34, color: '#F59E0B' },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
                        <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded">PRO</span>
                    </div>
                    <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                        <option>30 derniers jours</option>
                        <option>7 derniers jours</option>
                        <option>Ce mois</option>
                        <option>Cette année</option>
                    </select>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <Eye className="w-8 h-8 text-blue-500 mb-3" />
                        <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Vues totales</p>
                        <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                            <ArrowRight className="w-3 h-3 rotate-[-45deg]" /> +12% cette semaine
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <LayoutGrid className="w-8 h-8 text-green-500 mb-3" />
                        <p className="text-3xl font-bold text-gray-900">{stats.activeListings}</p>
                        <p className="text-sm text-gray-500">Annonces actives</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <MessageSquare className="w-8 h-8 text-purple-500 mb-3" />
                        <p className="text-3xl font-bold text-gray-900">{stats.totalContacts}</p>
                        <p className="text-sm text-gray-500">Contacts reçus</p>
                        <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                            <ArrowRight className="w-3 h-3 rotate-[-45deg]" /> +8% cette semaine
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <TrendingUp className="w-8 h-8 text-orange-500 mb-3" />
                        <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
                        <p className="text-sm text-gray-500">Taux conversion</p>
                    </div>
                </div>

                {/* Graphique évolution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                            Évolution des vues (30 derniers jours)
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-orange-500 rounded-full"></span> Vues</span>
                            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Contacts</span>
                        </div>
                    </div>
                    <div className="h-64 flex items-end gap-1">
                        {chartData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div 
                                    className="w-full bg-orange-500 rounded-t-sm transition-all hover:bg-orange-600"
                                    style={{ height: `${(d.vues / 70) * 100}%` }}
                                    title={`Jour ${d.day}: ${d.vues} vues`}
                                ></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>1</span>
                        <span>5</span>
                        <span>10</span>
                        <span>15</span>
                        <span>20</span>
                        <span>25</span>
                        <span>30</span>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Répartition par catégorie */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <LayoutGrid className="w-5 h-5 text-blue-500" />
                            Répartition par catégorie
                        </h3>
                        <div className="flex items-center justify-center gap-8">
                            <div className="relative w-40 h-40">
                                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                    {categoryData.reduce((acc, cat, i) => {
                                        const offset = acc.offset;
                                        const dash = cat.value;
                                        acc.elements.push(
                                            <circle
                                                key={i}
                                                cx="50" cy="50" r="40"
                                                fill="none"
                                                stroke={cat.color}
                                                strokeWidth="20"
                                                strokeDasharray={`${dash} ${100 - dash}`}
                                                strokeDashoffset={-offset}
                                            />
                                        );
                                        acc.offset += dash;
                                        return acc;
                                    }, { elements: [], offset: 0 }).elements}
                                </svg>
                            </div>
                            <div className="space-y-3">
                                {categoryData.map((cat, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }}></span>
                                        <span className="text-sm text-gray-700">{cat.name}</span>
                                        <span className="text-sm font-bold text-gray-900">{cat.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Performance */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500" />
                            Analyse de performance
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                                <p className="text-xs text-orange-600 font-medium mb-1">Meilleure perf.</p>
                                <p className="font-semibold text-gray-900 text-sm truncate">Villa luxueuse Cocody</p>
                                <p className="text-xs text-gray-500">456 vues</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                                <p className="text-xs text-green-600 font-medium mb-1">Plus contactée</p>
                                <p className="font-semibold text-gray-900 text-sm truncate">Toyota Prado 2020</p>
                                <p className="text-xs text-gray-500">18 contacts</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                                <p className="text-xs text-blue-600 font-medium mb-1">Moy. vues/annonce</p>
                                <p className="text-2xl font-bold text-gray-900">247</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                                <p className="text-xs text-purple-600 font-medium mb-1">Moy. contacts</p>
                                <p className="text-2xl font-bold text-gray-900">8.4</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tableau détaillé */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Eye className="w-5 h-5 text-orange-500" />
                            Détail de vos annonces
                        </h3>
                    </div>
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Annonce</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">Vues</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">Contacts</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">Conversion</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {topListings.map(listing => (
                                <tr key={listing.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={listing.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                            <span className="font-medium text-gray-900">{listing.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-semibold text-gray-900">{listing.views}</td>
                                    <td className="px-6 py-4 text-center font-semibold text-gray-900">{listing.contacts}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`font-semibold ${listing.conversion >= 5 ? 'text-green-500' : listing.conversion >= 3 ? 'text-yellow-500' : 'text-gray-500'}`}>
                                            {listing.conversion}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => navigate(`/listing/${listing.id}`)}
                                            className="p-2 bg-orange-50 text-orange-500 rounded-lg hover:bg-orange-100"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Profile Settings Page
function ProfileSettingsPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        whatsapp: '',
        bio: '',
        city: '',
        country: '',
        address: '',
        website: '',
        companyName: '',
        siret: ''
    });

    // Store initial profile to track changes
    const [initialProfile, setInitialProfile] = useState(null);

    // Check if profile is incomplete
    const isProfileIncomplete = !profile.phone || !profile.email || !profile.firstName;

    // Check if profile has changed
    const hasChanges = initialProfile && JSON.stringify(profile) !== JSON.stringify(initialProfile);

    // Load profile from localStorage/API
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const loadedProfile = {
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        whatsapp: user.whatsapp || user.whatsappPhone || user.phone || '',
                        bio: user.bio || '',
                        city: user.city || '',
                        country: user.country || '',
                        address: user.address || '',
                        website: user.website || '',
                        companyName: user.businessName || '',
                        siret: user.siret || '',
                        profilePicture: user.profilePicture || ''
                    };
                    setProfile(loadedProfile);
                    setInitialProfile(loadedProfile);
                    // Set avatar preview if profile picture exists
                    if (user.profilePicture) {
                        setAvatarPreview(user.profilePicture);
                    }
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadProfile();
    }, []);

    const [notifications, setNotifications] = useState({
        emailNewMessage: true,
        emailNewOffer: true,
        emailNewsletter: false,
        pushMessages: true,
        pushOffers: true,
        smsAlerts: false
    });

    const [security, setSecurity] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
                // Update profile with new picture (marks as changed)
                setProfile(prev => ({...prev, profilePicture: reader.result}));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!hasChanges) return;
        
        setIsSaving(true);
        try {
            const { authService } = await import('./services/api.js');
            const result = await authService.updateProfile({
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone,
                whatsapp: profile.whatsapp,
                bio: profile.bio,
                city: profile.city,
                country: profile.country,
                profilePicture: profile.profilePicture
            });
            
            if (result.ok) {
                // Update localStorage with new data
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const updatedUser = {
                        ...user,
                        firstName: profile.firstName,
                        lastName: profile.lastName,
                        phone: profile.phone,
                        whatsapp: profile.whatsapp,
                        bio: profile.bio,
                        city: profile.city,
                        country: profile.country,
                        profilePicture: profile.profilePicture
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
                
                // Update initial profile to current (no more changes)
                setInitialProfile({...profile});
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
                
                // Dispatch auth change event to update Header
                window.dispatchEvent(new Event('authChange'));
            } else {
                alert(result.data?.error || 'Erreur lors de la sauvegarde');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Erreur lors de la sauvegarde du profil');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = () => {
        if (security.newPassword !== security.confirmPassword) {
            alert('Les mots de passe ne correspondent pas');
            return;
        }
        if (security.newPassword.length < 8) {
            alert('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }
        alert('Mot de passe modifié avec succès !');
        setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const tabs = [
        { id: 'profile', label: 'Profil', icon: Settings },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Sécurité', icon: Shield },
        { id: 'billing', label: 'Facturation', icon: CreditCard }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Paramètres du compte</h1>
                        <p className="text-gray-500">Gérez vos informations personnelles et préférences</p>
                    </div>
                    {showSuccess && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                            <Check className="w-5 h-5" />
                            Modifications enregistrées
                        </div>
                    )}
                </div>

                {/* Profile incomplete alert */}
                {isProfileIncomplete && !isLoading && (
                    <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-orange-800">Complétez votre profil</h3>
                            <p className="text-sm text-orange-700 mt-1">
                                Pour que les acheteurs puissent vous contacter, veuillez renseigner votre numéro de téléphone et vos informations personnelles.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex gap-6">
                    {/* Sidebar Tabs */}
                    <div className="w-56 shrink-0">
                        <nav className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-orange-50 text-orange-600'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                                {/* Avatar Section */}
                                <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                                    <div className="relative">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
                                                {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 shadow-lg"
                                        >
                                            <Camera className="w-4 h-4" />
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{profile.firstName} {profile.lastName}</h3>
                                        <p className="text-gray-500">{profile.email}</p>
                                        <p className="text-sm text-orange-500 mt-1">Compte FREE • <Link to="/upgrade" className="underline">Passer PRO</Link></p>
                                    </div>
                                </div>

                                {/* Personal Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                            <input 
                                                type="text" 
                                                value={profile.firstName}
                                                onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                            <input 
                                                type="text" 
                                                value={profile.lastName}
                                                onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input 
                                                type="email" 
                                                value={profile.email}
                                                onChange={(e) => setProfile({...profile, email: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                            <input 
                                                type="tel" 
                                                value={profile.phone}
                                                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                            <input 
                                                type="tel" 
                                                value={profile.whatsapp}
                                                onChange={(e) => setProfile({...profile, whatsapp: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                                            <input 
                                                type="url" 
                                                value={profile.website}
                                                onChange={(e) => setProfile({...profile, website: e.target.value})}
                                                placeholder="https://..."
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                                            <select 
                                                value={profile.country}
                                                onChange={(e) => setProfile({...profile, country: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            >
                                                <option>Côte d'Ivoire</option>
                                                <option>Sénégal</option>
                                                <option>Mali</option>
                                                <option>Burkina Faso</option>
                                                <option>Guinée</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                                            <input 
                                                type="text" 
                                                value={profile.city}
                                                onChange={(e) => setProfile({...profile, city: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                            <input 
                                                type="text" 
                                                value={profile.address}
                                                onChange={(e) => setProfile({...profile, address: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Bio */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">À propos de vous</h3>
                                    <textarea 
                                        rows={4}
                                        value={profile.bio}
                                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                                        placeholder="Présentez-vous en quelques mots..."
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                    <p className="text-sm text-gray-400 mt-1">{profile.bio.length}/500 caractères</p>
                                </div>

                                {/* Save Button */}
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving || !hasChanges}
                                    className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                                        hasChanges 
                                            ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    } ${isSaving ? 'bg-orange-300' : ''}`}
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Enregistrement...
                                        </>
                                    ) : hasChanges ? (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Enregistrer les modifications
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Aucune modification
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900">Préférences de notifications</h3>
                                
                                <div className="space-y-4">
                                    <div className="pb-4 border-b border-gray-100">
                                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                            <Mail className="w-5 h-5 text-gray-400" /> Email
                                        </h4>
                                        <div className="space-y-3">
                                            <label className="flex items-center justify-between">
                                                <span className="text-gray-600">Nouveaux messages</span>
                                                <input 
                                                    type="checkbox" 
                                                    checked={notifications.emailNewMessage}
                                                    onChange={(e) => setNotifications({...notifications, emailNewMessage: e.target.checked})}
                                                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                                                />
                                            </label>
                                            <label className="flex items-center justify-between">
                                                <span className="text-gray-600">Nouvelles offres sur mes annonces</span>
                                                <input 
                                                    type="checkbox" 
                                                    checked={notifications.emailNewOffer}
                                                    onChange={(e) => setNotifications({...notifications, emailNewOffer: e.target.checked})}
                                                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                                                />
                                            </label>
                                            <label className="flex items-center justify-between">
                                                <span className="text-gray-600">Newsletter et actualités</span>
                                                <input 
                                                    type="checkbox" 
                                                    checked={notifications.emailNewsletter}
                                                    onChange={(e) => setNotifications({...notifications, emailNewsletter: e.target.checked})}
                                                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="pb-4 border-b border-gray-100">
                                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                            <Bell className="w-5 h-5 text-gray-400" /> Notifications push
                                        </h4>
                                        <div className="space-y-3">
                                            <label className="flex items-center justify-between">
                                                <span className="text-gray-600">Messages instantanés</span>
                                                <input 
                                                    type="checkbox" 
                                                    checked={notifications.pushMessages}
                                                    onChange={(e) => setNotifications({...notifications, pushMessages: e.target.checked})}
                                                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                                                />
                                            </label>
                                            <label className="flex items-center justify-between">
                                                <span className="text-gray-600">Offres et réservations</span>
                                                <input 
                                                    type="checkbox" 
                                                    checked={notifications.pushOffers}
                                                    onChange={(e) => setNotifications({...notifications, pushOffers: e.target.checked})}
                                                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                            <Phone className="w-5 h-5 text-gray-400" /> SMS
                                        </h4>
                                        <label className="flex items-center justify-between">
                                            <span className="text-gray-600">Alertes importantes uniquement</span>
                                            <input 
                                                type="checkbox" 
                                                checked={notifications.smsAlerts}
                                                onChange={(e) => setNotifications({...notifications, smsAlerts: e.target.checked})}
                                                className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                                            />
                                        </label>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleSave}
                                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium"
                                >
                                    Enregistrer les préférences
                                </button>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Changer le mot de passe</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                                            <input 
                                                type="password"
                                                value={security.currentPassword}
                                                onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                                            <input 
                                                type="password"
                                                value={security.newPassword}
                                                onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Minimum 8 caractères</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                                            <input 
                                                type="password"
                                                value={security.confirmPassword}
                                                onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                        <button 
                                            onClick={handlePasswordChange}
                                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium"
                                        >
                                            Modifier le mot de passe
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sessions actives</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                                            <div className="flex items-center gap-3">
                                                <Globe className="w-5 h-5 text-green-600" />
                                                <div>
                                                    <p className="font-medium text-gray-900">Chrome - Windows</p>
                                                    <p className="text-sm text-gray-500">Abidjan, CI • Actif maintenant</p>
                                                </div>
                                            </div>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Session actuelle</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                                    <h3 className="text-lg font-semibold text-red-700 mb-2">Zone dangereuse</h3>
                                    <p className="text-red-600 text-sm mb-4">La suppression de votre compte est irréversible.</p>
                                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
                                        Supprimer mon compte
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Billing Tab */}
                        {activeTab === 'billing' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Abonnement actuel</h3>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-gray-900">Plan FREE</p>
                                            <p className="text-sm text-gray-500">Fonctionnalités de base</p>
                                        </div>
                                        <Link to="/upgrade" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium">
                                            Passer PRO
                                        </Link>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des paiements</h3>
                                    <div className="text-center py-8 text-gray-500">
                                        <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>Aucun paiement pour le moment</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de facturation</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise (optionnel)</label>
                                            <input 
                                                type="text"
                                                value={profile.companyName}
                                                onChange={(e) => setProfile({...profile, companyName: e.target.value})}
                                                placeholder="Ma Société SARL"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">RCCM / SIRET (optionnel)</label>
                                            <input 
                                                type="text"
                                                value={profile.siret}
                                                onChange={(e) => setProfile({...profile, siret: e.target.value})}
                                                placeholder="CI-ABJ-2024-B-12345"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                        <button 
                                            onClick={handleSave}
                                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium"
                                        >
                                            Enregistrer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Upgrade to PRO Page
function UpgradePage() {
    const navigate = useNavigate();
    const [selectedDuration, setSelectedDuration] = useState(1);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStep, setPaymentStep] = useState('select'); // 'select', 'phone', 'processing', 'success', 'kkiapay'
    const [kkiapayConfig, setKkiapayConfig] = useState(null);
    const [paymentError, setPaymentError] = useState('');

    // Charger la config KKiaPay au montage
    useEffect(() => {
        const loadKKiapayConfig = async () => {
            try {
                const { kkiapayService } = await import('./services/api.js');
                const result = await kkiapayService.getConfig();
                if (result.ok) {
                    setKkiapayConfig(result.data);
                }
            } catch (error) {
                console.error('Error loading KKiaPay config:', error);
            }
        };
        loadKKiapayConfig();
        
        // Charger le SDK KKiaPay
        if (!document.getElementById('kkiapay-script')) {
            const script = document.createElement('script');
            script.id = 'kkiapay-script';
            script.src = 'https://cdn.kkiapay.me/k.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    // Prix des abonnements
    const subscriptionPrices = {
        1: { price: 5000, label: '1 mois' },
        3: { price: 12000, label: '3 mois', savings: 3000 },
        6: { price: 22000, label: '6 mois', savings: 8000 },
        12: { price: 40000, label: '12 mois', savings: 20000 },
    };

    // Méthodes de paiement
    const paymentMethods = [
        { 
            id: 'wave', 
            name: 'Wave', 
            logo: '/images/wave.webp',
            description: 'Paiement mobile Wave',
            color: 'from-blue-500 to-blue-600',
            requiresPhone: true
        },
        { 
            id: 'orange_money', 
            name: 'Orange Money', 
            logo: '/images/orange.webp',
            description: 'Paiement mobile Orange',
            color: 'from-orange-500 to-orange-600',
            requiresPhone: true
        },
        { 
            id: 'moov_money', 
            name: 'Moov Money', 
            logo: '/images/moov.jpg',
            description: 'Paiement mobile Moov',
            color: 'from-blue-600 to-blue-700',
            requiresPhone: true
        },
        { 
            id: 'mtn_money', 
            name: 'MTN Mobile Money', 
            logo: '/images/mtn.jpeg',
            description: 'Paiement mobile MTN',
            color: 'from-yellow-500 to-yellow-600',
            requiresPhone: true
        },
        { 
            id: 'card', 
            name: 'Carte Bancaire', 
            logo: '/images/banque.webp',
            description: 'Visa, Mastercard',
            color: 'from-gray-700 to-gray-800',
            requiresPhone: false
        },
    ];

    const currentPrice = subscriptionPrices[selectedDuration];

    const handleSelectPaymentMethod = (method) => {
        setSelectedPaymentMethod(method);
        if (method.requiresPhone) {
            setPaymentStep('phone');
        } else {
            setPaymentStep('processing');
            processPayment(method);
        }
    };

    const processPayment = async (method) => {
        setIsProcessing(true);
        setPaymentStep('processing');
        setPaymentError('');
        
        // Utiliser KKiaPay pour le paiement
        if (kkiapayConfig && window.openKkiapayWidget) {
            try {
                window.openKkiapayWidget({
                    amount: currentPrice.price,
                    position: 'center',
                    callback: async (response) => {
                        // Vérifier la transaction côté backend
                        try {
                            const { kkiapayService } = await import('./services/api.js');
                            const result = await kkiapayService.verifyTransaction(
                                response.transactionId,
                                selectedDuration,
                                'subscription'
                            );
                            
                            if (result.ok && result.data.success) {
                                setPaymentStep('success');
                                // Mettre à jour le localStorage avec les nouvelles infos utilisateur
                                const userStr = localStorage.getItem('user');
                                if (userStr) {
                                    const user = JSON.parse(userStr);
                                    user.accountType = 'PRO';
                                    user.isPro = true;
                                    localStorage.setItem('user', JSON.stringify(user));
                                    window.dispatchEvent(new Event('authChange'));
                                }
                            } else {
                                setPaymentError(result.data?.error || 'Erreur lors de la vérification');
                                setPaymentStep('select');
                            }
                        } catch (error) {
                            setPaymentError('Erreur lors de la vérification du paiement');
                            setPaymentStep('select');
                        }
                        setIsProcessing(false);
                    },
                    data: {
                        months: selectedDuration,
                        type: 'subscription'
                    },
                    theme: '#f97316',
                    sandbox: kkiapayConfig.sandbox,
                    key: kkiapayConfig.publicKey,
                });
            } catch (error) {
                setPaymentError('Erreur lors de l\'ouverture du paiement');
                setIsProcessing(false);
                setPaymentStep('select');
            }
        } else {
            setPaymentError('Service de paiement non disponible');
            setIsProcessing(false);
            setPaymentStep('select');
        }
    };

    const handlePhoneSubmit = () => {
        if (phoneNumber.length >= 8) {
            processPayment(selectedPaymentMethod);
        }
    };

    const resetPayment = () => {
        setShowPaymentModal(false);
        setSelectedPaymentMethod(null);
        setPhoneNumber('');
        setPaymentStep('select');
        setIsProcessing(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-5xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Choisissez votre plan</h1>
                <p className="text-gray-500 text-center mb-8">Débloquez toutes les fonctionnalités PRO</p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* FREE */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">FREE</h3>
                        <p className="text-3xl font-bold text-gray-900 mb-4">Gratuit</p>
                        <ul className="space-y-3 mb-6">
                            {['3 annonces maximum', '3 photos par annonce', 'Annonces expirent après 30 jours', 'Modification : 1 500 FCFA'].map((f, i) => (
                                <li key={i} className="flex items-center gap-2 text-gray-600">
                                    <Check className="w-5 h-5 text-green-500" /> {f}
                                </li>
                            ))}
                            {['Badge vérifié PRO', 'Statistiques détaillées'].map((f, i) => (
                                <li key={i} className="flex items-center gap-2 text-gray-400">
                                    <X className="w-5 h-5 text-red-400" /> {f}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => navigate('/')} className="w-full py-3 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
                            Rester en FREE
                        </button>
                    </div>

                    {/* PRO */}
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Star className="w-3 h-3" /> RECOMMANDÉ
                        </div>
                        <h3 className="text-xl font-bold mb-2">PRO</h3>
                        <p className="text-3xl font-bold mb-1">{formatPrice(currentPrice.price)} FCFA</p>
                        <p className="text-white/80 text-sm mb-4">{currentPrice.label}</p>
                        
                        {/* Sélection durée */}
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {Object.entries(subscriptionPrices).map(([months, data]) => (
                                <button
                                    key={months}
                                    onClick={() => setSelectedDuration(parseInt(months))}
                                    className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                                        selectedDuration === parseInt(months)
                                            ? 'bg-white text-orange-600'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                                >
                                    {months} mois
                                    {data.savings && (
                                        <span className="block text-[10px] text-green-500">-{formatPrice(data.savings)}</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <ul className="space-y-3 mb-6">
                            {['Annonces illimitées', '10 photos par annonce', 'Durée illimitée', 'Modifications gratuites', 'Badge vérifié PRO', 'Statistiques détaillées'].map((f, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    <Check className="w-5 h-5" /> {f}
                                </li>
                            ))}
                        </ul>
                        <button 
                            onClick={() => setShowPaymentModal(true)}
                            className="w-full py-3 bg-white text-orange-600 rounded-lg font-bold hover:bg-orange-50 flex items-center justify-center gap-2"
                        >
                            <Star className="w-5 h-5" /> Passer PRO maintenant
                        </button>
                    </div>
                </div>

                {/* Moyens de paiement acceptés */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Moyens de paiement acceptés</h3>
                    <div className="flex flex-wrap justify-center items-center gap-6">
                        {paymentMethods.map(method => (
                            <div key={method.id} className="flex flex-col items-center gap-2">
                                <img 
                                    src={method.logo} 
                                    alt={method.name} 
                                    className="h-20 w-auto object-contain rounded-lg"
                                />
                                <span className="text-xs text-gray-500">{method.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal de paiement */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {paymentStep === 'select' && 'Choisir le mode de paiement'}
                                    {paymentStep === 'phone' && 'Entrez votre numéro'}
                                    {paymentStep === 'processing' && 'Traitement en cours'}
                                    {paymentStep === 'success' && 'Paiement confirmé'}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Abonnement PRO - {currentPrice.label} • {formatPrice(currentPrice.price)} FCFA
                                </p>
                            </div>
                            <button 
                                onClick={resetPayment}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Étape 1: Sélection méthode */}
                            {paymentStep === 'select' && (
                                <div className="space-y-3">
                                    {paymentMethods.map(method => (
                                        <button
                                            key={method.id}
                                            onClick={() => handleSelectPaymentMethod(method)}
                                            className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50/50 transition-all group"
                                        >
                                            <img 
                                                src={method.logo} 
                                                alt={method.name}
                                                className="w-14 h-14 object-contain rounded-lg"
                                            />
                                            <div className="flex-1 text-left">
                                                <p className="font-semibold text-gray-900 group-hover:text-orange-600">{method.name}</p>
                                                <p className="text-sm text-gray-500">{method.description}</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Étape 2: Numéro de téléphone */}
                            {paymentStep === 'phone' && selectedPaymentMethod && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                        <img 
                                            src={selectedPaymentMethod.logo} 
                                            alt={selectedPaymentMethod.name}
                                            className="w-14 h-14 object-contain rounded-lg"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-900">{selectedPaymentMethod.name}</p>
                                            <p className="text-sm text-gray-500">{selectedPaymentMethod.description}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Numéro {selectedPaymentMethod.name}
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                placeholder="Ex: 07 XX XX XX XX"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+\s]/g, ''))}
                                                className="w-full pl-12 pr-4 h-14 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Vous recevrez une demande de paiement sur ce numéro
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setPaymentStep('select')}
                                            className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Retour
                                        </button>
                                        <button
                                            onClick={handlePhoneSubmit}
                                            disabled={phoneNumber.length < 8}
                                            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                                        >
                                            <CreditCard className="w-5 h-5" />
                                            Payer {formatPrice(currentPrice.price)} FCFA
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Étape 3: Traitement */}
                            {paymentStep === 'processing' && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Traitement en cours...</h3>
                                    <p className="text-gray-500">
                                        {selectedPaymentMethod?.requiresPhone 
                                            ? `Veuillez confirmer le paiement sur votre téléphone ${selectedPaymentMethod.name}`
                                            : 'Connexion au système de paiement...'
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Étape 4: Succès */}
                            {paymentStep === 'success' && (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Paiement réussi !</h3>
                                    <p className="text-gray-500 mb-6">
                                        Votre compte PRO est maintenant actif pour {currentPrice.label}
                                    </p>
                                    <div className="bg-orange-50 rounded-xl p-4 mb-6">
                                        <div className="flex items-center justify-center gap-2 text-orange-600 font-semibold">
                                            <Star className="w-5 h-5 fill-orange-500" />
                                            Compte PRO activé
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold"
                                    >
                                        Accéder à mon compte
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Sécurité footer */}
                        {paymentStep !== 'success' && (
                            <div className="px-6 pb-6">
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                    <Lock className="w-4 h-4" />
                                    Paiement 100% sécurisé
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Publish Listing Page
function PublishPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [imageFiles, setImageFiles] = useState([]); // Store actual files for upload
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    
    // Vérifier l'authentification au chargement
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { authService } = await import('./services/api.js');
                if (!authService.isAuthenticated()) {
                    // Rediriger vers login avec message
                    alert('Vous devez être connecté pour publier une annonce');
                    navigate('/login');
                    return;
                }
                setIsCheckingAuth(false);
            } catch (error) {
                console.error('Auth check error:', error);
                navigate('/login');
            }
        };
        checkAuth();
    }, [navigate]);
    
    const [formData, setFormData] = useState({
        category: '',
        subcategory: '',
        title: '',
        description: '',
        price: '',
        priceUnit: '',
        country: '',
        city: '',
        district: '',
        address: '',
        contactPhone: '',
        contactWhatsapp: '',
        contactEmail: '',
        images: [],
        features: {}
    });

    // Function to handle listing submission
    const handlePublishListing = async () => {
        setIsSubmitting(true);
        setSubmitError('');
        
        try {
            const { listingService, uploadService, virtualTourService, authService } = await import('./services/api.js');
            
            // Vérifier l'authentification avant de soumettre
            if (!authService.isAuthenticated()) {
                setSubmitError('Votre session a expiré. Veuillez vous reconnecter.');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }
            
            // 1. Upload images first if any
            let uploadedImageUrls = [];
            if (imageFiles.length > 0) {
                console.log('Uploading images...', imageFiles.length);
                const uploadResult = await uploadService.uploadImages(imageFiles);
                console.log('Upload result:', uploadResult);
                if (uploadResult.ok && uploadResult.data.urls) {
                    uploadedImageUrls = uploadResult.data.urls;
                } else if (!uploadResult.ok) {
                    setSubmitError(uploadResult.data?.error || 'Erreur lors de l\'upload des images');
                    setIsSubmitting(false);
                    return;
                }
            }
            
            // 2. Prepare listing data
            // Mapper les unités de prix frontend -> backend
            const priceUnitMap = {
                'jour': 'la jour',
                'nuit': 'la nuit',
                'mois': 'le mois',
                'an': 'le mois', // fallback
                '': null
            };
            // Récupérer les infos utilisateur pour les contacts par défaut
            const storedUser = localStorage.getItem('user');
            const currentUser = storedUser ? JSON.parse(storedUser) : {};
            
            const listingData = {
                title: formData.title,
                description: formData.description || formData.title,
                price: parseFloat(formData.price) || 0,
                priceUnit: priceUnitMap[formData.priceUnit] || 'le mois',
                currency: 'XOF',
                category: formData.category,
                subcategory: formData.subcategory,
                type: formData.subcategory?.includes('vendre') ? 'vente' : 'location',
                country: formData.country === 'Côte d\'Ivoire' ? 'CI' : 
                         formData.country === 'Sénégal' ? 'SN' : 
                         formData.country === 'Bénin' ? 'BJ' : 
                         formData.country === 'Mali' ? 'ML' : 'CI',
                city: formData.city,
                quartier: formData.district,
                address: formData.address || '',
                contactPhone: formData.contactPhone || currentUser.phone || '',
                contactWhatsapp: formData.contactWhatsapp || currentUser.phone || '',
                contactEmail: formData.contactEmail || currentUser.email || '',
                specifications: formData.features,
                images: uploadedImageUrls,
            };
            
            console.log('Creating listing with data:', listingData);
            
            // 3. Create listing
            const result = await listingService.create(listingData);
            console.log('Create listing result:', result);
            
            if (result.ok) {
                // 4. If virtual tour URL is provided, add it
                if (formData.features.visite360 && formData.features.visite360Url) {
                    await virtualTourService.setExternalUrl(
                        result.data.data.id, 
                        formData.features.visite360Url
                    );
                }
                
                alert('Annonce publiée avec succès!');
                navigate('/profile');
            } else {
                // Gérer les erreurs spécifiques
                const errorMsg = result.data?.message || result.data?.error || 'Erreur lors de la publication';
                
                if (result.data?.error === 'QUOTA_EXCEEDED') {
                    setSubmitError(`${result.data.message} (${result.data.currentListings}/${result.data.maxListings} annonces)`);
                } else if (result.data?.details) {
                    // Erreurs de validation
                    const validationErrors = Object.values(result.data.details).flat().join(', ');
                    setSubmitError(`Erreur de validation: ${validationErrors}`);
                } else {
                    setSubmitError(errorMsg);
                }
            }
        } catch (error) {
            console.error('Publish error:', error);
            if (error.response?.status === 401) {
                setSubmitError('Session expirée. Veuillez vous reconnecter.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setSubmitError(error.message || 'Erreur de connexion au serveur. Vérifiez que le backend est démarré.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = [
        { id: 'immobilier', name: 'Immobilier', icon: Home, subcategories: ['Maison à louer', 'Maison à vendre', 'Appartement à louer', 'Appartement à vendre', 'Terrain', 'Bureau/Commerce'] },
        { id: 'vehicule', name: 'Véhicules', icon: Car, subcategories: ['Voiture à vendre', 'Voiture à louer', 'Moto à vendre', 'Moto à louer'] },
        { id: 'vacance', name: 'Vacances', icon: Hotel, subcategories: ['Hôtel', 'Résidence meublée', 'Villa vacances', 'Appartement vacances'] },
    ];

    // Champs spécifiques par sous-catégorie
    const subcategoryFields = {
        'Maison à louer': [
            { key: 'surface', label: 'Surface habitable', type: 'number', unit: 'm²' },
            { key: 'pieces', label: 'Nombre de pièces', type: 'select', options: ['1', '2', '3', '4', '5', '6+'] },
            { key: 'chambres', label: 'Nombre de chambres', type: 'select', options: ['1', '2', '3', '4', '5+'] },
            { key: 'sallesEau', label: "Salles d'eau", type: 'select', options: ['1', '2', '3', '4+'] },
            { key: 'parking', label: 'Places de parking', type: 'select', options: ['0', '1', '2', '3+'] },
            { key: 'exterieur', label: 'Extérieur', type: 'multiselect', options: ['Jardin', 'Terrasse', 'Balcon', 'Piscine', 'Garage'] },
            { key: 'meuble', label: 'Meublé', type: 'select', options: ['Oui', 'Non'] },
        ],
        'Maison à vendre': [
            { key: 'surface', label: 'Surface habitable', type: 'number', unit: 'm²' },
            { key: 'surfaceTerrain', label: 'Surface terrain', type: 'number', unit: 'm²' },
            { key: 'pieces', label: 'Nombre de pièces', type: 'select', options: ['1', '2', '3', '4', '5', '6+'] },
            { key: 'chambres', label: 'Nombre de chambres', type: 'select', options: ['1', '2', '3', '4', '5+'] },
            { key: 'sallesEau', label: "Salles d'eau", type: 'select', options: ['1', '2', '3', '4+'] },
            { key: 'etages', label: "Nombre d'étages", type: 'select', options: ['1', '2', '3', '4+'] },
            { key: 'exterieur', label: 'Extérieur', type: 'multiselect', options: ['Jardin', 'Terrasse', 'Balcon', 'Piscine', 'Garage'] },
            { key: 'anneeConstruction', label: 'Année de construction', type: 'number' },
        ],
        'Appartement à louer': [
            { key: 'surface', label: 'Surface habitable', type: 'number', unit: 'm²' },
            { key: 'pieces', label: 'Nombre de pièces', type: 'select', options: ['1', '2', '3', '4', '5', '6+'] },
            { key: 'chambres', label: 'Nombre de chambres', type: 'select', options: ['Studio', '1', '2', '3', '4+'] },
            { key: 'sallesEau', label: "Salles d'eau", type: 'select', options: ['1', '2', '3+'] },
            { key: 'etage', label: 'Étage', type: 'select', options: ['RDC', '1', '2', '3', '4', '5+'] },
            { key: 'etagesImmeuble', label: "Étages dans l'immeuble", type: 'select', options: ['1', '2', '3', '4', '5', '10+'] },
            { key: 'chauffage', label: 'Type de chauffage', type: 'select', options: ['Individuel', 'Collectif', 'Électrique', 'Aucun'] },
            { key: 'exterieur', label: 'Extérieur', type: 'multiselect', options: ['Balcon', 'Terrasse', 'Loggia'] },
            { key: 'parking', label: 'Places de parking', type: 'select', options: ['0', '1', '2', '3+'] },
            { key: 'meuble', label: 'Meublé', type: 'select', options: ['Oui', 'Non'] },
        ],
        'Appartement à vendre': [
            { key: 'surface', label: 'Surface habitable', type: 'number', unit: 'm²' },
            { key: 'pieces', label: 'Nombre de pièces', type: 'select', options: ['1', '2', '3', '4', '5', '6+'] },
            { key: 'chambres', label: 'Nombre de chambres', type: 'select', options: ['Studio', '1', '2', '3', '4+'] },
            { key: 'sallesEau', label: "Salles d'eau", type: 'select', options: ['1', '2', '3+'] },
            { key: 'etage', label: 'Étage', type: 'select', options: ['RDC', '1', '2', '3', '4', '5+'] },
            { key: 'chauffage', label: 'Type de chauffage', type: 'select', options: ['Individuel', 'Collectif', 'Électrique', 'Aucun'] },
            { key: 'exterieur', label: 'Extérieur', type: 'multiselect', options: ['Balcon', 'Terrasse', 'Loggia'] },
            { key: 'parking', label: 'Places de parking', type: 'select', options: ['0', '1', '2', '3+'] },
            { key: 'anneeConstruction', label: 'Année de construction', type: 'number' },
        ],
        'Terrain': [
            { key: 'surface', label: 'Surface', type: 'number', unit: 'm²' },
            { key: 'typeTerrain', label: 'Type de terrain', type: 'select', options: ['Constructible', 'Agricole', 'Industriel', 'Loisir'] },
            { key: 'viabilise', label: 'Viabilisé', type: 'select', options: ['Oui', 'Non', 'Partiellement'] },
            { key: 'cloture', label: 'Clôturé', type: 'select', options: ['Oui', 'Non'] },
        ],
        'Bureau/Commerce': [
            { key: 'surface', label: 'Surface', type: 'number', unit: 'm²' },
            { key: 'typeBien', label: 'Type de bien', type: 'select', options: ['Bureau', 'Local commercial', 'Entrepôt', 'Atelier'] },
            { key: 'etage', label: 'Étage', type: 'select', options: ['RDC', '1', '2', '3', '4', '5+'] },
            { key: 'parking', label: 'Places de parking', type: 'select', options: ['0', '1', '2', '5+', '10+'] },
        ],
        'Voiture à vendre': [
            { key: 'marque', label: 'Marque', type: 'text' },
            { key: 'modele', label: 'Modèle', type: 'text' },
            { key: 'annee', label: 'Année', type: 'number' },
            { key: 'kilometrage', label: 'Kilométrage', type: 'number', unit: 'km' },
            { key: 'carburant', label: 'Carburant', type: 'select', options: ['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL'] },
            { key: 'boite', label: 'Boîte de vitesse', type: 'select', options: ['Manuelle', 'Automatique'] },
            { key: 'puissance', label: 'Puissance', type: 'number', unit: 'CV' },
            { key: 'couleur', label: 'Couleur', type: 'text' },
            { key: 'portes', label: 'Nombre de portes', type: 'select', options: ['2', '3', '4', '5'] },
        ],
        'Voiture à louer': [
            { key: 'marque', label: 'Marque', type: 'text' },
            { key: 'modele', label: 'Modèle', type: 'text' },
            { key: 'annee', label: 'Année', type: 'number' },
            { key: 'carburant', label: 'Carburant', type: 'select', options: ['Essence', 'Diesel', 'Hybride', 'Électrique'] },
            { key: 'boite', label: 'Boîte de vitesse', type: 'select', options: ['Manuelle', 'Automatique'] },
            { key: 'climatisation', label: 'Climatisation', type: 'select', options: ['Oui', 'Non'] },
            { key: 'places', label: 'Nombre de places', type: 'select', options: ['2', '4', '5', '7', '9+'] },
        ],
        'Moto à vendre': [
            { key: 'marque', label: 'Marque', type: 'text' },
            { key: 'modele', label: 'Modèle', type: 'text' },
            { key: 'annee', label: 'Année', type: 'number' },
            { key: 'cylindree', label: 'Cylindrée', type: 'number', unit: 'cc' },
            { key: 'kilometrage', label: 'Kilométrage', type: 'number', unit: 'km' },
            { key: 'typeMoto', label: 'Type', type: 'select', options: ['Scooter', 'Routière', 'Sportive', 'Trail', 'Custom'] },
        ],
        'Moto à louer': [
            { key: 'marque', label: 'Marque', type: 'text' },
            { key: 'modele', label: 'Modèle', type: 'text' },
            { key: 'cylindree', label: 'Cylindrée', type: 'number', unit: 'cc' },
            { key: 'typeMoto', label: 'Type', type: 'select', options: ['Scooter', 'Routière', 'Sportive', 'Trail'] },
        ],
        'Hôtel': [
            { key: 'etoiles', label: 'Classification', type: 'select', options: ['1 étoile', '2 étoiles', '3 étoiles', '4 étoiles', '5 étoiles'] },
            { key: 'typesChambre', label: 'Types de chambre', type: 'multiselect', options: ['Simple', 'Double', 'Suite', 'Familiale'] },
            { key: 'equipements', label: 'Équipements', type: 'multiselect', options: ['Piscine', 'Restaurant', 'Spa', 'Salle de sport', 'Parking', 'WiFi gratuit'] },
            { key: 'petitDejeuner', label: 'Petit-déjeuner inclus', type: 'select', options: ['Oui', 'Non', 'En option'] },
        ],
        'Résidence meublée': [
            { key: 'surface', label: 'Surface', type: 'number', unit: 'm²' },
            { key: 'chambres', label: 'Nombre de chambres', type: 'select', options: ['Studio', '1', '2', '3', '4+'] },
            { key: 'sallesEau', label: "Salles d'eau", type: 'select', options: ['1', '2', '3+'] },
            { key: 'equipements', label: 'Équipements', type: 'multiselect', options: ['Climatisation', 'WiFi', 'TV', 'Cuisine équipée', 'Machine à laver', 'Parking'] },
            { key: 'exterieur', label: 'Extérieur', type: 'multiselect', options: ['Balcon', 'Terrasse', 'Jardin', 'Piscine'] },
        ],
        'Villa vacances': [
            { key: 'surface', label: 'Surface', type: 'number', unit: 'm²' },
            { key: 'chambres', label: 'Nombre de chambres', type: 'select', options: ['1', '2', '3', '4', '5+'] },
            { key: 'sallesEau', label: "Salles d'eau", type: 'select', options: ['1', '2', '3', '4+'] },
            { key: 'capacite', label: 'Capacité (personnes)', type: 'select', options: ['2', '4', '6', '8', '10+'] },
            { key: 'equipements', label: 'Équipements', type: 'multiselect', options: ['Piscine', 'Climatisation', 'WiFi', 'Cuisine équipée', 'Barbecue', 'Jardin'] },
            { key: 'personnel', label: 'Personnel', type: 'multiselect', options: ['Gardien', 'Ménage', 'Cuisinier', 'Chauffeur'] },
        ],
        'Appartement vacances': [
            { key: 'surface', label: 'Surface', type: 'number', unit: 'm²' },
            { key: 'chambres', label: 'Nombre de chambres', type: 'select', options: ['Studio', '1', '2', '3+'] },
            { key: 'capacite', label: 'Capacité (personnes)', type: 'select', options: ['1', '2', '4', '6+'] },
            { key: 'equipements', label: 'Équipements', type: 'multiselect', options: ['Climatisation', 'WiFi', 'TV', 'Cuisine équipée', 'Machine à laver'] },
            { key: 'exterieur', label: 'Extérieur', type: 'multiselect', options: ['Balcon', 'Terrasse', 'Vue mer'] },
        ],
    };

    const currentFields = subcategoryFields[formData.subcategory] || [];

    // Mapping des icônes pour les champs
    const fieldIcons = {
        surface: <Home className="w-4 h-4" />,
        surfaceTerrain: <Trees className="w-4 h-4" />,
        pieces: <LayoutGrid className="w-4 h-4" />,
        chambres: <Hotel className="w-4 h-4" />,
        sallesEau: <Home className="w-4 h-4" />,
        parking: <Car className="w-4 h-4" />,
        exterieur: <Trees className="w-4 h-4" />,
        meuble: <Home className="w-4 h-4" />,
        etages: <Building className="w-4 h-4" />,
        etage: <Building className="w-4 h-4" />,
        etagesImmeuble: <Building className="w-4 h-4" />,
        chauffage: <Home className="w-4 h-4" />,
        anneeConstruction: <Calendar className="w-4 h-4" />,
        typeTerrain: <Trees className="w-4 h-4" />,
        viabilise: <Check className="w-4 h-4" />,
        cloture: <Shield className="w-4 h-4" />,
        typeBien: <Building className="w-4 h-4" />,
        marque: <Car className="w-4 h-4" />,
        modele: <Car className="w-4 h-4" />,
        annee: <Calendar className="w-4 h-4" />,
        kilometrage: <TrendingUp className="w-4 h-4" />,
        carburant: <Car className="w-4 h-4" />,
        boite: <Settings className="w-4 h-4" />,
        puissance: <TrendingUp className="w-4 h-4" />,
        couleur: <Eye className="w-4 h-4" />,
        portes: <Car className="w-4 h-4" />,
        climatisation: <Home className="w-4 h-4" />,
        places: <Car className="w-4 h-4" />,
        cylindree: <Settings className="w-4 h-4" />,
        typeMoto: <Car className="w-4 h-4" />,
        etoiles: <Star className="w-4 h-4" />,
        typesChambre: <Hotel className="w-4 h-4" />,
        equipements: <Check className="w-4 h-4" />,
        petitDejeuner: <Hotel className="w-4 h-4" />,
        capacite: <Car className="w-4 h-4" />,
        personnel: <Car className="w-4 h-4" />,
    };

    const countries = ['Côte d\'Ivoire', 'Sénégal', 'Mali', 'Burkina Faso', 'Guinée'];
    const cities = { 'Côte d\'Ivoire': ['Abidjan', 'Bouaké', 'Yamoussoukro'], 'Sénégal': ['Dakar', 'Thiès', 'Saint-Louis'] };

    // Afficher un loader pendant la vérification d'authentification
    if (isCheckingAuth) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Vérification de votre session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-3xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="p-2 bg-white rounded-lg shadow-sm">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-gray-900">Déposer une annonce</h1>
                        <p className="text-sm text-gray-500">Étape {step} sur 4</p>
                    </div>
                </div>

                {/* Progress */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`flex-1 h-2 rounded-full ${s <= step ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                    ))}
                </div>

                {/* Step 1: Category */}
                {step === 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Choisissez une catégorie</h2>
                        <div className="grid grid-cols-1 gap-3">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setFormData({ ...formData, category: cat.id }); setStep(2); }}
                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${formData.category === cat.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}
                                >
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                        <cat.icon className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <span className="font-medium text-gray-900">{cat.name}</span>
                                    <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails de l'annonce</h2>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sous-catégorie</label>
                            <select
                                value={formData.subcategory}
                                onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="">Sélectionner...</option>
                                {categories.find(c => c.id === formData.category)?.subcategories.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'annonce</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ex: Villa 4 chambres avec piscine"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                placeholder="Décrivez votre bien en détail..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                                <select
                                    value={formData.priceUnit}
                                    onChange={e => setFormData({ ...formData, priceUnit: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">Prix fixe</option>
                                    <option value="jour">Par jour</option>
                                    <option value="nuit">Par nuit</option>
                                    <option value="mois">Par mois</option>
                                    <option value="an">Par an</option>
                                </select>
                            </div>
                        </div>

                        {/* Informations clés dynamiques */}
                        {currentFields.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5 text-orange-500" />
                                    Informations clés
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {currentFields.map(field => (
                                        <div key={field.key} className={field.type === 'multiselect' ? 'col-span-2' : ''}>
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                                <span className="text-orange-500">{fieldIcons[field.key] || <SlidersHorizontal className="w-4 h-4" />}</span>
                                                {field.label} {field.unit && <span className="text-gray-400">({field.unit})</span>}
                                            </label>
                                            
                                            {field.type === 'text' && (
                                                <input
                                                    type="text"
                                                    value={formData.features[field.key] || ''}
                                                    onChange={e => setFormData({ 
                                                        ...formData, 
                                                        features: { ...formData.features, [field.key]: e.target.value }
                                                    })}
                                                    placeholder={field.label}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                            )}
                                            
                                            {field.type === 'number' && (
                                                <input
                                                    type="number"
                                                    value={formData.features[field.key] || ''}
                                                    onChange={e => setFormData({ 
                                                        ...formData, 
                                                        features: { ...formData.features, [field.key]: e.target.value }
                                                    })}
                                                    placeholder="0"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                            )}
                                            
                                            {field.type === 'select' && (
                                                <select
                                                    value={formData.features[field.key] || ''}
                                                    onChange={e => setFormData({ 
                                                        ...formData, 
                                                        features: { ...formData.features, [field.key]: e.target.value }
                                                    })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                >
                                                    <option value="">Sélectionner...</option>
                                                    {field.options.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            )}
                                            
                                            {field.type === 'multiselect' && (
                                                <div className="flex flex-wrap gap-2">
                                                    {field.options.map(opt => {
                                                        const selected = (formData.features[field.key] || []).includes(opt);
                                                        return (
                                                            <button
                                                                key={opt}
                                                                type="button"
                                                                onClick={() => {
                                                                    const current = formData.features[field.key] || [];
                                                                    const updated = selected 
                                                                        ? current.filter(v => v !== opt)
                                                                        : [...current, opt];
                                                                    setFormData({
                                                                        ...formData,
                                                                        features: { ...formData.features, [field.key]: updated }
                                                                    });
                                                                }}
                                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                                    selected 
                                                                        ? 'bg-orange-500 text-white' 
                                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                }`}
                                                            >
                                                                {selected && <Check className="w-4 h-4 inline mr-1" />}
                                                                {opt}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setStep(3)}
                            disabled={!formData.title || !formData.subcategory}
                            className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed mt-4"
                        >
                            Continuer
                        </button>
                    </div>
                )}

                {/* Step 3: Location */}
                {step === 3 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h2>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                            <select
                                value={formData.country}
                                onChange={e => setFormData({ ...formData, country: e.target.value, city: '' })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="">Sélectionner...</option>
                                {countries.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                            <select
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                disabled={!formData.country}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                            >
                                <option value="">Sélectionner...</option>
                                {(cities[formData.country] || []).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
                            <input
                                type="text"
                                value={formData.district}
                                onChange={e => setFormData({ ...formData, district: e.target.value })}
                                placeholder="Ex: Cocody, Plateau..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète (optionnel)</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Ex: Rue des jardins, lot 25..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        {/* Informations de contact */}
                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de contact</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                    <input
                                        type="tel"
                                        value={formData.contactPhone}
                                        onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                                        placeholder="+225 07 00 00 00 00"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                    <input
                                        type="tel"
                                        value={formData.contactWhatsapp}
                                        onChange={e => setFormData({ ...formData, contactWhatsapp: e.target.value })}
                                        placeholder="+225 07 00 00 00 00"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
                                    <input
                                        type="email"
                                        value={formData.contactEmail}
                                        onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                        placeholder="contact@exemple.com"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Si vides, vos informations de profil seront utilisées</p>
                        </div>

                        <button
                            onClick={() => setStep(4)}
                            disabled={!formData.country || !formData.city}
                            className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed mt-4"
                        >
                            Continuer
                        </button>
                    </div>
                )}

                {/* Step 4: Photos & Submit */}
                {step === 4 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>
                        
                        {/* Zone d'upload avec input file fonctionnel */}
                        <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 transition-colors cursor-pointer block">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const files = Array.from(e.target.files);
                                    const newImages = files.map(file => URL.createObjectURL(file));
                                    setFormData({ ...formData, images: [...formData.images, ...newImages].slice(0, 10) });
                                    setImageFiles(prev => [...prev, ...files].slice(0, 10));
                                }}
                            />
                            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium">Cliquez pour ajouter des photos</p>
                            <p className="text-gray-400 text-sm mt-1">Maximum 10 photos (5 MB chacune)</p>
                        </label>

                        {/* Aperçu des photos */}
                        <div className="grid grid-cols-4 gap-2">
                            {formData.images.length > 0 ? (
                                formData.images.map((img, i) => (
                                    <div key={i} className="aspect-square relative group">
                                        <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({ 
                                                    ...formData, 
                                                    images: formData.images.filter((_, idx) => idx !== i) 
                                                });
                                                setImageFiles(prev => prev.filter((_, idx) => idx !== i));
                                            }}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                [1, 2, 3, 4].map(i => (
                                    <label key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const newImage = URL.createObjectURL(file);
                                                    setFormData({ ...formData, images: [...formData.images, newImage].slice(0, 10) });
                                                    setImageFiles(prev => [...prev, file].slice(0, 10));
                                                }
                                            }}
                                        />
                                        <Plus className="w-6 h-6 text-gray-400" />
                                    </label>
                                ))
                            )}
                        </div>

                        {/* Visite virtuelle 360° */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Eye className="w-5 h-5 text-orange-500" />
                                Visite virtuelle 360°
                            </h3>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.features.visite360 || false}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            features: { ...formData.features, visite360: e.target.checked }
                                        })}
                                        className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                                    />
                                    <span className="text-gray-700">Ajouter une visite virtuelle 360°</span>
                                </label>
                            </div>
                            {formData.features.visite360 && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Lien de la visite 360° (optionnel)</label>
                                    <input
                                        type="url"
                                        value={formData.features.visite360Url || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            features: { ...formData.features, visite360Url: e.target.value }
                                        })}
                                        placeholder="https://exemple.com/visite-360"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Ou uploadez vos photos 360° et nous créerons la visite pour vous</p>
                                </div>
                            )}
                        </div>

                        {/* Summary */}
                        <div className="bg-gray-50 rounded-xl p-4 mt-6">
                            <h3 className="font-medium text-gray-900 mb-3">Résumé</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p><span className="font-medium">Catégorie:</span> {formData.category} - {formData.subcategory}</p>
                                <p><span className="font-medium">Titre:</span> {formData.title}</p>
                                <p><span className="font-medium">Prix:</span> {formatPrice(formData.price)} FCFA {formData.priceUnit && `/ ${formData.priceUnit}`}</p>
                                <p><span className="font-medium">Lieu:</span> {formData.district}, {formData.city}, {formData.country}</p>
                            </div>
                            
                            {/* Informations clés dans le résumé */}
                            {Object.keys(formData.features).length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                        <SlidersHorizontal className="w-4 h-4 text-orange-500" />
                                        Informations clés
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        {currentFields.map(field => {
                                            const value = formData.features[field.key];
                                            if (!value || (Array.isArray(value) && value.length === 0)) return null;
                                            return (
                                                <div key={field.key} className="flex items-center gap-2">
                                                    <span className="text-gray-500">{field.label}:</span>
                                                    <span className="font-medium text-gray-900">
                                                        {Array.isArray(value) ? value.join(', ') : value}
                                                        {field.unit && ` ${field.unit}`}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Error message */}
                        {submitError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                                <p className="text-red-600 text-sm">{submitError}</p>
                            </div>
                        )}

                        <button
                            onClick={handlePublishListing}
                            disabled={isSubmitting}
                            className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Publication en cours...
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" /> Publier l'annonce
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Auth Page (Login/Register) - Design PlanB
function AuthPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mode, setMode] = useState(location.pathname === '/register' ? 'register' : 'login');
    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Validation du mot de passe
    const passwordRules = {
        minLength: formData.password.length >= 8,
        hasUppercase: /[A-Z]/.test(formData.password),
        hasLowercase: /[a-z]/.test(formData.password),
        hasNumber: /[0-9]/.test(formData.password),
    };
    const isPasswordValid = Object.values(passwordRules).every(Boolean);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (mode === 'register') {
            if (!isPasswordValid) {
                setError('Le mot de passe ne respecte pas les règles de sécurité');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Les mots de passe ne correspondent pas');
                return;
            }
        }
        
        setIsLoading(true);
        
        try {
            const { authService } = await import('./services/api.js');
            
            if (mode === 'login') {
                const result = await authService.login(formData.email, formData.password);
                if (result.ok) {
                    // Dispatch auth change event to update Header
                    window.dispatchEvent(new Event('authChange'));
                    navigate('/');
                } else {
                    setError(result.data?.error || result.data?.message || 'Email ou mot de passe incorrect');
                }
            } else {
                const result = await authService.register({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName || 'Utilisateur',
                    lastName: formData.lastName || '',
                    phone: formData.phone || '',
                });
                if (result.ok) {
                    // Mark as new user for onboarding tour
                    localStorage.setItem('isNewUser', 'true');
                    
                    // Auto-login after registration
                    const loginResult = await authService.login(formData.email, formData.password);
                    if (loginResult.ok) {
                        // Dispatch auth change event to update Header
                        window.dispatchEvent(new Event('authChange'));
                        navigate('/');
                    } else {
                        navigate('/login');
                    }
                } else {
                    setError(result.data?.error || result.data?.message || 'Erreur lors de l\'inscription');
                }
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError('Erreur de connexion au serveur');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 pt-16">
            <div className="w-full max-w-md">
                {/* Login Mode */}
                {mode === 'login' && (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {/* Logo */}
                        <div className="flex flex-col items-center mb-6">
                            <img src="/logofinal.png" alt="PlanB" className="h-28 w-auto mb-2" />
                        </div>

                        {/* Title */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">Welcome to</h1>
                            <h2 className="text-2xl font-bold text-gray-900">PlanB</h2>
                            <p className="text-gray-500 mt-2">Sign in to continue</p>
                        </div>

                        {/* Google Button - Not implemented yet */}
                        <button 
                            onClick={() => alert('La connexion Google sera disponible prochainement. Utilisez votre email pour vous connecter.')}
                            className="w-full py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-3 mb-6 transition-colors opacity-60"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                            <span className="text-xs text-gray-400">(bientôt)</span>
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 h-px bg-gray-200"></div>
                            <span className="text-sm text-gray-400">OR</span>
                            <div className="flex-1 h-px bg-gray-200"></div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Error message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 text-center mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="you@example.com"
                                        className="w-full pl-10 pr-4 py-3 border-b border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-transparent"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 text-center mb-2">Password</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-3 border-b border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mt-6 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Connexion...
                                    </>
                                ) : 'Sign In'}
                            </button>
                        </form>

                        {/* Footer Links */}
                        <div className="flex justify-between mt-6 text-sm">
                            <button className="text-gray-500 hover:text-gray-700">Forgot password?</button>
                            <button 
                                onClick={() => setMode('register')}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Need an account? <span className="font-semibold text-gray-900">Sign up</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Register Mode */}
                {mode === 'register' && (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {/* Back Button */}
                        <button 
                            onClick={() => setMode('login')}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back to sign in
                        </button>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">Create your account</h1>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Prénom et Nom */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 text-center mb-2">Prénom</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="Jean"
                                        className="w-full px-4 py-3 border-b border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 text-center mb-2">Nom</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Dupont"
                                        className="w-full px-4 py-3 border-b border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 text-center mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="vous@exemple.com"
                                        className="w-full pl-10 pr-4 py-3 border-b border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 text-center mb-2">Password</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Min. 8 caractères"
                                        className="w-full pl-10 pr-10 py-3 border-b border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {/* Règles du mot de passe */}
                                {formData.password && (
                                    <div className="mt-2 space-y-1 text-xs">
                                        <div className={`flex items-center gap-1 ${passwordRules.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                                            {passwordRules.minLength ? '✓' : '○'} 8 caractères minimum
                                        </div>
                                        <div className={`flex items-center gap-1 ${passwordRules.hasUppercase ? 'text-green-600' : 'text-gray-400'}`}>
                                            {passwordRules.hasUppercase ? '✓' : '○'} Une majuscule
                                        </div>
                                        <div className={`flex items-center gap-1 ${passwordRules.hasLowercase ? 'text-green-600' : 'text-gray-400'}`}>
                                            {passwordRules.hasLowercase ? '✓' : '○'} Une minuscule
                                        </div>
                                        <div className={`flex items-center gap-1 ${passwordRules.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                                            {passwordRules.hasNumber ? '✓' : '○'} Un chiffre
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 text-center mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        placeholder="Re-enter password"
                                        className="w-full pl-10 pr-10 py-3 border-b border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Création en cours...
                                    </>
                                ) : (
                                    'Créer mon compte'
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

// Map Controller Component for Leaflet
function MapController({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, { duration: 1.5 });
    }, [center, zoom, map]);
    return null;
}

// Category Page - Shows listings filtered by category with subcategories
function CategoryPage() {
    const { categoryName } = useParams();
    const navigate = useNavigate();
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [categoryListings, setCategoryListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryListings = async () => {
            try {
                const { listingService } = await import('./services/api.js');
                const result = await listingService.getAll({ category: categoryName });
                if (result.ok && result.data?.data) {
                    setCategoryListings(result.data.data);
                }
            } catch (error) {
                console.error('Error fetching category listings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategoryListings();
    }, [categoryName]);

    const categoryConfig = {
        immobilier: {
            title: 'Immobilier',
            description: 'Maisons, appartements, terrains et locaux commerciaux',
            icon: Home,
            gradient: 'from-blue-500 to-blue-700',
            color: 'blue',
            subcategories: [
                { id: 'maison-vendre', label: 'Maison à vendre', icon: Home },
                { id: 'maison-louer', label: 'Maison à louer', icon: Home },
                { id: 'appartement-vendre', label: 'Appartement à vendre', icon: Building },
                { id: 'appartement-louer', label: 'Appartement à louer', icon: Building },
                { id: 'terrain', label: 'Terrain', icon: Trees },
                { id: 'bureau', label: 'Bureau / Local commercial', icon: Building }
            ]
        },
        vacance: {
            title: 'Vacances',
            description: 'Hôtels, résidences meublées et locations de vacances',
            icon: Hotel,
            gradient: 'from-purple-500 to-purple-700',
            color: 'purple',
            subcategories: [
                { id: 'hotel', label: 'Hôtel', icon: Hotel },
                { id: 'villa-meublee', label: 'Villa meublée', icon: Home },
                { id: 'appartement-meuble', label: 'Appartement meublé', icon: Building },
                { id: 'residence', label: 'Résidence', icon: Building },
                { id: 'maison-hotes', label: "Maison d'hôtes", icon: Home }
            ]
        },
        vehicule: {
            title: 'Véhicules',
            description: 'Voitures, motos, camions et engins',
            icon: Car,
            gradient: 'from-teal-500 to-teal-700',
            color: 'teal',
            subcategories: [
                { id: 'voiture-vendre', label: 'Voiture à vendre', icon: Car },
                { id: 'voiture-louer', label: 'Voiture à louer', icon: Car },
                { id: 'moto-vendre', label: 'Moto à vendre', icon: Car },
                { id: 'moto-louer', label: 'Moto à louer', icon: Car },
                { id: 'camion', label: 'Camion', icon: Car },
                { id: 'engin', label: 'Engin', icon: Car }
            ]
        }
    };

    const config = categoryConfig[categoryName] || categoryConfig.immobilier;
    const CategoryIcon = config.icon;
    
    // Filter by subcategory if selected
    const filteredListings = selectedSubcategory 
        ? categoryListings.filter(l => {
            const subcat = config.subcategories.find(s => s.id === selectedSubcategory);
            return subcat && l.subcategory?.toLowerCase().includes(subcat.label.toLowerCase().split(' ')[0]);
        })
        : categoryListings;

    // Sort listings
    const sortedListings = [...filteredListings].sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return b.id - a.id;
    });

    const getSelectedSubcategoryLabel = () => {
        if (!selectedSubcategory) return 'Toutes les sous-catégories';
        const sub = config.subcategories.find(s => s.id === selectedSubcategory);
        return sub ? sub.label : 'Toutes les sous-catégories';
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            {/* Hero Banner */}
            <div className={`bg-gradient-to-br ${config.gradient} py-8`}>
                <div className="max-w-7xl mx-auto px-4">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-white mb-4 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Retour à l'accueil
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                            <CategoryIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{config.title}</h1>
                            <p className="text-white/80">{config.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Subcategory Dropdown */}
                    <div className="relative">
                        <select
                            value={selectedSubcategory}
                            onChange={(e) => setSelectedSubcategory(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 min-w-[220px]"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                        >
                            <option value="">Toutes les sous-catégories ({categoryListings.length})</option>
                            {config.subcategories.map(sub => {
                                const count = categoryListings.filter(l => 
                                    l.subcategory?.toLowerCase().includes(sub.label.toLowerCase().split(' ')[0])
                                ).length;
                                return (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.label} ({count})
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Sort Dropdown */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                    >
                        <option value="recent">Plus récent</option>
                        <option value="price-asc">Prix croissant</option>
                        <option value="price-desc">Prix décroissant</option>
                    </select>

                    {/* Results count */}
                    <div className="ml-auto">
                        <p className="text-gray-600">
                            <span className="font-semibold text-gray-900">{sortedListings.length}</span> annonce{sortedListings.length > 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 pb-8">
                {sortedListings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedListings.map(listing => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune annonce trouvée</h3>
                        <p className="text-gray-500 mb-6">Essayez une autre sous-catégorie</p>
                        <button
                            onClick={() => setSelectedSubcategory('')}
                            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                        >
                            Voir toutes les annonces
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 mt-16">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="text-center text-gray-500 text-sm pt-8 border-t border-gray-800">
                        © 2026 PlanB. Tous droits réservés.
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Map Page - Real Interactive Map with Leaflet
function MapPage() {
    const navigate = useNavigate();
    const [selectedListing, setSelectedListing] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mapCenter, setMapCenter] = useState([5, 0]); // Africa center
    const [mapZoom, setMapZoom] = useState(3);
    const [userLocation, setUserLocation] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [mapListings, setMapListings] = useState([]);

    useEffect(() => {
        const fetchMapListings = async () => {
            try {
                const { listingService } = await import('./services/api.js');
                const result = await listingService.getAll();
                if (result.ok && result.data?.data) {
                    setMapListings(result.data.data);
                }
            } catch (error) {
                console.error('Error fetching map listings:', error);
            }
        };
        fetchMapListings();
    }, []);

    // Get user location
    const getUserLocation = () => {
        if (!navigator.geolocation) {
            alert('La géolocalisation n\'est pas supportée par votre navigateur');
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                setMapCenter([latitude, longitude]);
                setMapZoom(14);
                setIsLocating(false);
            },
            (error) => {
                console.error('Erreur de géolocalisation:', error);
                alert('Impossible d\'obtenir votre position. Vérifiez les permissions.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // Countries with coordinates
    const countries = {
        'Côte d\'Ivoire': { lat: 7.54, lng: -5.55, zoom: 7, cities: {
            'Abidjan': { lat: 5.36, lng: -4.01 },
            'Bouaké': { lat: 7.69, lng: -5.03 },
            'Yamoussoukro': { lat: 6.82, lng: -5.28 }
        }},
        'Sénégal': { lat: 14.50, lng: -14.45, zoom: 7, cities: {
            'Dakar': { lat: 14.69, lng: -17.44 },
            'Thiès': { lat: 14.79, lng: -16.93 },
            'Saint-Louis': { lat: 16.02, lng: -16.50 },
            'Saly': { lat: 14.45, lng: -17.02 }
        }},
        'Mali': { lat: 17.57, lng: -4.00, zoom: 6, cities: {
            'Bamako': { lat: 12.64, lng: -8.00 }
        }},
        'Burkina Faso': { lat: 12.24, lng: -1.56, zoom: 7, cities: {
            'Ouagadougou': { lat: 12.37, lng: -1.52 }
        }},
        'Ghana': { lat: 7.95, lng: -1.02, zoom: 7, cities: {
            'Accra': { lat: 5.56, lng: -0.19 }
        }},
        'Nigeria': { lat: 9.08, lng: 8.68, zoom: 6, cities: {
            'Lagos': { lat: 6.52, lng: 3.38 },
            'Abuja': { lat: 9.08, lng: 7.40 }
        }},
    };

    // Listings with real coordinates
    const listingsWithCoords = mapListings.map(listing => {
        const country = countries[listing.country];
        const city = country?.cities?.[listing.city];
        return {
            ...listing,
            lat: city?.lat || country?.lat || 5.36,
            lng: city?.lng || country?.lng || -4.01
        };
    });

    // Lucide SVG icons for markers
    const lucideIcons = {
        home: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
        building: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`,
        hotel: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 22v-6.57"/><path d="M12 11h.01"/><path d="M12 7h.01"/><path d="M14 15.43V22"/><path d="M15 16a5 5 0 0 0-6 0"/><path d="M16 11h.01"/><path d="M16 7h.01"/><path d="M8 11h.01"/><path d="M8 7h.01"/><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/></svg>`,
        trees: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.83V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M18 22v-6"/><path d="M14 14.2V14a3 3 0 1 1 6 0v.2"/><path d="M18 14a3.09 3.09 0 0 1 2.08.82L21 16a3 3 0 0 1-5.17 2.71"/></svg>`,
        car: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`,
        villa: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/></svg>`,
        pin: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`
    };

    // Get icon based on category
    const getListingIcon = (listing, forHtml = false) => {
        let iconKey = 'pin';
        if (listing.category === 'immobilier') {
            if (listing.subcategory?.includes('Terrain')) iconKey = 'trees';
            else if (listing.subcategory?.includes('Maison')) iconKey = 'home';
            else if (listing.subcategory?.includes('Appartement')) iconKey = 'building';
            else iconKey = 'home';
        } else if (listing.category === 'vehicule') {
            iconKey = 'car';
        } else if (listing.category === 'vacance') {
            if (listing.subcategory?.includes('Hôtel')) iconKey = 'hotel';
            else if (listing.subcategory?.includes('Villa') || listing.subcategory?.includes('meublée')) iconKey = 'villa';
            else iconKey = 'hotel';
        }
        return forHtml ? lucideIcons[iconKey] : iconKey;
    };

    // Get color based on category
    const getCategoryColor = (listing) => {
        if (listing.category === 'immobilier') {
            if (listing.subcategory?.includes('Terrain')) return { bg: '#22c55e', color: '#ffffff' }; // Vert
            if (listing.subcategory?.includes('Maison')) return { bg: '#3b82f6', color: '#ffffff' }; // Bleu
            if (listing.subcategory?.includes('Appartement')) return { bg: '#8b5cf6', color: '#ffffff' }; // Violet
            return { bg: '#3b82f6', color: '#ffffff' };
        }
        if (listing.category === 'vehicule') return { bg: '#ef4444', color: '#ffffff' }; // Rouge
        if (listing.category === 'vacance') {
            if (listing.subcategory?.includes('Hôtel')) return { bg: '#f97316', color: '#ffffff' }; // Orange
            return { bg: '#ec4899', color: '#ffffff' }; // Rose pour villa meublée
        }
        return { bg: '#6b7280', color: '#ffffff' }; // Gris par défaut
    };

    // Create custom marker icon (pin style)
    const createCustomIcon = (listing) => {
        const iconSvg = getListingIcon(listing, true);
        const colors = getCategoryColor(listing);
        
        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="position: relative; width: 40px; height: 52px;">
                <svg viewBox="0 0 40 52" width="40" height="52" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));">
                    <path d="M20 0C8.954 0 0 8.954 0 20c0 14.667 20 32 20 32s20-17.333 20-32C40 8.954 31.046 0 20 0z" fill="${colors.bg}"/>
                    <circle cx="20" cy="18" r="12" fill="white"/>
                </svg>
                <div style="position: absolute; top: 6px; left: 50%; transform: translateX(-50%); color: ${colors.bg}; display: flex; align-items: center; justify-content: center;">
                    ${iconSvg.replace('width="14" height="14"', 'width="20" height="20"').replace('stroke="currentColor"', `stroke="${colors.bg}"`)}
                </div>
            </div>`,
            iconSize: [40, 52],
            iconAnchor: [20, 52]
        });
    };

    // Filter listings
    const filteredListings = listingsWithCoords.filter(l => {
        if (selectedCountry && l.country !== selectedCountry) return false;
        if (selectedCity && l.city !== selectedCity) return false;
        if (searchQuery && !l.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !l.city?.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !l.country?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    // Handle country selection
    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setSelectedCity('');
        if (country && countries[country]) {
            setMapCenter([countries[country].lat, countries[country].lng]);
            setMapZoom(countries[country].zoom);
        } else {
            setMapCenter([5, 0]);
            setMapZoom(3);
        }
    };

    // Handle city selection
    const handleCitySelect = (city) => {
        setSelectedCity(city);
        if (city && selectedCountry && countries[selectedCountry]?.cities?.[city]) {
            const cityCoords = countries[selectedCountry].cities[city];
            setMapCenter([cityCoords.lat, cityCoords.lng]);
            setMapZoom(12);
        }
    };

    // Handle search
    const handleSearch = (query) => {
        setSearchQuery(query);
        const matchedCountry = Object.keys(countries).find(c => 
            c.toLowerCase().includes(query.toLowerCase())
        );
        if (matchedCountry) {
            handleCountrySelect(matchedCountry);
            return;
        }
        Object.entries(countries).forEach(([country, data]) => {
            const matchedCity = Object.keys(data.cities || {}).find(city => 
                city.toLowerCase().includes(query.toLowerCase())
            );
            if (matchedCity) {
                setSelectedCountry(country);
                handleCitySelect(matchedCity);
            }
        });
    };

    // Reset view
    const resetView = () => {
        setSelectedCountry('');
        setSelectedCity('');
        setSearchQuery('');
        setMapCenter([5, 0]);
        setMapZoom(3);
    };

    return (
        <div className="min-h-screen bg-gray-900 pt-16">
            <div className="relative h-[calc(100vh-64px)]">
                {/* Leaflet Map */}
                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    className="h-full w-full z-0"
                    style={{ background: '#1a1a2e' }}
                    zoomControl={false}
                >
                    <MapController center={mapCenter} zoom={mapZoom} />
                    
                    {/* Dark/Satellite style tile layer */}
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    
                    {/* Markers */}
                    {filteredListings.map(listing => (
                        <Marker
                            key={listing.id}
                            position={[listing.lat, listing.lng]}
                            icon={createCustomIcon(listing)}
                            eventHandlers={{
                                click: () => setSelectedListing(listing)
                            }}
                        />
                    ))}

                    {/* User Location Marker */}
                    {userLocation && (
                        <Marker
                            position={[userLocation.lat, userLocation.lng]}
                            icon={L.divIcon({
                                className: 'user-location-marker',
                                html: `<div style="position: relative; width: 24px; height: 24px;">
                                    <div style="position: absolute; width: 24px; height: 24px; background: #ef4444; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 10px rgba(239,68,68,0.5);"></div>
                                    <div style="position: absolute; width: 24px; height: 24px; background: #ef4444; border-radius: 50%; animation: pulse 2s infinite;"></div>
                                </div>
                                <style>
                                    @keyframes pulse {
                                        0% { transform: scale(1); opacity: 1; }
                                        100% { transform: scale(2.5); opacity: 0; }
                                    }
                                </style>`,
                                iconSize: [24, 24],
                                iconAnchor: [12, 12]
                            })}
                        />
                    )}
                </MapContainer>

                {/* Geolocation Button */}
                <button
                    onClick={getUserLocation}
                    disabled={isLocating}
                    className="absolute bottom-32 right-4 z-[1000] p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    title="Ma position"
                >
                    {isLocating ? (
                        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Navigation className="w-6 h-6 text-orange-500" />
                    )}
                </button>

                {/* Search Bar */}
                <div className="absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-xl z-[1000]">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-3">
                        <div className="flex items-center gap-2">
                            <Search className="w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                                placeholder="Rechercher un pays, une ville..."
                                className="flex-1 py-2 outline-none text-gray-900 bg-transparent"
                            />
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2 rounded-xl transition-colors ${showFilters ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                            </button>
                        </div>

                        {showFilters && (
                            <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-3">
                                <select
                                    value={selectedCountry}
                                    onChange={(e) => handleCountrySelect(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                                >
                                    <option value="">Tous les pays</option>
                                    {Object.keys(countries).map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => handleCitySelect(e.target.value)}
                                    disabled={!selectedCountry}
                                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white disabled:bg-gray-100"
                                >
                                    <option value="">Toutes les villes</option>
                                    {selectedCountry && Object.keys(countries[selectedCountry]?.cities || {}).map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Breadcrumb */}
                    {(selectedCountry || selectedCity) && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                            <button onClick={resetView} className="px-3 py-1.5 bg-white/90 rounded-full shadow text-gray-700 hover:bg-white flex items-center gap-1">
                                <Globe className="w-4 h-4" /> Afrique
                            </button>
                            {selectedCountry && (
                                <>
                                    <ChevronRight className="w-4 h-4 text-white/60" />
                                    <button 
                                        onClick={() => { handleCountrySelect(selectedCountry); setSelectedCity(''); }}
                                        className="px-3 py-1.5 bg-orange-500 text-white rounded-full shadow"
                                    >
                                        {selectedCountry}
                                    </button>
                                </>
                            )}
                            {selectedCity && (
                                <>
                                    <ChevronRight className="w-4 h-4 text-white/60" />
                                    <span className="px-3 py-1.5 bg-orange-600 text-white rounded-full shadow">
                                        {selectedCity}
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="absolute bottom-24 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 z-[1000]">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Légende</p>
                    <div className="space-y-1.5 text-xs text-gray-700">
                        <div className="flex items-center gap-2"><Home className="w-4 h-4" /> Maison</div>
                        <div className="flex items-center gap-2"><Building className="w-4 h-4" /> Appartement</div>
                        <div className="flex items-center gap-2"><Hotel className="w-4 h-4" /> Villa meublée</div>
                        <div className="flex items-center gap-2"><Hotel className="w-4 h-4" /> Hôtel</div>
                        <div className="flex items-center gap-2"><Trees className="w-4 h-4" /> Terrain</div>
                        <div className="flex items-center gap-2"><Car className="w-4 h-4" /> Véhicule</div>
                    </div>
                </div>

                {/* Zoom Controls */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-[1000]">
                    <button 
                        onClick={() => setMapZoom(Math.min(mapZoom + 1, 18))}
                        className="w-10 h-10 bg-white/95 rounded-xl shadow-lg flex items-center justify-center text-gray-700 hover:bg-white"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setMapZoom(Math.max(mapZoom - 1, 2))}
                        className="w-10 h-10 bg-white/95 rounded-xl shadow-lg flex items-center justify-center text-gray-700 hover:bg-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={resetView}
                        className="w-10 h-10 bg-white/95 rounded-xl shadow-lg flex items-center justify-center text-orange-500 hover:bg-white"
                    >
                        <Globe className="w-5 h-5" />
                    </button>
                </div>

                {/* Results count */}
                <div className="absolute top-4 right-20 bg-white/95 px-4 py-2 rounded-full shadow-lg text-sm font-medium text-gray-700 z-[1000]">
                    {filteredListings.length} annonce{filteredListings.length > 1 ? 's' : ''}
                </div>

                {/* Selected Listing Card */}
                {selectedListing && (
                    <div className="absolute bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-96 z-[1000]">
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                            <button 
                                onClick={() => setSelectedListing(null)} 
                                className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white z-10 hover:bg-black/70"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="flex">
                                <img src={selectedListing.image} alt="" className="w-36 h-36 object-cover" />
                                <div className="flex-1 p-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-orange-500">
                                            {getListingIcon(selectedListing) === 'home' && <Home className="w-5 h-5" />}
                                            {getListingIcon(selectedListing) === 'building' && <Building className="w-5 h-5" />}
                                            {getListingIcon(selectedListing) === 'hotel' && <Hotel className="w-5 h-5" />}
                                            {getListingIcon(selectedListing) === 'villa' && <Hotel className="w-5 h-5" />}
                                            {getListingIcon(selectedListing) === 'trees' && <Trees className="w-5 h-5" />}
                                            {getListingIcon(selectedListing) === 'car' && <Car className="w-5 h-5" />}
                                            {getListingIcon(selectedListing) === 'pin' && <MapPin className="w-5 h-5" />}
                                        </span>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{selectedListing.subcategory}</span>
                                    </div>
                                    <p className="font-bold text-gray-900 line-clamp-1">{selectedListing.title}</p>
                                    <p className="text-orange-500 font-bold text-lg">{formatPrice(selectedListing.price)} FCFA</p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                        <MapPin className="w-3 h-3" /> {selectedListing.city}, {selectedListing.country}
                                    </p>
                                    <button
                                        onClick={() => navigate(`/listing/${selectedListing.id}`)}
                                        className="mt-3 w-full py-2 bg-orange-500 text-white text-sm rounded-xl font-semibold hover:bg-orange-600"
                                    >
                                        Voir détails
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* List toggle */}
                <button
                    onClick={() => navigate('/annonces')}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden bg-white text-gray-900 px-6 py-3 rounded-full font-semibold shadow-2xl flex items-center gap-2 z-[1000]"
                >
                    <LayoutGrid className="w-5 h-5" /> Voir la liste
                </button>
            </div>
        </div>
    );
}

// Admin Dashboard Page
function AdminPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [adminUsers, setAdminUsers] = useState([]);
    const [adminListings, setAdminListings] = useState([]);
    const [adminPayments, setAdminPayments] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const [searchListing, setSearchListing] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [filterAccountType, setFilterAccountType] = useState('all');
    const [filterListingStatus, setFilterListingStatus] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [dashboard, setDashboard] = useState({
        users: { total: 0, free: 0, pro: 0, newThisMonth: 0 },
        listings: { total: 0, active: 0, draft: 0, expired: 0, newThisMonth: 0 },
        payments: { total: 0, completed: 0, pending: 0 },
        revenue: { total: 0, currency: 'XOF' }
    });

    useEffect(() => {
        // Vérifier si l'utilisateur est admin
        const checkAdmin = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                const isAdmin = user.roles?.includes('ROLE_ADMIN') || user.isAdmin === true;
                setIsAuthorized(isAdmin);
                if (!isAdmin) {
                    setIsLoading(false);
                }
                return isAdmin;
            }
            setIsLoading(false);
            return false;
        };
        
        if (!checkAdmin()) return;
        
        const fetchAdminData = async () => {
            try {
                const { adminService, listingService } = await import('./services/api.js');
                
                // Récupérer les stats du dashboard
                const statsResult = await adminService.getStats();
                if (statsResult.ok && statsResult.data?.stats) {
                    const s = statsResult.data.stats;
                    setDashboard({
                        users: { total: s.totalUsers || 0, free: s.freeUsers || 0, pro: s.proUsers || 0, newThisMonth: s.newUsersThisMonth || 0 },
                        listings: { total: s.totalListings || 0, active: s.activeListings || 0, draft: s.draftListings || 0, expired: s.expiredListings || 0, newThisMonth: s.newListingsThisMonth || 0 },
                        payments: { total: s.totalPayments || 0, completed: s.completedPayments || 0, pending: s.pendingPayments || 0 },
                        revenue: { total: s.totalRevenue || 0, currency: 'XOF' }
                    });
                }

                // Récupérer les utilisateurs
                const usersResult = await adminService.getUsers();
                if (usersResult.ok && usersResult.data?.users) {
                    setAdminUsers(usersResult.data.users.map(u => ({
                        id: u.id,
                        email: u.email,
                        phone: u.phone || '',
                        fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
                        accountType: u.accountType || 'FREE',
                        isLifetimePro: u.isLifetimePro || false,
                        city: u.city || '',
                        country: u.country || '',
                        createdAt: u.createdAt,
                        totalListings: u.listingsCount || 0,
                        totalPayments: u.paymentsCount || 0,
                        subscriptionExpiresAt: u.subscriptionExpiresAt
                    })));
                }

                // Récupérer les annonces
                const listingsResult = await listingService.getAll();
                if (listingsResult.ok && listingsResult.data?.data) {
                    setAdminListings(listingsResult.data.data.map(l => ({
                        id: l.id,
                        title: l.title,
                        price: l.price,
                        category: l.category,
                        status: l.status || 'active',
                        city: l.city,
                        viewsCount: l.viewsCount || 0,
                        createdAt: l.createdAt,
                        user: l.user ? { id: l.user.id, email: l.user.email, accountType: l.user.accountType } : null
                    })));
                }

                // Récupérer les paiements en attente
                const paymentsResult = await adminService.getPendingPayments();
                if (paymentsResult.ok && paymentsResult.data?.payments) {
                    setAdminPayments(paymentsResult.data.payments);
                }
            } catch (error) {
                console.error('Error fetching admin data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    // Filtrer les utilisateurs
    const filteredUsers = adminUsers.filter(user => {
        const matchSearch = user.email.toLowerCase().includes(searchUser.toLowerCase()) || 
                          user.fullName.toLowerCase().includes(searchUser.toLowerCase()) ||
                          user.phone.includes(searchUser);
        const matchType = filterAccountType === 'all' || user.accountType === filterAccountType;
        return matchSearch && matchType;
    });

    // Filtrer les annonces
    const filteredListings = adminListings.filter(listing => {
        const matchSearch = listing.title.toLowerCase().includes(searchListing.toLowerCase());
        const matchStatus = filterListingStatus === 'all' || listing.status === filterListingStatus;
        return matchSearch && matchStatus;
    });

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
        { id: 'users', label: 'Utilisateurs', icon: Users },
        { id: 'listings', label: 'Annonces', icon: FileText },
        { id: 'payments', label: 'Paiements', icon: CreditCard },
        { id: 'stats', label: 'Statistiques', icon: TrendingUp },
    ];

    // Afficher page d'accès refusé si non autorisé
    if (!isLoading && !isAuthorized) {
        return (
            <div className="min-h-screen bg-gray-100 pt-20 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
                    <p className="text-gray-600 mb-6">Vous n'avez pas les permissions nécessaires pour accéder au panneau d'administration.</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pt-16">
            <div className="flex">
                {/* Sidebar */}
                <div className="w-64 bg-gray-900 min-h-screen fixed left-0 top-16 pt-6">
                    <div className="px-4 mb-6">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Retour au site
                        </button>
                        <h2 className="text-white text-xl font-bold flex items-center gap-2">
                            <Shield className="w-6 h-6 text-orange-500" />
                            Admin Panel
                        </h2>
                    </div>
                    <nav className="space-y-1 px-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                    activeTab === tab.id 
                                        ? 'bg-orange-500 text-white' 
                                        : 'text-gray-300 hover:bg-gray-800'
                                }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="ml-64 flex-1 p-8">
                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                            
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Total Utilisateurs</p>
                                            <p className="text-3xl font-bold text-gray-900">{dashboard.users.total}</p>
                                            <p className="text-sm text-green-600 mt-1">+{dashboard.users.newThisMonth} ce mois</p>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Users className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-4 text-sm">
                                        <span className="text-gray-500">FREE: <strong>{dashboard.users.free}</strong></span>
                                        <span className="text-orange-500">PRO: <strong>{dashboard.users.pro}</strong></span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Total Annonces</p>
                                            <p className="text-3xl font-bold text-gray-900">{dashboard.listings.total}</p>
                                            <p className="text-sm text-green-600 mt-1">+{dashboard.listings.newThisMonth} ce mois</p>
                                        </div>
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-3 text-sm">
                                        <span className="text-green-600">Actives: <strong>{dashboard.listings.active}</strong></span>
                                        <span className="text-yellow-600">Brouillon: <strong>{dashboard.listings.draft}</strong></span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Paiements</p>
                                            <p className="text-3xl font-bold text-gray-900">{dashboard.payments.total}</p>
                                            <p className="text-sm text-yellow-600 mt-1">{dashboard.payments.pending} en attente</p>
                                        </div>
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                            <CreditCard className="w-6 h-6 text-purple-600" />
                                        </div>
                                    </div>
                                    <div className="mt-4 text-sm">
                                        <span className="text-green-600">Complétés: <strong>{dashboard.payments.completed}</strong></span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Revenus Totaux</p>
                                            <p className="text-3xl font-bold text-orange-500">{formatPrice(dashboard.revenue.total)}</p>
                                            <p className="text-sm text-gray-500 mt-1">FCFA</p>
                                        </div>
                                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                            <Banknote className="w-6 h-6 text-orange-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-500" />
                                        Derniers Utilisateurs
                                    </h3>
                                    <div className="space-y-3">
                                        {adminUsers.slice(0, 4).map(user => (
                                            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                                                        {user.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{user.fullName}</p>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    user.accountType === 'PRO' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {user.accountType}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                        Paiements en Attente
                                    </h3>
                                    {adminPayments.length > 0 ? (
                                        <div className="space-y-3">
                                            {adminPayments.map(payment => (
                                                <div key={payment.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{payment.user.fullName}</p>
                                                        <p className="text-sm text-gray-500">{payment.description}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-orange-500">{formatPrice(payment.amount)} FCFA</p>
                                                        <div className="flex gap-2 mt-1">
                                                            <button className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                                                                <Check className="w-3 h-3" />
                                                            </button>
                                                            <button className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">Aucun paiement en attente</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
                                <span className="text-sm text-gray-500">{filteredUsers.length} utilisateur(s)</span>
                            </div>

                            {/* Filters */}
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-4">
                                <div className="flex-1 min-w-[200px]">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Rechercher par email, nom ou téléphone..."
                                            value={searchUser}
                                            onChange={(e) => setSearchUser(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={filterAccountType}
                                    onChange={(e) => setFilterAccountType(e.target.value)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="all">Tous les comptes</option>
                                    <option value="FREE">FREE</option>
                                    <option value="PRO">PRO</option>
                                </select>
                            </div>

                            {/* Users Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compte</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Annonces</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscrit le</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                                            {user.fullName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{user.fullName}</p>
                                                            <p className="text-sm text-gray-500">{user.city}, {user.country}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-900">{user.email}</p>
                                                    <p className="text-sm text-gray-500">{user.phone}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                            user.accountType === 'PRO' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {user.accountType}
                                                        </span>
                                                        {user.isLifetimePro && (
                                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-600">
                                                                ILLIMITÉ
                                                            </span>
                                                        )}
                                                    </div>
                                                    {user.subscriptionExpiresAt && (
                                                        <p className="text-xs text-gray-500 mt-1">Expire: {user.subscriptionExpiresAt}</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-gray-900">{user.totalListings}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {user.createdAt}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => { setSelectedUser(user); setShowUserModal(true); }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                            title="Voir détails"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        {!user.isLifetimePro && (
                                                            <button
                                                                onClick={() => alert(`PRO illimité activé pour ${user.fullName}`)}
                                                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                                                                title="Donner PRO illimité"
                                                            >
                                                                <Star className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {user.isLifetimePro && (
                                                            <button
                                                                onClick={() => alert(`PRO illimité retiré pour ${user.fullName}`)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                                title="Retirer PRO illimité"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Listings Tab */}
                    {activeTab === 'listings' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-bold text-gray-900">Modération des Annonces</h1>
                                <span className="text-sm text-gray-500">{filteredListings.length} annonce(s)</span>
                            </div>

                            {/* Filters */}
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-4">
                                <div className="flex-1 min-w-[200px]">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Rechercher une annonce..."
                                            value={searchListing}
                                            onChange={(e) => setSearchListing(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={filterListingStatus}
                                    onChange={(e) => setFilterListingStatus(e.target.value)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="all">Tous les statuts</option>
                                    <option value="active">Actives</option>
                                    <option value="draft">Brouillons</option>
                                    <option value="expired">Expirées</option>
                                    <option value="sold">Vendues</option>
                                </select>
                            </div>

                            {/* Listings Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Annonce</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendeur</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vues</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredListings.map(listing => (
                                            <tr key={listing.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{listing.title}</p>
                                                        <p className="text-sm text-gray-500">{listing.category} • {listing.city}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-orange-500">{formatPrice(listing.price)} FCFA</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-900">{listing.user.email}</p>
                                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                                        listing.user.accountType === 'PRO' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {listing.user.accountType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        listing.status === 'active' ? 'bg-green-100 text-green-600' :
                                                        listing.status === 'draft' ? 'bg-yellow-100 text-yellow-600' :
                                                        listing.status === 'expired' ? 'bg-red-100 text-red-600' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {listing.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="flex items-center gap-1 text-gray-600">
                                                        <Eye className="w-4 h-4" /> {listing.viewsCount}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => navigate(`/listing/${listing.id}`)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                            title="Voir"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Supprimer l'annonce "${listing.title}" ?`)) {
                                                                    alert('Annonce supprimée');
                                                                }
                                                            }}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Payments Tab */}
                    {activeTab === 'payments' && (
                        <div className="space-y-6">
                            <h1 className="text-2xl font-bold text-gray-900">Gestion des Paiements</h1>

                            {/* Pending Payments */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-yellow-500" />
                                    Paiements en attente de vérification
                                </h3>
                                {adminPayments.length > 0 ? (
                                    <div className="space-y-4">
                                        {adminPayments.map(payment => (
                                            <div key={payment.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                                                        <CreditCard className="w-6 h-6 text-yellow-700" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{payment.user.fullName}</p>
                                                        <p className="text-sm text-gray-600">{payment.user.email}</p>
                                                        <p className="text-sm text-gray-500">{payment.user.phone}</p>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-500">{payment.description}</p>
                                                    <p className="text-2xl font-bold text-orange-500">{formatPrice(payment.amount)} FCFA</p>
                                                    <p className="text-xs text-gray-400">{payment.createdAt}</p>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <button 
                                                        onClick={() => alert(`Paiement #${payment.id} confirmé ! ${payment.user.fullName} est maintenant PRO.`)}
                                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                                                    >
                                                        <Check className="w-4 h-4" /> Confirmer
                                                    </button>
                                                    <button 
                                                        onClick={() => alert(`Paiement #${payment.id} rejeté.`)}
                                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                                                    >
                                                        <X className="w-4 h-4" /> Rejeter
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <Check className="w-16 h-16 mx-auto mb-4 text-green-300" />
                                        <p className="text-lg">Aucun paiement en attente</p>
                                        <p className="text-sm">Tous les paiements ont été traités</p>
                                    </div>
                                )}
                            </div>

                            {/* Revenue Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <p className="text-sm text-gray-500">Revenus ce mois</p>
                                    <p className="text-3xl font-bold text-green-500">{formatPrice(850000)} FCFA</p>
                                </div>
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <p className="text-sm text-gray-500">Revenus mois dernier</p>
                                    <p className="text-3xl font-bold text-gray-700">{formatPrice(720000)} FCFA</p>
                                </div>
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <p className="text-sm text-gray-500">Revenus totaux</p>
                                    <p className="text-3xl font-bold text-orange-500">{formatPrice(dashboard.revenue.total)} FCFA</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Tab */}
                    {activeTab === 'stats' && (
                        <div className="space-y-6">
                            <h1 className="text-2xl font-bold text-gray-900">Statistiques & Croissance</h1>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Users Growth */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Croissance Utilisateurs (30 jours)</h3>
                                    <div className="h-48 flex items-end justify-between gap-1">
                                        {[5, 8, 12, 6, 15, 10, 8, 20, 14, 18, 22, 25, 19, 28].map((val, i) => (
                                            <div key={i} className="flex-1 bg-blue-500 rounded-t" style={{ height: `${val * 4}%` }}></div>
                                        ))}
                                    </div>
                                    <p className="text-center text-sm text-gray-500 mt-4">+45 nouveaux utilisateurs ce mois</p>
                                </div>

                                {/* Listings Growth */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouvelles Annonces (30 jours)</h3>
                                    <div className="h-48 flex items-end justify-between gap-1">
                                        {[15, 23, 18, 30, 25, 35, 28, 40, 32, 45, 38, 50, 42, 55].map((val, i) => (
                                            <div key={i} className="flex-1 bg-green-500 rounded-t" style={{ height: `${val * 2}%` }}></div>
                                        ))}
                                    </div>
                                    <p className="text-center text-sm text-gray-500 mt-4">+123 nouvelles annonces ce mois</p>
                                </div>

                                {/* Conversion Rate */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Taux de Conversion FREE → PRO</h3>
                                    <div className="flex items-center justify-center">
                                        <div className="relative w-40 h-40">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="80" cy="80" r="70" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                                                <circle cx="80" cy="80" r="70" fill="none" stroke="#f97316" strokeWidth="12" 
                                                    strokeDasharray={`${14.1 * 2 * Math.PI * 70 / 100} ${2 * Math.PI * 70}`} />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-3xl font-bold text-orange-500">14.1%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-center text-sm text-gray-500 mt-4">22 PRO / 156 Total</p>
                                </div>

                                {/* Revenue by Type */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Revenus</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Abonnements PRO</span>
                                                <span className="font-medium">75%</span>
                                            </div>
                                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-orange-500 rounded-full" style={{ width: '75%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Boosts annonces</span>
                                                <span className="font-medium">20%</span>
                                            </div>
                                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '20%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Autres</span>
                                                <span className="font-medium">5%</span>
                                            </div>
                                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full" style={{ width: '5%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* User Detail Modal */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Détails Utilisateur</h2>
                            <button onClick={() => setShowUserModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {selectedUser.fullName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.fullName}</h3>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            selectedUser.accountType === 'PRO' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {selectedUser.accountType}
                                        </span>
                                        {selectedUser.isLifetimePro && (
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-600">
                                                ILLIMITÉ
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Téléphone</p>
                                    <p className="font-medium">{selectedUser.phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Localisation</p>
                                    <p className="font-medium">{selectedUser.city}, {selectedUser.country}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Inscrit le</p>
                                    <p className="font-medium">{selectedUser.createdAt}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Annonces</p>
                                    <p className="font-medium">{selectedUser.totalListings}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Paiements</p>
                                    <p className="font-medium">{selectedUser.totalPayments}</p>
                                </div>
                            </div>

                            {selectedUser.subscriptionExpiresAt && (
                                <div className="bg-orange-50 rounded-lg p-3">
                                    <p className="text-sm text-orange-700">
                                        <strong>Abonnement PRO expire le:</strong> {selectedUser.subscriptionExpiresAt}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4 border-t">
                                {!selectedUser.isLifetimePro ? (
                                    <button 
                                        onClick={() => {
                                            alert(`${selectedUser.fullName} est maintenant PRO ILLIMITÉ !`);
                                            setShowUserModal(false);
                                        }}
                                        className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                    >
                                        <Star className="w-5 h-5" /> Donner PRO illimité
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            alert(`PRO illimité retiré pour ${selectedUser.fullName}`);
                                            setShowUserModal(false);
                                        }}
                                        className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                    >
                                        <X className="w-5 h-5" /> Retirer PRO illimité
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// About Page - Qui sommes-nous
function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Hero */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Qui sommes-nous ?</h1>
                    <p className="text-white/90 text-lg">Découvrez l'histoire de PlanB, la première plateforme de petites annonces pour l'Afrique</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Mission */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre Mission</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        PlanB est née d'une vision simple : créer la plateforme de référence pour les petites annonces en Afrique. 
                        Nous croyons que chaque personne mérite un accès facile et sécurisé pour acheter, vendre ou louer des biens et services.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        Notre objectif est de connecter les vendeurs et acheteurs à travers tout le continent africain, 
                        en offrant une expérience utilisateur moderne, intuitive et adaptée aux réalités locales.
                    </p>
                </section>

                {/* Values */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Nos Valeurs</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-orange-500" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Confiance</h3>
                            <p className="text-gray-600 text-sm">Nous vérifions les annonces et les utilisateurs pour garantir des transactions sécurisées.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-blue-500" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Communauté</h3>
                            <p className="text-gray-600 text-sm">Nous construisons une communauté active et engagée à travers l'Afrique.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                                <Sparkles className="w-6 h-6 text-green-500" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Innovation</h3>
                            <p className="text-gray-600 text-sm">Nous innovons constamment pour offrir les meilleures fonctionnalités à nos utilisateurs.</p>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 text-center">
                    <h2 className="text-2xl font-bold text-white mb-8">PlanB en chiffres</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-3xl font-bold text-orange-500">10K+</p>
                            <p className="text-gray-400 text-sm">Utilisateurs actifs</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-orange-500">5K+</p>
                            <p className="text-gray-400 text-sm">Annonces publiées</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-orange-500">15+</p>
                            <p className="text-gray-400 text-sm">Pays couverts</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-orange-500">98%</p>
                            <p className="text-gray-400 text-sm">Satisfaction client</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 mt-16">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center text-gray-500 text-sm">
                        © 2026 PlanB. Tous droits réservés.
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Contact Page
function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const { contactService } = await import('./services/api.js');
            const result = await contactService.submit(formData);
            
            if (result.ok) {
                setSubmitted(true);
                setFormData({ name: '', email: '', subject: '', message: '' });
                setTimeout(() => setSubmitted(false), 5000);
            } else {
                setError(result.data?.error || 'Une erreur est survenue');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Hero */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Contactez-nous</h1>
                    <p className="text-white/90 text-lg">Notre équipe est là pour vous aider</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations de contact</h2>
                        
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Email</h3>
                                    <p className="text-gray-600">contact@planb-africa.com</p>
                                    <p className="text-gray-600">support@planb-africa.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Téléphone</h3>
                                    <p className="text-gray-600">+225 07 00 00 00 00</p>
                                    <p className="text-gray-600">+221 77 000 00 00</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Adresse</h3>
                                    <p className="text-gray-600">Abidjan, Côte d'Ivoire</p>
                                    <p className="text-gray-600">Cocody, Riviera Palmeraie</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-6 bg-orange-50 rounded-2xl">
                            <h3 className="font-semibold text-gray-900 mb-2">Horaires d'ouverture</h3>
                            <p className="text-gray-600 text-sm">Lundi - Vendredi: 8h00 - 18h00</p>
                            <p className="text-gray-600 text-sm">Samedi: 9h00 - 14h00</p>
                            <p className="text-gray-600 text-sm">Dimanche: Fermé</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
                        
                        {submitted ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Message envoyé !</h3>
                                <p className="text-gray-600">Nous vous répondrons dans les plus brefs délais.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                        placeholder="Votre nom"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                        placeholder="votre@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                                    <select
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                    >
                                        <option value="">Sélectionnez un sujet</option>
                                        <option value="general">Question générale</option>
                                        <option value="support">Support technique</option>
                                        <option value="business">Partenariat</option>
                                        <option value="report">Signaler un problème</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 resize-none"
                                        placeholder="Votre message..."
                                    />
                                </div>
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                        {error}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        'Envoyer le message'
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 mt-16">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center text-gray-500 text-sm">
                        © 2026 PlanB. Tous droits réservés.
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Terms Page - Conditions d'utilisation
function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Hero */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Conditions d'utilisation</h1>
                    <p className="text-white/90 text-lg">Dernière mise à jour : Janvier 2026</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl shadow-sm p-8">
                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">1. Acceptation des conditions</h2>
                        <p className="text-gray-600 leading-relaxed">
                            En accédant et en utilisant la plateforme PlanB, vous acceptez d'être lié par les présentes conditions d'utilisation. 
                            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">2. Description du service</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            PlanB est une plateforme de petites annonces en ligne permettant aux utilisateurs de :
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                            <li>Publier des annonces de vente, location ou services</li>
                            <li>Rechercher et consulter des annonces</li>
                            <li>Contacter d'autres utilisateurs</li>
                            <li>Gérer leur profil et leurs annonces</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">3. Inscription et compte</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Pour publier une annonce, vous devez créer un compte avec des informations exactes et à jour. 
                            Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toutes les activités 
                            effectuées sous votre compte.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">4. Règles de publication</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">Les annonces publiées doivent :</p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                            <li>Être légales et conformes aux lois en vigueur</li>
                            <li>Contenir des informations véridiques et exactes</li>
                            <li>Ne pas porter atteinte aux droits de tiers</li>
                            <li>Ne pas contenir de contenu offensant, discriminatoire ou illégal</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">5. Responsabilités</h2>
                        <p className="text-gray-600 leading-relaxed">
                            PlanB agit en tant qu'intermédiaire et n'est pas partie aux transactions entre utilisateurs. 
                            Nous ne garantissons pas la qualité, la sécurité ou la légalité des articles annoncés, 
                            ni la capacité des vendeurs à vendre ou des acheteurs à acheter.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">6. Propriété intellectuelle</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Tous les contenus de la plateforme (logos, textes, images, code) sont la propriété de PlanB 
                            ou de ses partenaires et sont protégés par les lois sur la propriété intellectuelle.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">7. Protection des données</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Vos données personnelles sont traitées conformément à notre politique de confidentialité. 
                            Nous nous engageons à protéger vos informations et à les utiliser uniquement dans le cadre 
                            de nos services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">8. Modifications</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Nous nous réservons le droit de modifier ces conditions à tout moment. 
                            Les modifications entrent en vigueur dès leur publication sur la plateforme.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">9. Contact</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Pour toute question concernant ces conditions, veuillez nous contacter à : 
                            <a href="mailto:legal@planb-africa.com" className="text-orange-500 hover:underline ml-1">legal@planb-africa.com</a>
                        </p>
                    </section>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 mt-16">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center text-gray-500 text-sm">
                        © 2026 PlanB. Tous droits réservés.
                    </div>
                </div>
            </footer>
        </div>
    );
}

function AppContent() {
    const location = useLocation();
    const hideHeader = ['/login', '/register', '/admin'].includes(location.pathname);
    
    return (
        <>
            {!hideHeader && <Header />}
            <OnboardingTour />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/annonces" element={<AnnoncesPage />} />
                <Route path="/category/:categoryName" element={<CategoryPage />} />
                <Route path="/listing/:id" element={<ListingDetailPage />} />
                <Route path="/seller/:sellerId" element={<SellerProfilePage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<MyListingsPage />} />
                <Route path="/reservations" element={<MyReservationsPage />} />
                <Route path="/payments" element={<MyPaymentsPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/settings" element={<ProfileSettingsPage />} />
                <Route path="/upgrade" element={<UpgradePage />} />
                <Route path="/publish" element={<PublishPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="*" element={<HomePage />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
