// MyReservationsPage - User reservations
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Check, X, Eye } from 'lucide-react';
import { formatPrice } from '../utils/helpers';

function MyReservationsPage() {
    const [activeTab, setActiveTab] = useState('visits'); // 'visits' par défaut pour les visites
    const [filter, setFilter] = useState('all');
    const [reservations, setReservations] = useState([]);
    const [visits, setVisits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                if (activeTab === 'visits') {
                    // Charger mes visites réservées
                    const { visitSlotService } = await import('../services/api.js');
                    const result = await visitSlotService.getMyBookings();
                    if (result.ok) {
                        setVisits(result.data.data || []);
                    } else {
                        setError(result.data?.error || 'Erreur de chargement');
                    }
                } else if (activeTab === 'my-slots') {
                    // Charger les créneaux que j'ai créés (propriétaire)
                    const { visitSlotService } = await import('../services/api.js');
                    const result = await visitSlotService.getMySlots();
                    if (result.ok) {
                        setVisits(result.data.data || []);
                    } else {
                        setError(result.data?.error || 'Erreur de chargement');
                    }
                } else {
                    // Charger les bookings (tenant/owner)
                    const { bookingService } = await import('../services/api.js');
                    const result = await bookingService.getMyBookings(activeTab);
                    if (result.ok) {
                        setReservations(result.data.data || []);
                    } else {
                        setError(result.data?.error || result.data?.message || 'Erreur de chargement');
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Impossible de charger les données');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
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
            active:    'bg-emerald-100 text-emerald-700',
            available: 'bg-green-100 text-green-700',
            booked:    'bg-blue-100 text-blue-700'
        };
        const labels = {
            pending:   'En attente',
            accepted:  'Acceptée',
            visited:   'Visite effectuée',
            confirmed: 'Confirmée',
            rejected:  'Refusée',
            cancelled: 'Annulée',
            completed: 'Terminée',
            active:    'En cours',
            available: 'Disponible',
            booked:    'Réservée'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.pending}`}>
                {labels[status] || status}
            </span>
        );
    };

    const isVisitsTab = activeTab === 'visits' || activeTab === 'my-slots';

    // Fonction pour gérer l'acceptation/rejet des réservations
    const handleBookingAction = async (bookingId, action) => {
        try {
            const { bookingService } = await import('../services/api.js');
            const result = await bookingService.updateStatus(bookingId, action);
            if (result.ok) {
                // Mettre à jour la liste
                setReservations(prev => prev.map(r => 
                    r.id === bookingId ? { ...r, status: action } : r
                ));
            } else {
                alert(result.data?.error || 'Erreur lors de la mise à jour');
            }
        } catch (err) {
            console.error('Error updating booking:', err);
            alert('Erreur lors de la mise à jour');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes réservations & visites</h1>

                {/* Role Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('visits')}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                            activeTab === 'visits' 
                                ? 'bg-orange-500 text-white' 
                                : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                    >
                        <Eye className="w-4 h-4 inline mr-2" />
                        Mes visites
                    </button>
                    <button
                        onClick={() => setActiveTab('my-slots')}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                            activeTab === 'my-slots' 
                                ? 'bg-orange-500 text-white' 
                                : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                    >
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Créneaux créés
                    </button>
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

                {/* Status Filter - only for bookings */}
                {!isVisitsTab && (
                    <div className="flex gap-2 mb-6">
                        {['all', 'pending', 'accepted', 'completed', 'cancelled'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filter === f 
                                        ? 'bg-gray-900 text-white' 
                                        : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                {f === 'all' ? 'Toutes' : f === 'pending' ? 'En attente' : f === 'accepted' ? 'Confirmées' : f === 'completed' ? 'Terminées' : 'Annulées'}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-200">
                        <p className="text-red-600 font-medium">⚠️ {error}</p>
                    </div>
                ) : isVisitsTab ? (
                    /* Visits List */
                    visits.length > 0 ? (
                        <div className="space-y-4">
                            {visits.map(visit => (
                                <div key={visit.id} className="bg-white rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Eye className="w-8 h-8 text-orange-500" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {visit.listingTitle || `Annonce #${visit.listingId}`}
                                                    </h3>
                                                    {visit.notes && (
                                                        <p className="text-sm text-gray-500 mt-1">{visit.notes}</p>
                                                    )}
                                                </div>
                                                {getStatusBadge(visit.status)}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {visit.date ? new Date(visit.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : '?'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {visit.startTime || '?'} - {visit.endTime || '?'}
                                                </span>
                                                {visit.bookedBy?.phone && (
                                                    <span className="text-gray-500">📞 {visit.bookedBy.phone}</span>
                                                )}
                                            </div>
                                            {visit.visitorMessage && (
                                                <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg italic">
                                                    "{visit.visitorMessage}"
                                                </p>
                                            )}
                                            {activeTab === 'my-slots' && visit.bookedBy && (
                                                <p className="mt-2 text-sm text-blue-600">
                                                    Réservé par: {visit.bookedBy.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl">
                            <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">
                                {activeTab === 'visits' ? 'Aucune visite réservée' : 'Aucun créneau créé'}
                            </p>
                        </div>
                    )
                ) : reservations.length > 0 ? (
                    /* Bookings List */
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
                                                {/* Afficher le demandeur pour le propriétaire */}
                                                {activeTab === 'owner' && reservation.tenant_name && (
                                                    <p className="text-sm text-blue-600 mt-1 font-medium">
                                                        👤 Demande de : {reservation.tenant_name}
                                                    </p>
                                                )}
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
                                        
                                        {/* Boutons d'action pour le propriétaire */}
                                        {activeTab === 'owner' && reservation.status === 'pending' && (
                                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleBookingAction(reservation.id, 'accepted')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Accepter
                                                </button>
                                                <button
                                                    onClick={() => handleBookingAction(reservation.id, 'rejected')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Refuser
                                                </button>
                                            </div>
                                        )}
                                        
                                        {/* Info pour le locataire si accepté */}
                                        {activeTab === 'tenant' && reservation.status === 'accepted' && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-sm text-green-600 font-medium">✓ Votre réservation a été acceptée par le propriétaire</p>
                                            </div>
                                        )}
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
