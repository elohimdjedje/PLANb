// Configuration des caractéristiques par sous-catégorie
// Ce fichier définit "Les + de cette annonce" et "Les informations clés" pour chaque type de bien

import {
    Car, Calendar, Gauge, Fuel, Settings, DoorOpen, Armchair,
    Square, BedDouble, Bath, Building, MapPin, Sofa, Shield,
    TreePine, Utensils, Wifi, Snowflake, Navigation, Camera,
    Bluetooth, Thermometer, Layers, Maximize, Check, Star,
    Home, Briefcase, Zap, Wind, Tv, UtensilsCrossed, Waves,
    ParkingCircle, Users, Baby, Dumbbell, Sparkles
} from 'lucide-react';

// Icônes personnalisées
const CircleIcon = () => <div className="w-5 h-5 rounded-full border-2 border-current" />;
const ArrowUpIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
);

// ============================================================================
// VÉHICULES
// ============================================================================

const vehiculeVoitureVendre = {
    highlights: [
        { id: 'regulateur_vitesse', label: 'Régulateur de vitesse', icon: Gauge },
        { id: 'bluetooth', label: 'Bluetooth', icon: Bluetooth },
        { id: 'climatisation', label: 'Climatisation', icon: Snowflake },
        { id: 'gps', label: 'GPS', icon: Navigation },
        { id: 'toit_ouvrant', label: 'Toit ouvrant', icon: Layers },
        { id: 'siege_chauffant', label: 'Sièges chauffants', icon: Thermometer },
        { id: 'camera_recul', label: 'Caméra de recul', icon: Camera },
        { id: 'aide_parking', label: 'Aide au parking', icon: ParkingCircle },
        { id: 'jantes_alu', label: 'Jantes aluminium', icon: CircleIcon },
        { id: 'vitres_electriques', label: 'Vitres électriques', icon: Maximize },
    ],
    keyInfo: [
        { key: 'brand', label: 'Marque', icon: Car },
        { key: 'model', label: 'Modèle', icon: Car },
        { key: 'year', label: 'Année modèle', icon: Calendar, format: (v) => v },
        { key: 'mileage', label: 'Kilométrage', icon: Gauge, format: (v) => `${parseInt(v).toLocaleString()} km` },
        { key: 'fuel', label: 'Énergie', icon: Fuel },
        { key: 'transmission', label: 'Boîte de vitesse', icon: Settings },
        { key: 'doors', label: 'Nombre de portes', icon: DoorOpen },
        { key: 'seats', label: 'Nombre de places', icon: Armchair },
        { key: 'color', label: 'Couleur', icon: Sparkles },
        { key: 'condition', label: 'État du véhicule', icon: Check },
    ]
};

const vehiculeMotoVendre = {
    highlights: [
        { id: 'abs', label: 'ABS', icon: Shield },
        { id: 'freinage_combine', label: 'Freinage combiné', icon: Check },
        { id: 'anti_demarrage', label: 'Système anti-démarrage', icon: Shield },
        { id: 'poignees_chauffantes', label: 'Poignées chauffantes', icon: Thermometer },
    ],
    keyInfo: [
        { key: 'brand', label: 'Marque', icon: Car },
        { key: 'model', label: 'Modèle', icon: Car },
        { key: 'year', label: 'Année', icon: Calendar },
        { key: 'mileage', label: 'Kilométrage', icon: Gauge, format: (v) => `${parseInt(v).toLocaleString()} km` },
        { key: 'cylindree', label: 'Cylindrée', icon: Zap, format: (v) => `${v} cm³` },
        { key: 'type_moto', label: 'Type', icon: Car },
        { key: 'color', label: 'Couleur', icon: Sparkles },
        { key: 'condition', label: 'État', icon: Check },
    ]
};

const vehiculeCamion = {
    highlights: [
        { id: 'climatisation', label: 'Climatisation', icon: Snowflake },
        { id: 'gps', label: 'GPS', icon: Navigation },
        { id: 'camera_recul', label: 'Caméra de recul', icon: Camera },
    ],
    keyInfo: [
        { key: 'brand', label: 'Marque', icon: Car },
        { key: 'model', label: 'Modèle', icon: Car },
        { key: 'year', label: 'Année', icon: Calendar },
        { key: 'mileage', label: 'Kilométrage', icon: Gauge, format: (v) => `${parseInt(v).toLocaleString()} km` },
        { key: 'fuel', label: 'Carburant', icon: Fuel },
        { key: 'charge_utile', label: 'Charge utile', icon: Briefcase, format: (v) => `${v} kg` },
        { key: 'transmission', label: 'Boîte de vitesse', icon: Settings },
        { key: 'condition', label: 'État', icon: Check },
    ]
};

// ============================================================================
// IMMOBILIER
// ============================================================================

const immobilierAppartementLouer = {
    highlights: [
        { id: 'meuble', label: 'Meublé', icon: Sofa },
        { id: 'parking', label: 'Parking', icon: Car },
        { id: 'ascenseur', label: 'Ascenseur', icon: ArrowUpIcon },
        { id: 'gardien', label: 'Gardien', icon: Shield },
        { id: 'balcon', label: 'Balcon', icon: Building },
        { id: 'terrasse', label: 'Terrasse', icon: TreePine },
        { id: 'cave', label: 'Cave', icon: Square },
        { id: 'cuisine_equipee', label: 'Cuisine équipée', icon: Utensils },
    ],
    keyInfo: [
        { key: 'surface', label: 'Surface', icon: Square, format: (v) => `${v} m²` },
        { key: 'rooms', label: 'Pièces', icon: DoorOpen },
        { key: 'bedrooms', label: 'Chambres', icon: BedDouble },
        { key: 'bathrooms', label: 'Salles de bain', icon: Bath },
        { key: 'floor', label: 'Étage', icon: Building },
        { key: 'furnished', label: 'Meublé', icon: Sofa, format: (v) => v ? 'Oui' : 'Non' },
        { key: 'parking', label: 'Parking', icon: Car, format: (v) => v ? 'Oui' : 'Non' },
        { key: 'elevator', label: 'Ascenseur', icon: ArrowUpIcon, format: (v) => v ? 'Oui' : 'Non' },
    ]
};

const immobilierMaisonVendre = {
    highlights: [
        { id: 'jardin', label: 'Jardin', icon: TreePine },
        { id: 'piscine', label: 'Piscine', icon: Waves },
        { id: 'garage', label: 'Garage', icon: Car },
        { id: 'terrasse', label: 'Terrasse', icon: TreePine },
        { id: 'cuisine_equipee', label: 'Cuisine équipée', icon: Utensils },
        { id: 'climatisation', label: 'Climatisation', icon: Snowflake },
    ],
    keyInfo: [
        { key: 'surface', label: 'Surface habitable', icon: Square, format: (v) => `${v} m²` },
        { key: 'terrain_surface', label: 'Surface terrain', icon: Square, format: (v) => `${v} m²` },
        { key: 'rooms', label: 'Pièces', icon: DoorOpen },
        { key: 'bedrooms', label: 'Chambres', icon: BedDouble },
        { key: 'bathrooms', label: 'Salles de bain', icon: Bath },
        { key: 'floors', label: 'Nombre d\'étages', icon: Building },
        { key: 'parking', label: 'Parking', icon: Car, format: (v) => v ? 'Oui' : 'Non' },
        { key: 'garden', label: 'Jardin', icon: TreePine, format: (v) => v ? 'Oui' : 'Non' },
    ]
};

const immobilierTerrain = {
    highlights: [
        { id: 'titre_foncier', label: 'Titre foncier', icon: Shield },
        { id: 'viabilise', label: 'Viabilisé', icon: Check },
        { id: 'cloture', label: 'Clôturé', icon: Building },
        { id: 'acces_route', label: 'Accès route', icon: Navigation },
    ],
    keyInfo: [
        { key: 'surface', label: 'Surface', icon: Square, format: (v) => `${v} m²` },
        { key: 'terrain_type', label: 'Type de terrain', icon: Home },
        { key: 'viabilise', label: 'Viabilisé', icon: Check, format: (v) => v ? 'Oui' : 'Non' },
        { key: 'titre_foncier', label: 'Titre foncier', icon: Shield, format: (v) => v ? 'Oui' : 'Non' },
        { key: 'acces_route', label: 'Accès route', icon: Navigation, format: (v) => v ? 'Oui' : 'Non' },
        { key: 'cloture', label: 'Clôturé', icon: Building, format: (v) => v ? 'Oui' : 'Non' },
    ]
};

const immobilierBureau = {
    highlights: [
        { id: 'climatisation', label: 'Climatisation', icon: Snowflake },
        { id: 'parking', label: 'Parking', icon: Car },
        { id: 'ascenseur', label: 'Ascenseur', icon: ArrowUpIcon },
        { id: 'wifi', label: 'WiFi', icon: Wifi },
        { id: 'gardien', label: 'Gardien', icon: Shield },
    ],
    keyInfo: [
        { key: 'surface', label: 'Surface', icon: Square, format: (v) => `${v} m²` },
        { key: 'rooms', label: 'Nombre de bureaux', icon: DoorOpen },
        { key: 'floor', label: 'Étage', icon: Building },
        { key: 'parking', label: 'Parking', icon: Car, format: (v) => v ? 'Oui' : 'Non' },
        { key: 'elevator', label: 'Ascenseur', icon: ArrowUpIcon, format: (v) => v ? 'Oui' : 'Non' },
        { key: 'furnished', label: 'Meublé', icon: Sofa, format: (v) => v ? 'Oui' : 'Non' },
    ]
};

// ============================================================================
// VACANCES
// ============================================================================

const vacanceHotel = {
    highlights: [
        { id: 'piscine', label: 'Piscine', icon: Waves },
        { id: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed },
        { id: 'wifi', label: 'WiFi gratuit', icon: Wifi },
        { id: 'parking', label: 'Parking gratuit', icon: Car },
        { id: 'climatisation', label: 'Climatisation', icon: Snowflake },
        { id: 'service_chambre', label: 'Service de chambre', icon: Users },
        { id: 'salle_sport', label: 'Salle de sport', icon: Dumbbell },
        { id: 'spa', label: 'Spa', icon: Sparkles },
    ],
    keyInfo: [
        { key: 'stars', label: 'Nombre d\'étoiles', icon: Star },
        { key: 'rooms_count', label: 'Nombre de chambres', icon: BedDouble },
        { key: 'breakfast', label: 'Petit-déjeuner inclus', icon: UtensilsCrossed, format: (v) => v ? 'Oui' : 'Non' },
        { key: 'piscine', label: 'Piscine', icon: Waves, format: (v) => v ? 'Oui' : 'Non' },
        { key: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed, format: (v) => v ? 'Oui' : 'Non' },
        { key: 'wifi', label: 'WiFi', icon: Wifi, format: (v) => v ? 'Gratuit' : 'Payant' },
        { key: 'parking', label: 'Parking', icon: Car, format: (v) => v ? 'Gratuit' : 'Payant' },
    ]
};

const vacanceVillaMeublee = {
    highlights: [
        { id: 'piscine', label: 'Piscine', icon: Waves },
        { id: 'vue_mer', label: 'Vue mer', icon: Navigation },
        { id: 'wifi', label: 'WiFi', icon: Wifi },
        { id: 'climatisation', label: 'Climatisation', icon: Snowflake },
        { id: 'parking', label: 'Parking', icon: Car },
        { id: 'jardin', label: 'Jardin', icon: TreePine },
        { id: 'barbecue', label: 'Barbecue', icon: UtensilsCrossed },
    ],
    keyInfo: [
        { key: 'surface', label: 'Surface', icon: Square, format: (v) => `${v} m²` },
        { key: 'bedrooms', label: 'Chambres', icon: BedDouble },
        { key: 'bathrooms', label: 'Salles de bain', icon: Bath },
        { key: 'capacity', label: 'Capacité', icon: Users, format: (v) => `${v} personnes` },
        { key: 'piscine', label: 'Piscine', icon: Waves, format: (v) => v ? 'Oui' : 'Non' },
        { key: 'wifi', label: 'WiFi', icon: Wifi, format: (v) => v ? 'Oui' : 'Non' },
        { key: 'parking', label: 'Parking', icon: Car, format: (v) => v ? 'Oui' : 'Non' },
    ]
};

// ============================================================================
// MAPPING DES SOUS-CATÉGORIES
// ============================================================================

export const subcategoryConfig = {
    // Véhicules
    'Voiture à vendre': vehiculeVoitureVendre,
    'Voiture à louer': vehiculeVoitureVendre,
    'Moto à vendre': vehiculeMotoVendre,
    'Moto à louer': vehiculeMotoVendre,
    'Camion': vehiculeCamion,
    'Engin': vehiculeCamion,

    // Immobilier
    'Appartement à vendre': immobilierAppartementLouer,
    'Appartement à louer': immobilierAppartementLouer,
    'Maison à vendre': immobilierMaisonVendre,
    'Maison à louer': immobilierMaisonVendre,
    'Terrain': immobilierTerrain,
    'Bureau': immobilierBureau,
    'Local commercial': immobilierBureau,

    // Vacances
    'Hôtel': vacanceHotel,
    'Villa meublée': vacanceVillaMeublee,
    'Appartement meublé': vacanceVillaMeublee,
    'Résidence': vacanceHotel,
    'Maison d\'hôtes': vacanceHotel,
};

// Fallback vers la catégorie principale si sous-catégorie non trouvée
export const categoryFallback = {
    vehicule: vehiculeVoitureVendre,
    immobilier: immobilierAppartementLouer,
    vacance: vacanceHotel,
};

export default subcategoryConfig;
