// PayDepositPage - Création de contrat de caution sécurisée
// Dans le nouveau workflow: le locataire crée le contrat (signature auto),
// puis le propriétaire et l'admin signent. Le paiement se fait ensuite sur DepositDetailPage.
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Shield, ArrowLeft, CheckCircle, Info, PenTool, FileText
} from 'lucide-react';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

const COMMISSION_RATE = 0.05;

function PayDepositPage() {
    const { listingId } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1); // 1: info + signature, 2: confirmation
    const [acceptedCGU, setAcceptedCGU] = useState(false);
    const [formData, setFormData] = useState({
        rental_start_date: '',
        rental_end_date: '',
        tenant_id_type: 'cni',
        tenant_id_number: '',
    });
    const [createdDeposit, setCreatedDeposit] = useState(null);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const { listingService } = await import('../services/api.js');
                const result = await listingService.getById(listingId);
                setListing(result.data || result);
            } catch (err) {
                console.error('Erreur listing:', err);
                toast.error('Annonce introuvable');
            } finally {
                setIsLoading(false);
            }
        };
        fetchListing();
    }, [listingId]);

    const depositAmount = listing?.deposit_amount_required || listing?.depositAmountRequired || listing?.price || 0;
    const commissionAmount = Math.round(depositAmount * COMMISSION_RATE);
    const escrowedAmount = depositAmount - commissionAmount;

    const handleCreateContract = async () => {
        if (!acceptedCGU) {
            toast.error('Veuillez accepter les CGU');
            return;
        }
        if (!formData.rental_start_date || !formData.rental_end_date) {
            toast.error('Veuillez renseigner les dates de location');
            return;
        }
        if (!formData.tenant_id_number) {
            toast.error('Veuillez renseigner votre numéro de pièce d\'identité');
            return;
        }

        setIsSubmitting(true);
        try {
            const { secureDepositService } = await import('../services/api.js');
            const result = await secureDepositService.create({
                listing_id: parseInt(listingId),
                rental_start_date: formData.rental_start_date,
                rental_end_date: formData.rental_end_date,
                tenant_id_type: formData.tenant_id_type,
                tenant_id_number: formData.tenant_id_number,
            });

            if (result.success) {
                setCreatedDeposit(result.data);
                setStep(2);
                toast.success('Contrat créé et signé ! En attente des autres signatures.');
            } else {
                toast.error(result.error || 'Erreur lors de la création du contrat');
            }
        } catch (err) {
            console.error('Erreur création:', err);
            toast.error(err.response?.data?.error || 'Erreur lors de la création du contrat');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 text-center py-20">
                <p className="text-gray-500">Annonce introuvable</p>
                <button onClick={() => navigate('/annonces')} className="mt-4 text-orange-600 hover:underline">
                    Retour aux annonces
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Back */}
                <button
                    onClick={() => step > 1 ? setStep(1) : navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {step > 1 ? 'Retour' : 'Retour à l\'annonce'}
                </button>

                {/* Progress Steps */}
                <div className="flex items-center gap-2 mb-8">
                    {[1, 2].map(s => (
                        <div key={s} className="flex-1 flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                step >= s ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                            </div>
                            <span className={`text-sm hidden md:inline ${step >= s ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                                {s === 1 ? 'Contrat & Signature' : 'Confirmation'}
                            </span>
                            {s < 2 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-orange-500' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Contract Info + Auto-Sign */}
                {step === 1 && (
                    <div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-orange-500" />
                                Création du contrat de caution
                            </h2>
                            <p className="text-gray-600 mb-4">
                                En créant ce contrat, vous le signez automatiquement en tant que locataire. Le contrat sera ensuite envoyé au propriétaire pour signature, puis validé par l&apos;administration.
                            </p>

                            {/* Workflow explanation */}
                            <div className="bg-blue-50 rounded-xl p-4 mb-6">
                                <p className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                    <Info className="w-4 h-4" /> Comment ça fonctionne
                                </p>
                                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                                    <li><strong>Vous signez</strong> le contrat (automatique à la création)</li>
                                    <li><strong>Le propriétaire</strong> prend connaissance et signe</li>
                                    <li><strong>L&apos;admin</strong> valide et signe</li>
                                    <li>Une demande de <strong>paiement</strong> vous est envoyée</li>
                                    <li>Votre caution est <strong>active et sécurisée</strong></li>
                                </ol>
                            </div>

                            {/* Listing recap */}
                            <div className="p-4 bg-orange-50 rounded-xl mb-6">
                                <p className="font-semibold text-gray-900">{listing.title}</p>
                                <p className="text-sm text-gray-600">{listing.address || listing.city}</p>
                                <p className="text-lg font-bold text-orange-600 mt-1">
                                    Caution : {formatPrice(depositAmount)} FCFA
                                </p>
                            </div>

                            {/* Form */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Début de location *</label>
                                        <input
                                            type="date"
                                            value={formData.rental_start_date}
                                            onChange={e => setFormData({...formData, rental_start_date: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fin de location *</label>
                                        <input
                                            type="date"
                                            value={formData.rental_end_date}
                                            onChange={e => setFormData({...formData, rental_end_date: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type de pièce d&apos;identité</label>
                                        <select
                                            value={formData.tenant_id_type}
                                            onChange={e => setFormData({...formData, tenant_id_type: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                                        >
                                            <option value="cni">CNI</option>
                                            <option value="passport">Passeport</option>
                                            <option value="titre_sejour">Titre de séjour</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de pièce *</label>
                                        <input
                                            type="text"
                                            value={formData.tenant_id_number}
                                            onChange={e => setFormData({...formData, tenant_id_number: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                                            placeholder="CI-XXXX-XXXX"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Amount summary */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                            <h3 className="font-semibold text-gray-900 mb-3">Récapitulatif financier</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Montant de la caution</span>
                                    <span className="text-orange-600">{formatPrice(depositAmount)} FCFA</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500 pt-2 border-t border-gray-200">
                                    <span>Commission plateforme (5%)</span>
                                    <span>{formatPrice(commissionAmount)} FCFA</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Montant séquestré (garanti)</span>
                                    <span className="text-green-600 font-medium">{formatPrice(escrowedAmount)} FCFA</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-3">
                                Le paiement sera demandé uniquement après la signature de toutes les parties.
                            </p>
                        </div>

                        {/* CGU checkbox */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={acceptedCGU}
                                    onChange={e => setAcceptedCGU(e.target.checked)}
                                    className="mt-1 w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm text-gray-600">
                                    J&apos;accepte les{' '}
                                    <Link to="/cgu-caution" target="_blank" className="text-orange-600 underline hover:text-orange-700">
                                        Conditions Générales d&apos;Utilisation — Caution Sécurisée
                                    </Link>{' '}
                                    et je comprends que le contrat doit être signé par toutes les parties avant le paiement.
                                </span>
                            </label>
                        </div>

                        {/* Signature banner */}
                        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                            <PenTool className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-indigo-800">Signature numérique</p>
                                <p className="text-xs text-indigo-600">En cliquant sur le bouton ci-dessous, vous signez électroniquement le contrat de caution.</p>
                            </div>
                        </div>

                        <button
                            onClick={handleCreateContract}
                            disabled={isSubmitting || !acceptedCGU}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <PenTool className="w-5 h-5" />
                            {isSubmitting ? 'Création et signature en cours...' : 'Créer et signer le contrat'}
                        </button>
                    </div>
                )}

                {/* Step 2: Confirmation — Contract Created & Signed */}
                {step === 2 && (
                    <div className="text-center">
                        <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <PenTool className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Contrat créé et signé !</h2>
                            <p className="text-gray-600 mb-6">
                                Votre contrat de caution de <strong>{formatPrice(depositAmount)} FCFA</strong> a été créé.
                                Vous l&apos;avez signé automatiquement en tant que locataire.
                            </p>

                            <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-800 mb-6">
                                <p className="font-medium mb-2">📋 Prochaines étapes :</p>
                                <div className="space-y-2 text-left">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <span className="line-through text-green-700">Votre signature (locataire)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full border-2 border-orange-400 flex-shrink-0" />
                                        <span>Signature du propriétaire</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                        <span>Validation de l&apos;administration</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                        <span>Paiement de la caution</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 mb-6">
                                Vous recevrez une notification lorsque le propriétaire aura signé. Suivez l&apos;avancement en temps réel sur la page de la caution.
                            </p>

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => navigate(`/escrow/${createdDeposit?.id}`)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                                >
                                    Suivre ma caution
                                </button>
                                <button
                                    onClick={() => navigate('/escrow')}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
                                >
                                    Toutes mes cautions
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PayDepositPage;
