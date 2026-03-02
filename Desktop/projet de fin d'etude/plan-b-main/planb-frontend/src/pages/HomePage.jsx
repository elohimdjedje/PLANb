import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, MapPin, SlidersHorizontal, X, Home, Hotel, Car,
    Star, ArrowRight, TrendingUp, Shield, CreditCard
} from 'lucide-react';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import ListingCard from '../components/ui/ListingCard';

// Home Page
function HomePage() {
    const [query, setQuery] = useState('');
    const [city, setCity] = useState('');
    const [category, setCategory] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [subcategory, setSubcategory] = useState('');
    const [country, setCountry] = useState('');
    const [district, setDistrict] = useState('');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [surfaceMin, setSurfaceMin] = useState('');
    const [currentBgImage, setCurrentBgImage] = useState(0);
    const [listings, setListings] = useState([]);
    const [proListingsData, setProListingsData] = useState([]);
    const [recentListingsData, setRecentListingsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchActive, setSearchActive] = useState(false);
    const resultsRef = useRef(null);

    const [platformStats, setPlatformStats] = useState({ activeListings: 0, totalUsers: 0, countries: 0 });

    // Fetch listings and stats from API (avec cache sessionStorage 2 minutes)
    useEffect(() => {
        const CACHE_KEY = 'planb_homepage_data';
        const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

        const loadFromCache = () => {
            try {
                const raw = sessionStorage.getItem(CACHE_KEY);
                if (!raw) return null;
                const { data, timestamp } = JSON.parse(raw);
                if (Date.now() - timestamp < CACHE_TTL) return data;
                sessionStorage.removeItem(CACHE_KEY);
            } catch (_) { /* cache corrompu — on ignore */ }
            return null;
        };

        const saveToCache = (data) => {
            try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
            } catch (_) { /* sessionStorage plein ou indisponible */ }
        };

        const fetchData = async () => {
            // Charger depuis le cache si disponible
            const cached = loadFromCache();
            if (cached) {
                setListings(cached.listings);
                setProListingsData(cached.proListings);
                setRecentListingsData(cached.recentListings);
                setPlatformStats(cached.stats);
                setIsLoading(false);
                return;
            }

            try {
                const { listingService } = await import('../services/api.js');

                // Fetch all listings and stats en parallèle
                const [allResult, proResult, recentResult, statsResult] = await Promise.all([
                    listingService.getAll({ limit: 20 }),
                    listingService.getProListings(6),       // PRO listings via /listings/pro
                    listingService.getRecentListings(8),    // Recent listings via /listings/recent
                    listingService.getStats()                // Statistiques plateforme
                ]);

                const newListings = allResult.ok ? (allResult.data.data || []) : [];
                const newProListings = proResult.ok ? (proResult.data.data || []) : [];
                const newRecentListings = recentResult.ok ? (recentResult.data.data || []) : [];
                const newStats = (statsResult.ok && statsResult.data.stats) ? statsResult.data.stats : { activeListings: 0, totalUsers: 0, countries: 0 };

                setListings(newListings);
                setProListingsData(newProListings);
                setRecentListingsData(newRecentListings);
                setPlatformStats(newStats);

                // Sauvegarder en cache
                saveToCache({ listings: newListings, proListings: newProListings, recentListings: newRecentListings, stats: newStats });
            } catch (error) {
                console.error('Error fetching data:', error);
                setListings([]);
                setProListingsData([]);
                setRecentListingsData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Images pour le diaporama (null = collage voitures) - mémorisé
    const bgImages = useMemo(() => [
        '/Immeuble-Clarte_Claudio-Merlini1-scaled.jpg',
        '/nieruchomosci-w-Calpe.webp',
        'cars-collage'
    ], []);

    // Images de voitures pour le collage - mémorisé
    const carImages = useMemo(() => [
        '/car0.webp',
        '/car1.webp',
        '/car2.webp',
        '/car3.webp',
        '/car4.webp'
    ], []);

    // Diaporama automatique
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBgImage((prev) => (prev + 1) % bgImages.length);
        }, 5000); // Change toutes les 5 secondes
        return () => clearInterval(interval);
    }, [bgImages.length]);

    // Sous-catégories par catégorie - mémorisé
    const subcategories = useMemo(() => ({
        immobilier: ['Maison à vendre', 'Maison à louer', 'Appartement à vendre', 'Appartement à louer', 'Terrain', 'Bureau'],
        vehicule: ['Voiture à vendre', 'Voiture à louer', 'Moto à vendre', 'Moto à louer', 'Camion'],
        vacance: ['Hôtel', 'Villa meublée', 'Appartement meublé', 'Résidence']
    }), []);

    // Pays et villes - mémorisé
    const countries = useMemo(() => ['Côte d\'Ivoire', 'Sénégal', 'Mali', 'Burkina Faso', 'Guinée'], []);
    const citiesByCountry = useMemo(() => ({
        'Côte d\'Ivoire': ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San Pedro'],
        'Sénégal': ['Dakar', 'Thiès', 'Saint-Louis', 'Saly'],
        'Mali': ['Bamako', 'Sikasso'],
        'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso'],
        'Guinée': ['Conakry', 'Kankan']
    }), []);

    // Quartiers par ville - mémorisé
    const districtsByCity = useMemo(() => ({
        'Abidjan': ['Cocody', 'Plateau', 'Marcory', 'Yopougon', 'Treichville'],
        'Dakar': ['Plateau', 'Almadies', 'Ngor', 'Ouakam', 'Mermoz'],
        'Bamako': ['Hippodrome', 'Badalabougou', 'ACI 2000']
    }), []);

    const handleUseMyLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Store coords and show a friendly label in the city field
                    setCity(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
                },
                () => {
                    // Silently ignore — geolocation denied or unavailable
                    setCity('');
                }
            );
        }
    }, []);

    // Use API data - mémorisé
    const proListings = useMemo(() => proListingsData, [proListingsData]);
    const recentListings = useMemo(() => recentListingsData, [recentListingsData]);

    // Use real stats from API - mémorisé
    const stats = useMemo(() => ({
        total: platformStats.activeListings || listings.length || 0,
        users: platformStats.totalUsers || 0,
        countries: platformStats.countries || 0
    }), [platformStats, listings.length]);

    // Compteurs par catégorie - mémorisé
    const immobilierCount = useMemo(() =>
        listings.filter(l => l.category === 'immobilier').length,
        [listings]
    );
    const vacanceCount = useMemo(() =>
        listings.filter(l => l.category === 'vacance').length,
        [listings]
    );
    const vehiculeCount = useMemo(() =>
        listings.filter(l => l.category === 'vehicule').length,
        [listings]
    );

    // ── Smart Search Engine ───────────────────────────────────────────
    //
    // Normalise le texte : accents + minuscules
    const normalize = (s = '') =>
        s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Dictionnaire de synonymes → termes recherchés dans les données
    const SYNONYMS = useMemo(() => ({
        // ── Codes pièces (T1…T10) ──
        t1: ['t1', 'studio', '1 pièce', '1 piece', 'une pièce'],
        t2: ['t2', '2 pièces', '2 pieces', 'deux pièces', 'f2'],
        t3: ['t3', '3 pièces', '3 pieces', 'trois pièces', 'f3', '3 chambres'],
        t4: ['t4', '4 pièces', '4 pieces', 'quatre pièces', 'f4', '4 chambres'],
        t5: ['t5', '5 pièces', '5 pieces', 'cinq pièces', 'f5', '5 chambres'],
        t6: ['t6', '6 pièces', 'f6'], t7: ['t7', 'f7'], t8: ['t8', 'f8'],
        t9: ['t9', 'f9'], t10: ['t10', 'f10'],

        // ── Immobilier ──
        maison: ['maison', 'villa', 'bungalow', 'pavillon', 'duplex', 'maison individuelle'],
        appartement: ['appartement', 'appart', 'flat'],
        studio: ['studio', 't1', '1 pièce', 'chambre meublée'],
        villa: ['villa', 'maison', 'résidence', 'domaine'],
        terrain: ['terrain', 'parcelle', 'lot', 'zone', 'foncier'],
        bureau: ['bureau', 'local commercial', 'cabinet', 'open space', 'coworking'],
        immeuble: ['immeuble', 'bâtiment', 'résidence', 'buildings'],
        local: ['local', 'commerce', 'boutique', 'magasin', 'entrepôt'],
        louer: ['louer', 'location', 'loyer', 'mensuell', 'locatif', 'bail'],
        vendre: ['vendre', 'vente', 'achat', 'cession', 'acquérir'],
        meuble: ['meublé', 'meuble', 'équipé', 'décoré', 'aménagé'],
        neuf: ['neuf', 'nouveau', 'livraison', 'construction', 'récent'],
        ancien: ['ancien', 'rénové', 'réhabilité', 'occasion'],
        luxe: ['luxe', 'prestige', 'premium', 'haut de gamme', 'standing'],
        piscine: ['piscine', 'pool'],
        jardin: ['jardin', 'garden', 'cour', 'terrasse'],

        // ── Véhicules ──
        voiture: ['voiture', 'véhicule', 'automobile', 'auto', 'berline', 'suv', '4x4', 'citadine'],
        moto: ['moto', 'scooter', 'motocyclette', 'deux-roues', 'moto cross'],
        camion: ['camion', 'truck', 'utilitaire', 'fourgon', 'benne'],
        occasion: ['occasion', 'usagé', 'second main', 'seconde main', '2ème main'],
        diesel: ['diesel', 'gazole', 'gasoil'],
        essence: ['essence', 'sans plomb', 'sp95', 'sp98'],
        hybride: ['hybride', 'hybrid'],
        electrique: ['électrique', 'electrique', 'ev', 'zéro émission'],
        automatique: ['automatique', 'auto', 'boîte automatique'],
        manuel: ['manuelle', 'manuel', 'mécanique', 'boîte manuelle'],
        toyota: ['toyota'], mercedes: ['mercedes', 'benz'], bmw: ['bmw'],
        peugeot: ['peugeot'], renault: ['renault'], tesla: ['tesla'],
        hyundai: ['hyundai'], kia: ['kia'], honda: ['honda'], ford: ['ford'],

        // ── Vacances ──
        hotel: ['hôtel', 'hotel', 'hébergement', 'chambre d\'hôtel'],
        residence: ['résidence', 'residence', 'appart-hôtel', 'appart hotel'],
        plage: ['plage', 'beach', 'bord de mer', 'côtier', 'maritime'],
        piscine_vac: ['piscine', 'pool', 'aquatique'],
        vue_mer: ['vue mer', 'ocean', 'vue sur mer', 'front de mer'],

        // ── Catégories globales ──
        immobilier: ['immobilier', 'maison', 'appartement', 'terrain', 'bureau', 'villa', 'local'],
        vehicule: ['véhicule', 'vehicule', 'voiture', 'moto', 'camion', 'auto'],
        vacance: ['vacance', 'vacances', 'hôtel', 'hotel', 'villa', 'meublé', 'séjour', 'tourisme'],
    }), []);

    const filteredListings = useMemo(() => {
        if (!searchActive) return [];
        const q = normalize(query.trim());
        const loc = normalize(city.trim());

        // Expand query: find all synonym groups that match the typed word
        const expandedTerms = new Set([q]);
        if (q) {
            Object.entries(SYNONYMS).forEach(([key, synonymList]) => {
                const normKey = normalize(key);
                // If user typed the key or any synonym, expand with all group terms
                if (normKey === q || synonymList.some(s => normalize(s) === q || normalize(s).startsWith(q) || q.startsWith(normalize(s)))) {
                    synonymList.forEach(s => expandedTerms.add(normalize(s)));
                    expandedTerms.add(normKey);
                }
            });
        }

        // Check if any expanded term is contained in a text field
        const matchesAny = (text = '') => {
            const n = normalize(text);
            return [...expandedTerms].some(t => t && n.includes(t));
        };

        // Special: Tx room code → match rooms count in specifications
        const roomMatch = q.match(/^t(\d+)$/);
        const targetRooms = roomMatch ? parseInt(roomMatch[1]) : null;

        return listings.filter(l => {
            // ── Keyword ──
            let keywordOk = !q;
            if (!keywordOk) {
                // Room code shortcut (T3 → rooms=3)
                if (targetRooms !== null) {
                    const rooms = l.specifications?.rooms || l.specifications?.bedrooms;
                    keywordOk = Number(rooms) === targetRooms;
                    // also allow "3 pièces" variant in title/description
                    if (!keywordOk) keywordOk = matchesAny(l.title) || matchesAny(l.description) || matchesAny(l.subcategory);
                } else {
                    keywordOk = matchesAny(l.title)
                        || matchesAny(l.description)
                        || matchesAny(l.subcategory)
                        || matchesAny(l.category)
                        || matchesAny(l.city)
                        || matchesAny(l.specifications?.brand)
                        || matchesAny(l.specifications?.model)
                        || matchesAny(l.specifications?.fuel)
                        || matchesAny(l.specifications?.transmission)
                        || matchesAny(l.specifications?.condition)
                        || matchesAny(l.specifications?.color);
                }
            }

            // ── Location (champ texte rapide) ──
            const locationOk = !loc
                || normalize(l.city || '').includes(loc)
                || normalize(l.country || '').includes(loc)
                || normalize(l.commune || '').includes(loc)
                || normalize(l.quartier || '').includes(loc);

            // ── Category dropdown ──
            const categoryOk = !category || l.category === category;

            // ── Sous-catégorie (filtre avancé) ──
            const subcategoryOk = !subcategory
                || normalize(l.subcategory || '').includes(normalize(subcategory));

            // ── Pays (filtre avancé) ──
            const countryOk = !country
                || normalize(l.country || '').includes(normalize(country));

            // ── Quartier / Ville avancée ──
            const districtOk = !district
                || normalize(l.quartier || '').includes(normalize(district))
                || normalize(l.commune || '').includes(normalize(district));

            // ── Advanced filters ──
            const priceOk = (!priceMin || l.price >= Number(priceMin)) &&
                (!priceMax || l.price <= Number(priceMax));
            const surfaceOk = !surfaceMin ||
                (l.specifications?.surface >= Number(surfaceMin));

            return keywordOk && locationOk && categoryOk && subcategoryOk && countryOk && districtOk && priceOk && surfaceOk;
        });
    }, [searchActive, query, city, category, subcategory, country, district, priceMin, priceMax, surfaceMin, listings, SYNONYMS]);

    const handleSearch = useCallback(async () => {
        setSearchActive(true);
        
        // Aussi chercher via l'API pour obtenir plus de résultats que les 20 initiaux
        try {
            const { listingService } = await import('../services/api.js');
            const params = { limit: 50 };
            if (query.trim()) params.search = query.trim();
            if (city.trim()) params.city = city.trim();
            if (category) params.category = category;
            if (subcategory) params.subcategory = subcategory;
            if (country) {
                // Mapper nom pays vers code ISO pour l'API
                const countryCodeMap = {
                    'Côte d\'Ivoire': 'CI', 'Sénégal': 'SN', 'Mali': 'ML',
                    'Burkina Faso': 'BF', 'Guinée': 'GN'
                };
                params.country = countryCodeMap[country] || country;
            }
            if (priceMin) params.minPrice = priceMin;
            if (priceMax) params.maxPrice = priceMax;
            
            const result = await listingService.getAll(params);
            if (result.ok && result.data.data) {
                setListings(result.data.data);
            }
        } catch (error) {
            console.error('Search API error:', error);
        }
        
        // Scroll vers les résultats
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
    }, [query, city, category, subcategory, country, priceMin, priceMax]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') handleSearch();
    }, [handleSearch]);

    // Reset search when all fields are cleared
    useEffect(() => {
        if (!query && !city && !category && !subcategory && !country && !district && !priceMin && !priceMax && !surfaceMin) {
            setSearchActive(false);
        }
    }, [query, city, category, subcategory, country, district, priceMin, priceMax, surfaceMin]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative pt-28 pb-40 overflow-hidden">
                {/* Background Slideshow */}
                <div className="absolute inset-0">
                    {bgImages.map((img, index) => (
                        img === 'cars-collage' ? (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBgImage ? 'opacity-100' : 'opacity-0'
                                    }`}
                            >
                                <div className="w-full h-full grid grid-cols-3 grid-rows-2">
                                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${carImages[0]})` }} />
                                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${carImages[1]})` }} />
                                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${carImages[2]})` }} />
                                    <div className="w-full h-full bg-cover bg-center col-span-2" style={{ backgroundImage: `url(${carImages[3]})` }} />
                                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${carImages[4]})` }} />
                                </div>
                            </div>
                        ) : (
                            <div
                                key={index}
                                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === currentBgImage ? 'opacity-100' : 'opacity-0'
                                    }`}
                                style={{ backgroundImage: `url(${img})` }}
                            />
                        )
                    ))}
                    {/* Orange overlay with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/85 via-orange-400/80 to-amber-400/85" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4">
                    {/* Title */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                            Trouvez votre bonheur
                            <br />
                            <span className="text-amber-200">partout en Afrique</span>
                        </h1>
                        <p className="text-white/90 text-lg">
                            Immobilier, Vacances, Véhicules – Des milliers d'annonces vous attendent
                        </p>
                    </div>

                    {/* Search Form */}
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl p-5 shadow-2xl">
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Que recherchez-vous ?"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full pl-12 pr-4 h-14 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex-1 relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Ville ou pays"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full pl-12 pr-4 h-14 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className={`h-14 px-4 rounded-xl bg-white text-gray-700 focus:outline-none md:w-48 appearance-none cursor-pointer transition-all ${category
                                    ? 'border-2 border-orange-500 ring-2 ring-orange-100'
                                    : 'border border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-orange-500'
                                    }`}
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                            >
                                <option value="">Catégorie</option>
                                <option value="immobilier">Immobilier</option>
                                <option value="vacance">Vacances</option>
                                <option value="vehicule">Véhicules</option>
                            </select>
                            <button
                                onClick={handleSearch}
                                className="h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
                            >
                                <Search className="w-5 h-5" />
                                Rechercher
                            </button>
                        </div>
                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className="flex items-center gap-2 mt-4 text-gray-500 hover:text-orange-600 transition-colors text-sm"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filtres avancés
                        </button>

                        {/* Advanced Filters Panel */}
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showAdvancedFilters ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                            }`}>
                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                <h4 className="font-medium text-gray-900">Filtres avancés</h4>
                                <button
                                    onClick={() => setShowAdvancedFilters(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Row 1: Sous-catégorie, Pays, Ville, Quartier */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Sous-catégorie</label>
                                    <select
                                        value={subcategory}
                                        onChange={(e) => setSubcategory(e.target.value)}
                                        disabled={!category}
                                        className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-400"
                                    >
                                        <option value="">{category ? 'Toutes' : 'Choisir catégorie'}</option>
                                        {category && subcategories[category]?.map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Pays</label>
                                    <select
                                        value={country}
                                        onChange={(e) => { setCountry(e.target.value); setCity(''); setDistrict(''); }}
                                        className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    >
                                        <option value="">Tous les pays</option>
                                        {countries.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Ville</label>
                                    <select
                                        value={city}
                                        onChange={(e) => { setCity(e.target.value); setDistrict(''); }}
                                        disabled={!country}
                                        className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-400"
                                    >
                                        <option value="">{country ? 'Toutes les villes' : 'Choisir pays'}</option>
                                        {country && citiesByCountry[country]?.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Quartier</label>
                                    <select
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        disabled={!city || !districtsByCity[city]}
                                        className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-400"
                                    >
                                        <option value="">{city && districtsByCity[city] ? 'Tous' : 'Choisir ville'}</option>
                                        {city && districtsByCity[city]?.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Row 2: Prix, Surface, Position */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Prix min</label>
                                    <input
                                        type="number"
                                        placeholder="0 FCFA"
                                        value={priceMin}
                                        onChange={(e) => setPriceMin(e.target.value)}
                                        className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Prix max</label>
                                    <input
                                        type="number"
                                        placeholder="Max FCFA"
                                        value={priceMax}
                                        onChange={(e) => setPriceMax(e.target.value)}
                                        className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>
                                {(category === 'immobilier' || category === '' || category === 'vacance') && (
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Surface min (m²)</label>
                                        <input
                                            type="number"
                                            placeholder="m²"
                                            value={surfaceMin}
                                            onChange={(e) => setSurfaceMin(e.target.value)}
                                            className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Localisation</label>
                                    <button
                                        onClick={handleUseMyLocation}
                                        className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm bg-white hover:bg-gray-50 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 flex items-center justify-center gap-2 text-gray-600"
                                    >
                                        <MapPin className="w-4 h-4 text-orange-500" />
                                        Ma position
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats with animated counters */}
                    <div className="flex flex-wrap justify-center gap-10 md:gap-20 mt-12">
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-bold text-white">
                                <AnimatedCounter end={stats.total} duration={2000} />
                            </p>
                            <p className="text-white/70 text-sm">Annonces actives</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-bold text-white">
                                <AnimatedCounter end={stats.users} duration={2500} />
                            </p>
                            <p className="text-white/70 text-sm">Utilisateurs</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-bold text-white">
                                <AnimatedCounter end={stats.countries} duration={1500} />
                            </p>
                            <p className="text-white/70 text-sm">Pays couverts</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Cards */}
            <section className="max-w-7xl mx-auto px-4 -mt-20 relative z-10 mb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Link to="/category/immobilier" className="group">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                <Home className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-white font-semibold text-xl">Immobilier</h3>
                            <p className="text-white/70 text-sm mt-1">Maisons, terrains, magasins</p>
                            <span className="inline-block mt-3 px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full">
                                {immobilierCount || '+'} annonces
                            </span>
                        </div>
                    </Link>
                    <Link to="/category/vacance" className="group">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                <Hotel className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-white font-semibold text-xl">Vacances</h3>
                            <p className="text-white/70 text-sm mt-1">Hôtels, résidences meublées</p>
                            <span className="inline-block mt-3 px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full">
                                {vacanceCount || '+'} annonces
                            </span>
                        </div>
                    </Link>
                    <Link to="/category/vehicule" className="group">
                        <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                <Car className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-white font-semibold text-xl">Véhicules</h3>
                            <p className="text-white/70 text-sm mt-1">Voitures, motos et plus</p>
                            <span className="inline-block mt-3 px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full">
                                {vehiculeCount || '+'} annonces
                            </span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* ── SEARCH RESULTS (shown when query active) ── */}
            {searchActive && (
                <section ref={resultsRef} className="max-w-7xl mx-auto px-4 py-12 scroll-mt-24">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {filteredListings.length > 0
                                    ? <>{filteredListings.length} résultat{filteredListings.length > 1 ? 's' : ''} pour <span className="text-orange-500">&laquo;{query || city || category}&raquo;</span></>
                                    : 'Aucun résultat trouvé'
                                }
                            </h2>
                            {filteredListings.length === 0 && (
                                <p className="text-gray-500 mt-1">Essayez un autre mot-clé ou modifiez les filtres.</p>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                setSearchActive(false);
                                setQuery(''); setCity(''); setCategory('');
                                setSubcategory(''); setCountry(''); setDistrict('');
                                setPriceMin(''); setPriceMax(''); setSurfaceMin('');
                            }}
                            className="text-sm text-gray-500 hover:text-orange-600 underline"
                        >
                            Effacer la recherche
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredListings.map(listing => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                </section>
            )}

            {/* ── Show default sections only when search is NOT active ── */}
            {!searchActive && (
                <>
                    {/* Pro Listings Section */}
                    <section className="max-w-7xl mx-auto px-4 py-12">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
                                    <span className="text-orange-600 font-semibold text-sm">ANNONCES PRO</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Sélection Premium</h2>
                            </div>
                            <Link to="/annonces?pro=true" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium">
                                Voir tout <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {proListings.map((listing) => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    </section>

                    {/* Recent Listings Section */}
                    <section className="max-w-7xl mx-auto px-4 py-12">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="w-5 h-5 text-orange-500" />
                                    <span className="text-orange-600 font-semibold text-sm">NOUVELLES ANNONCES</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">récemment ajoutés</h2>
                            </div>
                            <Link to="/annonces" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium">
                                Voir tout <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recentListings.map((listing) => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="bg-gray-100 py-16">
                        <div className="max-w-7xl mx-auto px-4">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
                                Pourquoi choisir PlanB ?
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Shield className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Vendeurs vérifiés</h3>
                                    <p className="text-gray-600 text-sm">Tous nos bailleurs passent par une vérification stricte</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <CreditCard className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Paiements sécurisés</h3>
                                    <p className="text-gray-600 text-sm">Payez les loyers et les mises en garde directement sur la plateforme</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Star className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Visite virtuelle à 360°</h3>
                                    <p className="text-gray-600 text-sm">Explorez les biens sans vous déplacer</p>
                                </div>
                            </div>
                        </div>
                    </section>






                    {/* PRO CTA Section */}
                    <section className="max-w-7xl mx-auto px-4 py-16">

                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full -translate-y-32 translate-x-32" />
                            <div className="relative z-10 max-w-2xl">
                                <div className="inline-flex items-center gap-2 bg-orange-500 px-4 py-2 rounded-full text-white text-sm mb-4">
                                    <Star className="w-4 h-4 fill-current" />
                                    COMPTE PRO
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                    Boostez votre visibilité
                                </h2>
                                <p className="text-gray-300 text-lg mb-6">
                                    Annonces illimitées, 8 photos par annonce, visite virtuelle 360°, statistiques avancées
                                    et mise en avant sur la page d'accueil.
                                </p>
                                <div className="flex flex-wrap items-center gap-4">
                                    <Link to="/upgrade" className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-semibold transition-all">
                                        Seulement 5 000 FCFA/mois
                                    </Link>
                                    <span className="text-gray-400 text-sm">Sans engagement</span>
                                </div>
                            </div>
                        </div>
                    </section >

                    {/* Footer */}
                    < footer className="bg-gray-900 text-white py-12" >
                        <div className="max-w-7xl mx-auto px-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                                <div className="col-span-2 md:col-span-1">
                                    <div className="flex items-center gap-2 mb-4">
                                        <img src="/logofinal.png" alt="PlanB" className="h-20 w-auto" />
                                        <span className="text-xl font-bold">PlanB</span>
                                    </div>
                                    <p className="text-gray-400 text-sm">
                                        La première plateforme de petites annonces pour l'Afrique.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-4">Catégories</h4>
                                    <ul className="space-y-2 text-gray-400 text-sm">
                                        <li><Link to="/annonces?category=immobilier" className="hover:text-white">Immobilier</Link></li>
                                        <li><Link to="/annonces?category=vacance" className="hover:text-white">Vacances</Link></li>
                                        <li><Link to="/annonces?category=vehicule" className="hover:text-white">Véhicules</Link></li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-4">Compte</h4>
                                    <ul className="space-y-2 text-gray-400 text-sm">
                                        <li><Link to="/publish" className="hover:text-white">Déposer une annonce</Link></li>
                                        <li><Link to="/profile" className="hover:text-white">Mes annonces</Link></li>
                                        <li><Link to="/upgrade" className="hover:text-white">Compte PRO</Link></li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-4">À propos</h4>
                                    <ul className="space-y-2 text-gray-400 text-sm">
                                        <li><Link to="/about" className="hover:text-white">Qui sommes-nous</Link></li>
                                        <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                                        <li><Link to="/terms" className="hover:text-white">Conditions d'utilisation</Link></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                                © {new Date().getFullYear()} PlanB. Tous droits réservés.
                            </div>
                        </div>
                    </footer>
                </>
            )
            }
        </div>
    );
}

export default HomePage;
