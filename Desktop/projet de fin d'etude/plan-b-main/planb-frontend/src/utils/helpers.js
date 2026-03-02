// Utility functions and configurations

// ── Image URL helper ──────────────────────────────────────────────
// Les images backend sont stockées avec un chemin relatif (/uploads/listings/xxx.jpg).
// En dev, le proxy Vite redirige /uploads → backend:8000.
// En prod, on préfixe avec l'URL du backend si le chemin est relatif.
const BACKEND_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '')
    : '';

export function getImageUrl(url) {
    if (!url) return null;
    // Déjà une URL absolue (http/https/data) → retourner tel quel
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }
    // Chemin relatif /uploads/... → préfixer avec le backend en prod
    if (url.startsWith('/uploads')) {
        return BACKEND_URL ? `${BACKEND_URL}${url}` : url;
    }
    // Tout autre chemin relatif
    return BACKEND_URL ? `${BACKEND_URL}${url}` : url;
}

// Statut badge colors (aligné avec les statuts backend: draft, active, expired, sold, suspended)
export const statusConfig = {
    'draft': { label: 'Brouillon', color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-50' },
    'active': { label: 'Active', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' },
    'expired': { label: 'Expirée', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' },
    'sold': { label: 'Vendu', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' },
    'suspended': { label: 'Suspendue', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50' },
};

export function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR').format(price);
}

// Mapper code ISO pays vers nom complet
const countryNameMap = {
    'CI': 'Côte d\'Ivoire',
    'SN': 'Sénégal',
    'ML': 'Mali',
    'BF': 'Burkina Faso',
    'BJ': 'Bénin',
    'GN': 'Guinée',
};

export function countryCodeToName(code) {
    return countryNameMap[code] || code;
}

// Sous-catégories par catégorie
export const subcategories = {
    immobilier: ['Maison à vendre', 'Maison à louer', 'Appartement à vendre', 'Appartement à louer', 'Terrain', 'Bureau', 'Local commercial'],
    vehicule: ['Voiture à vendre', 'Voiture à louer', 'Moto à vendre', 'Moto à louer', 'Camion', 'Engin'],
    vacance: ['Hôtel', 'Villa meublée', 'Appartement meublé', 'Résidence', 'Maison d\'hôtes']
};

// Pays disponibles
export const countries = ['Côte d\'Ivoire', 'Sénégal', 'Mali', 'Burkina Faso', 'Guinée'];

// Villes par pays
export const citiesByCountry = {
    'Côte d\'Ivoire': ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San Pedro', 'Korhogo'],
    'Sénégal': ['Dakar', 'Thiès', 'Saint-Louis', 'Saly', 'Mbour'],
    'Mali': ['Bamako', 'Sikasso', 'Mopti'],
    'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso'],
    'Guinée': ['Conakry', 'Kankan']
};

// Quartiers par ville
export const districtsByCity = {
    'Abidjan': ['Cocody', 'Plateau', 'Marcory', 'Yopougon', 'Treichville', 'Adjamé'],
    'Dakar': ['Plateau', 'Almadies', 'Ngor', 'Ouakam', 'Mermoz', 'Fann'],
    'Bamako': ['Hippodrome', 'Badalabougou', 'ACI 2000', 'Hamdallaye']
};
