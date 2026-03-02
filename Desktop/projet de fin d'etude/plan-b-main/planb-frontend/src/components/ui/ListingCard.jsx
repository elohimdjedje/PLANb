import { useState, useEffect, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Heart, Camera, Eye, Star, Globe, X, LogIn } from 'lucide-react';
import { StarRating } from '../../components';
import { formatPrice, countryCodeToName, getImageUrl } from '../../utils/helpers';
import { favoriteService } from '../../services/api';

// ── Mini modal "connexion requise" ────────────────────────────────────
function AuthPromptModal({ onClose, onLogin }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm relative"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </button>

                {/* Icône */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                        <Heart className="w-8 h-8 text-red-400" />
                    </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                    Connectez-vous pour sauvegarder
                </h3>
                <p className="text-gray-500 text-sm text-center mb-6">
                    Vous devez avoir un compte pour ajouter des annonces à vos favoris.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onLogin}
                        className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                        <LogIn className="w-4 h-4" />
                        Se connecter
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all"
                    >
                        Continuer sans compte
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Listing Card Component ────────────────────────────────────────────
const ListingCard = memo(function ListingCard({ listing, initialFavorite = null }) {
    const [isFavorite, setIsFavorite] = useState(initialFavorite ?? false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const navigate = useNavigate();

    // Vérifier si l'annonce est en favori au montage (uniquement si pas fourni par le parent)
    useEffect(() => {
        if (initialFavorite !== null) return; // Le parent a déjà fourni l'état
        const checkFavorite = async () => {
            if (localStorage.getItem('token')) {
                const result = await favoriteService.check(listing.id);
                if (result.ok) {
                    setIsFavorite(result.data.isFavorite);
                }
            }
        };
        checkFavorite();
    }, [listing.id, initialFavorite]);

    // Vérifie si l'utilisateur est connecté (token en localStorage)
    const isLoggedIn = useCallback(() => {
        return !!localStorage.getItem('token');
    }, []);

    const handleFavoriteClick = useCallback(async (e) => {
        e.stopPropagation();
        if (!isLoggedIn()) {
            setShowAuthModal(true);
            return;
        }

        const newStatus = !isFavorite;
        setIsFavorite(newStatus);

        try {
            if (newStatus) {
                await favoriteService.add(listing.id);
            } else {
                await favoriteService.remove(listing.id);
            }
        } catch (error) {
            console.error('Error updating favorite:', error);
            // Revenir à l'état précédent en cas d'erreur
            setIsFavorite(!newStatus);
        }
    }, [isLoggedIn, isFavorite, listing.id]);

    const handleLogin = useCallback(() => {
        setShowAuthModal(false);
        navigate('/login', { state: { from: `/listing/${listing.id}` } });
    }, [navigate, listing.id]);

    return (
        <>
            {showAuthModal && (
                <AuthPromptModal
                    onClose={() => setShowAuthModal(false)}
                    onLogin={handleLogin}
                />
            )}

            <div
                onClick={() => navigate(`/listing/${listing.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 group flex flex-col h-full"
            >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                        src={getImageUrl(listing.image || listing.mainImage || listing.images?.[0]?.url || listing.images?.[0]) || 'https://placehold.co/400x300/f3f4f6/9ca3af?text=Pas+d%27image'}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => { e.target.src = 'https://placehold.co/400x300/f3f4f6/9ca3af?text=Image'; }}
                    />

                    {/* PRO Badge */}
                    {listing.user?.isPro && (
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
                        onClick={handleFavoriteClick}
                        className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                        title={isLoggedIn() ? 'Ajouter aux favoris' : 'Connectez-vous pour sauvegarder'}
                    >
                        <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
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
                <div className="p-4 flex flex-col flex-1">
                    <div className="flex-1">
                        <div className="mb-2">
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                                {listing.subcategory}
                            </span>
                        </div>

                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                            {listing.title}
                        </h3>

                        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                            <MapPin className="w-4 h-4" />
                            <span>{listing.city}{listing.commune ? `, ${listing.commune}` : ''}, {countryCodeToName(listing.country)}</span>
                        </div>
                    </div>

                    {listing.user?.averageRating > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                            <StarRating
                                rating={listing.user.averageRating}
                                reviewsCount={listing.user.reviewsCount || 0}
                                size="xs"
                                showScore={true}
                                showCount={true}
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
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
        </>
    );
});

export default ListingCard;
