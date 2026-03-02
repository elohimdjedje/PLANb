// StatsPage - PRO user statistics dashboard
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Heart, MessageSquare, TrendingUp, ArrowUp, ArrowDown, Star } from 'lucide-react';
import { formatPrice, getImageUrl } from '../utils/helpers';

function StatsPage() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalViews: 0, activeListings: 0, totalContacts: 0, conversionRate: 0 });
    const [topListings, setTopListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        const checkProAndFetchStats = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user.accountType !== 'PRO') {
                    navigate('/upgrade');
                    return;
                }
                setIsPro(true);

                const { userStatsService } = await import('../services/api.js');
                const result = await userStatsService.getStats();
                if (result.ok) {
                    setStats(result.data.stats || stats);
                    setTopListings(result.data.topListings || []);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setIsLoading(false);
            }
        };
        checkProAndFetchStats();
    }, []);

    if (!isPro) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-600 text-sm font-medium rounded-full">
                        <Star className="w-4 h-4 fill-current" /> PRO
                    </span>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <Eye className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <span className="flex items-center gap-1 text-green-500 text-sm">
                                        <ArrowUp className="w-4 h-4" /> 12%
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">Vues totales</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                        <Heart className="w-6 h-6 text-red-500" />
                                    </div>
                                    <span className="flex items-center gap-1 text-green-500 text-sm">
                                        <ArrowUp className="w-4 h-4" /> 8%
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
                                <p className="text-sm text-gray-500">Annonces actives</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                        <MessageSquare className="w-6 h-6 text-green-500" />
                                    </div>
                                    <span className="flex items-center gap-1 text-green-500 text-sm">
                                        <ArrowUp className="w-4 h-4" /> 23%
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
                                <p className="text-sm text-gray-500">Contacts reçus</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-orange-500" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
                                <p className="text-sm text-gray-500">Taux de conversion</p>
                            </div>
                        </div>

                        {/* Top Listings */}
                        <div className="bg-white rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Annonces les plus vues</h2>
                            {topListings.length > 0 ? (
                                <div className="space-y-4">
                                    {topListings.map((listing, index) => (
                                        <div key={listing.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                            <span className="text-2xl font-bold text-gray-300">#{index + 1}</span>
                                            <img 
                                                src={getImageUrl(listing.mainImage) || '/placeholder.jpg'}
                                                alt={listing.title}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{listing.title}</p>
                                                <p className="text-sm text-orange-500 font-bold">{formatPrice(listing.price)} FCFA</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">{listing.viewsCount}</p>
                                                <p className="text-sm text-gray-500">vues</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default StatsPage;
