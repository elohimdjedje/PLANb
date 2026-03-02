// DepositDetailPage - Détail et actions d'une caution sécurisée (workflow complet)
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Shield, Clock, CheckCircle, AlertTriangle, XCircle, ArrowLeft,
    Download, FileText, DollarSign, User, Home, Car, Building2,
    CreditCard, Phone, PenTool, Eye, Send, ClipboardCheck
} from 'lucide-react';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

// ============== 14 STATUS CONFIG ==============
const STATUS_LABELS = {
    draft: 'Brouillon — En attente de signatures',
    signed_tenant: 'Signé par le locataire',
    signed_landlord: 'Signé par le propriétaire',
    pending_payment: 'Contrat signé — En attente de paiement',
    active: 'Caution active',
    termination_requested: 'Résiliation demandée',
    admin_review: 'En cours de traitement par l\'admin',
    landlord_inspection: 'Inspection par le propriétaire',
    landlord_validated: 'Validé par le propriétaire',
    tenant_exit_validated: 'Signé par le locataire (sortie)',
    refund_processing: 'Remboursement en cours',
    completed: 'Terminée',
    dispute_open: 'Litige en cours',
    dispute_resolved: 'Litige résolu',
    cancelled: 'Annulée',
};

const STATUS_COLORS = {
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    signed_tenant: 'bg-blue-100 text-blue-800 border-blue-200',
    signed_landlord: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    pending_payment: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    termination_requested: 'bg-orange-100 text-orange-800 border-orange-200',
    admin_review: 'bg-purple-100 text-purple-800 border-purple-200',
    landlord_inspection: 'bg-amber-100 text-amber-800 border-amber-200',
    landlord_validated: 'bg-teal-100 text-teal-800 border-teal-200',
    tenant_exit_validated: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    refund_processing: 'bg-lime-100 text-lime-800 border-lime-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dispute_open: 'bg-red-100 text-red-800 border-red-200',
    dispute_resolved: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

// ============== 12-STEP PROGRESS ==============
const STEP_LABELS = [
    { step: 1, label: 'Création contrat', icon: FileText },
    { step: 2, label: 'Signature locataire', icon: PenTool },
    { step: 3, label: 'Signature propriétaire', icon: PenTool },
    { step: 4, label: 'Validation admin', icon: Shield },
    { step: 5, label: 'Paiement caution', icon: CreditCard },
    { step: 6, label: 'Caution active', icon: CheckCircle },
    { step: 7, label: 'Demande résiliation', icon: Send },
    { step: 8, label: 'Revue admin', icon: Eye },
    { step: 9, label: 'Inspection propriétaire', icon: ClipboardCheck },
    { step: 10, label: 'Signature locataire (sortie)', icon: PenTool },
    { step: 11, label: 'Validation finale admin', icon: Shield },
    { step: 12, label: 'Remboursement', icon: DollarSign },
];

function ProgressStepper({ currentStep }) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 overflow-x-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Progression du contrat</h3>
            <div className="flex items-start gap-0 min-w-[700px]">
                {STEP_LABELS.map(({ step, label, icon: Icon }, idx) => {
                    const isDone = step < currentStep;
                    const isCurrent = step === currentStep;
                    const isFuture = step > currentStep;
                    return (
                        <div key={step} className="flex items-center flex-1">
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    isDone ? 'bg-green-500 text-white' :
                                    isCurrent ? 'bg-orange-500 text-white ring-4 ring-orange-200' :
                                    'bg-gray-200 text-gray-400'
                                }`}>
                                    {isDone ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                                </div>
                                <span className={`text-[10px] mt-1 leading-tight max-w-[70px] ${
                                    isCurrent ? 'font-bold text-orange-600' : isDone ? 'text-green-600' : 'text-gray-400'
                                }`}>{label}</span>
                            </div>
                            {idx < STEP_LABELS.length - 1 && (
                                <div className={`flex-1 h-0.5 mt-4 mx-1 ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============== SIGNATURE VISUAL ==============
function SignatureCard({ title, name, signedAt, color = 'blue' }) {
    const bg = color === 'orange' ? 'bg-orange-50' : color === 'purple' ? 'bg-purple-50' : 'bg-blue-50';
    const textColor = color === 'orange' ? 'text-orange-600' : color === 'purple' ? 'text-purple-600' : 'text-blue-600';
    return (
        <div className={`p-4 ${bg} rounded-xl`}>
            <p className={`text-xs ${textColor} font-semibold uppercase mb-2`}>{title}</p>
            <p className="font-semibold text-gray-900">{name || '—'}</p>
            {signedAt ? (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Signé le {new Date(signedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
            ) : (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> En attente de signature
                </p>
            )}
        </div>
    );
}

// ============== MAIN COMPONENT ==============
function DepositDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [deposit, setDeposit] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    // Forms
    const [showDisputeForm, setShowDisputeForm] = useState(false);
    const [showPayoutForm, setShowPayoutForm] = useState(false);
    const [inspectionNotes, setInspectionNotes] = useState('');
    const [disputeData, setDisputeData] = useState({ damage_description: '', estimated_cost: '' });
    const [disputeResponse, setDisputeResponse] = useState({ comment: '' });
    const [payoutData, setPayoutData] = useState({ tenant_payout_method: 'mobile_money', tenant_payout_phone: '', landlord_payout_method: 'mobile_money', landlord_payout_phone: '' });

    const fetchDeposit = useCallback(async () => {
        try {
            const { secureDepositService } = await import('../services/api.js');
            const result = await secureDepositService.get(id);
            if (result.success === false) {
                toast.error(result.error || 'Impossible de charger la caution');
                setDeposit(null);
            } else {
                setDeposit(result.data || null);
            }
        } catch (err) {
            console.error('Erreur:', err);
            toast.error('Impossible de charger la caution');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDeposit();
    }, [fetchDeposit]);

    // ============== GENERIC ACTION HANDLER ==============
    const handleAction = async (actionName, actionFn, successMsg) => {
        setActionLoading(actionName);
        try {
            const { secureDepositService } = await import('../services/api.js');
            const result = await actionFn(secureDepositService);
            // _call() ne throw jamais — vérifier le champ success
            if (result && result.success === false) {
                toast.error(result.error || 'Erreur lors de l\'action');
            } else {
                toast.success(successMsg || 'Action effectuée avec succès');
                await fetchDeposit();
            }
        } catch (err) {
            console.error(`Erreur ${actionName}:`, err);
            toast.error(err.response?.data?.error || 'Erreur lors de l\'action');
        } finally {
            setActionLoading(null);
        }
    };

    // ============== ACTION HANDLERS ==============
    const handleSignLandlord = () => handleAction('signLandlord', (svc) => svc.signLandlord(id), 'Contrat signé par le propriétaire');
    const handleSignAdmin = () => handleAction('signAdmin', (svc) => svc.signAdmin(id), 'Contrat validé par l\'admin');
    const handleConfirmPayment = () => handleAction('confirmPayment', (svc) => svc.confirmPayment(id, {
        payment_method: 'mobile_money', payment_provider: 'paytech', transaction_id: `TXN_${Date.now()}`
    }), 'Paiement confirmé — Caution active');
    const handleRequestTermination = () => handleAction('requestTermination', (svc) => svc.requestTermination(id), 'Demande de résiliation envoyée');
    const handleAdminReview = () => handleAction('adminReview', (svc) => svc.adminReview(id), 'Dossier transmis au propriétaire');
    const handleLandlordInspect = () => handleAction('landlordInspect', (svc) => svc.landlordInspect(id, { inspection_notes: inspectionNotes }), 'Inspection validée et signée');
    const handleTenantExitSign = () => handleAction('tenantExitSign', (svc) => svc.tenantExitSign(id), 'Sortie validée par le locataire');
    const handleAdminFinalSign = () => handleAction('adminFinalSign', (svc) => svc.adminFinalSign(id), 'Validation finale — remboursement initié');
    const handleProcessRefund = () => handleAction('processRefund', (svc) => svc.processRefund(id), 'Remboursement effectué');
    const handleCancel = () => handleAction('cancel', (svc) => svc.cancel(id), 'Contrat annulé');

    const handleOpenDispute = () => {
        handleAction('dispute', (svc) => svc.openDispute(id, disputeData), 'Litige ouvert');
        setShowDisputeForm(false);
    };

    const handleRespondDispute = (accepted) => {
        handleAction('respondDispute', (svc) => svc.respondToDispute(id, { accepted, comment: disputeResponse.comment }));
    };

    const handleSetPayoutMethods = () => {
        handleAction('payout', (svc) => svc.setPayoutMethods(id, payoutData));
        setShowPayoutForm(false);
    };

    const handleReleaseFunds = () => handleAction('release', (svc) => svc.releaseFunds(id, {}), 'Fonds libérés');

    const handleDownloadCertificate = async () => {
        try {
            const { secureDepositService } = await import('../services/api.js');
            const result = await secureDepositService.getCertificate(id);
            if (result.success === false) {
                toast.error(result.error || 'Erreur génération certificat');
            } else if (result.data?.certificate_url) {
                window.open(result.data.certificate_url, '_blank');
            } else {
                toast.success('Certificat prêt');
            }
        } catch { toast.error('Erreur génération certificat'); }
    };

    // ============== LOADING / NOT FOUND ==============
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!deposit) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-3xl mx-auto px-4 py-8 text-center">
                    <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">Caution introuvable</h2>
                    <button onClick={() => navigate('/escrow')} className="mt-4 text-orange-600 hover:underline">Retour aux cautions</button>
                </div>
            </div>
        );
    }

    const isLandlord = deposit.is_landlord;
    const isTenant = deposit.is_tenant;
    const isAdmin = deposit.is_admin;
    const disputes = deposit.disputes || [];
    const pendingDispute = disputes.find(d => d.status === 'pending');
    const currentStep = deposit.current_step || 1;
    const status = deposit.status;

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Back */}
                <button onClick={() => navigate('/escrow')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-5 h-5" /> Retour aux cautions
                </button>

                {/* Status Banner */}
                <div className={`rounded-2xl p-6 mb-6 border ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6" />
                        <div>
                            <h2 className="font-bold text-lg">{STATUS_LABELS[status] || status}</h2>
                            <p className="text-sm mt-1 opacity-80">Étape {currentStep} sur 12</p>
                        </div>
                    </div>
                </div>

                {/* Progress Stepper */}
                <ProgressStepper currentStep={currentStep} />

                {/* Property Info */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        {deposit.property_type === 'maison' ? <Home className="w-5 h-5" /> : deposit.property_type === 'vehicule' ? <Car className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                        Bien concerné
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><p className="text-gray-500">Type</p><p className="font-medium">{deposit.property_type === 'maison' ? 'Maison' : deposit.property_type === 'appartement' ? 'Appartement' : deposit.property_type === 'bureau' ? 'Bureau' : 'Véhicule'}</p></div>
                        <div><p className="text-gray-500">Description</p><p className="font-medium">{deposit.property_description}</p></div>
                        <div><p className="text-gray-500">Adresse</p><p className="font-medium">{deposit.property_address}</p></div>
                        <div>
                            <p className="text-gray-500">Période de location</p>
                            <p className="font-medium">
                                {deposit.rental_start_date && new Date(deposit.rental_start_date).toLocaleDateString('fr-FR')}
                                {' → '}
                                {deposit.rental_end_date && new Date(deposit.rental_end_date).toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Financial Info */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5" /> Détails financiers</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500">Montant de la caution</span>
                            <span className="font-bold text-lg">{formatPrice(deposit.deposit_amount)} FCFA</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500">Commission plateforme (5%)</span>
                            <span className="text-gray-700">{formatPrice(deposit.commission_amount)} FCFA</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500">Montant séquestré</span>
                            <span className="font-bold text-green-600">{formatPrice(deposit.escrowed_amount)} FCFA</span>
                        </div>
                        {deposit.payment_provider && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-500">Paiement</span>
                                <span className="capitalize">{deposit.payment_method} ({deposit.payment_provider})</span>
                            </div>
                        )}
                        {deposit.transaction_id && (
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-500">ID de transaction</span>
                                <span className="font-mono text-sm">{deposit.transaction_id}</span>
                            </div>
                        )}
                        {deposit.refund_amount_tenant != null && (deposit.status === 'refund_processing' || deposit.status === 'completed') && (
                            <>
                                <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-2">
                                    <span className="text-gray-500">Remboursé au locataire</span>
                                    <span className="font-bold text-blue-600">{formatPrice(deposit.refund_amount_tenant)} FCFA</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-500">Versé au bailleur</span>
                                    <span className="font-bold text-orange-600">{formatPrice(deposit.release_amount_landlord)} FCFA</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ============== SIGNATURES DU CONTRAT ============== */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><PenTool className="w-5 h-5" /> Signatures du contrat</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SignatureCard title="Locataire" name={deposit.tenant_name} signedAt={deposit.tenant_signed_at} color="blue" />
                        <SignatureCard title="Propriétaire" name={deposit.landlord_name} signedAt={deposit.landlord_signed_at} color="orange" />
                        <SignatureCard title="Admin" name="Administration" signedAt={deposit.admin_signed_at} color="purple" />
                    </div>
                </div>

                {/* ============== SIGNATURES DE SORTIE (restitution) ============== */}
                {['landlord_inspection', 'landlord_validated', 'tenant_exit_validated', 'refund_processing', 'completed'].includes(status) && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><ClipboardCheck className="w-5 h-5" /> Signatures de sortie (restitution)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SignatureCard title="Propriétaire (inspection)" name={deposit.landlord_name} signedAt={deposit.landlord_exit_signed_at} color="orange" />
                            <SignatureCard title="Locataire (sortie)" name={deposit.tenant_name} signedAt={deposit.tenant_exit_signed_at} color="blue" />
                            <SignatureCard title="Admin (validation finale)" name="Administration" signedAt={deposit.admin_final_signed_at} color="purple" />
                        </div>
                        {deposit.landlord_inspection_notes && (
                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-sm font-semibold text-amber-800 mb-1">Notes d&apos;inspection du propriétaire :</p>
                                <p className="text-sm text-amber-700">{deposit.landlord_inspection_notes}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ============== DISPUTES ============== */}
                {disputes.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" /> Litiges
                        </h3>
                        <div className="space-y-4">
                            {disputes.map((dispute, idx) => (
                                <div key={dispute.id || idx} className="p-4 border border-red-200 rounded-xl bg-red-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-medium text-red-800">{dispute.damage_description}</p>
                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">{dispute.status}</span>
                                    </div>
                                    <p className="text-sm text-red-700">Coût estimé : {formatPrice(dispute.estimated_cost)} FCFA</p>
                                    {dispute.tenant_comment && (
                                        <p className="text-sm text-gray-600 mt-2 italic">Réponse locataire : {dispute.tenant_comment}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Certificate */}
                {deposit.certificate_pdf_url && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                        <button onClick={handleDownloadCertificate} className="flex items-center gap-3 text-orange-600 hover:text-orange-700 font-medium">
                            <Download className="w-5 h-5" /> Télécharger le certificat de caution (PDF)
                        </button>
                    </div>
                )}

                {/* ==================== ACTION BUTTONS ==================== */}
                <div className="space-y-4">

                    {/* ---- PHASE 1: SIGNING ---- */}

                    {/* Landlord signs (when tenant has signed) */}
                    {status === 'signed_tenant' && isLandlord && (
                        <button onClick={handleSignLandlord} disabled={actionLoading === 'signLandlord'}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50">
                            <PenTool className="w-5 h-5" />
                            {actionLoading === 'signLandlord' ? 'Signature en cours...' : 'Signer le contrat de caution'}
                        </button>
                    )}

                    {/* Admin signs (when landlord has signed) */}
                    {status === 'signed_landlord' && isAdmin && (
                        <button onClick={handleSignAdmin} disabled={actionLoading === 'signAdmin'}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50">
                            <Shield className="w-5 h-5" />
                            {actionLoading === 'signAdmin' ? 'Validation en cours...' : 'Valider et signer le contrat (Admin)'}
                        </button>
                    )}

                    {/* ---- PHASE 2: PAYMENT ---- */}

                    {/* Tenant pays (all 3 signatures done) */}
                    {status === 'pending_payment' && isTenant && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-yellow-300">
                            <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                                <CreditCard className="w-5 h-5" /> Payer la caution
                            </h4>
                            <p className="text-sm text-gray-600 mb-4">
                                Le contrat a été signé par toutes les parties. Vous pouvez maintenant procéder au paiement de votre caution de <strong>{formatPrice(deposit.deposit_amount)} FCFA</strong>.
                            </p>
                            <button onClick={handleConfirmPayment} disabled={actionLoading === 'confirmPayment'}
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50">
                                <CreditCard className="w-5 h-5" />
                                {actionLoading === 'confirmPayment' ? 'Paiement en cours...' : 'Confirmer le paiement'}
                            </button>
                        </div>
                    )}

                    {/* ---- PHASE 3: ACTIVE ---- */}

                    {/* Tenant requests termination */}
                    {status === 'active' && isTenant && (
                        <button onClick={handleRequestTermination} disabled={actionLoading === 'requestTermination'}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50">
                            <Send className="w-5 h-5" />
                            {actionLoading === 'requestTermination' ? 'En cours...' : 'Demander la résiliation et restitution de caution'}
                        </button>
                    )}

                    {/* ---- PHASE 4: TERMINATION FLOW ---- */}

                    {/* Admin reviews termination request */}
                    {status === 'termination_requested' && isAdmin && (
                        <button onClick={handleAdminReview} disabled={actionLoading === 'adminReview'}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50">
                            <Eye className="w-5 h-5" />
                            {actionLoading === 'adminReview' ? 'En cours...' : 'Traiter la demande et transmettre au propriétaire'}
                        </button>
                    )}

                    {/* Landlord inspects and signs */}
                    {status === 'landlord_inspection' && isLandlord && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-amber-300">
                            <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5" /> Inspection et validation
                            </h4>
                            <p className="text-sm text-gray-600 mb-4">
                                Inspectez le bien et notez les éventuels dommages. En signant, vous validez l&apos;état du bien.
                            </p>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes d&apos;inspection</label>
                                <textarea
                                    value={inspectionNotes}
                                    onChange={e => setInspectionNotes(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Aucun dommage constaté / Décrivez les éventuels dommages..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handleLandlordInspect} disabled={actionLoading === 'landlordInspect'}
                                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                                    <PenTool className="w-5 h-5" />
                                    {actionLoading === 'landlordInspect' ? 'En cours...' : 'Valider et signer'}
                                </button>
                                <button onClick={() => setShowDisputeForm(true)}
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl flex items-center gap-2 transition-colors">
                                    <AlertTriangle className="w-4 h-4" /> Ouvrir un litige
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tenant exit sign */}
                    {status === 'landlord_validated' && isTenant && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-teal-300">
                            <h4 className="font-semibold text-teal-800 mb-3 flex items-center gap-2">
                                <PenTool className="w-5 h-5" /> Validation de sortie
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Le propriétaire a validé l&apos;inspection. Signez pour confirmer la restitution.
                            </p>
                            {deposit.landlord_inspection_notes && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-sm text-amber-700">
                                    <strong>Notes du propriétaire :</strong> {deposit.landlord_inspection_notes}
                                </div>
                            )}
                            <button onClick={handleTenantExitSign} disabled={actionLoading === 'tenantExitSign'}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50">
                                <PenTool className="w-5 h-5" />
                                {actionLoading === 'tenantExitSign' ? 'Signature en cours...' : 'Signer et valider la sortie'}
                            </button>
                        </div>
                    )}

                    {/* Admin final sign */}
                    {status === 'tenant_exit_validated' && isAdmin && (
                        <button onClick={handleAdminFinalSign} disabled={actionLoading === 'adminFinalSign'}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50">
                            <Shield className="w-5 h-5" />
                            {actionLoading === 'adminFinalSign' ? 'En cours...' : 'Validation finale et initier le remboursement'}
                        </button>
                    )}

                    {/* Admin processes refund */}
                    {status === 'refund_processing' && isAdmin && (
                        <button onClick={handleProcessRefund} disabled={actionLoading === 'processRefund'}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50">
                            <DollarSign className="w-5 h-5" />
                            {actionLoading === 'processRefund' ? 'En cours...' : 'Confirmer le remboursement effectué'}
                        </button>
                    )}

                    {/* ---- CANCEL ---- */}
                    {['draft', 'signed_tenant', 'signed_landlord'].includes(status) && (isTenant || isLandlord) && (
                        <button onClick={handleCancel} disabled={actionLoading === 'cancel'}
                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-2xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50">
                            <XCircle className="w-5 h-5" />
                            {actionLoading === 'cancel' ? 'Annulation...' : 'Annuler le contrat'}
                        </button>
                    )}

                    {/* ---- DISPUTES ---- */}

                    {/* Dispute Form (landlord during landlord_inspection) */}
                    {showDisputeForm && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-200">
                            <h4 className="font-semibold text-red-800 mb-4">Ouvrir un litige</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description des dommages *</label>
                                    <textarea value={disputeData.damage_description}
                                        onChange={e => setDisputeData({...disputeData, damage_description: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        rows={3} placeholder="Décrivez les dommages constatés..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Coût estimé des réparations (FCFA) *</label>
                                    <input type="number" value={disputeData.estimated_cost}
                                        onChange={e => setDisputeData({...disputeData, estimated_cost: Number(e.target.value)})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="50000" />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={handleOpenDispute}
                                        disabled={!disputeData.damage_description || !disputeData.estimated_cost || actionLoading === 'dispute'}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl disabled:opacity-50 transition-colors">
                                        {actionLoading === 'dispute' ? 'Envoi...' : 'Envoyer le litige'}
                                    </button>
                                    <button onClick={() => setShowDisputeForm(false)}
                                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Respond to dispute (tenant) */}
                    {status === 'dispute_open' && isTenant && pendingDispute && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-200">
                            <h4 className="font-semibold text-orange-800 mb-4">Répondre au litige</h4>
                            <div className="p-4 bg-red-50 rounded-xl mb-4">
                                <p className="text-sm text-red-800"><strong>Dommage déclaré :</strong> {pendingDispute.damage_description}</p>
                                <p className="text-sm text-red-800"><strong>Coût estimé :</strong> {formatPrice(pendingDispute.estimated_cost)} FCFA</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Votre commentaire</label>
                                <textarea value={disputeResponse.comment}
                                    onChange={e => setDisputeResponse({...disputeResponse, comment: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    rows={3} placeholder="Entrez votre commentaire..." />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => handleRespondDispute(true)} disabled={actionLoading === 'respondDispute'}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50">
                                    Accepter la retenue
                                </button>
                                <button onClick={() => handleRespondDispute(false)} disabled={actionLoading === 'respondDispute'}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50">
                                    Refuser
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Admin release funds for resolved dispute */}
                    {status === 'dispute_resolved' && isAdmin && (
                        <button onClick={handleReleaseFunds} disabled={actionLoading === 'release'}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50">
                            <DollarSign className="w-5 h-5" />
                            {actionLoading === 'release' ? 'En cours...' : 'Libérer les fonds (litige résolu)'}
                        </button>
                    )}

                    {/* Payout methods */}
                    {status === 'refund_processing' && (isTenant || isLandlord) && (
                        <button onClick={() => setShowPayoutForm(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-colors">
                            <Phone className="w-5 h-5" /> Choisir le moyen de remboursement
                        </button>
                    )}

                    {showPayoutForm && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-4">Moyen de remboursement</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {isTenant ? 'Votre numéro Mobile Money' : 'Numéro Mobile Money du locataire'}
                                    </label>
                                    <input type="tel" value={payoutData.tenant_payout_phone}
                                        onChange={e => setPayoutData({...payoutData, tenant_payout_phone: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                                        placeholder="+225 07 XX XX XX XX" />
                                </div>
                                {deposit.release_amount_landlord > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Numéro Mobile Money du bailleur</label>
                                        <input type="tel" value={payoutData.landlord_payout_phone}
                                            onChange={e => setPayoutData({...payoutData, landlord_payout_phone: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                                            placeholder="+225 07 XX XX XX XX" />
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button onClick={handleSetPayoutMethods} disabled={actionLoading === 'payout'}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl disabled:opacity-50 transition-colors">
                                        {actionLoading === 'payout' ? 'En cours...' : 'Valider'}
                                    </button>
                                    <button onClick={() => setShowPayoutForm(false)}
                                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">Annuler</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* CGU */}
                <div className="mt-8 text-center">
                    <Link to="/cgu-caution" className="text-sm text-gray-500 hover:text-orange-600">
                        Consulter les Conditions Générales d&apos;Utilisation — Caution Sécurisée
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default DepositDetailPage;
