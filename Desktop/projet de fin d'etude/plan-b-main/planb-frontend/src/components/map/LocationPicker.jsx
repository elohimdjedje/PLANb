/**
 * LocationPicker — Composant de sélection de position sur carte
 * 
 * Permet à l'utilisateur de :
 *  - Cliquer sur la carte pour placer un marqueur
 *  - Utiliser sa position GPS actuelle
 *  - Rechercher une adresse avec autocomplétion (Nominatim)
 *  - Auto-remplir pays/ville/quartier/adresse depuis les coordonnées
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Search, X, Loader } from 'lucide-react';
import { searchAddress, reverseGeocode, countryCodeToName } from '../../services/geocoding';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon (webpack/vite issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Icône personnalisée orange pour le marqueur
const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// === Sous-composant: écoute les clics sur la carte ===
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// === Sous-composant: recentre la carte sur la position ===
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.flyTo([lat, lng], 15, { duration: 1 });
    }
  }, [lat, lng, map]);
  return null;
}

/**
 * @param {object} props
 * @param {number|null} props.latitude - Latitude initiale
 * @param {number|null} props.longitude - Longitude initiale
 * @param {function} props.onChange - Callback ({latitude, longitude, country, city, quartier, address})
 * @param {string} props.className - Classes CSS additionnelles
 */
export default function LocationPicker({ latitude, longitude, onChange, className = '' }) {
  const [position, setPosition] = useState(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );
  const [mapCenter, setMapCenter] = useState(
    latitude && longitude ? [latitude, longitude] : [5.36, -4.0083] // Abidjan par défaut
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isReversing, setIsReversing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Fermer les résultats quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recherche avec debounce
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.trim().length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchAddress(value);
      setSearchResults(results);
      setShowResults(results.length > 0);
      setIsSearching(false);
    }, 500);
  }, []);

  // Sélectionner un résultat de recherche
  const handleSelectResult = useCallback((result) => {
    const newPos = { lat: result.lat, lng: result.lng };
    setPosition(newPos);
    setMapCenter([result.lat, result.lng]);
    setSearchQuery(result.displayName.split(',').slice(0, 2).join(','));
    setShowResults(false);

    onChange?.({
      latitude: result.lat,
      longitude: result.lng,
      country: countryCodeToName(result.address.countryCode),
      city: result.address.city,
      quartier: result.address.suburb,
      address: [result.address.road, result.address.houseNumber].filter(Boolean).join(' ') || '',
    });
  }, [onChange]);

  // Clic sur la carte → reverse geocode
  const handleMapClick = useCallback(async (lat, lng) => {
    const newPos = { lat, lng };
    setPosition(newPos);
    setIsReversing(true);

    const result = await reverseGeocode(lat, lng);
    setIsReversing(false);

    if (result) {
      setSearchQuery(result.displayName.split(',').slice(0, 3).join(','));
      onChange?.({
        latitude: lat,
        longitude: lng,
        country: countryCodeToName(result.address.countryCode),
        city: result.address.city,
        quartier: result.address.suburb,
        address: [result.address.road, result.address.houseNumber].filter(Boolean).join(' ') || '',
      });
    } else {
      onChange?.({
        latitude: lat,
        longitude: lng,
        country: '',
        city: '',
        quartier: '',
        address: '',
      });
    }
  }, [onChange]);

  // Bouton "Ma position" (GPS)
  const handleUseMyLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const newPos = { lat, lng };
        setPosition(newPos);
        setMapCenter([lat, lng]);

        // Reverse geocode la position GPS
        const result = await reverseGeocode(lat, lng);
        setIsLocating(false);

        if (result) {
          setSearchQuery(result.displayName.split(',').slice(0, 3).join(','));
          onChange?.({
            latitude: lat,
            longitude: lng,
            country: countryCodeToName(result.address.countryCode),
            city: result.address.city,
            quartier: result.address.suburb,
            address: [result.address.road, result.address.houseNumber].filter(Boolean).join(' ') || '',
          });
        } else {
          onChange?.({ latitude: lat, longitude: lng, country: '', city: '', quartier: '', address: '' });
        }
      },
      (err) => {
        setIsLocating(false);
        console.error('Geolocation error:', err);
        alert('Impossible d\'accéder à votre position. Vérifiez les permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onChange]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Barre de recherche + bouton GPS */}
      <div className="flex gap-2">
        <div ref={searchContainerRef} className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Rechercher une adresse, un quartier..."
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults([]); setShowResults(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {isSearching && (
              <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 animate-spin" />
            )}
          </div>

          {/* Résultats de recherche */}
          {showResults && (
            <div className="absolute z-[1000] mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectResult(result)}
                  className="w-full text-left px-4 py-3 hover:bg-orange-50 border-b border-gray-100 last:border-0 flex items-start gap-2"
                >
                  <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 line-clamp-2">{result.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bouton GPS */}
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="flex items-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {isLocating ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span className="hidden sm:inline text-sm font-medium">Ma position</span>
        </button>
      </div>

      {/* Carte */}
      <div className="relative rounded-xl overflow-hidden border border-gray-200" style={{ height: '350px' }}>
        {isReversing && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-white px-3 py-1.5 rounded-full shadow-md flex items-center gap-2">
            <Loader className="w-3 h-3 text-orange-500 animate-spin" />
            <span className="text-xs text-gray-600">Identification de l'adresse...</span>
          </div>
        )}
        <MapContainer
          center={mapCenter}
          zoom={position ? 15 : 6}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleMapClick} />
          {position && <RecenterMap lat={position.lat} lng={position.lng} />}
          {position && <Marker position={[position.lat, position.lng]} icon={orangeIcon} />}
        </MapContainer>
      </div>

      {/* Indication */}
      <p className="text-xs text-gray-500 flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        Cliquez sur la carte ou recherchez une adresse pour positionner votre annonce
      </p>

      {/* Coordonnées sélectionnées (si debug) */}
      {position && (
        <div className="text-xs text-gray-400">
          📍 {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}
