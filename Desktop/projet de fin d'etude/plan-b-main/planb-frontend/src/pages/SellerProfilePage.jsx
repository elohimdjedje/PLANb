// SellerProfilePage - View seller's listings and profile
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Calendar, ArrowLeft, MessageSquare, LogIn } from 'lucide-react';
import ListingCard from '../components/ui/ListingCard';
import { VerifiedBadge, StarRating } from '../components';
import { authService } from '../services/api';

function SellerProfilePage() {
    const { sellerId } = useParams();
    const navigate = useNavigate();
    const [seller, setSeller] = useState(null);
    const [listings, setListings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = authService.getUser();
        setCurrentUser(user);
    }, []);

    useEffect(() => {
        const fetchSellerData = async () => {
            try {
                const { userService, reviewService } = await import('../services/api.js');
                const [sellerResult, reviewsResult] = await Promise.all([
                    userService.getById(sellerId),
                    reviewService.getSellerReviews(sellerId)
                ]);

                if (sellerResult.ok) {
                    const data = sellerResult.data;
                    setSeller(data.user || data);
                    setListings(data.listings || []);
                }
                if (reviewsResult.ok) {
                    const rData = reviewsResult.data;
                    setReviews(rData.reviews || []);
                    setReviewStats(rData.stats || null);
                }
            } catch (error) {
                console.error('Error fetching seller:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSellerData();
    }, [sellerId]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!seller) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendeur introuvable</h2>
                    <button onClick={() => navigate(-1)} className="text-orange-500 hover:underline">
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                </button>

                {/* Seller Profile Card */}
                <div className="bg-white rounded-2xl p-8 mb-8">
                    <div className="flex items-start gap-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                            {seller.firstName?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-1.5 mb-2">
                                <span className="text-2xl font-bold text-gray-900">
                                    {seller.firstName} {seller.lastName}
                                </span>
                                <VerifiedBadge isVerified={seller.isVerified || false} badges={seller.verificationBadges || []} size="lg" />
                                {seller.isPro && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-600 text-sm font-medium rounded-full ml-1">
                                        <Star className="w-4 h-4 fill-current" /> PRO
                                    </span>
                                )}
                            </div>

                            {/* Rating Display */}
                            {seller.averageRating > 0 && (
                                <div className="mb-3">
                                    <StarRating
                                        rating={seller.averageRating}
                                        reviewsCount={seller.reviewsCount || 0}
                                        size="md"
                                        showScore={true}
                                        showCount={true}
                                    />
                                </div>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
                                {seller.city && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {seller.city}, {seller.country}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Membre depuis {new Date(seller.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                </span>
                            </div>

                            {/* Bio */}
                            {seller.bio && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                                    <p className="text-gray-700 text-sm leading-relaxed">{seller.bio}</p>
                                </div>
                            )}

                            <div className="flex gap-3 mt-4">
                                {seller.phone && (
                                    <a
                                        href={`tel:${seller.phone}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                    >
                                        <Phone className="w-4 h-4" />
                                        Appeler
                                    </a>
                                )}
                                {currentUser && String(currentUser.id) !== String(sellerId) && (
                                    <button
                                        onClick={() => {
                                            if (!currentUser) {
                                                navigate('/login', { state: { from: `/seller/${sellerId}` } });
                                            } else if (listings.length > 0) {
                                                navigate(`/listing/${listings[0].id}`);
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Envoyer un message
                                    </button>
                                )}
                                {!currentUser && (
                                    <button
                                        onClick={() => navigate('/login', { state: { from: `/seller/${sellerId}` } })}
                                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Connectez-vous pour envoyer un message
                                    </button>
                                )}
                                {seller.email && (
                                    <a
                                        href={`mailto:${seller.email}`}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-orange-500">{listings.length}</p>
                            <p className="text-gray-500 text-sm">Annonces</p>
                        </div>
                    </div>
                </div>

                {/* Seller's Listings */}
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Annonces de {seller.firstName} ({listings.length})
                </h2>

                {listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {listings.map(listing => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl">
                        <p className="text-gray-600">Ce vendeur n'a pas encore d'annonces actives.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SellerProfilePage;
