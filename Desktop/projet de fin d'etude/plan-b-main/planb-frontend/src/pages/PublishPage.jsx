// PublishPage - Create/Edit listing
// Note: This is a simplified version. The full implementation is in the Publish.jsx file.
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Camera, MapPin, Plus, X, ArrowLeft, Check, Shield, AlertTriangle, Globe } from 'lucide-react';
import { formatPrice } from '../utils/helpers';
import LocationPicker from '../components/map/LocationPicker';

function PublishPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [images, setImages] = useState([]);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [checkingScope, setCheckingScope] = useState(false);
    const [scopeInfo, setScopeInfo] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        price: '',
        priceUnit: 'mois',
        transactionType: 'location',
        country: 'Côte d\'Ivoire',
        city: '',
        district: '',
        address: '',
        latitude: null,
        longitude: null,
        // Champs immobilier
        surface: '',
        rooms: '',
        bedrooms: '',
        bathrooms: '',
        furnished: false,
        parking: false,
        floor: '',
        elevator: false,
        // Champs véhicules
        brand: '',
        model: '',
        year: '',
        mileage: '',
        fuel: '',
        transmission: '',
        doors: '',
        seats: '',
        color: '',
        condition: '',
        // Caractéristiques (highlights)
        characteristics: {},
        // Visite virtuelle
        virtualTourUrl: ''
    });

    const categories = {
        immobilier: {
            label: 'Immobilier',
            subcategories: ['Maison à vendre', 'Maison à louer', 'Appartement à vendre', 'Appartement à louer', 'Terrain', 'Bureau', 'Local commercial']
        },
        vehicule: {
            label: 'Véhicules',
            subcategories: ['Voiture à vendre', 'Voiture à louer', 'Moto à vendre', 'Moto à louer', 'Camion', 'Engin']
        },
        vacance: {
            label: 'Vacances',
            subcategories: ['Hôtel', 'Villa meublée', 'Appartement meublé', 'Résidence', 'Maison d\'hôtes']
        }
    };

    // "Les + de cette annonce" par sous-catégorie
    const highlightsBySubcategory = {
        // IMMOBILIER
        'Maison à vendre': ['Piscine', 'Jardin', 'Garage', 'Terrasse', 'Climatisation', 'Gardien', 'Groupe électrogène', 'Eau courante', 'Titre foncier', 'Quartier résidentiel', 'Proche école', 'Proche commerces'],
        'Maison à louer': ['Piscine', 'Jardin', 'Garage', 'Terrasse', 'Climatisation', 'Gardien', 'Groupe électrogène', 'Eau courante', 'Meublée', 'Quartier résidentiel', 'Proche école', 'Proche commerces'],
        'Appartement à vendre': ['Ascenseur', 'Balcon', 'Climatisation', 'Parking', 'Gardien', 'Interphone', 'Groupe électrogène', 'Eau courante', 'Vue dégagée', 'Résidence sécurisée', 'Titre foncier'],
        'Appartement à louer': ['Ascenseur', 'Balcon', 'Climatisation', 'Parking', 'Gardien', 'Interphone', 'Groupe électrogène', 'Eau courante', 'Meublé', 'Vue dégagée', 'Résidence sécurisée'],
        'Terrain': ['Titre foncier', 'ACD', 'Lotissement approuvé', 'Bord de route', 'Clôturé', 'Viabilisé', 'Eau', 'Électricité', 'Zone résidentielle', 'Zone commerciale'],
        'Bureau': ['Climatisation', 'Parking', 'Ascenseur', 'Gardien', 'Internet haut débit', 'Groupe électrogène', 'Salle de réunion', 'Open space', 'Accès handicapé'],
        'Local commercial': ['Vitrine', 'Climatisation', 'Parking', 'Bord de route', 'Grande surface', 'Entrepôt', 'Accès livraison', 'Zone commerciale'],
        // VÉHICULES
        'Voiture à vendre': ['Climatisation', 'Bluetooth', 'GPS', 'Caméra de recul', 'Régulateur de vitesse', 'Toit ouvrant', 'Sièges cuir', 'Jantes alu', 'Vitres électriques', 'ABS', 'Airbags', 'Première main', 'Carnet d\'entretien', 'Dédouanée'],
        'Voiture à louer': ['Climatisation', 'Bluetooth', 'GPS', 'Caméra de recul', 'Assurance incluse', 'Kilométrage illimité', 'Chauffeur disponible', 'Livraison possible'],
        'Moto à vendre': ['Casque inclus', 'Première main', 'Dédouanée', 'Carte grise à jour', 'Bon état mécanique', 'Peu de kilomètres'],
        'Moto à louer': ['Casque inclus', 'Assurance incluse', 'Livraison possible'],
        'Camion': ['Climatisation', 'GPS', 'Benne', 'Plateau', 'Frigorifique', 'Grue', 'Dédouané', 'Carte grise à jour'],
        'Engin': ['Bon état mécanique', 'Heures moteur faibles', 'Dédouané', 'Carte grise à jour', 'Disponible immédiatement'],
        // VACANCES
        'Hôtel': ['Piscine', 'WiFi', 'Climatisation', 'Restaurant', 'Parking', 'Room service', 'Spa', 'Salle de sport', 'Vue mer', 'Petit-déjeuner inclus', 'Transfert aéroport'],
        'Villa meublée': ['Piscine', 'WiFi', 'Climatisation', 'Jardin', 'Gardien', 'Groupe électrogène', 'Barbecue', 'Vue mer', 'Personnel de maison', 'Parking'],
        'Appartement meublé': ['WiFi', 'Climatisation', 'Balcon', 'Parking', 'Ascenseur', 'Gardien', 'Machine à laver', 'Cuisine équipée', 'Vue dégagée'],
        'Résidence': ['Piscine', 'WiFi', 'Climatisation', 'Restaurant', 'Parking', 'Sécurité 24h', 'Salle de sport', 'Espace enfants'],
        'Maison d\'hôtes': ['WiFi', 'Climatisation', 'Petit-déjeuner inclus', 'Jardin', 'Terrasse', 'Parking', 'Cuisine partagée', 'Ambiance familiale']
    };

    // Informations clés spécifiques par sous-catégorie
    const keyInfoBySubcategory = {
        // IMMOBILIER - Terrain
        'Terrain': [
            { key: 'lotSize', label: 'Superficie (m²)', type: 'number', placeholder: 'Ex: 500' },
            { key: 'landType', label: 'Type de terrain', type: 'select', options: ['Résidentiel', 'Commercial', 'Agricole', 'Industriel', 'Mixte'] },
            { key: 'document', label: 'Document disponible', type: 'select', options: ['Titre foncier', 'ACD', 'Lettre d\'attribution', 'Attestation villageoise', 'Autre'] },
            { key: 'topography', label: 'Topographie', type: 'select', options: ['Plat', 'En pente', 'Vallonné'] },
        ],
        // IMMOBILIER - Bureau
        'Bureau': [
            { key: 'surface', label: 'Surface (m²)', type: 'number', placeholder: 'Ex: 100' },
            { key: 'rooms', label: 'Nombre de bureaux', type: 'select', options: ['1', '2', '3', '4', '5', '6+'] },
            { key: 'floor', label: 'Étage', type: 'select', options: ['RDC', '1er', '2ème', '3ème', '4ème', '5ème+'] },
            { key: 'condition', label: 'État', type: 'select', options: ['Neuf', 'Rénové', 'Bon état', 'À rénover'] },
        ],
        // IMMOBILIER - Local commercial
        'Local commercial': [
            { key: 'surface', label: 'Surface (m²)', type: 'number', placeholder: 'Ex: 200' },
            { key: 'floor', label: 'Étage', type: 'select', options: ['RDC', '1er', '2ème', '3ème+'] },
            { key: 'shopType', label: 'Type', type: 'select', options: ['Boutique', 'Magasin', 'Entrepôt', 'Restaurant', 'Showroom', 'Autre'] },
            { key: 'condition', label: 'État', type: 'select', options: ['Neuf', 'Rénové', 'Bon état', 'À rénover'] },
        ],
        // VÉHICULES - Moto
        'Moto à vendre': [
            { key: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Yamaha' },
            { key: 'model', label: 'Modèle', type: 'text', placeholder: 'Ex: YBR 125' },
            { key: 'year', label: 'Année', type: 'number', placeholder: 'Ex: 2022' },
            { key: 'mileage', label: 'Kilométrage (km)', type: 'number', placeholder: 'Ex: 15000' },
            { key: 'engineSize', label: 'Cylindrée (cc)', type: 'select', options: ['50', '100', '125', '150', '200', '250', '400', '600', '1000+'] },
            { key: 'condition', label: 'État', type: 'select', options: ['Neuf', 'Très bon état', 'Bon état', 'État correct'] },
        ],
        'Moto à louer': [
            { key: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Yamaha' },
            { key: 'model', label: 'Modèle', type: 'text', placeholder: 'Ex: YBR 125' },
            { key: 'year', label: 'Année', type: 'number', placeholder: 'Ex: 2022' },
            { key: 'engineSize', label: 'Cylindrée (cc)', type: 'select', options: ['50', '100', '125', '150', '200', '250', '400', '600', '1000+'] },
        ],
        // VÉHICULES - Camion
        'Camion': [
            { key: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Mercedes' },
            { key: 'model', label: 'Modèle', type: 'text', placeholder: 'Ex: Actros' },
            { key: 'year', label: 'Année', type: 'number', placeholder: 'Ex: 2018' },
            { key: 'mileage', label: 'Kilométrage (km)', type: 'number', placeholder: 'Ex: 200000' },
            { key: 'fuel', label: 'Carburant', type: 'select', options: ['Diesel', 'Essence'] },
            { key: 'payload', label: 'Charge utile (tonnes)', type: 'number', placeholder: 'Ex: 10' },
            { key: 'truckType', label: 'Type', type: 'select', options: ['Benne', 'Plateau', 'Frigorifique', 'Citerne', 'Porte-conteneur', 'Autre'] },
            { key: 'condition', label: 'État', type: 'select', options: ['Neuf', 'Très bon état', 'Bon état', 'État correct'] },
        ],
        // VÉHICULES - Engin
        'Engin': [
            { key: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Caterpillar' },
            { key: 'model', label: 'Modèle', type: 'text', placeholder: 'Ex: 320D' },
            { key: 'year', label: 'Année', type: 'number', placeholder: 'Ex: 2019' },
            { key: 'engineHours', label: 'Heures moteur', type: 'number', placeholder: 'Ex: 5000' },
            { key: 'enginType', label: 'Type d\'engin', type: 'select', options: ['Pelleteuse', 'Bulldozer', 'Chargeuse', 'Grue', 'Compacteur', 'Niveleuse', 'Autre'] },
            { key: 'condition', label: 'État', type: 'select', options: ['Neuf', 'Très bon état', 'Bon état', 'État correct'] },
        ],
        // VACANCES
        'Hôtel': [
            { key: 'roomType', label: 'Type de chambre', type: 'select', options: ['Standard', 'Supérieure', 'Deluxe', 'Suite', 'Suite Junior'] },
            { key: 'bedType', label: 'Type de lit', type: 'select', options: ['Simple', 'Double', 'King Size', 'Twin (2 lits)'] },
            { key: 'stars', label: 'Étoiles', type: 'select', options: ['1', '2', '3', '4', '5'] },
            { key: 'checkIn', label: 'Heure check-in', type: 'text', placeholder: 'Ex: 14h00' },
            { key: 'checkOut', label: 'Heure check-out', type: 'text', placeholder: 'Ex: 12h00' },
        ],
        'Résidence': [
            { key: 'surface', label: 'Surface (m²)', type: 'number', placeholder: 'Ex: 50' },
            { key: 'bedrooms', label: 'Chambres', type: 'select', options: ['Studio', '1', '2', '3', '4+'] },
            { key: 'capacity', label: 'Capacité (personnes)', type: 'number', placeholder: 'Ex: 4' },
            { key: 'minStay', label: 'Séjour minimum (nuits)', type: 'number', placeholder: 'Ex: 2' },
        ],
        'Maison d\'hôtes': [
            { key: 'roomType', label: 'Type de chambre', type: 'select', options: ['Privée', 'Partagée'] },
            { key: 'bedType', label: 'Type de lit', type: 'select', options: ['Simple', 'Double', 'Twin (2 lits)'] },
            { key: 'capacity', label: 'Capacité (personnes)', type: 'number', placeholder: 'Ex: 2' },
            { key: 'bathroomType', label: 'Salle de bain', type: 'select', options: ['Privée', 'Partagée'] },
        ],
    };

    const countries = ['Côte d\'Ivoire', 'Sénégal', 'Mali', 'Burkina Faso', 'Guinée'];

    const cities = {
        'Côte d\'Ivoire': ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San Pedro', 'Korhogo'],
        'Sénégal': ['Dakar', 'Thiès', 'Saint-Louis', 'Saly', 'Mbour'],
        'Mali': ['Bamako', 'Sikasso', 'Mopti'],
        'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso'],
        'Guinée': ['Conakry', 'Kankan']
    };

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Vérifier si l'utilisateur est certifié
        const checkVerification = async () => {
            try {
                const { verificationService } = await import('../services/api.js');
                const result = await verificationService.getStatus();
                if (result.ok) {
                    setVerificationStatus(result.data);
                    if (!result.data.canPublish) {
                        setShowVerificationModal(true);
                    }
                }
            } catch (e) {
                console.error('Error checking verification:', e);
            }
        };
        checkVerification();

        // Load listing data if editing
        if (editId) {
            const loadListing = async () => {
                try {
                    const { listingService } = await import('../services/api.js');
                    const result = await listingService.getById(editId);
                    if (result.ok) {
                        const listing = result.data.data || result.data;
                        const specs = listing.specifications || {};
                        
                        // Mapper code ISO pays vers nom complet
                        const countryNameMap = {
                            'CI': 'Côte d\'Ivoire',
                            'SN': 'Sénégal',
                            'ML': 'Mali',
                            'BF': 'Burkina Faso',
                            'BJ': 'Bénin',
                            'GN': 'Guinée'
                        };
                        
                        setFormData({
                            title: listing.title || '',
                            description: listing.description || '',
                            category: listing.category || '',
                            subcategory: listing.subcategory || '',
                            price: listing.price || '',
                            priceUnit: listing.priceUnit || 'mois',
                            transactionType: listing.type || 'location',
                            country: countryNameMap[listing.country] || listing.country || 'Côte d\'Ivoire',
                            city: listing.city || '',
                            district: listing.quartier || listing.commune || '',
                            address: listing.address || '',
                            surface: specs.surface || '',
                            rooms: specs.rooms || '',
                            bedrooms: specs.bedrooms || '',
                            bathrooms: specs.bathrooms || '',
                            furnished: specs.furnished || false,
                            parking: specs.parking || false,
                            floor: specs.floor || '',
                            elevator: specs.elevator || false,
                            brand: specs.brand || '',
                            model: specs.model || '',
                            year: specs.year || '',
                            mileage: specs.mileage || '',
                            fuel: specs.fuel || '',
                            transmission: specs.transmission || '',
                            doors: specs.doors || '',
                            seats: specs.seats || '',
                            color: specs.color || '',
                            condition: specs.condition || '',
                            characteristics: specs.characteristics || {},
                            virtualTourUrl: listing.virtualTour?.url || ''
                        });
                        if (listing.images) {
                            setImages(listing.images.map(img => typeof img === 'string' ? img : img.url));
                        }
                    }
                } catch (error) {
                    console.error('Error loading listing:', error);
                }
            };
            loadListing();
        }
    }, [editId, navigate]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImages(prev => [...prev, e.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const { listingService, uploadService } = await import('../services/api.js');

            // 1. Uploader les images d'abord
            let imageUrls = [];
            if (images.length > 0) {
                // Séparer les URLs existantes (serveur) des nouvelles images (base64)
                const existingUrls = images.filter(img => img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/uploads'));
                const newBase64Images = images.filter(img => img.startsWith('data:'));
                
                // Garder les URLs existantes
                imageUrls = [...existingUrls];
                
                // Uploader seulement les nouvelles images base64
                if (newBase64Images.length > 0) {
                    const imageFiles = await Promise.all(
                        newBase64Images.map(async (base64Image, index) => {
                            const response = await fetch(base64Image);
                            const blob = await response.blob();
                            return new File([blob], `image_${index}.${blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg'}`, { type: blob.type || 'image/jpeg' });
                        })
                    );

                    console.log('Uploading new images...', imageFiles.length);
                    const uploadResult = await uploadService.uploadImages(imageFiles);
                    console.log('Upload result:', uploadResult);

                    if (!uploadResult.ok) {
                        const errorMsg = uploadResult.data?.message || uploadResult.data?.error || 'Erreur lors de l\'upload des images';
                        console.error('Upload failed:', uploadResult);
                        setError(errorMsg);
                        setLoading(false);
                        return;
                    }

                    // Ajouter les nouvelles URLs
                    const newUrls = uploadResult.data.urls || uploadResult.data.images || [];
                    imageUrls = [...imageUrls, ...newUrls];
                }
                
                console.log('All image URLs:', imageUrls);
            }

            // Mapper le nom du pays vers le code ISO 2 lettres
            const countryCodeMap = {
                'Côte d\'Ivoire': 'CI',
                'Sénégal': 'SN',
                'Mali': 'ML',
                'Burkina Faso': 'BF',
                'Guinée': 'GN'
            };
            const countryCode = countryCodeMap[formData.country] || 'CI';

            // 2. Structurer les données pour l'API
            // Filtrer les "+ de cette annonce" (booléens true uniquement)
            const selectedHighlights = {};
            Object.entries(formData.characteristics).forEach(([key, value]) => {
                if (value === true) {
                    selectedHighlights[key] = true;
                }
            });

            const specifications = {
                // Les + de cette annonce dans un sous-objet dédié
                characteristics: Object.keys(selectedHighlights).length > 0 ? selectedHighlights : undefined,
                // Champs spécifiques selon la catégorie
                brand: formData.brand,
                model: formData.model,
                year: formData.year,
                mileage: formData.mileage,
                fuel: formData.fuel,
                transmission: formData.transmission,
                doors: formData.doors,
                seats: formData.seats,
                color: formData.color,
                condition: formData.condition,
                surface: formData.surface,
                rooms: formData.rooms,
                bedrooms: formData.bedrooms,
                bathrooms: formData.bathrooms,
                furnished: formData.furnished,
                parking: formData.parking,
                floor: formData.floor,
                elevator: formData.elevator,
            };

            // Nettoyer les valeurs vides
            Object.keys(specifications).forEach(key => {
                if (specifications[key] === '' || specifications[key] === null || specifications[key] === undefined) {
                    delete specifications[key];
                }
            });

            const data = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                subcategory: formData.subcategory,
                type: formData.transactionType,
                price: formData.price,
                priceUnit: formData.priceUnit,
                country: countryCode,  // Utiliser le code ISO au lieu du nom complet
                city: formData.city,
                commune: formData.district,
                quartier: formData.district,
                address: formData.address,
                latitude: formData.latitude,
                longitude: formData.longitude,
                specifications,
                images: imageUrls  // URLs from server
            };

            console.log('Creating listing with data:', data);

            const result = editId
                ? await listingService.update(editId, data)
                : await listingService.create(data);

            console.log('Listing creation result:', result);

            if (result.ok) {
                const listingId = result.data?.data?.id || result.data?.id || editId;

                // Si une URL de visite virtuelle est fournie, l'enregistrer
                if (formData.virtualTourUrl.trim() && listingId) {
                    try {
                        const { virtualTourService } = await import('../services/api.js');
                        await virtualTourService.setExternalUrl(listingId, formData.virtualTourUrl.trim());
                        console.log('Virtual tour URL saved');
                    } catch (tourErr) {
                        console.warn('Virtual tour URL save failed:', tourErr);
                    }
                }

                navigate('/profile');
            } else {
                // Vérifier si c'est une erreur de vérification de scope
                if (result.data?.requiresVerification && result.data?.requiredScope) {
                    // Rediriger vers la page de vérification de scope
                    const returnUrl = encodeURIComponent(`/publish${editId ? `?edit=${editId}` : ''}`);
                    navigate(`/verification-scope/${result.data.requiredScope}?returnTo=${returnUrl}`);
                    return;
                }
                const errorMsg = result.data?.message || result.data?.error || 'Erreur lors de la publication';
                console.error('Listing creation failed:', result);
                setError(errorMsg);
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Erreur de connexion: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = async () => {
        // Si on passe de l'étape 1 (catégorie) à l'étape 2, vérifier le scope
        if (step === 1 && formData.category) {
            setCheckingScope(true);
            setError('');
            
            try {
                const { scopeVerificationService } = await import('../services/api.js');
                const result = await scopeVerificationService.canPublishInCategory(formData.category, formData.subcategory || null);
                
                if (result.ok) {
                    if (!result.data.canPublish) {
                        // L'utilisateur n'est pas certifié pour cette catégorie
                        setScopeInfo(result.data);
                        const returnUrl = encodeURIComponent('/publish');
                        navigate(`/verification-scope/${result.data.requiredScope}?returnTo=${returnUrl}`);
                        return;
                    }
                }
            } catch (err) {
                console.warn('Scope check failed, continuing anyway:', err);
            } finally {
                setCheckingScope(false);
            }
        }
        
        setStep(s => Math.min(s + 1, 4));
    };
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Modal Vérification Requise */}
            {showVerificationModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center relative">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-orange-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">Vérification requise</h2>
                        {verificationStatus?.verificationStatus === 'pending' ? (
                            <>
                                <p className="text-gray-600 mb-6">
                                    Votre demande de vérification est en cours d'examen (24-72h).
                                    Vous recevrez une notification dès qu'elle sera traitée.
                                </p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300"
                                >
                                    Retour à l'accueil
                                </button>
                            </>
                        ) : verificationStatus?.verificationStatus === 'rejected' ? (
                            <>
                                <p className="text-gray-600 mb-2">
                                    Votre précédente demande a été refusée.
                                </p>
                                {verificationStatus?.currentRequest?.rejectionReason && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                        <p className="text-red-700 text-sm">
                                            <strong>Motif :</strong> {verificationStatus.currentRequest.rejectionReason}
                                        </p>
                                    </div>
                                )}
                                {verificationStatus?.canSubmit ? (
                                    <Link
                                        to="/verification"
                                        className="block w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 text-center"
                                    >
                                        Resoumettre mes documents
                                    </Link>
                                ) : (
                                    <p className="text-red-500 text-sm">Nombre maximum de tentatives atteint. Contactez le support.</p>
                                )}
                            </>
                        ) : (
                            <>
                                <p className="text-gray-600 mb-6">
                                    Pour publier une annonce, vous devez d'abord vérifier votre identité.
                                    C'est rapide et sécurisé !
                                </p>
                                <div className="space-y-3">
                                    <Link
                                        to="/verification"
                                        className="block w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 text-center"
                                    >
                                        Vérifier mon identité
                                    </Link>
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
                                    >
                                        Plus tard
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto px-4 py-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                </button>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {editId ? 'Modifier l\'annonce' : 'Publier une annonce'}
                </h1>
                <p className="text-gray-600 mb-8">Étape {step} sur 4</p>

                {/* Progress */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3, 4].map(s => (
                        <div
                            key={s}
                            className={`flex-1 h-2 rounded-full ${s <= step ? 'bg-orange-500' : 'bg-gray-200'}`}
                        />
                    ))}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-2xl p-6">
                    {/* Step 1: Category */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Catégorie</h2>
                            <div className="space-y-4">
                                {Object.entries(categories).map(([key, cat]) => (
                                    <button
                                        key={key}
                                        onClick={() => setFormData({ ...formData, category: key, subcategory: '' })}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${formData.category === key
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-gray-200 hover:border-orange-300'
                                            }`}
                                    >
                                        <p className="font-medium text-gray-900">{cat.label}</p>
                                    </button>
                                ))}
                            </div>

                            {formData.category && (
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sous-catégorie</label>
                                    <select
                                        value={formData.subcategory}
                                        onChange={(e) => {
                                            const sub = e.target.value;
                                            // Auto-déduire le type de transaction depuis la sous-catégorie
                                            let transType = formData.transactionType;
                                            if (sub.includes('vendre') || sub === 'Terrain') transType = 'vente';
                                            else if (sub.includes('louer') || sub.includes('meublé') || sub.includes('meublée') || sub === 'Hôtel' || sub === 'Résidence' || sub.includes('hôtes')) transType = 'location';
                                            setFormData({ ...formData, subcategory: sub, transactionType: transType });
                                        }}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                    >
                                        <option value="">Sélectionnez</option>
                                        {categories[formData.category]?.subcategories.map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Details */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Détails de l'annonce</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    maxLength={100}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                    placeholder="Ex: Appartement 3 pièces à Cocody"
                                />
                                <p className={`text-sm mt-1 ${formData.title.length < 10 ? 'text-red-500' : formData.title.length > 90 ? 'text-orange-500' : 'text-gray-500'}`}>
                                    {formData.title.length}/100 caractères {formData.title.length < 10 && '(minimum 10)'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                <textarea
                                    rows={5}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    maxLength={1000}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 resize-none"
                                    placeholder="Décrivez votre bien en détail..."
                                />
                                <p className={`text-sm mt-1 ${formData.description.length < 20 ? 'text-red-500' : formData.description.length > 950 ? 'text-orange-500' : 'text-gray-500'}`}>
                                    {formData.description.length}/1000 caractères {formData.description.length < 20 && '(minimum 20)'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                        placeholder="Prix en FCFA"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                                    <select
                                        value={formData.priceUnit}
                                        onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                    >
                                        <option value="">Prix fixe</option>
                                        <option value="mois">/mois</option>
                                        <option value="jour">/jour</option>
                                        <option value="heure">/heure</option>
                                        <option value="nuit">/nuit</option>
                                    </select>
                                </div>
                            </div>

                            {/* ===== LES INFORMATIONS CLÉS ===== */}
                            {/* Immobilier: Maison / Appartement */}
                            {(formData.subcategory?.includes('Maison') || formData.subcategory?.includes('Appartement')) && formData.category === 'immobilier' && (
                                <div className="border-t border-gray-100 pt-6 mt-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500 text-sm">🏠</span>
                                        Les informations clés
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
                                            <input type="number" value={formData.surface} onChange={(e) => setFormData({ ...formData, surface: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500" placeholder="Ex: 75" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de pièces</label>
                                            <select value={formData.rooms} onChange={(e) => setFormData({ ...formData, rooms: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500">
                                                <option value="">Sélectionnez</option>
                                                {['1', '2', '3', '4', '5', '6+'].map(v => <option key={v} value={v}>{v} pièce{v !== '1' ? 's' : ''}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Chambres</label>
                                            <select value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500">
                                                <option value="">Sélectionnez</option>
                                                <option value="0">Studio</option>
                                                {['1', '2', '3', '4', '5+'].map(v => <option key={v} value={v}>{v} chambre{v !== '1' ? 's' : ''}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Salles de bain</label>
                                            <select value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500">
                                                <option value="">Sélectionnez</option>
                                                {['1', '2', '3', '4+'].map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Étage</label>
                                            <select value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500">
                                                <option value="">Sélectionnez</option>
                                                {['RDC', '1er', '2ème', '3ème', '4ème', '5ème+'].map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">État</label>
                                            <select value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500">
                                                <option value="">Sélectionnez</option>
                                                {['Neuf', 'Rénové', 'Bon état', 'À rénover'].map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4 mt-4">
                                        {[{ key: 'furnished', label: 'Meublé' }, { key: 'parking', label: 'Parking' }, { key: 'elevator', label: 'Ascenseur' }].map(opt => (
                                            <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={formData[opt.key]} onChange={(e) => setFormData({ ...formData, [opt.key]: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                                                <span className="text-gray-700">{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Voiture à vendre / louer */}
                            {(formData.subcategory === 'Voiture à vendre' || formData.subcategory === 'Voiture à louer') && (
                                <div className="border-t border-gray-100 pt-6 mt-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500 text-sm">🚗</span>
                                        Les informations clés
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
                                            <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500" placeholder="Ex: Toyota" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
                                            <input type="text" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500" placeholder="Ex: Corolla" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                                            <input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500" placeholder="Ex: 2020" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Kilométrage (km)</label>
                                            <input type="number" value={formData.mileage} onChange={(e) => setFormData({ ...formData, mileage: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500" placeholder="Ex: 50000" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Énergie</label>
                                            <select value={formData.fuel} onChange={(e) => setFormData({ ...formData, fuel: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500">
                                                <option value="">Sélectionnez</option>
                                                {['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL'].map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Boîte de vitesse</label>
                                            <select value={formData.transmission} onChange={(e) => setFormData({ ...formData, transmission: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500">
                                                <option value="">Sélectionnez</option>
                                                <option value="manuelle">Manuelle</option>
                                                <option value="automatique">Automatique</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de portes</label>
                                            <select value={formData.doors} onChange={(e) => setFormData({ ...formData, doors: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500">
                                                <option value="">Sélectionnez</option>
                                                {['2', '3', '4', '5'].map(v => <option key={v} value={v}>{v} portes</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de places</label>
                                            <select value={formData.seats} onChange={(e) => setFormData({ ...formData, seats: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500">
                                                <option value="">Sélectionnez</option>
                                                {['2', '4', '5', '7', '9'].map(v => <option key={v} value={v}>{v} places</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
                                            <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500" placeholder="Ex: Noir" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">État du véhicule</label>
                                            <select value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500">
                                                <option value="">Sélectionnez</option>
                                                {['Neuf', 'Très bon état', 'Bon état', 'État correct'].map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sous-catégories avec infos clés dynamiques (Terrain, Bureau, Local, Moto, Camion, Engin, Hôtel, Résidence, Maison d'hôtes) */}
                            {keyInfoBySubcategory[formData.subcategory] && (
                                <div className="border-t border-gray-100 pt-6 mt-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500 text-sm">
                                            {formData.category === 'immobilier' ? '🏢' : formData.category === 'vehicule' ? '🚛' : '🏖️'}
                                        </span>
                                        Les informations clés
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {keyInfoBySubcategory[formData.subcategory].map(field => (
                                            <div key={field.key}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                                                {field.type === 'select' ? (
                                                    <select
                                                        value={formData.characteristics[field.key] || formData[field.key] || ''}
                                                        onChange={(e) => setFormData({ ...formData, characteristics: { ...formData.characteristics, [field.key]: e.target.value }, [field.key]: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                                    >
                                                        <option value="">Sélectionnez</option>
                                                        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type={field.type}
                                                        value={formData.characteristics[field.key] || formData[field.key] || ''}
                                                        onChange={(e) => setFormData({ ...formData, characteristics: { ...formData.characteristics, [field.key]: e.target.value }, [field.key]: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                                        placeholder={field.placeholder || ''}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Villa meublée / Appartement meublé (vacances) */}
                            {(formData.subcategory === 'Villa meublée' || formData.subcategory === 'Appartement meublé') && (
                                <div className="border-t border-gray-100 pt-6 mt-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500 text-sm">🏖️</span>
                                        Les informations clés
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
                                            <input type="number" value={formData.surface} onChange={(e) => setFormData({ ...formData, surface: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500" placeholder="Ex: 120" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Chambres</label>
                                            <select value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500">
                                                <option value="">Sélectionnez</option>
                                                {['Studio', '1', '2', '3', '4', '5+'].map(v => <option key={v} value={v}>{v === 'Studio' ? 'Studio' : `${v} chambre${v !== '1' ? 's' : ''}`}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Capacité (personnes)</label>
                                            <input type="number" value={formData.characteristics.capacity || ''} onChange={(e) => setFormData({ ...formData, characteristics: { ...formData.characteristics, capacity: e.target.value } })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500" placeholder="Ex: 6" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Salles de bain</label>
                                            <select value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500">
                                                <option value="">Sélectionnez</option>
                                                {['1', '2', '3', '4+'].map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ===== LES + DE CETTE ANNONCE ===== */}
                            {formData.subcategory && highlightsBySubcategory[formData.subcategory] && (
                                <div className="border-t border-gray-100 pt-6 mt-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-sm">✨</span>
                                        Les + de cette annonce
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">Sélectionnez les atouts de votre bien</p>
                                    <div className="flex flex-wrap gap-2">
                                        {highlightsBySubcategory[formData.subcategory].map(highlight => {
                                            const isSelected = formData.characteristics[highlight] === true;
                                            return (
                                                <button
                                                    key={highlight}
                                                    type="button"
                                                    onClick={() => setFormData({
                                                        ...formData,
                                                        characteristics: {
                                                            ...formData.characteristics,
                                                            [highlight]: !isSelected
                                                        }
                                                    })}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${isSelected
                                                        ? 'bg-orange-500 text-white border-orange-500'
                                                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                                                        }`}
                                                >
                                                    {isSelected && <span className="mr-1">✓</span>}
                                                    {highlight}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Location */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Localisation</h2>

                            {/* Carte interactive */}
                            <LocationPicker
                                latitude={formData.latitude}
                                longitude={formData.longitude}
                                onChange={({ latitude, longitude, country, city, quartier, address }) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        latitude,
                                        longitude,
                                        // Auto-remplir si la carte retourne des infos
                                        ...(country && { country: country }),
                                        ...(city && { city: city }),
                                        ...(quartier && { district: quartier }),
                                        ...(address && { address: address }),
                                    }));
                                }}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pays *</label>
                                    <select
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value, city: '' })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                    >
                                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                                    <select
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                    >
                                        <option value="">Sélectionnez</option>
                                        {(cities[formData.country] || []).map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
                                <input
                                    type="text"
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                    placeholder="Ex: Cocody Angré"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                    placeholder="Ex: Rue des Jardins, près du supermarché"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Photos */}
                    {step === 4 && (
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Photos</h2>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {images.map((img, index) => (
                                    <div key={index} className="relative aspect-square">
                                        <img src={img} alt="" className="w-full h-full object-cover rounded-xl" />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        {index === 0 && (
                                            <span className="absolute bottom-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs rounded">
                                                Photo principale
                                            </span>
                                        )}
                                    </div>
                                ))}

                                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Ajouter</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            <p className="text-sm text-gray-500 mb-6">
                                Ajoutez jusqu'à {localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).accountType === 'PRO' ? '10' : '3'} photos.
                                La première sera la photo principale.
                            </p>

                            {/* Visite virtuelle 360° */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <Globe className="w-5 h-5 text-purple-500" />
                                    <h3 className="text-lg font-bold text-gray-900">Visite virtuelle 360°</h3>
                                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full font-medium">Optionnel</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-3">
                                    Ajoutez un lien vers une visite virtuelle 360° pour attirer plus d'acheteurs.
                                    Plateformes supportées : Matterport, YouTube 360°, Kuula, Panoraven, ou tout lien d'iframe.
                                </p>
                                <input
                                    type="url"
                                    value={formData.virtualTourUrl}
                                    onChange={(e) => setFormData({ ...formData, virtualTourUrl: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                                    placeholder="https://my.matterport.com/show/?m=... ou lien YouTube 360°"
                                />
                                {formData.virtualTourUrl && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                                        <Check className="w-4 h-4" />
                                        <span>Lien de visite virtuelle ajouté</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                        {step > 1 ? (
                            <button
                                onClick={prevStep}
                                className="px-6 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
                            >
                                Précédent
                            </button>
                        ) : <div />}

                        {step < 4 ? (
                            <button
                                onClick={nextStep}
                                disabled={step === 1 && (!formData.category || !formData.subcategory)}
                                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:bg-gray-300"
                            >
                                Suivant
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || images.length === 0}
                                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:bg-gray-300 flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Publication...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        {editId ? 'Mettre à jour' : 'Publier l\'annonce'}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PublishPage;
