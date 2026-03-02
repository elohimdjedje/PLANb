import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, Upload, CheckCircle, XCircle, Clock, AlertTriangle,
    User, Home, Car, Building, Zap, FileText, Camera, ArrowLeft, Loader2
} from 'lucide-react';
import { verificationService, authService } from '../services/api';

const CATEGORIES = [
    {
        id: 'particulier',
        label: 'Particulier',
        icon: User,
        description: 'CNI/Passeport + Selfie',
        color: 'blue',
    },
    {
        id: 'bailleur',
        label: 'Bailleur Immobilier',
        icon: Home,
        description: 'CNI + Titre foncier / Bail notarié',
        color: 'green',
    },
    {
        id: 'vehicule',
        label: 'Vendeur Véhicule',
        icon: Car,
        description: 'CNI + Carte grise',
        color: 'orange',
    },
    {
        id: 'hotel',
        label: 'Hôtel / Location',
        icon: Building,
        description: 'CNI gérant + Registre de commerce',
        color: 'purple',
    },
];

const BADGE_LABELS = {
    identity_verified: { label: 'Identité vérifiée', icon: '✅', color: 'green' },
    bailleur_certified: { label: 'Bailleur certifié', icon: '🏠', color: 'blue' },
    vehicule_certified: { label: 'Vendeur auto certifié', icon: '🚗', color: 'orange' },
    hotel_certified: { label: 'Établissement certifié', icon: '🏨', color: 'purple' },
    manual_certified: { label: 'Certifié manuellement', icon: '⚡', color: 'yellow' },
};

function VerificationPage() {
    const navigate = useNavigate();
    const [currentUser] = useState(() => authService.getUser());
    const [step, setStep] = useState('loading'); // loading, status, category, documents, submitting, done
    const [verificationData, setVerificationData] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [requiredDocs, setRequiredDocs] = useState([]);
    const [files, setFiles] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login', { state: { from: '/verification' } });
            return;
        }
        loadStatus();
    }, []);

    const loadStatus = async () => {
        const result = await verificationService.getStatus();
        if (result.ok) {
            setVerificationData(result.data);
            if (result.data.isVerified) {
                setStep('verified');
            } else if (result.data.currentRequest?.status === 'pending') {
                setStep('pending');
            } else if (!result.data.canSubmit) {
                setStep('blocked');
            } else {
                setStep('category');
            }
        } else {
            setStep('category');
        }
    };

    const handleCategorySelect = async (categoryId) => {
        setSelectedCategory(categoryId);
        setError(null);
        const result = await verificationService.getRequiredDocuments(categoryId);
        if (result.ok) {
            setRequiredDocs(result.data.documents);
            setFiles({});
            setStep('documents');
        } else {
            setError('Erreur lors du chargement des documents requis');
        }
    };

    const handleFileChange = (key, file) => {
        setFiles(prev => ({ ...prev, [key]: file }));
    };

    const handleSubmit = async () => {
        setError(null);
        // Vérifier que tous les documents requis sont fournis
        const missingRequired = requiredDocs.filter(d => d.required && !files[d.key]);
        if (missingRequired.length > 0) {
            setError(`Documents manquants : ${missingRequired.map(d => d.label).join(', ')}`);
            return;
        }

        setIsSubmitting(true);
        const result = await verificationService.submit(selectedCategory, files);
        setIsSubmitting(false);

        if (result.ok) {
            setSuccess(result.data.message);
            setStep('done');
            // Mettre à jour le user en localStorage
            const user = authService.getUser();
            if (user) {
                user.verificationStatus = 'pending';
                localStorage.setItem('user', JSON.stringify(user));
            }
        } else {
            setError(result.data?.error || result.data?.message || 'Erreur lors de la soumission');
        }
    };

    // ========== RENDER ==========

    if (step === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-orange-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Vérification d'identité</h1>
                    <p className="text-gray-500 mt-2">Vérifiez votre identité pour publier des annonces en toute confiance</p>
                </div>

                {/* Déjà vérifié */}
                {step === 'verified' && (
                    <div className="bg-white rounded-2xl p-8 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Compte vérifié !</h2>
                        <p className="text-gray-600 mb-6">Votre identité a été confirmée. Vous pouvez publier vos annonces.</p>
                        {verificationData?.verificationBadges?.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                {verificationData.verificationBadges.map(badge => {
                                    const info = BADGE_LABELS[badge] || { label: badge, icon: '✅' };
                                    return (
                                        <span key={badge} className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                                            {info.icon} {info.label}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                        <button
                            onClick={() => navigate('/publish')}
                            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600"
                        >
                            Publier une annonce
                        </button>
                    </div>
                )}

                {/* Demande en attente */}
                {step === 'pending' && (
                    <div className="bg-white rounded-2xl p-8 text-center">
                        <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Demande en cours d'examen</h2>
                        <p className="text-gray-600 mb-4">
                            Vos documents ont été soumis le{' '}
                            {verificationData?.currentRequest?.createdAt
                                ? new Date(verificationData.currentRequest.createdAt).toLocaleDateString('fr-FR')
                                : '---'}.
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-800 text-sm">
                                Notre équipe examine vos documents sous <strong>24 à 72h</strong>.
                                Vous recevrez une notification dès que votre demande sera traitée.
                            </p>
                        </div>
                    </div>
                )}

                {/* Max tentatives atteint */}
                {step === 'blocked' && (
                    <div className="bg-white rounded-2xl p-8 text-center">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Tentatives épuisées</h2>
                        <p className="text-gray-600 mb-4">
                            Vous avez atteint le nombre maximum de tentatives ({verificationData?.maxAttempts}).
                        </p>
                        {verificationData?.currentRequest?.rejectionReason && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <p className="text-red-800 text-sm">
                                    <strong>Dernier motif de rejet :</strong> {verificationData.currentRequest.rejectionReason}
                                </p>
                            </div>
                        )}
                        <p className="text-gray-500 text-sm">Contactez le support pour obtenir de l'aide.</p>
                    </div>
                )}

                {/* Choix catégorie */}
                {step === 'category' && (
                    <div className="space-y-4">
                        {verificationData?.currentRequest?.status === 'rejected' && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-red-800">Demande précédente rejetée</p>
                                        <p className="text-red-700 text-sm mt-1">
                                            Motif : {verificationData.currentRequest.rejectionReason}
                                        </p>
                                        <p className="text-red-600 text-xs mt-1">
                                            Tentative {verificationData.attemptsUsed}/{verificationData.maxAttempts}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <h2 className="text-lg font-bold text-gray-900">Choisissez votre catégorie</h2>
                        <p className="text-gray-500 text-sm mb-4">
                            Les documents requis dépendent de votre profil de vendeur.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {CATEGORIES.map(cat => {
                                const Icon = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategorySelect(cat.id)}
                                        className="bg-white rounded-xl p-6 text-left hover:border-orange-300 border-2 border-transparent transition-all hover:shadow-md"
                                    >
                                        <Icon className="w-8 h-8 text-orange-500 mb-3" />
                                        <h3 className="font-bold text-gray-900">{cat.label}</h3>
                                        <p className="text-gray-500 text-sm mt-1">{cat.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Upload documents */}
                {step === 'documents' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <button
                                onClick={() => setStep('category')}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Documents requis — {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                                </h2>
                                <p className="text-gray-500 text-sm">Formats acceptés : JPG, PNG, WebP, PDF (max 10MB)</p>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {requiredDocs.map(doc => (
                                <div key={doc.key} className="bg-white rounded-xl p-5 border border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <span className="font-medium text-gray-900">{doc.label}</span>
                                        </div>
                                        {!doc.required && (
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Optionnel</span>
                                        )}
                                    </div>

                                    {files[doc.key] ? (
                                        <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                            <span className="text-sm text-green-700 flex-1 truncate">
                                                {files[doc.key].name}
                                            </span>
                                            <button
                                                onClick={() => setFiles(prev => {
                                                    const copy = { ...prev };
                                                    delete copy[doc.key];
                                                    return copy;
                                                })}
                                                className="text-red-400 hover:text-red-600 text-xs"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                                            {doc.key.includes('selfie') ? (
                                                <Camera className="w-8 h-8 text-gray-400" />
                                            ) : (
                                                <Upload className="w-8 h-8 text-gray-400" />
                                            )}
                                            <span className="text-sm text-gray-500">Cliquez pour choisir un fichier</span>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files[0]) {
                                                        handleFileChange(doc.key, e.target.files[0]);
                                                    }
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2 ${
                                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-5 h-5" />
                                    Soumettre ma demande de vérification
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Succès */}
                {step === 'done' && (
                    <div className="bg-white rounded-2xl p-8 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Demande envoyée !</h2>
                        <p className="text-gray-600 mb-6">{success || 'Vos documents ont été soumis avec succès.'}</p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-blue-800 text-sm">
                                Notre équipe examine vos documents sous <strong>24 à 72h</strong>.
                                Vous recevrez une notification dès que votre demande sera traitée.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600"
                        >
                            Retour à l'accueil
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VerificationPage;
