import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, Bookmark, LayoutGrid, Menu, Navigation } from 'lucide-react';
import ListingCard from '../components/ui/ListingCard';
import SaveSearchModal from '../components/modals/SaveSearchModal';
import { reverseGeocode } from '../services/geocoding';

// Annonces Page
function AnnoncesPage() {
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [subcategory, setSubcategory] = useState('');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [surfaceMin, setSurfaceMin] = useState('');
    const [surfaceMax, setSurfaceMax] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState(searchParams.get('country') || '');
    const [district, setDistrict] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [viewMode, setViewMode] = useState('grid');
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [apiListings, setApiListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch listings from API
    useEffect(() => {
        const fetchListings = async () => {
            try {
                const { listingService } = await import('../services/api.js');
                const result = await listingService.getAll({ limit: 50 });
                if (result.ok && result.data.data) {
                    setApiListings(result.data.data);
                }
            } catch (error) {
                console.error('Error fetching listings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchListings();
    }, []);

    // Sous-catégories par catégorie - mémorisé
    const subcategories = useMemo(() => ({
        immobilier: ['Maison à vendre', 'Maison à louer', 'Appartement à vendre', 'Appartement à louer', 'Terrain', 'Bureau', 'Local commercial'],
        vehicule: ['Voiture à vendre', 'Voiture à louer', 'Moto à vendre', 'Moto à louer', 'Camion', 'Engin'],
        vacance: ['Hôtel', 'Villa meublée', 'Appartement meublé', 'Résidence', 'Maison d\'hôtes']
    }), []);

    // Villes et pays disponibles - mémorisé
    const countries = useMemo(() => ['Côte d\'Ivoire', 'Sénégal', 'Mali', 'Burkina Faso', 'Guinée'], []);
    const cities = useMemo(() => ({
        'Côte d\'Ivoire': ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San Pedro', 'Korhogo'],
        'Sénégal': ['Dakar', 'Thiès', 'Saint-Louis', 'Saly', 'Mbour'],
        'Mali': ['Bamako', 'Sikasso', 'Mopti'],
        'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso'],
        'Guinée': ['Conakry', 'Kankan']
    }), []);

    // Quartiers par ville - mémorisé
    const districts = useMemo(() => ({
        'Abidjan': ['Cocody', 'Plateau', 'Marcory', 'Yopougon', 'Treichville', 'Adjamé'],
        'Dakar': ['Plateau', 'Almadies', 'Ngor', 'Ouakam', 'Mermoz', 'Fann'],
        'Bamako': ['Hippodrome', 'Badalabougou', 'ACI 2000', 'Hamdallaye']
    }), []);

    const handleUseMyLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    // Reverse geocode pour trouver la ville
                    setCity('Localisation...');
                    const result = await reverseGeocode(latitude, longitude);
                    if (result?.address?.city) {
                        setCity(result.address.city);
                    } else {
                        setCity('');
                    }
                },
                () => {
                    // Géolocalisation refusée
                    setCity('');
                }
            );
        }
    }, []);

    // Use API listings - mémorisé
    const sourceListings = useMemo(() => apiListings, [apiListings]);

    // Filtrage mémorisé pour éviter les recalculs inutiles
    const filteredListings = useMemo(() => {
        let results = sourceListings.filter(listing => {
            if (category && listing.category !== category) return false;
            if (subcategory && listing.subcategory !== subcategory) return false;
            if (priceMin && listing.price < parseInt(priceMin)) return false;
            if (priceMax && listing.price > parseInt(priceMax)) return false;
            if (city && listing.city !== city) return false;
            // ✅ FIX: Compare country with both name and ISO code
            if (country && listing.country !== country) {
                // Map of country names to ISO codes for flexible matching
                const countryMap = {
                    "C\u00f4te d'Ivoire": 'CI', 'S\u00e9n\u00e9gal': 'SN', 'Mali': 'ML',
                    'Burkina Faso': 'BF', 'Guin\u00e9e': 'GN',
                    'CI': "C\u00f4te d'Ivoire", 'SN': 'S\u00e9n\u00e9gal', 'ML': 'Mali',
                    'BF': 'Burkina Faso', 'GN': 'Guin\u00e9e'
                };
                const altName = countryMap[country];
                if (!altName || listing.country !== altName) return false;
            }
            if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });

        // ✅ FIX: Apply sorting
        switch (sortBy) {
            case 'price-asc':
                results.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price-desc':
                results.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'popular':
                results.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
                break;
            case 'recent':
            default:
                results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                break;
        }

        return results;
    }, [sourceListings, category, subcategory, priceMin, priceMax, city, country, searchQuery, sortBy]);

    const resetFilters = () => {
        setCategory('');
        setSubcategory('');
        setPriceMin('');
        setPriceMax('');
        setSurfaceMin('');
        setSurfaceMax('');
        setCity('');
        setCountry('');
        setDistrict('');
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Save Search Modal */}
            <SaveSearchModal
                isOpen={saveModalOpen}
                onClose={() => setSaveModalOpen(false)}
                searchQuery={searchQuery}
            />

            {/* Search Bar */}
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 h-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <button className="h-12 w-12 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center">
                            <Search className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setSaveModalOpen(true)}
                            className="h-12 w-12 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50"
                        >
                            <Bookmark className="w-5 h-5" />
                        </button>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="h-12 px-4 border border-gray-200 rounded-lg bg-white text-gray-700"
                        >
                            <option value="recent">Plus récentes</option>
                            <option value="price_asc">Prix croissant</option>
                            <option value="price_desc">Prix décroissant</option>
                            <option value="popular">Plus populaires</option>
                        </select>
                        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`h-12 w-12 flex items-center justify-center ${viewMode === 'grid' ? 'bg-gray-100 text-orange-500' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`h-12 w-12 flex items-center justify-center border-l border-gray-200 ${viewMode === 'list' ? 'bg-gray-100 text-orange-500' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Sidebar Filters */}
                    <div className="w-64 flex-shrink-0 hidden lg:block">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h3 className="font-semibold text-gray-900 mb-6 text-lg">Filtres</h3>

                            {/* Category */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                                <select
                                    value={category}
                                    onChange={(e) => { setCategory(e.target.value); setSubcategory(''); }}
                                    className={`w-full h-11 px-4 rounded-lg bg-white text-gray-700 text-sm appearance-none cursor-pointer transition-all ${category
                                        ? 'border-2 border-orange-500 ring-2 ring-orange-100'
                                        : 'border border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                                        }`}
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                                >
                                    <option value="">Toutes les catégories</option>
                                    <option value="immobilier">Immobilier</option>
                                    <option value="vacance">Vacances</option>
                                    <option value="vehicule">Véhicules</option>
                                </select>
                            </div>

                            {/* Subcategory */}
                            {category && (
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sous-catégorie</label>
                                    <select
                                        value={subcategory}
                                        onChange={(e) => setSubcategory(e.target.value)}
                                        className={`w-full h-11 px-4 rounded-lg bg-white text-gray-700 text-sm appearance-none cursor-pointer transition-all ${subcategory
                                            ? 'border-2 border-orange-500 ring-2 ring-orange-100'
                                            : 'border border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                                            }`}
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                                    >
                                        <option value="">Toutes les sous-catégories</option>
                                        {subcategories[category]?.map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Country */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                                <select
                                    value={country}
                                    onChange={(e) => { setCountry(e.target.value); setCity(''); }}
                                    className={`w-full h-11 px-4 rounded-lg bg-white text-gray-700 text-sm appearance-none cursor-pointer transition-all ${country
                                        ? 'border-2 border-orange-500 ring-2 ring-orange-100'
                                        : 'border border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                                        }`}
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                                >
                                    <option value="">Tous les pays</option>
                                    {countries.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* City */}
                            {country && (
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                                    <select
                                        value={city}
                                        onChange={(e) => { setCity(e.target.value); setDistrict(''); }}
                                        className={`w-full h-11 px-4 rounded-lg bg-white text-gray-700 text-sm appearance-none cursor-pointer transition-all ${city
                                            ? 'border-2 border-orange-500 ring-2 ring-orange-100'
                                            : 'border border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                                            }`}
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                                    >
                                        <option value="">Toutes les villes</option>
                                        {cities[country]?.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* District/Quartier */}
                            {city && districts[city] && (
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quartier</label>
                                    <select
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        className={`w-full h-11 px-4 rounded-lg bg-white text-gray-700 text-sm appearance-none cursor-pointer transition-all ${district
                                            ? 'border-2 border-orange-500 ring-2 ring-orange-100'
                                            : 'border border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                                            }`}
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                                    >
                                        <option value="">Tous les quartiers</option>
                                        {districts[city]?.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Ma position */}
                            <div className="mb-5">
                                <button
                                    onClick={handleUseMyLocation}
                                    className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm bg-white hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-600 transition-all"
                                >
                                    <MapPin className="w-4 h-4 text-orange-500" />
                                    Utiliser ma position
                                </button>
                            </div>

                            {/* Price */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Prix (FCFA)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={priceMin}
                                        onChange={(e) => setPriceMin(e.target.value)}
                                        className="w-1/2 h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={priceMax}
                                        onChange={(e) => setPriceMax(e.target.value)}
                                        className="w-1/2 h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Surface - Only for immobilier */}
                            {(category === 'immobilier' || category === '') && (
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Surface (m²)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={surfaceMin}
                                            onChange={(e) => setSurfaceMin(e.target.value)}
                                            className="w-1/2 h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={surfaceMax}
                                            onChange={(e) => setSurfaceMax(e.target.value)}
                                            className="w-1/2 h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Reset */}
                            <button
                                onClick={resetFilters}
                                className="w-full h-11 border border-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Réinitialiser les filtres
                            </button>
                        </div>
                    </div>

                    {/* Listings Grid */}
                    <div className="flex-1">
                        <p className="text-gray-600 mb-6">{isLoading ? 'Chargement...' : `${filteredListings.length} annonces trouvées`}</p>

                        {/* Skeleton Loader */}
                        {isLoading && (
                            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                                        <div className="h-48 bg-gray-200"></div>
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            <div className="flex justify-between items-center pt-2">
                                                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isLoading && (
                            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                {filteredListings.map((listing) => (
                                    <ListingCard key={listing.id} listing={listing} />
                                ))}
                            </div>
                        )}

                        {!isLoading && filteredListings.length === 0 && (
                            <div className="text-center py-16">
                                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 text-lg">Aucune annonce trouvée</p>
                                <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos filtres</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 mt-12">
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
        </div>
    );
}

export default AnnoncesPage;
