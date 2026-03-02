// SecureDepositsPage - Dashboard des cautions sécurisées
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Clock, CheckCircle, AlertTriangle, XCircle, ArrowRight, FileText, PenTool, CreditCard, Eye } from 'lucide-react';
import { formatPrice } from '../utils/helpers';

const STATUS_LABELS = {
    draft: 'Brouillon',
    signed_tenant: 'Signé par le locataire',
    signed_landlord: 'Signé par le propriétaire',
    pending_payment: 'En attente de paiement',
    active: 'Caution active',
    termination_requested: 'Résiliation demandée',
    admin_review: 'En cours de traitement',
    landlord_inspection: 'Inspection propriétaire',
    landlord_validated: 'Validé par le propriétaire',
    tenant_exit_validated: 'Signé par le locataire (sortie)',
    refund_processing: 'Remboursement en cours',
    completed: 'Terminée',
    dispute_open: 'Litige en cours',
    dispute_resolved: 'Litige résolu',
    cancelled: 'Annulée',
};

const STATUS_COLORS = {
    draft: 'bg-gray-100 text-gray-700',
    signed_tenant: 'bg-blue-100 text-blue-800',
    signed_landlord: 'bg-indigo-100 text-indigo-800',
    pending_payment: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    termination_requested: 'bg-orange-100 text-orange-800',
    admin_review: 'bg-purple-100 text-purple-800',
    landlord_inspection: 'bg-amber-100 text-amber-800',
    landlord_validated: 'bg-teal-100 text-teal-800',
    tenant_exit_validated: 'bg-cyan-100 text-cyan-800',
    refund_processing: 'bg-lime-100 text-lime-800',
    completed: 'bg-emerald-100 text-emerald-800',
    dispute_open: 'bg-red-100 text-red-800',
    dispute_resolved: 'bg-indigo-100 text-indigo-800',
    cancelled: 'bg-gray-100 text-gray-500',
};

const STATUS_ICONS = {
    draft: FileText,
    signed_tenant: PenTool,
    signed_landlord: PenTool,
    pending_payment: CreditCard,
    active: CheckCircle,
    termination_requested: Clock,
    admin_review: Eye,
    landlord_inspection: Eye,
    landlord_validated: CheckCircle,
    tenant_exit_validated: PenTool,
    refund_processing: Clock,
    completed: CheckCircle,
    dispute_open: AlertTriangle,
    dispute_resolved: FileText,
    cancelled: XCircle,
};

const TOTAL_STEPS = 12;

function MiniProgressBar({ currentStep }) {
    const pct = Math.round((currentStep / TOTAL_STEPS) * 100);
    return (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

function SecureDepositsPage() {
    const navigate = useNavigate();
    const [deposits, setDeposits] = useState([]);
    const [filter, setFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDeposits = async () => {
            try {
                const { secureDepositService } = await import('../services/api.js');
                const result = await secureDepositService.list();
                if (result.success === false) {
                    setError(result.error || 'Impossible de charger les cautions');
                } else {
                    setDeposits(result.data || []);
                }
            } catch (err) {
                console.error('Erreur chargement cautions:', err);
                setError('Impossible de charger les cautions');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDeposits();
    }, []);

    const filteredDeposits = filter === 'all'
        ? deposits
        : filter === 'signing'
        ? deposits.filter(d => ['draft', 'signed_tenant', 'signed_landlord'].includes(d.status))
        : filter === 'restitution'
        ? deposits.filter(d => ['termination_requested', 'admin_review', 'landlord_inspection', 'landlord_validated', 'tenant_exit_validated', 'refund_processing'].includes(d.status))
        : deposits.filter(d => d.status === filter);

    const activeCount = deposits.filter(d => d.status === 'active').length;
    const signingCount = deposits.filter(d => ['draft', 'signed_tenant', 'signed_landlord', 'pending_payment'].includes(d.status)).length;
    const disputeCount = deposits.filter(d => d.status === 'dispute_open').length;
    const totalEscrowed = deposits
        .filter(d => ['active', 'termination_requested', 'admin_review', 'landlord_inspection', 'landlord_validated', 'tenant_exit_validated', 'refund_processing', 'dispute_open'].includes(d.status))
        .reduce((sum, d) => sum + parseFloat(d.escrowed_amount || 0), 0);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des cautions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="w-7 h-7 text-orange-500" />
                            Mes Cautions Sécurisées
                        </h1>
                        <p className="text-gray-500 mt-1">Gérez vos dépôts de garantie en toute sécurité</p>
                    </div>
                    <Link
                        to="/cgu-caution"
                        className="text-sm text-orange-600 hover:text-orange-700 underline"
                    >
                        Conditions Générales
                    </Link>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <PenTool className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">En signature</p>
                                <p className="text-xl font-bold text-gray-900">{signingCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Shield className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Actives</p>
                                <p className="text-xl font-bold text-gray-900">{activeCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Litiges</p>
                                <p className="text-xl font-bold text-gray-900">{disputeCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total sécurisé</p>
                                <p className="text-lg font-bold text-gray-900">{formatPrice(totalEscrowed)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        { key: 'all', label: 'Toutes' },
                        { key: 'signing', label: 'En signature' },
                        { key: 'active', label: 'Actives' },
                        { key: 'restitution', label: 'Restitution' },
                        { key: 'dispute_open', label: 'Litiges' },
                        { key: 'completed', label: 'Terminées' },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                filter === f.key
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700">
                        {error}
                    </div>
                )}

                {/* Deposit List */}
                {filteredDeposits.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            {filter === 'all' ? 'Aucune caution' : 'Aucune caution dans cette catégorie'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Vos cautions sécurisées apparaîtront ici lorsqu&apos;une location sera initiée.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredDeposits.map(deposit => {
                            const StatusIcon = STATUS_ICONS[deposit.status] || Shield;
                            const step = deposit.current_step || 0;
                            return (
                                <div
                                    key={deposit.id}
                                    onClick={() => navigate(`/escrow/${deposit.id}`)}
                                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-orange-200"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <StatusIcon className="w-5 h-5 text-gray-400" />
                                                <h3 className="font-semibold text-gray-900">
                                                    {deposit.property_description || 'Logement'}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[deposit.status] || 'bg-gray-100 text-gray-800'}`}>
                                                    {STATUS_LABELS[deposit.status] || deposit.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-1">
                                                {deposit.property_address || ''}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>
                                                    {deposit.property_type === 'maison' ? '🏠 Maison' : deposit.property_type === 'appartement' ? '🏢 Appartement' : deposit.property_type === 'bureau' ? '🏬 Bureau' : '🚗 Véhicule'}
                                                </span>
                                                <span className="text-xs text-gray-400">Étape {step}/12</span>
                                            </div>
                                            <MiniProgressBar currentStep={step} />
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-lg font-bold text-gray-900">
                                                {formatPrice(deposit.deposit_amount || 0)} FCFA
                                            </p>
                                            <p className="text-xs text-gray-400">Caution</p>
                                            <ArrowRight className="w-5 h-5 text-gray-400 mt-2 ml-auto" />
                                        </div>
                                    </div>

                                    {/* Contextual messages */}
                                    {deposit.status === 'dispute_open' && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-2 text-sm text-red-600">
                                                <AlertTriangle className="w-4 h-4" />
                                                <span>Litige en cours — action requise</span>
                                            </div>
                                        </div>
                                    )}
                                    {deposit.status === 'signed_tenant' && deposit.is_landlord && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-2 text-sm text-blue-600">
                                                <PenTool className="w-4 h-4" />
                                                <span>En attente de votre signature</span>
                                            </div>
                                        </div>
                                    )}
                                    {deposit.status === 'pending_payment' && deposit.is_tenant && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-2 text-sm text-yellow-600">
                                                <CreditCard className="w-4 h-4" />
                                                <span>Contrat signé — Paiement en attente</span>
                                            </div>
                                        </div>
                                    )}
                                    {deposit.status === 'landlord_validated' && deposit.is_tenant && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-2 text-sm text-teal-600">
                                                <PenTool className="w-4 h-4" />
                                                <span>Le propriétaire a validé — signez la restitution</span>
                                            </div>
                                        </div>
                                    )}
                                    {deposit.status === 'landlord_inspection' && deposit.is_landlord && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-2 text-sm text-amber-600">
                                                <Eye className="w-4 h-4" />
                                                <span>Inspection requise — validez et signez</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SecureDepositsPage;
