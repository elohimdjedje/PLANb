import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Eye, Heart, MessageSquare, TrendingUp, ArrowLeft, 
    Calendar, Users, Globe, BarChart3
} from 'lucide-react';
import { statisticsService } from '../services/api';

function ListingStatsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const result = await statisticsService.getListingStats(id);
                if (result.ok) {
                    setStats(result.data.stats);
                } else {
                    setError(result.data.error || 'Erreur lors du chargement des statistiques');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchStats();
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 text-orange-500 hover:text-orange-600 font-medium"
                        >
                            Retour
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Statistiques de l'annonce</h1>
                            <p className="text-gray-500 mt-1">Analyse détaillée des performances</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Views */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Eye className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.views.total.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">Vues totales</p>
                        <p className="text-xs text-gray-400 mt-2">
                            {stats.views.uniqueUsers} utilisateurs uniques
                        </p>
                    </div>

                    {/* Contacts */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.contacts.total.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">Contacts</p>
                        <p className="text-xs text-gray-400 mt-2">
                            Taux de conversion: {stats.performance.conversionRate}%
                        </p>
                    </div>

                    {/* Favorites */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <Heart className="w-6 h-6 text-red-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.favorites.total.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">Favoris</p>
                    </div>

                    {/* Last 7 Days */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-orange-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.views.last7Days.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">Vues (7 jours)</p>
                        <p className="text-xs text-gray-400 mt-2">
                            {stats.performance.viewsPerDay} vues/jour en moyenne
                        </p>
                    </div>
                </div>

                {/* Detailed Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Views Breakdown */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Détails des vues
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Eye className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-700">Vues totales</span>
                                </div>
                                <span className="font-bold text-gray-900">{stats.views.total.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-700">Utilisateurs uniques</span>
                                </div>
                                <span className="font-bold text-gray-900">{stats.views.uniqueUsers.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-700">Adresses IP uniques</span>
                                </div>
                                <span className="font-bold text-gray-900">{stats.views.uniqueIps.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-700">Vues (7 derniers jours)</span>
                                </div>
                                <span className="font-bold text-gray-900">{stats.views.last7Days.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Métriques de performance
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-700">Taux de conversion</span>
                                    <span className="font-bold text-gray-900">{stats.performance.conversionRate}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-green-500 h-2 rounded-full transition-all"
                                        style={{ width: `${Math.min(stats.performance.conversionRate, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Contacts / Vues × 100
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-700">Vues par jour (moyenne)</span>
                                    <span className="font-bold text-gray-900">{stats.performance.viewsPerDay}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Basé sur les 7 derniers jours
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ListingStatsPage;
