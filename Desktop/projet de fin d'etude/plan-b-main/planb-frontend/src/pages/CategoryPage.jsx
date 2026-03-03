// CategoryPage - Shows listings filtered by category
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, Hotel, Car, ArrowLeft } from 'lucide-react';
import ListingCard from '../components/ui/ListingCard';

const categoryConfig = {
    immobilier: {
        title: 'Immobilier',
        icon: Home,
        color: 'from-blue-500 to-blue-700',
        subcategories: ['Maison à vendre', 'Maison à louer', 'Appartement à vendre', 'Appartement à louer', 'Terrain', 'Bureau', 'Local commercial']
    },
    vacance: {
        title: 'Vacances',
        icon: Hotel,
        color: 'from-purple-500 to-purple-700',
        subcategories: ['Hôtel', 'Villa meublée', 'Appartement meublé', 'Résidence', 'Maison d\'hôtes']
    },
    vehicule: {
        title: 'Véhicules',
        icon: Car,
        color: 'from-teal-500 to-teal-700',
        subcategories: ['Voiture à vendre', 'Voiture à louer', 'Moto à vendre', 'Moto à louer', 'Camion', 'Engin']
    }
};

function CategoryPage() {
    const { categoryName } = useParams();
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const config = categoryConfig[categoryName] || categoryConfig.immobilier;
    const IconComponent = config.icon;

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const { listingService } = await import('../services/api.js');
                const result = await listingService.getAll({ category: categoryName, limit: 50 });
                if (result.ok) {
                    setListings(result.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching listings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchListings();
    }, [categoryName]);

    const filteredListings = selectedSubcategory 
        ? listings.filter(l => l.subcategory === selectedSubcategory)
        : listings;

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Hero */}
            <div className={`bg-gradient-to-br ${config.color} py-16`}>
                <div className="max-w-7xl mx-auto px-4">
                    <Link to="/annonces" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Retour aux annonces
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                            <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{config.title}</h1>
                            <p className="text-white/80">{filteredListings.length} annonces disponibles</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Subcategory Filter */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setSelectedSubcategory('')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            !selectedSubcategory 
                                ? 'bg-orange-500 text-white' 
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-500'
                        }`}
                    >
                        Toutes
                    </button>
                    {config.subcategories.map(sub => (
                        <button
                            key={sub}
                            onClick={() => setSelectedSubcategory(sub)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                selectedSubcategory === sub 
                                    ? 'bg-orange-500 text-white' 
                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-500'
                            }`}
                        >
                            {sub}
                        </button>
                    ))}
                </div>

                {/* Listings Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
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
                ) : filteredListings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredListings.map(listing => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <IconComponent className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucune annonce</h2>
                        <p className="text-gray-600">Aucune annonce dans cette catégorie pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CategoryPage;
