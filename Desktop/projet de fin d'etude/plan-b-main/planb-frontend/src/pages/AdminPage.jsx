// AdminPage - Admin dashboard
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutGrid, Users, FileText, TrendingUp, Shield, Check, X, 
    Eye, Trash2, Search, ChevronDown, LogOut, Home, BadgeCheck, Clock, Zap, XCircle, CheckCircle, AlertCircle
} from 'lucide-react';
import { formatPrice, getImageUrl } from '../utils/helpers';
import { scopeVerificationService, verificationService } from '../services/api';

function AdminPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ listings: 0, users: 0, pending: 0, revenue: 0 });
    const [listings, setListings] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    // Verification state
    const [verificationRequests, setVerificationRequests] = useState([]);
    const [verificationStats, setVerificationStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [verificationFilter, setVerificationFilter] = useState('pending');
    const [viewingDocuments, setViewingDocuments] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(null);
    const [certifyManualUserId, setCertifyManualUserId] = useState('');

    useEffect(() => {
        const checkAdminAndFetch = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (!user.roles?.includes('ROLE_ADMIN') && !user.isAdmin) {
                    navigate('/');
                    return;
                }
                setIsAdmin(true);

                const { adminService } = await import('../services/api.js');
                const [statsResult, listingsResult, usersResult] = await Promise.all([
                    adminService.getStats(),
                    adminService.getListings(),
                    adminService.getUsers()
                ]);

                if (statsResult.ok && statsResult.data.dashboard) {
                    const d = statsResult.data.dashboard;
                    setStats({
                        listings: d.listings?.total || 0,
                        users: d.users?.total || 0,
                        pending: d.payments?.pending || 0,
                        revenue: d.revenue?.total || 0
                    });
                }
                if (listingsResult.ok) setListings(listingsResult.data.listings || listingsResult.data.data || []);
                if (usersResult.ok) setUsers(usersResult.data.users || usersResult.data.data || []);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };
        checkAdminAndFetch();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const approveListing = async (id) => {
        try {
            const { adminService } = await import('../services/api.js');
            await adminService.approveListing(id);
            setListings(prev => prev.map(l => l.id === id ? {...l, status: 'approved'} : l));
        } catch (error) {
            console.error('Error approving:', error);
        }
    };

    const deleteListing = async (id) => {
        if (!confirm('Supprimer cette annonce ?')) return;
        try {
            const { adminService } = await import('../services/api.js');
            await adminService.deleteListing(id);
            setListings(prev => prev.filter(l => l.id !== id));
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    // ========== VERIFICATION FUNCTIONS ==========
    const loadVerificationRequests = async () => {
        const result = await scopeVerificationService.adminGetPendingScopes();
        if (result.ok) {
            setVerificationRequests(result.data.verifications || []);
            setVerificationStats({ pending: result.data.count || 0, approved: 0, rejected: 0 });
        }
    };

    const handleViewDocuments = async (requestId) => {
        // Les documents sont déjà inclus dans la vérification
        const vr = verificationRequests.find(v => v.id === requestId);
        if (vr) {
            setViewingDocuments({
                requestId,
                scopeKey: vr.scopeKey,
                scopeDisplayName: vr.scopeDisplayName,
                documents: vr.documents || []
            });
        }
    };

    const handleApprove = async (requestId) => {
        if (!confirm('Certifier cet utilisateur pour ce scope ?')) return;
        const result = await scopeVerificationService.adminApproveScope(requestId);
        if (result.ok) {
            alert(result.data.message || 'Certification approuvée');
            loadVerificationRequests();
            setViewingDocuments(null);
        } else {
            alert(result.data?.error || 'Erreur');
        }
    };

    const handleReject = async (requestId) => {
        if (!rejectReason.trim()) {
            alert('Veuillez saisir un motif de rejet');
            return;
        }
        const result = await scopeVerificationService.adminRejectScope(requestId, rejectReason);
        if (result.ok) {
            alert(result.data.message || 'Demande rejetée');
            setShowRejectModal(null);
            setRejectReason('');
            loadVerificationRequests();
        } else {
            alert(result.data?.error || 'Erreur');
        }
    };

    const handleCertifyManual = async () => {
        if (!certifyManualUserId) return;
        const result = await verificationService.adminCertifyManual(certifyManualUserId);
        if (result.ok) {
            alert(result.data.message);
            setCertifyManualUserId('');
            loadVerificationRequests();
        } else {
            alert(result.data?.error || 'Erreur');
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 text-white">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold">PlanB Admin</p>
                            <p className="text-xs text-gray-400">Dashboard</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {[
                            { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard' },
                            { id: 'verifications', icon: BadgeCheck, label: 'Vérifications', badge: verificationStats.pending || null },
                            { id: 'listings', icon: FileText, label: 'Annonces' },
                            { id: 'users', icon: Users, label: 'Utilisateurs' },
                            { id: 'stats', icon: TrendingUp, label: 'Statistiques' }
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    if (item.id === 'verifications') loadVerificationRequests();
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    activeTab === item.id 
                                        ? 'bg-orange-500 text-white' 
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                                {item.badge > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-orange-400 hover:text-orange-300 hover:bg-gray-800 rounded-lg"
                    >
                        <Home className="w-5 h-5" />
                        Retour au site
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                    >
                        <LogOut className="w-5 h-5" />
                        Déconnexion
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-64 p-8">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* Dashboard */}
                        {activeTab === 'dashboard' && (
                            <>
                                <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <div className="bg-white rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <FileText className="w-6 h-6 text-blue-500" />
                                            </div>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{stats.listings || listings.length}</p>
                                        <p className="text-sm text-gray-500">Annonces totales</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                                <Users className="w-6 h-6 text-green-500" />
                                            </div>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{stats.users || users.length}</p>
                                        <p className="text-sm text-gray-500">Utilisateurs</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                                <TrendingUp className="w-6 h-6 text-yellow-500" />
                                            </div>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{stats.pending || 0}</p>
                                        <p className="text-sm text-gray-500">En attente</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                                <Shield className="w-6 h-6 text-orange-500" />
                                            </div>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.revenue || 0)}</p>
                                        <p className="text-sm text-gray-500">Revenus FCFA</p>
                                    </div>
                                </div>

                                {/* Recent Listings */}
                                <div className="bg-white rounded-2xl p-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4">Annonces récentes</h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left text-sm text-gray-500 border-b">
                                                    <th className="pb-3">Annonce</th>
                                                    <th className="pb-3">Catégorie</th>
                                                    <th className="pb-3">Prix</th>
                                                    <th className="pb-3">Statut</th>
                                                    <th className="pb-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {listings.slice(0, 5).map(listing => (
                                                    <tr key={listing.id} className="border-b border-gray-100">
                                                        <td className="py-4">
                                                            <div className="flex items-center gap-3">
                                                                <img 
                                                                    src={getImageUrl(listing.mainImage) || '/placeholder.jpg'}
                                                                    alt=""
                                                                    className="w-10 h-10 object-cover rounded"
                                                                />
                                                                <span className="font-medium truncate max-w-[200px]">{listing.title}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 text-gray-500">{listing.category}</td>
                                                        <td className="py-4 font-medium">{formatPrice(listing.price)} FCFA</td>
                                                        <td className="py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                listing.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                listing.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                                {listing.status || 'active'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4">
                                                            <div className="flex gap-2">
                                                                <button 
                                                                    onClick={() => navigate(`/listing/${listing.id}`)}
                                                                    className="p-1 text-gray-400 hover:text-blue-500"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => approveListing(listing.id)}
                                                                    className="p-1 text-gray-400 hover:text-green-500"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => deleteListing(listing.id)}
                                                                    className="p-1 text-gray-400 hover:text-red-500"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Listings Tab */}
                        {activeTab === 'listings' && (
                            <>
                                <div className="flex items-center justify-between mb-8">
                                    <h1 className="text-2xl font-bold text-gray-900">Gestion des annonces</h1>
                                    <div className="flex gap-2">
                                        <select className="px-4 py-2 border border-gray-200 rounded-lg">
                                            <option>Tous les statuts</option>
                                            <option>Actives</option>
                                            <option>En attente</option>
                                            <option>Expirées</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left text-sm text-gray-500 border-b">
                                                    <th className="pb-3">Annonce</th>
                                                    <th className="pb-3">Propriétaire</th>
                                                    <th className="pb-3">Catégorie</th>
                                                    <th className="pb-3">Prix</th>
                                                    <th className="pb-3">Statut</th>
                                                    <th className="pb-3">Vues</th>
                                                    <th className="pb-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {listings.map(listing => (
                                                    <tr key={listing.id} className="border-b border-gray-100">
                                                        <td className="py-4">
                                                            <div className="flex items-center gap-3">
                                                                <img 
                                                                    src={getImageUrl(listing.mainImage) || '/placeholder.jpg'}
                                                                    alt=""
                                                                    className="w-12 h-12 object-cover rounded"
                                                                />
                                                                <div>
                                                                    <p className="font-medium">{listing.title}</p>
                                                                    <p className="text-xs text-gray-500">{listing.city}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 text-gray-600">{listing.user?.firstName || 'N/A'}</td>
                                                        <td className="py-4 text-gray-600">{listing.category}</td>
                                                        <td className="py-4 font-medium">{formatPrice(listing.price)}</td>
                                                        <td className="py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                listing.status === 'active' ? 'bg-green-100 text-green-700' :
                                                                listing.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                listing.status === 'expired' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                                {listing.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 text-gray-600">{listing.viewsCount || 0}</td>
                                                        <td className="py-4">
                                                            <div className="flex gap-2">
                                                                <button 
                                                                    onClick={() => navigate(`/listing/${listing.id}`)}
                                                                    className="p-1 text-gray-400 hover:text-blue-500"
                                                                    title="Voir"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                                {listing.status === 'pending' && (
                                                                    <button 
                                                                        onClick={() => approveListing(listing.id)}
                                                                        className="p-1 text-gray-400 hover:text-green-500"
                                                                        title="Approuver"
                                                                    >
                                                                        <Check className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                                <button 
                                                                    onClick={() => deleteListing(listing.id)}
                                                                    className="p-1 text-gray-400 hover:text-red-500"
                                                                    title="Supprimer"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {listings.length === 0 && (
                                        <div className="text-center py-12 text-gray-500">
                                            Aucune annonce trouvée
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <>
                                <div className="flex items-center justify-between mb-8">
                                    <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
                                </div>
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left text-sm text-gray-500 border-b">
                                                    <th className="pb-3">Utilisateur</th>
                                                    <th className="pb-3">Email</th>
                                                    <th className="pb-3">Type</th>
                                                    <th className="pb-3">Annonces</th>
                                                    <th className="pb-3">Statut</th>
                                                    <th className="pb-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map(user => (
                                                    <tr key={user.id} className="border-b border-gray-100">
                                                        <td className="py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                                    <Users className="w-5 h-5 text-gray-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                                                                    <p className="text-xs text-gray-500">{user.phone || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 text-gray-600">{user.email}</td>
                                                        <td className="py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                user.accountType === 'PRO' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                                {user.accountType}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 text-gray-600">{user.listingsCount || 0}</td>
                                                        <td className="py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                user.isActive !== false ? 'bg-green-100 text-green-700' :
                                                                'bg-red-100 text-red-700'
                                                            }`}>
                                                                {user.isActive !== false ? 'Actif' : 'Suspendu'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4">
                                                            <div className="flex gap-2">
                                                                <button 
                                                                    onClick={() => navigate(`/seller/${user.id}`)}
                                                                    className="p-1 text-gray-400 hover:text-blue-500"
                                                                    title="Voir profil"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {users.length === 0 && (
                                        <div className="text-center py-12 text-gray-500">
                                            Aucun utilisateur trouvé
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Stats Tab */}
                        {activeTab === 'stats' && (
                            <>
                                <h1 className="text-2xl font-bold text-gray-900 mb-8">Statistiques détaillées</h1>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                                        <h2 className="text-lg font-bold text-gray-900 mb-4">Annonces</h2>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total</span>
                                                <span className="font-bold">{stats.listings || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Actives</span>
                                                <span className="font-bold text-green-600">{stats.activeListings || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Expirées</span>
                                                <span className="font-bold text-red-600">{stats.expiredListings || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                                        <h2 className="text-lg font-bold text-gray-900 mb-4">Utilisateurs</h2>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total</span>
                                                <span className="font-bold">{stats.users || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Gratuits</span>
                                                <span className="font-bold">{stats.freeUsers || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">PRO</span>
                                                <span className="font-bold text-orange-600">{stats.proUsers || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                                        <h2 className="text-lg font-bold text-gray-900 mb-4">Revenus</h2>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total</span>
                                                <span className="font-bold text-green-600">{formatPrice(stats.revenue || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                                        <h2 className="text-lg font-bold text-gray-900 mb-4">En attente</h2>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Annonces</span>
                                                <span className="font-bold text-yellow-600">{stats.pending || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Verifications Tab */}
                        {activeTab === 'verifications' && (
                            <>
                                <div className="flex items-center justify-between mb-8">
                                    <h1 className="text-2xl font-bold text-gray-900">Certifications par Scope</h1>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full">
                                            <Clock className="w-4 h-4 text-yellow-500" />
                                            <span className="text-sm font-medium text-yellow-700">{verificationStats.pending} en attente</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions + Refresh */}
                                <div className="flex flex-wrap items-center gap-4 mb-6">
                                    <button
                                        onClick={() => loadVerificationRequests()}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Rafraîchir
                                    </button>

                                    <div className="flex items-center gap-2 ml-auto">
                                        <input
                                            type="number"
                                            placeholder="ID utilisateur"
                                            value={certifyManualUserId}
                                            onChange={(e) => setCertifyManualUserId(e.target.value)}
                                            className="w-40 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                        />
                                        <button
                                            onClick={handleCertifyManual}
                                            disabled={!certifyManualUserId}
                                            className="flex items-center gap-1 px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-50"
                                        >
                                            <Zap className="w-4 h-4" />
                                            Certifier sans doc
                                        </button>
                                    </div>
                                </div>

                                {/* Liste des demandes */}
                                {verificationRequests.length === 0 ? (
                                    <div className="bg-white rounded-2xl p-12 text-center">
                                        <BadgeCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">Aucune demande en attente</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {verificationRequests.map(vr => (
                                            <div key={vr.id} className="bg-white rounded-xl p-6 shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                        {vr.scopeIcon || vr.user?.firstName?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-gray-900">{vr.user?.firstName} {vr.user?.lastName}</p>
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                                vr.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                                vr.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                                {vr.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                                                                {vr.status === 'APPROVED' && <CheckCircle className="w-3.5 h-3.5" />}
                                                                {vr.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                                                                {vr.status === 'PENDING' ? 'En attente' : vr.status === 'APPROVED' ? 'Certifié' : 'Rejeté'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500">
                                                            {vr.user?.email} · Scope : <strong>{vr.scopeDisplayName || vr.scopeKey}</strong>
                                                            {vr.rejectionCount > 0 && ` · ${vr.rejectionCount} rejet(s)`}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            Soumis le {new Date(vr.submittedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleViewDocuments(vr.id)}
                                                            className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            {vr.documents?.length || 0} Doc(s)
                                                        </button>
                                                        {vr.status === 'PENDING' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(vr.id)}
                                                                    className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                    Certifier
                                                                </button>
                                                                <button
                                                                    onClick={() => { setShowRejectModal(vr.id); setRejectReason(''); }}
                                                                    className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                    Rejeter
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Modal Voir Documents */}
                                {viewingDocuments && (
                                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    Documents - Demande #{viewingDocuments.requestId}
                                                </h3>
                                                <button onClick={() => setViewingDocuments(null)} className="text-gray-400 hover:text-gray-600">
                                                    <X className="w-6 h-6" />
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4">Scope : <strong>{viewingDocuments.scopeDisplayName || viewingDocuments.scopeKey}</strong></p>
                                            {viewingDocuments.documents?.length === 0 ? (
                                                <p className="text-gray-400 text-center py-8">Aucun document soumis</p>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {viewingDocuments.documents?.map((doc, idx) => (
                                                        <div key={doc.id || idx} className="border border-gray-200 rounded-xl p-4">
                                                            <p className="font-medium text-gray-700 mb-2">{doc.docType}</p>
                                                            <p className="text-xs text-gray-500 mb-2">{doc.fileName}</p>
                                                            {doc.fileUrl ? (
                                                                doc.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                                    <img src={doc.fileUrl} alt={doc.docType} className="w-full rounded-lg max-h-64 object-contain bg-gray-50" />
                                                                ) : (
                                                                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                                                                        Voir le document
                                                                    </a>
                                                                )
                                                            ) : (
                                                                <p className="text-gray-400 text-sm">Document non disponible</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Modal Rejet */}
                                {showRejectModal && (
                                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                        <div className="bg-white rounded-2xl w-full max-w-md p-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">Rejeter la demande</h3>
                                            <textarea
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                                placeholder="Motif du rejet (obligatoire)..."
                                                className="w-full p-3 border border-gray-200 rounded-xl min-h-[100px] focus:outline-none focus:border-orange-500 mb-4"
                                            />
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setShowRejectModal(null)}
                                                    className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50"
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={() => handleReject(showRejectModal)}
                                                    disabled={!rejectReason.trim()}
                                                    className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50"
                                                >
                                                    Confirmer le rejet
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminPage;
