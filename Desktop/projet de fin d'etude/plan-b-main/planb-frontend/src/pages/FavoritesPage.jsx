// FavoritesPage - User's favorite listings
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import ListingCard from '../components/ui/ListingCard';

function FavoritesPage() {
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const { favoriteService } = await import('../services/api.js');
                const result = await favoriteService.getAll();
                if (result.ok) {
                    setFavorites(result.data.favorites?.map(f => f.listing) || []);
                }
            } catch (error) {
                console.error('Error fetching favorites:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes favoris</h1>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-200"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    <div className="flex justify-between items-center pt-2">
                                        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map(listing => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl">
                        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun favori</h2>
                        <p className="text-gray-500">
                            Cliquez sur le cœur des annonces pour les ajouter à vos favoris
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FavoritesPage;
