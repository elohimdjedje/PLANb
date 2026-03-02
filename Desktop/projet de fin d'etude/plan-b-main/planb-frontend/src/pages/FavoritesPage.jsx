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
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
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
