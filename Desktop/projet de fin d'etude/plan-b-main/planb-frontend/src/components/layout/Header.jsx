import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Bell, MessageSquare, Heart, ChevronDown, Plus, Star, MapPin,
    LogOut, LogIn, Settings, LayoutGrid, TrendingUp, CreditCard, Shield
} from 'lucide-react';

// Header Component
function Header() {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [showProPopup, setShowProPopup] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/home';

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
            const { authService } = await import('../../services/api.js');
            // authService.logout() does removeToken/removeUser + redirect
            // We update local state first, then let logout handle the redirect
            setCurrentUser(null);
            setUserMenuOpen(false);
            authService.logout();
        } catch (e) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setCurrentUser(null);
            setUserMenuOpen(false);
            window.location.href = '/login';
        }
    };

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    // Calculer la progression du scroll (0 à 1) sur les premiers 100px
                    const progress = Math.min(window.scrollY / 100, 1);
                    setScrollProgress(progress);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Styles dynamiques basés sur le scroll - mémorisé
    const isScrolled = useMemo(() => scrollProgress > 0.5, [scrollProgress]);
    const bgOpacity = useMemo(() => isHome ? scrollProgress : 1, [isHome, scrollProgress]);
    const textColorClass = useMemo(() => isHome && !isScrolled ? 'text-white' : 'text-gray-900', [isHome, isScrolled]);
    const iconColorClass = useMemo(() => isHome && !isScrolled ? 'text-white' : 'text-gray-700', [isHome, isScrolled]);

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
            style={{
                backgroundColor: isHome
                    ? (isScrolled ? 'white' : `rgba(244, 98, 31, ${0.15 + bgOpacity * 0.85})`)
                    : 'white',
                boxShadow: bgOpacity > 0.5 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                backdropFilter: isHome && !isScrolled ? 'blur(8px)' : 'none'
            }}
        >
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/home" className="flex items-center">
                        <img src="/logofinal.png" alt="PlanB" className="h-20 w-auto" />
                        <span className="transition-colors duration-300 -ml-3" style={{ fontSize: '1.875rem', fontWeight: 'bold', fontFamily: "'Syne', sans-serif", color: textColorClass === 'text-white' ? 'white' : '#1a1a1a' }}>
                            Plan <span style={{ color: isHome && !isScrolled ? '#1a1a1a' : isHome && isScrolled ? '#F4621F' : '#1a1a1a', transition: 'all 0.3s ease' }}>B</span>
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        <Link
                            to="/home"
                            className={`px-4 py-1.5 rounded font-medium text-sm transition-all ${location.pathname === '/home'
                                    ? 'bg-white text-orange-600 shadow-sm'
                                    : `${textColorClass} hover:bg-black/5`
                                }`}
                        >
                            Accueil
                        </Link>
                        <Link
                            to="/annonces"
                            className={`px-4 py-1.5 rounded font-medium text-sm transition-all ${location.pathname === '/annonces'
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
                                                <Link to="/escrow" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50">
                                                    <Shield className="w-5 h-5 text-gray-400" /> Mes cautions
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

export default Header;
