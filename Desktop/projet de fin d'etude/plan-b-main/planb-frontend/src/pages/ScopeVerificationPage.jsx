import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Shield, Upload, CheckCircle, XCircle, Clock, AlertTriangle,
    FileText, Camera, ArrowLeft, Loader2, ShieldCheck, Car, Home,
    Briefcase, Wrench, Laptop, Shirt, Sofa, Gamepad2
} from 'lucide-react';
import { scopeVerificationService, authService } from '../services/api';

// Labels et icônes pour les scopes
const SCOPE_INFO = {
    AUTO: { label: 'Automobile', icon: Car, color: 'orange' },
    'AUTO/PRO': { label: 'Professionnel Auto', icon: Car, color: 'orange' },
    'AUTO/CAR_IMPORT': { label: 'Importateur Auto', icon: Car, color: 'red' },
    'AUTO/LOCATION': { label: 'Location de véhicule', icon: Car, color: 'blue' },
    'AUTO/MOTO': { label: 'Moto', icon: Car, color: 'purple' },
    'AUTO/CAMION': { label: 'Camion', icon: Car, color: 'gray' },
    'AUTO/ENGIN': { label: 'Engin lourd', icon: Car, color: 'yellow' },
    IMMOBILIER: { label: 'Immobilier', icon: Home, color: 'blue' },
    'IMMOBILIER/AGENCE': { label: 'Agence Immobilière', icon: Home, color: 'blue' },
    'IMMOBILIER/PROMOTEUR': { label: 'Promoteur Immobilier', icon: Home, color: 'indigo' },
    'IMMOBILIER/TERRAIN': { label: 'Terrain', icon: Home, color: 'green' },
    'IMMOBILIER/LOCATION': { label: 'Location Immobilière', icon: Home, color: 'cyan' },
    EMPLOI: { label: 'Emploi', icon: Briefcase, color: 'purple' },
    'EMPLOI/RECRUTEUR': { label: 'Recruteur Pro', icon: Briefcase, color: 'purple' },
    SERVICES: { label: 'Services', icon: Wrench, color: 'green' },
    'SERVICES/PRO': { label: 'Services Professionnels', icon: Wrench, color: 'green' },
    ELECTRONIQUE: { label: 'Électronique', icon: Laptop, color: 'gray' },
    MODE: { label: 'Mode', icon: Shirt, color: 'pink' },
    MAISON: { label: 'Maison & Jardin', icon: Sofa, color: 'amber' },
    LOISIRS: { label: 'Loisirs', icon: Gamepad2, color: 'cyan' },
};

// Labels des types de documents (adapté Afrique)
const DOC_TYPE_LABELS = {
    // Identité
    CNI: 'Carte Nationale d\'Identité ou Passeport',
    SELFIE_ID: 'Selfie avec votre pièce d\'identité',
    PERMIS: 'Permis de conduire',
    
    // Véhicules
    CARTE_GRISE: 'Carte grise du véhicule',
    CARTE_GRISE_MOTO: 'Carte grise de la moto',
    PHOTO_VIN: 'Photo du numéro de châssis (VIN)',
    CERTIFICAT_NON_GAGE: 'Certificat de non-gage',
    ASSURANCE: 'Attestation d\'assurance valide',
    CONTROLE_TECHNIQUE: 'Contrôle technique récent',
    AUTORISATION_TRANSPORT: 'Autorisation de transport',
    DOCUMENTS_IMPORTATION: 'Documents d\'importation',
    FACTURE_ACHAT: 'Facture d\'achat du véhicule/engin',
    CERTIFICAT_PROPRIETE: 'Certificat de propriété',
    
    // Immobilier
    TITRE_FONCIER: 'Titre foncier',
    PLAN_CADASTRAL: 'Plan cadastral',
    TAXE_FONCIERE: 'Taxe foncière récente',
    FACTURE_EAU_ELECTRICITE: 'Facture eau/électricité à votre nom',
    MANDAT_PROPRIETAIRE: 'Mandat signé par le propriétaire',
    
    // Entreprise / Pro
    RCCM: 'Registre du Commerce (RCCM)',
    NIF: 'Numéro d\'Identification Fiscale (NIF/IFU)',
    KBIS: 'Extrait Kbis',
    RC_PRO: 'Responsabilité Civile Professionnelle',
    CARTE_PRO_IMMO: 'Carte professionnelle immobilier',
    ASSURANCE_PRO: 'Assurance professionnelle',
    
    // Autres
    ATTESTATION_FISCALE: 'Attestation fiscale',
    DIPLOME: 'Diplôme ou certificat',
    JUSTIF_DOMICILE: 'Justificatif de domicile',
    AUTRE: 'Autre document',
};

function ScopeVerificationPage() {
    const { scopeKey } = useParams();
    const [searchParams] = useSearchParams();
    const returnTo = searchParams.get('returnTo');
    const navigate = useNavigate();
    
    const [currentUser] = useState(() => authService.getUser());
    const [loading, setLoading] = useState(true);
    const [scopeConfig, setScopeConfig] = useState(null);
    const [verification, setVerification] = useState(null);
    const [myDocuments, setMyDocuments] = useState([]);
    const [files, setFiles] = useState({});
    const [uploadingDoc, setUploadingDoc] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login', { state: { from: `/verification-scope/${scopeKey}` } });
            return;
        }
        loadData();
    }, [scopeKey]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Charger statut du scope et documents existants en parallèle
            const [statusResult, docsResult] = await Promise.all([
                scopeVerificationService.getScopeStatus(scopeKey),
                scopeVerificationService.getMyDocuments(),
            ]);

            if (statusResult.ok) {
                setScopeConfig({
                    key: scopeKey,
                    displayName: statusResult.data.scopeDisplayName,
                    icon: statusResult.data.scopeIcon,
                    requiredDocs: statusResult.data.requiredDocs || [],
                });
                setVerification(statusResult.data.verification);
            } else {
                setError(statusResult.data?.error || 'Impossible de charger les informations du scope');
            }

            if (docsResult.ok) {
                setMyDocuments(docsResult.data.documents || []);
            }
        } catch (e) {
            setError('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (docType, file) => {
        if (!file) return;
        
        setUploadingDoc(docType);
        setError(null);

        const result = await scopeVerificationService.uploadDocument(file, docType);
        
        if (result.ok) {
            // Ajouter le nouveau document à la liste
            setMyDocuments(prev => {
                const filtered = prev.filter(d => d.docType !== docType || d.status !== 'UPLOADED');
                return [...filtered, result.data.document];
            });
            setFiles(prev => ({ ...prev, [docType]: result.data.document }));
        } else {
            setError(result.data?.error || 'Erreur lors de l\'upload');
        }
        
        setUploadingDoc(null);
    };

    const handleSubmit = async () => {
        setError(null);
        
        // Récupérer tous les documents uploadés (pas de validation obligatoire)
        const uploadedDocTypes = myDocuments
            .filter(d => ['UPLOADED', 'VALIDATED'].includes(d.status))
            .map(d => d.docType);
        
        // S'assurer qu'au moins un document est uploadé
        if (uploadedDocTypes.length === 0) {
            setError('Veuillez uploader au moins un document pour la certification');
            return;
        }

        setIsSubmitting(true);
        
        const docIds = myDocuments
            .filter(d => ['UPLOADED', 'VALIDATED'].includes(d.status))
            .map(d => d.id);
        
        const result = await scopeVerificationService.submitForScope(scopeKey, docIds);
        
        setIsSubmitting(false);

        if (result.ok) {
            setSuccess(result.data.message || 'Demande soumise avec succès !');
            setVerification(result.data.verification);
        } else {
            setError(result.data?.error || 'Erreur lors de la soumission');
        }
    };

    const getScopeIcon = () => {
        const info = SCOPE_INFO[scopeKey];
        if (info) {
            const Icon = info.icon;
            return <Icon className="w-8 h-8 text-orange-500" />;
        }
        return <Shield className="w-8 h-8 text-orange-500" />;
    };

    const getDocStatus = (docType) => {
        const doc = myDocuments.find(d => d.docType === docType);
        if (!doc) return null;
        return doc;
    };

    // ========== RENDER ==========

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    const isApproved = verification?.status === 'APPROVED';
    const isPending = verification?.status === 'PENDING';
    const isRejected = verification?.status === 'REJECTED';
    const isBlocked = verification?.status === 'BLOCKED';

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <button
                    onClick={() => returnTo ? navigate(returnTo) : navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        {getScopeIcon()}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Certification {scopeConfig?.displayName || scopeKey}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Obtenez votre certification pour publier dans cette catégorie
                    </p>
                </div>

                {/* Erreur globale */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                            <p className="text-red-800">{error}</p>
                        </div>
                    </div>
                )}

                {/* Succès */}
                {success && !isApproved && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                            <p className="text-green-800">{success}</p>
                        </div>
                    </div>
                )}

                {/* Déjà certifié */}
                {isApproved && (
                    <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                        <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Vous êtes certifié !</h2>
                        <p className="text-gray-600 mb-6">
                            Votre certification {scopeConfig?.displayName} est active.
                            Vous pouvez publier des annonces dans cette catégorie.
                        </p>
                        {verification?.approvedAt && (
                            <p className="text-sm text-gray-500 mb-6">
                                Approuvé le {new Date(verification.approvedAt).toLocaleDateString('fr-FR')}
                                {verification.expiresAt && (
                                    <> — Expire le {new Date(verification.expiresAt).toLocaleDateString('fr-FR')}</>
                                )}
                            </p>
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
                {isPending && (
                    <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                        <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Demande en cours d'examen</h2>
                        <p className="text-gray-600 mb-4">
                            Vos documents ont été soumis le{' '}
                            {verification?.submittedAt
                                ? new Date(verification.submittedAt).toLocaleDateString('fr-FR')
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

                {/* Bloqué (trop de rejets) */}
                {isBlocked && (
                    <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Accès bloqué</h2>
                        <p className="text-gray-600 mb-4">
                            Vous avez atteint le nombre maximum de tentatives pour cette certification.
                        </p>
                        {verification?.rejectionReason && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <p className="text-red-800 text-sm">
                                    <strong>Dernier motif :</strong> {verification.rejectionReason}
                                </p>
                            </div>
                        )}
                        <p className="text-gray-500 text-sm">
                            Contactez le support pour obtenir de l'aide.
                        </p>
                    </div>
                )}

                {/* Formulaire d'upload (si pas approuvé, pas en attente, pas bloqué) */}
                {!isApproved && !isPending && !isBlocked && (
                    <div className="space-y-6">
                        {/* Message si rejeté précédemment */}
                        {isRejected && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-red-800">Demande précédente rejetée</p>
                                        {verification?.rejectionReason && (
                                            <p className="text-red-700 text-sm mt-1">
                                                Motif : {verification.rejectionReason}
                                            </p>
                                        )}
                                        <p className="text-red-600 text-xs mt-1">
                                            Tentative {verification?.rejectionCount || 0}/3
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">
                                Documents à fournir
                            </h2>
                            <p className="text-gray-500 text-sm mb-6">
                                Formats acceptés : JPG, PNG, WebP, PDF (max 10MB). Uploadez au moins un document.
                            </p>

                            <div className="space-y-4">
                                {(scopeConfig?.requiredDocs || []).map(docType => {
                                    const existingDoc = getDocStatus(docType);
                                    const isUploading = uploadingDoc === docType;
                                    const isValidated = existingDoc?.status === 'VALIDATED';
                                    const isUploaded = existingDoc?.status === 'UPLOADED';
                                    const isDocRejected = existingDoc?.status === 'REJECTED';

                                    return (
                                        <div key={docType} className="border border-gray-200 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-5 h-5 text-gray-400" />
                                                    <span className="font-medium text-gray-900">
                                                        {DOC_TYPE_LABELS[docType] || docType}
                                                    </span>
                                                </div>
                                                {isValidated && (
                                                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Validé
                                                    </span>
                                                )}
                                                {isUploaded && (
                                                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                                        Uploadé
                                                    </span>
                                                )}
                                                {isDocRejected && (
                                                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1">
                                                        <XCircle className="w-3 h-3" /> Rejeté
                                                    </span>
                                                )}
                                            </div>

                                            {isUploading ? (
                                                <div className="flex items-center justify-center gap-2 p-6 bg-gray-50 rounded-lg">
                                                    <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                                                    <span className="text-gray-600">Upload en cours...</span>
                                                </div>
                                            ) : (isUploaded || isValidated) ? (
                                                <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg">
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                    <span className="text-sm text-green-700 flex-1 truncate">
                                                        {existingDoc.fileName}
                                                    </span>
                                                    {!isValidated && (
                                                        <label className="text-orange-500 hover:text-orange-600 text-xs cursor-pointer">
                                                            Remplacer
                                                            <input
                                                                type="file"
                                                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    if (e.target.files[0]) {
                                                                        handleFileSelect(docType, e.target.files[0]);
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    )}
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                                                    {docType === 'SELFIE' ? (
                                                        <Camera className="w-8 h-8 text-gray-400" />
                                                    ) : (
                                                        <Upload className="w-8 h-8 text-gray-400" />
                                                    )}
                                                    <span className="text-sm text-gray-500">
                                                        Cliquez pour choisir un fichier
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp,application/pdf"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            if (e.target.files[0]) {
                                                                handleFileSelect(docType, e.target.files[0]);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            )}

                                            {isDocRejected && existingDoc?.rejectionReason && (
                                                <p className="text-xs text-red-600 mt-2">
                                                    Motif : {existingDoc.rejectionReason}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Section pour uploader un document libre */}
                                <div className="border border-dashed border-gray-300 rounded-xl p-4 mt-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText className="w-5 h-5 text-gray-400" />
                                        <span className="font-medium text-gray-900">
                                            Autre document (optionnel)
                                        </span>
                                    </div>
                                    
                                    {uploadingDoc === 'AUTRE' ? (
                                        <div className="flex items-center justify-center gap-2 p-6 bg-gray-50 rounded-lg">
                                            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                                            <span className="text-gray-600">Upload en cours...</span>
                                        </div>
                                    ) : getDocStatus('AUTRE') ? (
                                        <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                            <span className="text-sm text-green-700 flex-1 truncate">
                                                {getDocStatus('AUTRE').fileName}
                                            </span>
                                            <label className="text-orange-500 hover:text-orange-600 text-xs cursor-pointer">
                                                Ajouter un autre
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp,application/pdf"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        if (e.target.files[0]) {
                                                            handleFileSelect('AUTRE', e.target.files[0]);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                                            <Upload className="w-8 h-8 text-gray-400" />
                                            <span className="text-sm text-gray-500">
                                                Cliquez pour ajouter un document supplémentaire
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files[0]) {
                                                        handleFileSelect('AUTRE', e.target.files[0]);
                                                    }
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
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
                                    <ShieldCheck className="w-5 h-5" />
                                    Soumettre ma demande de certification
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ScopeVerificationPage;
