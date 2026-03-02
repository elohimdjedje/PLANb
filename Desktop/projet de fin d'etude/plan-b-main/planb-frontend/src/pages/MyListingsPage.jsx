// MyListingsPage - User's listings dashboard
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, MoreVertical, Search, Globe } from 'lucide-react';
import { formatPrice, getImageUrl } from '../utils/helpers';

function MyListingsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('active');
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchMyListings = async () => {
            try {
                const { listingService } = await import('../services/api.js');
                const result = await listingService.getMyListings();
                if (result.ok) {
                    setListings(result.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching listings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMyListings();
    }, []);

    const filteredListings = listings.filter(l => {
        if (activeTab === 'active' && l.status !== 'active') return false;
        if (activeTab === 'sold' && l.status !== 'sold') return false;
        if (activeTab === 'draft' && l.status !== 'draft') return false;
        if (searchQuery && !l.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cette annonce ?')) return;
        try {
            const { listingService } = await import('../services/api.js');
            await listingService.delete(id);
            setListings(prev => prev.filter(l => l.id !== id));
        } catch (error) {
            console.error('Error deleting listing:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Mes annonces</h1>
                    <Link 
                        to="/publish"
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        <Plus className="w-5 h-5" />
                        Nouvelle annonce
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {[
                        { id: 'active', label: 'Actives' },
                        { id: 'sold', label: 'Vendues' },
                        { id: 'draft', label: 'Brouillons' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === tab.id 
                                    ? 'bg-orange-500 text-white' 
                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-500'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher dans mes annonces..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                        />
                    </div>
                </div>

                {/* Listings */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredListings.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        {filteredListings.map(listing => (
                            <div key={listing.id} className="p-4 border-b border-gray-100 flex items-center gap-4">
                                <img 
                                    src={getImageUrl(listing.mainImage || listing.images?.[0]?.url) || '/placeholder.jpg'}
                                    alt={listing.title}
                                    className="w-20 h-20 object-cover rounded-lg"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
                                    <p className="text-orange-500 font-bold">{formatPrice(listing.price)} FCFA</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" />
                                            {listing.viewsCount || 0} vues
                                        </span>
                                        {(listing.hasVirtualTour || listing.has360 || listing.virtualTour) && (
                                            <span className="flex items-center gap-1 text-purple-500 font-medium">
                                                <Globe className="w-4 h-4" />
                                                360°
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => navigate(`/listing/${listing.id}`)}
                                        className="p-2 text-gray-400 hover:text-blue-500"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/publish?edit=${listing.id}`)}
                                        className="p-2 text-gray-400 hover:text-orange-500"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(listing.id)}
                                        className="p-2 text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl">
                        <Plus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">Aucune annonce</p>
                        <Link 
                            to="/publish"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                        >
                            <Plus className="w-5 h-5" />
                            Publier une annonce
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyListingsPage;
