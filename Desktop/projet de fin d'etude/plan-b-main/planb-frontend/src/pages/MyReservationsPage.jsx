// MyReservationsPage - User reservations
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Check, X } from 'lucide-react';
import { formatPrice } from '../utils/helpers';

function MyReservationsPage() {
    const [activeTab, setActiveTab] = useState('tenant');
    const [filter, setFilter] = useState('all');
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReservations = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const { bookingService } = await import('../services/api.js');
                const result = await bookingService.getMyBookings(activeTab);
                if (result.ok) {
                    setReservations(result.data.data || []);
                } else {
                    setError(result.data?.error || result.data?.message || 'Erreur de chargement');
                }
            } catch (err) {
                console.error('Error fetching reservations:', err);
                setError('Impossible de charger les réservations');
            } finally {
                setIsLoading(false);
            }
        };
        fetchReservations();
    }, [activeTab]);

    const getStatusBadge = (status) => {
        const styles = {
            pending:   'bg-yellow-100 text-yellow-700',
            accepted:  'bg-blue-100 text-blue-700',
            visited:   'bg-purple-100 text-purple-700',
            confirmed: 'bg-green-100 text-green-700',
            rejected:  'bg-red-100 text-red-700',
            cancelled: 'bg-red-100 text-red-700',
            completed: 'bg-gray-100 text-gray-700',
            active:    'bg-emerald-100 text-emerald-700'
        };
        const labels = {
            pending:   'En attente',
            accepted:  'Acceptée',
            visited:   'Visite effectuée',
            confirmed: 'Confirmée',
            rejected:  'Refusée',
            cancelled: 'Annulée',
            completed: 'Terminée',
            active:    'En cours'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.pending}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes réservations</h1>

                {/* Role Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('tenant')}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                            activeTab === 'tenant' 
                                ? 'bg-orange-500 text-white' 
                                : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                    >
                        Mes réservations
                    </button>
                    <button
                        onClick={() => setActiveTab('owner')}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                            activeTab === 'owner' 
                                ? 'bg-orange-500 text-white' 
                                : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                    >
                        Demandes reçues
                    </button>
                </div>

                {/* Status Filter */}
                <div className="flex gap-2 mb-6">
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === f 
                                    ? 'bg-gray-900 text-white' 
                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            {f === 'all' ? 'Toutes' : f === 'pending' ? 'En attente' : f === 'confirmed' ? 'Confirmées' : f === 'completed' ? 'Terminées' : 'Annulées'}
                        </button>
                    ))}
                </div>

                {/* Reservations List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-200">
                        <p className="text-red-600 font-medium">⚠️ {error}</p>
                    </div>
                ) : reservations.length > 0 ? (
                    <div className="space-y-4">
                        {reservations
                            .filter(r => filter === 'all' || r.status === filter)
                            .map(reservation => (
                            <div key={reservation.id} className="bg-white rounded-2xl p-6 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <img 
                                        src={reservation.listing_image || '/placeholder.jpg'}
                                        alt={reservation.listing_title}
                                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{reservation.listing_title || 'Annonce'}</h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {[reservation.listing_city, reservation.listing_country].filter(Boolean).join(', ') || '—'}
                                                </p>
                                            </div>
                                            {getStatusBadge(reservation.status)}
                                        </div>
                                        <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {reservation.start_date ? new Date(reservation.start_date).toLocaleDateString('fr-FR') : '?'}
                                                {' — '}
                                                {reservation.end_date ? new Date(reservation.end_date).toLocaleDateString('fr-FR') : '?'}
                                            </span>
                                            <span className="font-bold text-orange-500">
                                                {formatPrice(reservation.total_amount)} FCFA
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Aucune réservation</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyReservationsPage;
