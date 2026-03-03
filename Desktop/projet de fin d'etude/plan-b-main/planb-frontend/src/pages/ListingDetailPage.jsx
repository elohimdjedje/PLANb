// ListingDetailPage - Placeholder for extraction
// This page needs to be extracted from the original App.jsx
// For now, re-export from the legacy file

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    MapPin, Heart, Share2, ChevronLeft, ChevronRight, Phone, Mail,
    Calendar, Eye, Star, Check, AlertTriangle, MessageSquare, Globe, X, Send,
    Home, Car, Bed, Bath, Maximize, Layers, Fuel, Settings, Palette, Hash, LogIn,
    Clock, Plus, Trash2, CheckCircle, Shield
} from 'lucide-react';

// ── Mini modal connexion requise pour favoris ─────────────────────────
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
                <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                    <X className="w-4 h-4 text-gray-500" />
                </button>
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                        <Heart className="w-8 h-8 text-red-400" />
                    </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Connectez-vous pour sauvegarder</h3>
                <p className="text-gray-500 text-sm text-center mb-6">Vous devez avoir un compte pour ajouter des annonces à vos favoris.</p>
                <div className="flex flex-col gap-3">
                    <button onClick={onLogin} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all">
                        <LogIn className="w-4 h-4" /> Se connecter
                    </button>
                    <button onClick={onClose} className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all">
                        Continuer sans compte
                    </button>
                </div>
            </div>
        </div>
    );
}
import { formatPrice, countryCodeToName, getImageUrl } from '../utils/helpers';
import { VerifiedBadge, StarRating, CategoryCertifiedBadge } from '../components';
import { messageService, reviewService, favoriteService, visitSlotService, bookingService } from '../services/api';

function ListingDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [listing, setListing] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const isLoggedIn = () => !!localStorage.getItem('token');
    const [showContactModal, setShowContactModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // État pour le message de contact
    const [contactMessage, setContactMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    // État pour le formulaire d'avis
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // État pour la réservation avec dates (locations)
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingStartDate, setBookingStartDate] = useState('');
    const [bookingEndDate, setBookingEndDate] = useState('');
    const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
    const [bookingError, setBookingError] = useState('');

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const { listingService, authService } = await import('../services/api.js');
                const result = await listingService.getById(id);
                if (result.ok) {
                    setListing(result.data.data || result.data);
                }
                const user = authService.getUser();
                setCurrentUser(user);
            } catch (error) {
                console.error('Error fetching listing:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    // Charger les avis de l'annonce
    useEffect(() => {
        if (!id) return;
        const fetchReviews = async () => {
            setReviewsLoading(true);
            try {
                const result = await reviewService.getListingReviews(id);
                if (result.ok) {
                    setReviews(result.data.reviews || result.data.data || []);
                }
            } catch (e) {
                console.error('Error fetching reviews:', e);
            } finally {
                setReviewsLoading(false);
            }
        };

        const checkFavorite = async () => {
            if (isLoggedIn()) {
                const result = await favoriteService.check(id);
                if (result.ok) {
                    setIsFavorite(result.data.isFavorite);
                }
            }
        };

        fetchReviews();
        checkFavorite();
    }, [id]);

    const handleStartConversation = async () => {
        if (!currentUser) {
            navigate('/login', { state: { from: `/annonces/${id}` } });
            return;
        }

        if (!contactMessage.trim()) return;

        setIsSending(true);
        try {
            console.debug('[Contact] Starting conversation for listing', listing.id, 'as user', currentUser.email);
            const result = await messageService.startConversation(listing.id, contactMessage);
            if (result.ok) {
                const conversationId = result.data.conversationId || result.data.data?.id || result.data.id;
                if (conversationId && conversationId !== 'undefined') {
                    console.debug('[Contact] Conversation created:', conversationId);
                    navigate(`/messages?conversationId=${conversationId}`);
                } else {
                    // Backend returned 200 but no conversationId (e.g. requiresAuth: false)
                    console.warn('[Contact] No conversationId in response:', result.data);
                    alert("Votre session a peut-être expiré. Veuillez vous reconnecter.");
                    navigate('/login', { state: { from: `/annonces/${id}` } });
                }
            } else {
                console.error('[Contact] Error:', result.data);
                alert("Erreur lors de l'envoi du message : " + (result.data?.error || result.data?.message || 'Erreur inconnue'));
            }
        } catch (error) {
            console.error('[Contact] Exception:', error);
            alert("Une erreur est survenue lors de l'envoi.");
        } finally {
            setIsSending(false);
            setShowContactModal(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!isLoggedIn()) {
            setShowAuthModal(true);
            return;
        }

        const newStatus = !isFavorite;
        setIsFavorite(newStatus);

        try {
            if (newStatus) {
                await favoriteService.add(id);
            } else {
                await favoriteService.remove(id);
            }
        } catch (error) {
            console.error('Error updating favorite:', error);
            setIsFavorite(!newStatus);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!isLoggedIn()) {
            setShowAuthModal(true);
            return;
        }

        setIsSubmittingReview(true);
        try {
            const result = await reviewService.create(id, reviewRating, reviewComment);
            if (result.ok) {
                // Rafraîchir les avis
                const newReview = result.data.review || result.data.data || result.data;
                setReviews(prev => [newReview, ...prev]);
                setReviewComment('');
                setReviewRating(5);
                alert("Merci pour votre avis !");
            } else {
                alert(result.data?.error || "Erreur lors de l'envoi de l'avis");
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert("Une erreur est survenue lors de l'envoi de l'avis.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    // Détection si c'est une location (louer/location)
    const isRentalListing = (() => {
        if (!listing) return false;
        // Vérifier le priceUnit (jour, semaine, mois)
        const rentalUnits = ['jour', 'semaine', 'mois', 'heure', 'nuit'];
        if (listing.priceUnit && rentalUnits.includes(listing.priceUnit.toLowerCase())) return true;
        // Vérifier la subcategory
        const subcatLower = (listing.subcategory || '').toLowerCase();
        if (subcatLower.includes('louer') || subcatLower.includes('location')) return true;
        // Vérifier le titre/description
        const titleLower = (listing.title || '').toLowerCase();
        if (titleLower.includes('à louer') || titleLower.includes('location')) return true;
        return false;
    })();

    // Handler pour soumettre une réservation avec dates
    const handleSubmitBooking = async (e) => {
        e.preventDefault();
        setBookingError('');

        if (!currentUser) {
            navigate('/login', { state: { from: `/annonces/${id}` } });
            return;
        }

        if (!bookingStartDate || !bookingEndDate) {
            setBookingError('Veuillez sélectionner les dates de début et de fin');
            return;
        }

        const start = new Date(bookingStartDate);
        const end = new Date(bookingEndDate);
        if (end <= start) {
            setBookingError('La date de fin doit être après la date de début');
            return;
        }

        setIsSubmittingBooking(true);
        try {
            const result = await bookingService.create(listing.id, bookingStartDate, bookingEndDate);
            if (result.ok) {
                setShowBookingModal(false);
                setBookingStartDate('');
                setBookingEndDate('');
                alert('Votre demande de réservation a été envoyée ! Le propriétaire va la confirmer.');
                navigate('/mes-reservations');
            } else {
                setBookingError(result.data?.error || result.data?.message || 'Erreur lors de la réservation');
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            setBookingError('Une erreur est survenue');
        } finally {
            setIsSubmittingBooking(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement de l'annonce...</p>
                </div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Annonce introuvable</h2>
                    <p className="text-gray-600 mb-6">Cette annonce n'existe pas ou a été supprimée.</p>
                    <button
                        onClick={() => navigate('/annonces')}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        Voir toutes les annonces
                    </button>
                </div>
            </div>
        );
    }

    const images = listing.images || [listing.mainImage || '/placeholder.jpg'];
    // Fonction pour résoudre l'URL d'une image (objet ou string)
    const resolveImgSrc = (img) => getImageUrl(typeof img === 'string' ? img : img?.url) || '/placeholder.jpg';

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Modal auth favoris */}
            {showAuthModal && (
                <AuthPromptModal
                    onClose={() => setShowAuthModal(false)}
                    onLogin={() => {
                        setShowAuthModal(false);
                        navigate('/login', { state: { from: `/listing/${id}` } });
                    }}
                />
            )}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link to="/home" className="hover:text-orange-500">Accueil</Link>
                    <span>/</span>
                    <Link to="/annonces" className="hover:text-orange-500">Annonces</Link>
                    <span>/</span>
                    <span className="text-gray-900">{listing.title}</span>
                </nav>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Image Gallery */}
                        <div className="relative bg-gray-200 rounded-2xl overflow-hidden aspect-[16/10] mb-6">
                            <img
                                src={resolveImgSrc(images[currentImageIndex])}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                            />

                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex(i => i > 0 ? i - 1 : images.length - 1)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex(i => i < images.length - 1 ? i + 1 : 0)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                        {images.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentImageIndex(idx)}
                                                className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={handleToggleFavorite}
                                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                                    title={isLoggedIn() ? 'Ajouter aux favoris' : 'Connectez-vous pour sauvegarder'}
                                >
                                    <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                                </button>
                                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                                    <Share2 className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Title & Location */}
                        <div className="bg-white rounded-2xl p-6 mb-6">

                            {/* Virtual Tour Viewer */}
                            {(listing.hasVirtualTour || listing.has360 || listing.virtualTour) && (() => {
                                const tour = listing.virtualTour || {};
                                const tourType = tour.type || listing.virtualTourType;
                                const tourUrl = tour.url || listing.virtualTourUrl;
                                const tourThumb = tour.thumbnail || listing.virtualTourThumbnail;

                                return tourUrl ? (
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Globe className="w-5 h-5 text-purple-500" />
                                            <h3 className="text-lg font-bold text-gray-900">Visite Virtuelle 360°</h3>
                                        </div>
                                        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                                            {(tourType === 'matterport' || tourType === 'external') && (
                                                <iframe
                                                    src={tourUrl}
                                                    title="Visite virtuelle 360°"
                                                    className="w-full"
                                                    style={{ height: '450px', border: 'none' }}
                                                    allowFullScreen
                                                    loading="lazy"
                                                    allow="xr-spatial-tracking"
                                                />
                                            )}
                                            {tourType === '360_video' && (
                                                <iframe
                                                    src={tourUrl.includes('youtube.com/watch') ? tourUrl.replace('watch?v=', 'embed/') : tourUrl}
                                                    title="Vidéo 360°"
                                                    className="w-full"
                                                    style={{ height: '450px', border: 'none' }}
                                                    allowFullScreen
                                                    loading="lazy"
                                                />
                                            )}
                                            {tourType === '360_photo' && (
                                                <a
                                                    href={tourUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block relative group"
                                                >
                                                    <img
                                                        src={tourThumb || tourUrl}
                                                        alt="Photo 360°"
                                                        className="w-full object-cover transition-transform group-hover:scale-105"
                                                        style={{ maxHeight: '450px' }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="px-6 py-3 bg-white/90 rounded-xl font-semibold text-gray-900 flex items-center gap-2">
                                                            <Globe className="w-5 h-5" />
                                                            Voir en 360°
                                                        </div>
                                                    </div>
                                                </a>
                                            )}
                                            {!tourType && (
                                                <iframe
                                                    src={tourUrl}
                                                    title="Visite virtuelle"
                                                    className="w-full"
                                                    style={{ height: '450px', border: 'none' }}
                                                    allowFullScreen
                                                    loading="lazy"
                                                />
                                            )}
                                        </div>
                                    </div>
                                ) : tourThumb ? (
                                    <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-purple-500" />
                                        <span className="text-purple-700 font-medium">Visite virtuelle disponible</span>
                                    </div>
                                ) : null;
                            })()}

                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 text-sm font-medium rounded-full mb-2">
                                        {listing.subcategory || listing.category}
                                    </span>
                                    <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-2xl font-bold text-orange-500 whitespace-nowrap">
                                        {formatPrice(listing.price)} FCFA
                                        {listing.priceUnit && (
                                            <span className="text-base font-normal text-gray-500 ml-0.5">/{listing.priceUnit}</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{[listing.quartier, listing.commune, listing.city].filter(Boolean).join(', ') || listing.city}, {countryCodeToName(listing.country)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    <span>{listing.viewsCount || 0} vues</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Publié le {new Date(listing.createdAt).toLocaleDateString('fr-FR')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Informations clés */}
                        {listing.specifications && Object.keys(listing.specifications).length > 0 && (
                            <div className="bg-white rounded-2xl p-6 mb-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Informations clés</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {listing.specifications.surface && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Maximize className="w-5 h-5 text-orange-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Surface</p>
                                                <p className="font-semibold text-gray-900">{listing.specifications.surface} m²</p>
                                            </div>
                                        </div>
                                    )}
                                    {listing.specifications.rooms && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Home className="w-5 h-5 text-orange-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Pièces</p>
                                                <p className="font-semibold text-gray-900">{listing.specifications.rooms}</p>
                                            </div>
                                        </div>
                                    )}
                                    {listing.specifications.bedrooms && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Bed className="w-5 h-5 text-orange-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Chambres</p>
                                                <p className="font-semibold text-gray-900">{listing.specifications.bedrooms}</p>
                                            </div>
                                        </div>
                                    )}
                                    {listing.specifications.bathrooms && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Bath className="w-5 h-5 text-orange-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Salles de bain</p>
                                                <p className="font-semibold text-gray-900">{listing.specifications.bathrooms}</p>
                                            </div>
                                        </div>
                                    )}
                                    {listing.specifications.floor && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Layers className="w-5 h-5 text-orange-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Étage</p>
                                                <p className="font-semibold text-gray-900">{listing.specifications.floor}</p>
                                            </div>
                                        </div>
                                    )}
                                    {listing.specifications.furnished !== undefined && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Home className="w-5 h-5 text-orange-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Meublé</p>
                                                <p className="font-semibold text-gray-900">{listing.specifications.furnished ? 'Oui' : 'Non'}</p>
                                            </div>
                                        </div>
                                    )}
                                    {/* Véhicules */}
                                    {listing.specifications.brand && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Car className="w-5 h-5 text-orange-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Marque / Modèle</p>
                                                <p className="font-semibold text-gray-900">{listing.specifications.brand} {listing.specifications.model || ''}</p>
                                            </div>
                                        </div>
                                    )}
                                    {listing.specifications.year && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Calendar className="w-5 h-5 text-orange-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Année</p>
                                                <p className="font-semibold text-gray-900">{listing.specifications.year}</p>
                                            </div>
                                        </div>
                                    )}
                                    {listing.specifications.mileage && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Hash className="w-5 h-5 text-orange-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Kilométrage</p>
                                                <p className="font-semibold text-gray-900">{Number(listing.specifications.mileage).toLocaleString('fr-FR')} km</p>
                                            </div>
                                        </div>
                                    )}
                                    {listing.specifications.fuel && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Fuel className="w-5 h-5 text-orange-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Carburant</p>
                                                <p className="font-semibold text-gray-900">{listing.specifications.fuel}</p>
                                            </div>
                                        </div>
                                    )}
                                    {listing.specifications.transmission && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Settings className="w-5 h-5 text-orange-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Transmission</p>
                                                <p className="font-semibold text-gray-900">{listing.specifications.transmission}</p>
                                            </div>
                                        </div>
                                    )}
                                    {listing.specifications.color && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Palette className="w-5 h-5 text-orange-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Couleur</p>
                                                <p className="font-semibold text-gray-900">{listing.specifications.color}</p>
                                            </div>
                                        </div>
                                    )}
                                    {listing.specifications.condition && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Check className="w-5 h-5 text-orange-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">État</p>
                                                <p className="font-semibold text-gray-900">{listing.specifications.condition}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-white rounded-2xl p-6 mb-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Description</h2>
                            <p className="text-gray-600 whitespace-pre-line">{listing.description}</p>
                        </div>

                        {/* Les + de cette annonce (characteristics/highlights) */}
                        {listing.specifications?.characteristics && Object.keys(listing.specifications.characteristics).length > 0 && (
                            <div className="bg-white rounded-2xl p-6 mb-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Les + de cette annonce</h2>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(listing.specifications.characteristics).filter(([, v]) => v === true).map(([key]) => (
                                        <span key={key} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                                            <Check className="w-4 h-4" />
                                            {key}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Avis */}
                        <div className="bg-white rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Avis ({reviews.length})</h2>
                                {listing.averageRating > 0 && (
                                    <div className="flex items-center gap-2">
                                        <StarRating rating={listing.averageRating} size="sm" showScore={true} />
                                    </div>
                                )}
                            </div>

                            {/* Formulaire de dépôt d'avis */}
                            {isLoggedIn() && currentUser && listing.user?.id !== currentUser.id && (
                                <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4">Laisser un avis</h3>
                                    <form onSubmit={handleSubmitReview} className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Note :</span>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setReviewRating(star)}
                                                        className="focus:outline-none"
                                                    >
                                                        <Star
                                                            className={`w-6 h-6 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <textarea
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                                placeholder="Partagez votre expérience avec ce vendeur..."
                                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 min-h-[80px] text-sm"
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmittingReview}
                                            className="px-6 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 text-sm"
                                        >
                                            {isSubmittingReview ? "Envoi..." : "Publier l'avis"}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {!isLoggedIn() && (
                                <div className="mb-8 p-4 bg-orange-50 rounded-xl border border-orange-100 text-center">
                                    <p className="text-sm text-orange-800 mb-3">Connectez-vous pour laisser un avis sur cette annonce.</p>
                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        className="px-4 py-2 bg-white text-orange-500 rounded-lg font-bold border border-orange-200 hover:bg-orange-50 transition-colors text-sm"
                                    >
                                        Se connecter
                                    </button>
                                </div>
                            )}

                            {reviewsLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center py-8">
                                    <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">Aucun avis pour le moment</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map(review => (
                                        <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                    {review.reviewer?.initials || review.reviewer?.firstName?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 text-sm">
                                                        {review.reviewer?.firstName || 'Utilisateur'} {review.reviewer?.lastName?.charAt(0) || ''}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <StarRating rating={review.rating} size="xs" showScore={false} />
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p className="text-gray-600 text-sm ml-12">{review.comment}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        {/* Seller Card */}
                        <div className="bg-white rounded-2xl p-6 sticky top-24">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 mt-0.5">
                                    {listing.user?.firstName?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    {/* Ligne 1: Nom + Badge vérifié alignés */}
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-gray-900">
                                            {listing.user?.firstName} {listing.user?.lastName}
                                        </span>
                                        <VerifiedBadge isVerified={listing.user?.isVerified || false} badges={listing.user?.verificationBadges || []} size="md" />
                                        {listing.user?.isPro && (
                                            <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full ml-1">
                                                <Star className="w-3 h-3 fill-current" /> PRO
                                            </span>
                                        )}
                                    </div>
                                    {/* Ligne 2: Badge certifié catégorie */}
                                    <CategoryCertifiedBadge 
                                        isCertified={listing.user?.isCertifiedForCategory || false}
                                        category={listing.category}
                                        size="sm"
                                    />
                                    {/* Ligne 3: Note et avis */}
                                    {listing.user?.averageRating > 0 && (
                                        <div className="mt-1">
                                            <StarRating
                                                rating={listing.user.averageRating}
                                                reviewsCount={listing.user.reviewsCount || 0}
                                                size="sm"
                                                showScore={false}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact buttons - hidden for owner */}
                            {currentUser && listing.user?.id === currentUser.id ? (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                    <p className="text-blue-800 text-sm">
                                        ✓ C'est votre annonce. Les visiteurs verront ici les boutons de contact.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {listing.user?.phone && (
                                        <a
                                            href={`tel:${listing.user.phone}`}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
                                        >
                                            <Phone className="w-5 h-5" />
                                            Appeler
                                        </a>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (!currentUser) {
                                                navigate('/login', { state: { from: `/annonces/${id}` } });
                                            } else {
                                                setShowContactModal(true);
                                                setContactMessage(`Bonjour, je suis intéressé par votre annonce "${listing.title}". Est-elle toujours disponible ?`);
                                            }
                                        }}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        Envoyer un message
                                    </button>
                                    {listing.user?.email && (
                                        <a
                                            href={`mailto:${listing.user.email}`}
                                            className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            <Mail className="w-5 h-5" />
                                            Email
                                        </a>
                                    )}
                                    {/* Caution sécurisée */}
                                    {(listing.secureDepositEnabled || listing.secure_deposit_enabled || listing.depositAmountRequired || listing.deposit_amount_required) && (
                                        <button
                                            onClick={() => {
                                                if (!currentUser) {
                                                    navigate('/login', { state: { from: `/escrow/pay/${id}` } });
                                                } else {
                                                    navigate(`/escrow/pay/${id}`);
                                                }
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                                        >
                                            <Shield className="w-5 h-5" />
                                            Payer la caution sécurisée
                                        </button>
                                    )}
                                    {/* Réserver avec dates (locations uniquement) */}
                                    {isRentalListing && (
                                        <button
                                            onClick={() => {
                                                if (!currentUser) {
                                                    navigate('/login', { state: { from: `/annonces/${id}` } });
                                                } else {
                                                    setShowBookingModal(true);
                                                }
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                                        >
                                            <Calendar className="w-5 h-5" />
                                            Réserver avec dates
                                        </button>
                                    )}
                                </div>
                            )}

                            <Link
                                to={`/seller/${listing.user?.id}`}
                                className="block text-center text-orange-500 hover:text-orange-600 mt-4 text-sm font-medium"
                            >
                                Voir toutes les annonces de ce vendeur →
                            </Link>
                        </div>

                        {/* Visit Slots Section */}
                        <VisitSlotSection
                            listingId={listing.id}
                            isOwner={currentUser && listing.user?.id === currentUser.id}
                            currentUser={currentUser}
                            navigate={navigate}
                        />
                    </div>
                </div>
            </div>

            {/* Contact Modal */}
            {showContactModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setShowContactModal(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Contacter le vendeur</h3>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden">
                                    <img
                                        src={typeof images[0] === 'string' ? images[0] : images[0]?.url || '/placeholder.jpg'}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{listing.title}</p>
                                    <p className="text-sm text-orange-500 font-bold">{formatPrice(listing.price)} FCFA</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Votre message</label>
                                <textarea
                                    value={contactMessage}
                                    onChange={(e) => setContactMessage(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 min-h-[120px]"
                                    placeholder="Bonjour, je suis intéressé..."
                                ></textarea>
                            </div>

                            <button
                                onClick={handleStartConversation}
                                disabled={isSending || !contactMessage.trim()}
                                className={`w-full py-3 bg-orange-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${(isSending || !contactMessage.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'
                                    }`}
                            >
                                {isSending ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Envoi en cours...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Envoyer le message
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de réservation avec dates (locations) */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => {
                                setShowBookingModal(false);
                                setBookingError('');
                            }}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Réserver avec dates</h3>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden">
                                    {listing && (
                                        <img
                                            src={typeof images[0] === 'string' ? images[0] : images[0]?.url || '/placeholder.jpg'}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{listing?.title}</p>
                                    <p className="text-sm text-orange-500 font-bold">
                                        {formatPrice(listing?.price)} FCFA
                                        {listing?.priceUnit && <span className="text-gray-500 font-normal"> /{listing.priceUnit}</span>}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitBooking} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date de début
                                </label>
                                <input
                                    type="date"
                                    value={bookingStartDate}
                                    onChange={(e) => setBookingStartDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date de fin
                                </label>
                                <input
                                    type="date"
                                    value={bookingEndDate}
                                    onChange={(e) => setBookingEndDate(e.target.value)}
                                    min={bookingStartDate || new Date().toISOString().split('T')[0]}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            {/* Calcul du nombre de jours et prix estimé */}
                            {bookingStartDate && bookingEndDate && new Date(bookingEndDate) > new Date(bookingStartDate) && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-blue-800">Durée :</span>
                                        <span className="font-medium text-blue-900">
                                            {Math.ceil((new Date(bookingEndDate) - new Date(bookingStartDate)) / (1000 * 60 * 60 * 24))} jour(s)
                                        </span>
                                    </div>
                                    {listing?.priceUnit === 'jour' && (
                                        <div className="flex justify-between text-sm mt-1">
                                            <span className="text-blue-800">Prix estimé :</span>
                                            <span className="font-bold text-blue-900">
                                                {formatPrice(listing.price * Math.ceil((new Date(bookingEndDate) - new Date(bookingStartDate)) / (1000 * 60 * 60 * 24)))} FCFA
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {bookingError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                                    {bookingError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmittingBooking || !bookingStartDate || !bookingEndDate}
                                className={`w-full py-3 bg-blue-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${
                                    (isSubmittingBooking || !bookingStartDate || !bookingEndDate) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                                }`}
                            >
                                {isSubmittingBooking ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Envoi en cours...
                                    </>
                                ) : (
                                    <>
                                        <Calendar className="w-5 h-5" />
                                        Envoyer ma demande de réservation
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-500 text-center">
                                Le propriétaire recevra votre demande et pourra l'accepter ou la refuser.
                            </p>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Composant de créneaux de visite ── //
function VisitSlotSection({ listingId, isOwner, currentUser, navigate }) {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [bookingSlot, setBookingSlot] = useState(null);
    const [bookingMessage, setBookingMessage] = useState('');
    const [bookingPhone, setBookingPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Form pour créer un créneau (owner)
    const [newSlot, setNewSlot] = useState({
        date: '', startTime: '10:00', endTime: '11:00', notes: ''
    });

    const fetchSlots = async () => {
        setLoading(true);
        try {
            const result = await visitSlotService.getByListing(listingId);
            if (result.ok) {
                setSlots(result.data.data || []);
            }
        } catch (e) {
            console.error('Error fetching slots:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, [listingId]);

    const handleCreateSlot = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');
        try {
            const result = await visitSlotService.create({
                listingId: parseInt(listingId),
                date: newSlot.date,
                startTime: newSlot.startTime,
                endTime: newSlot.endTime,
                notes: newSlot.notes || null,
            });
            if (result.ok) {
                setSuccessMsg('Créneau créé avec succès !');
                setShowCreateForm(false);
                setNewSlot({ date: '', startTime: '10:00', endTime: '11:00', notes: '' });
                fetchSlots();
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setErrorMsg(result.data?.error || 'Erreur lors de la création');
            }
        } catch (e) {
            setErrorMsg('Erreur de connexion');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (!window.confirm('Supprimer ce créneau ?')) return;
        try {
            const result = await visitSlotService.delete(slotId);
            if (result.ok) {
                fetchSlots();
                setSuccessMsg('Créneau supprimé');
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (e) {
            setErrorMsg('Erreur lors de la suppression');
        }
    };

    const handleBookSlot = async () => {
        if (!currentUser) {
            navigate('/login', { state: { from: `/annonces/${listingId}` } });
            return;
        }
        setIsSubmitting(true);
        setErrorMsg('');
        try {
            const result = await visitSlotService.book(bookingSlot.id, {
                message: bookingMessage || null,
                phone: bookingPhone || null,
            });
            if (result.ok) {
                setSuccessMsg('Visite réservée avec succès ! Le propriétaire sera notifié.');
                setBookingSlot(null);
                setBookingMessage('');
                setBookingPhone('');
                fetchSlots();
                setTimeout(() => setSuccessMsg(''), 5000);
            } else {
                setErrorMsg(result.data?.error || 'Erreur lors de la réservation');
            }
        } catch (e) {
            setErrorMsg('Erreur de connexion');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    // On n'affiche la section que s'il y a des créneaux ou si c'est le propriétaire
    if (!isOwner && slots.length === 0 && !loading) return null;

    return (
        <div className="bg-white rounded-2xl p-6 mt-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-bold text-gray-900">Planifier une visite</h3>
                </div>
                {isOwner && (
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Ajouter
                    </button>
                )}
            </div>

            {/* Messages */}
            {successMsg && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
                    <CheckCircle className="w-4 h-4" /> {successMsg}
                </div>
            )}
            {errorMsg && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                    <AlertTriangle className="w-4 h-4" /> {errorMsg}
                </div>
            )}

            {/* Formulaire création (owner) */}
            {isOwner && showCreateForm && (
                <form onSubmit={handleCreateSlot} className="mb-4 p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={newSlot.date}
                            onChange={e => setNewSlot({...newSlot, date: e.target.value})}
                            min={new Date().toISOString().split('T')[0]}
                            required
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
                            <input
                                type="time"
                                value={newSlot.startTime}
                                onChange={e => setNewSlot({...newSlot, startTime: e.target.value})}
                                required
                                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                            <input
                                type="time"
                                value={newSlot.endTime}
                                onChange={e => setNewSlot({...newSlot, endTime: e.target.value})}
                                required
                                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
                        <input
                            type="text"
                            value={newSlot.notes}
                            onChange={e => setNewSlot({...newSlot, notes: e.target.value})}
                            placeholder="Ex: Visite avec guide"
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Création...' : 'Créer le créneau'}
                    </button>
                </form>
            )}

            {/* Loading */}
            {loading && (
                <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            )}

            {/* Liste des créneaux */}
            {!loading && slots.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-3">
                    {isOwner ? 'Aucun créneau de visite. Ajoutez-en un !' : 'Aucun créneau disponible pour le moment.'}
                </p>
            )}

            {!loading && slots.length > 0 && (
                <div className="space-y-2">
                    {slots.map(slot => (
                        <div key={slot.id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-orange-50 rounded-xl border border-gray-100 transition-colors">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                    <span className="font-medium text-gray-900 text-sm">{formatDate(slot.date)}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 ml-6">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-gray-600 text-sm">{slot.startTime} - {slot.endTime}</span>
                                </div>
                                {slot.notes && (
                                    <p className="text-gray-400 text-xs mt-1 ml-6 truncate">{slot.notes}</p>
                                )}
                            </div>
                            {isOwner ? (
                                <button
                                    onClick={() => handleDeleteSlot(slot.id)}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        if (!currentUser) {
                                            navigate('/login');
                                            return;
                                        }
                                        setBookingSlot(slot);
                                    }}
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
                                >
                                    Réserver
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de réservation */}
            {bookingSlot && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setBookingSlot(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setBookingSlot(null)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-orange-500" />
                            <h3 className="text-lg font-bold text-gray-900">Réserver cette visite</h3>
                        </div>

                        <div className="p-3 bg-orange-50 rounded-xl mb-4">
                            <p className="font-medium text-gray-900">{formatDate(bookingSlot.date)}</p>
                            <p className="text-gray-600 text-sm">{bookingSlot.startTime} - {bookingSlot.endTime}</p>
                            {bookingSlot.notes && <p className="text-gray-400 text-xs mt-1">{bookingSlot.notes}</p>}
                        </div>

                        <div className="space-y-3 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                <input
                                    type="tel"
                                    value={bookingPhone}
                                    onChange={e => setBookingPhone(e.target.value)}
                                    placeholder="+225 XX XX XX XX"
                                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message (optionnel)</label>
                                <textarea
                                    value={bookingMessage}
                                    onChange={e => setBookingMessage(e.target.value)}
                                    placeholder="Bonjour, je souhaite visiter ce bien..."
                                    rows={3}
                                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                                ></textarea>
                            </div>
                        </div>

                        <button
                            onClick={handleBookSlot}
                            disabled={isSubmitting}
                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Réservation...
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Confirmer la réservation
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListingDetailPage;
