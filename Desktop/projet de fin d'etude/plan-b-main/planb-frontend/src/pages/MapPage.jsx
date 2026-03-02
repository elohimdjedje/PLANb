// MapPage - Carte interactive Leaflet avec recherche "autour de moi"
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Navigation, X } from 'lucide-react';
import { formatPrice, getImageUrl } from '../utils/helpers';

// ── Fix Leaflet icon paths ────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ── Villes principales Afrique de l'Ouest ────────────────────────────
const CITY_COORDS = {
    'abidjan': [5.3600, -4.0083], 'bouaké': [7.6886, -5.0319],
    'yamoussoukro': [6.8276, -5.2893], 'san pedro': [4.7485, -6.6363],
    'dakar': [14.7167, -17.4677], 'thiès': [14.7910, -16.9259],
    'saly': [14.4601, -17.0207], 'bamako': [12.6392, -8.0029],
    'ouagadougou': [12.3686, -1.5275], 'bobo-dioulasso': [11.1771, -4.2979],
    'conakry': [9.6412, -13.5784], 'accra': [5.6037, -0.1870],
    'lagos': [6.5244, 3.3792], 'douala': [4.0511, 9.7679],
    'nairobi': [1.2921, 36.8219], 'lomé': [6.1375, 1.2123],
    'cotonou': [6.3654, 2.4183], 'abuja': [9.0579, 7.4951],
};

function getCoords(listing) {
    if (listing.latitude && listing.longitude)
        return [parseFloat(listing.latitude), parseFloat(listing.longitude)];
    const city = (listing.city || listing.commune || '').toLowerCase().trim();
    return CITY_COORDS[city] || null;
}

// ── Haversine distance (km) ───────────────────────────────────────────
function haversine([lat1, lon1], [lat2, lon2]) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── SVG paths Lucide par type de bien ────────────────────────────────
const LUCIDE_ICONS = {
    villa: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
    maison: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
    appartement: `<rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="2" x2="9" y2="22"/><line x1="15" y1="2" x2="15" y2="22"/><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>`,
    'appartement à louer': `<rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="2" x2="9" y2="22"/><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>`,
    studio: `<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>`,
    terrain: `<polygon points="3 11 22 2 13 21 11 13 3 11"/>`,
    bureau: `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`,
    'local commercial': `<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>`,
    immeuble: `<rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="2" x2="9" y2="22"/><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/>`,
    duplex: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>`,
    voiture: `<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>`,
    moto: `<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>`,
    scooter: `<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>`,
    camion: `<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>`,
    hôtel: `<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/><line x1="12" y1="4" x2="12" y2="10"/>`,
    hotel: `<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/><line x1="12" y1="4" x2="12" y2="10"/>`,
    bungalow: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>`,
    résidence: `<rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="2" x2="9" y2="22"/>`,
    immobilier: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
    vehicule: `<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>`,
    vacance: `<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/>`,
    default: `<circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/>`,
};

const CAT_COLORS = {
    immobilier: { bg: '#3b82f6', sel: '#1d4ed8' },
    vehicule: { bg: '#10b981', sel: '#065f46' },
    vacance: { bg: '#f59e0b', sel: '#b45309' },
    default: { bg: '#f97316', sel: '#ea580c' },
};

function makeIcon(category, subcategory, selected = false) {
    const palette = CAT_COLORS[category] || CAT_COLORS.default;
    const bg = selected ? palette.sel : palette.bg;
    const size = selected ? 48 : 40;
    const key = (subcategory || '').toLowerCase().trim();
    const catKey = (category || '').toLowerCase().trim();
    const svgPath = LUCIDE_ICONS[key] || LUCIDE_ICONS[catKey] || LUCIDE_ICONS.default;
    return L.divIcon({
        className: '',
        html: `<div style="width:${size}px;height:${size}px;background:${bg};border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.4);${selected ? 'transform:scale(1.15);' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(size * .52)}" height="${Math.round(size * .52)}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg>
        </div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -(size / 2 + 4)],
    });
}

// Marqueur "ma position" pulsant
const ME_ICON = L.divIcon({
    className: '',
    html: `<div style="position:relative;width:24px;height:24px;">
        <div style="position:absolute;inset:0;background:#f97316;border-radius:50%;opacity:.3;animation:pulse 1.5s infinite;"></div>
        <div style="position:absolute;inset:4px;background:#f97316;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>
        <style>@keyframes pulse{0%{transform:scale(1);opacity:.4}70%{transform:scale(2.2);opacity:0}100%{transform:scale(1);opacity:0}}</style>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

// Recentre la carte
function FlyTo({ coords, zoom = 13 }) {
    const map = useMap();
    useEffect(() => {
        if (coords) map.flyTo(coords, zoom, { duration: 1 });
    }, [coords, zoom, map]);
    return null;
}

// ── Composant principal ───────────────────────────────────────────────
function MapPage() {
    const [allListings, setAllListings] = useState([]);
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('');
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // "Autour de moi"
    const [userPos, setUserPos] = useState(null); // [lat, lng]
    const [nearRadius, setNearRadius] = useState(50);   // km
    const [nearActive, setNearActive] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const { listingService } = await import('../services/api.js');
                const result = await listingService.getAll({ limit: 200 });
                if (result.ok) setAllListings(result.data.data || []);
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        })();
    }, []);

    // Annonces avec coords
    const mapped = useMemo(() =>
        allListings.map(l => ({ ...l, _coords: getCoords(l) })).filter(l => l._coords),
        [allListings]
    );

    // Filtrage : catégorie + texte + (si mode "autour de moi") distance
    const filtered = useMemo(() => {
        let list = filter ? mapped.filter(l => l.category === filter) : mapped;
        if (searchText.trim()) {
            const q = searchText.toLowerCase();
            list = list.filter(l =>
                l.title?.toLowerCase().includes(q) ||
                l.city?.toLowerCase().includes(q) ||
                l.subcategory?.toLowerCase().includes(q)
            );
        }
        if (nearActive && userPos) {
            list = list.filter(l => haversine(userPos, l._coords) <= nearRadius);
        }
        return list;
    }, [mapped, filter, searchText, nearActive, userPos, nearRadius]);

    // Activer "autour de moi"
    const handleNearMe = useCallback(() => {
        if (!navigator.geolocation) return;
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setUserPos([coords.latitude, coords.longitude]);
                setNearActive(true);
                setGeoLoading(false);
            },
            () => setGeoLoading(false),
            { timeout: 10000 }
        );
    }, []);

    const cancelNearMe = useCallback(() => {
        setNearActive(false);
        setUserPos(null);
    }, []);

    const center = useMemo(() =>
        nearActive && userPos ? userPos :
            filtered.length > 0 ? filtered[0]._coords :
                [7.54, -5.55],   // Côte d'Ivoire par défaut
        [filtered, nearActive, userPos]
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-16 flex">

            {/* ── Sidebar ── */}
            <div className="fixed left-0 top-16 bottom-0 w-80 bg-white shadow-lg z-[1000] flex flex-col">

                {/* Header + Search */}
                <div className="p-4 border-b border-gray-200 flex-shrink-0 space-y-3">

                    {/* Barre de recherche */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher sur la carte..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                        />
                    </div>

                    {/* Bouton "Autour de moi" */}
                    {!nearActive ? (
                        <button
                            onClick={handleNearMe}
                            disabled={geoLoading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all bg-orange-500 hover:bg-orange-600 text-white shadow disabled:opacity-60"
                        >
                            <Navigation className="w-4 h-4" />
                            {geoLoading ? 'Localisation…' : 'Autour de moi'}
                        </button>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {/* Rayon */}
                            <div className="flex items-center gap-2">
                                <Navigation className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                <span className="text-xs text-gray-600 flex-1">Rayon : <strong>{nearRadius} km</strong></span>
                                <button onClick={cancelNearMe} className="text-gray-400 hover:text-red-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <input
                                type="range" min={5} max={500} step={5}
                                value={nearRadius}
                                onChange={e => setNearRadius(Number(e.target.value))}
                                className="w-full accent-orange-500"
                            />
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>5 km</span><span>500 km</span>
                            </div>
                        </div>
                    )}

                    {/* Filtres catégorie */}
                    <div className="flex gap-2 flex-wrap">
                        {[
                            { val: '', label: 'Tout' },
                            { val: 'immobilier', label: '🏠 Immo' },
                            { val: 'vacance', label: '🏨 Vacances' },
                            { val: 'vehicule', label: '🚗 Véhicules' },
                        ].map(({ val, label }) => (
                            <button
                                key={val}
                                onClick={() => setFilter(val)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === val
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <p className="text-xs text-gray-400">
                        {isLoading ? 'Chargement…' : (
                            nearActive
                                ? `${filtered.length} annonce${filtered.length !== 1 ? 's' : ''} dans un rayon de ${nearRadius} km`
                                : `${filtered.length} annonce${filtered.length !== 1 ? 's' : ''} sur la carte`
                        )}
                    </p>
                </div>

                {/* Liste */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">
                                {nearActive
                                    ? `Aucune annonce à moins de ${nearRadius} km de vous`
                                    : 'Aucune annonce trouvée'}
                            </p>
                            {nearActive && (
                                <button
                                    onClick={() => setNearRadius(r => Math.min(r + 50, 500))}
                                    className="mt-3 text-xs text-orange-600 underline"
                                >
                                    Élargir le rayon
                                </button>
                            )}
                        </div>
                    ) : (
                        filtered.map(listing => {
                            const dist = nearActive && userPos
                                ? haversine(userPos, listing._coords)
                                : null;
                            return (
                                <button
                                    key={listing.id}
                                    onClick={() => setSelected(listing)}
                                    className={`w-full p-4 border-b border-gray-100 text-left transition-colors hover:bg-orange-50 ${selected?.id === listing.id ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <img
                                            src={getImageUrl(listing.mainImage || listing.images?.[0]?.url) || '/placeholder.jpg'}
                                            alt={listing.title}
                                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">{listing.title}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <MapPin className="w-3 h-3" />
                                                {listing.city || 'Ville inconnue'}
                                                {dist !== null && (
                                                    <span className="ml-1 text-orange-500 font-semibold">
                                                        · {dist < 1 ? '<1' : Math.round(dist)} km
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-orange-500 font-bold text-sm mt-0.5">
                                                {formatPrice(listing.price)} FCFA
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── Carte ── */}
            <div className="ml-80 flex-1 h-[calc(100vh-64px)]">
                <MapContainer
                    center={center}
                    zoom={nearActive ? 11 : 7}
                    style={{ width: '100%', height: '100%' }}
                    scrollWheelZoom
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Recentrage automatique */}
                    {nearActive && userPos && <FlyTo coords={userPos} zoom={nearRadius < 30 ? 13 : nearRadius < 100 ? 11 : 9} />}
                    {!nearActive && selected?._coords && <FlyTo coords={selected._coords} zoom={13} />}

                    {/* Cercle de rayon "autour de moi" */}
                    {nearActive && userPos && (
                        <Circle
                            center={userPos}
                            radius={nearRadius * 1000}
                            pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.08, weight: 2, dashArray: '6 4' }}
                        />
                    )}

                    {/* Marqueur position utilisateur */}
                    {userPos && (
                        <Marker position={userPos} icon={ME_ICON}>
                            <Popup><strong>Vous êtes ici</strong></Popup>
                        </Marker>
                    )}

                    {/* Marqueurs annonces */}
                    {filtered.map(listing => (
                        <Marker
                            key={listing.id}
                            position={listing._coords}
                            icon={makeIcon(listing.category, listing.subcategory, selected?.id === listing.id)}
                            eventHandlers={{ click: () => setSelected(listing) }}
                        >
                            <Popup>
                                <div style={{ minWidth: 200 }}>
                                    <img
                                        src={getImageUrl(listing.mainImage) || '/placeholder.jpg'}
                                        alt={listing.title}
                                        style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }}
                                    />
                                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{listing.title}</p>
                                    <p style={{ color: '#f97316', fontWeight: 700 }}>{formatPrice(listing.price)} FCFA</p>
                                    <p style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>{listing.city}</p>
                                    {nearActive && userPos && (
                                        <p style={{ color: '#f97316', fontSize: 11, marginTop: 2 }}>
                                            📍 {Math.round(haversine(userPos, listing._coords))} km de vous
                                        </p>
                                    )}
                                    <Link
                                        to={`/listing/${listing.id}`}
                                        style={{
                                            display: 'block', marginTop: 10, background: '#f97316', color: 'white',
                                            textAlign: 'center', padding: '6px 0', borderRadius: 6, fontSize: 13,
                                            fontWeight: 600, textDecoration: 'none'
                                        }}
                                    >
                                        Voir l'annonce →
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}

export default MapPage;
