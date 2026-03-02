import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, SlidersHorizontal, MapPin, DollarSign, 
    Home, Car, Plane, X, Filter, TrendingUp
} from 'lucide-react';
import ListingCard from '../components/ui/ListingCard';
import { searchService } from '../services/api';

function AdvancedSearchPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useState({
        q: '',
        category: '',
        type: '',
        country: '',
        city: '',
        minPrice: '',
        maxPrice: '',
        sortBy: 'recent',
    });
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [popularSearches, setPopularSearches] = useState([]);
    const [categories, setCategories] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (searchParams.q.length >= 2) {
            loadSuggestions(searchParams.q);
        } else {
            setSuggestions([]);
        }
    }, [searchParams.q]);

    const loadInitialData = async () => {
        try {
            const [categoriesResult, popularResult] = await Promise.all([
                searchService.getCategories(),
                searchService.getPopularSearches(),
            ]);

            if (categoriesResult.ok) {
                setCategories(categoriesResult.data.categories || []);
            }
            if (popularResult.ok) {
                setPopularSearches(popularResult.data.popular || []);
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    };

    const loadSuggestions = async (query) => {
        try {
            const result = await searchService.getSuggestions(query);
            if (result.ok) {
                setSuggestions(result.data.suggestions || []);
            }
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
    };

    const loadCities = async (country) => {
        if (!country) return;
        try {
            const result = await searchService.getCities(country);
            if (result.ok) {
                setCities(result.data.cities || []);
            }
        } catch (error) {
            console.error('Error loading cities:', error);
        }
    };

    const handleSearch = async () => {
        setIsLoading(true);
        try {
            const params = {
                ...searchParams,
                limit: 20,
                offset: 0,
            };

            // Nettoyer les paramètres vides
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) {
                    delete params[key];
                }
            });

            const result = await searchService.advancedSearch(params);
            if (result.ok) {
                setResults(result.data.results || []);
                setTotal(result.data.total || 0);
            }
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setIsLoading(false);
            setShowFilters(false);
        }
    };

    const handlePopularSearch = (search) => {
        setSearchParams({
            ...searchParams,
            q: search.query,
            category: search.category || '',
            type: search.type || '',
        });
    };

    const clearFilters = () => {
        setSearchParams({
            q: '',
            category: '',
            type: '',
            country: '',
            city: '',
            minPrice: '',
            maxPrice: '',
            sortBy: 'recent',
        });
        setResults([]);
        setTotal(0);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Recherche avancée</h1>
                    <p className="text-gray-500">Trouvez exactement ce que vous cherchez</p>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchParams.q}
                                onChange={(e) => setSearchParams({ ...searchParams, q: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-12 pr-4 h-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            {suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setSearchParams({ ...searchParams, q: suggestion.text });
                                                setSuggestions([]);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{suggestion.text}</span>
                                                {suggestion.confidence && (
                                                    <span className="text-xs text-gray-400">{suggestion.confidence}%</span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                                showFilters
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <SlidersHorizontal className="w-5 h-5 inline mr-2" />
                            Filtres
                        </button>
                        <button
                            onClick={handleSearch}
                            disabled={isLoading}
                            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50"
                        >
                            {isLoading ? 'Recherche...' : 'Rechercher'}
                        </button>
                    </div>

                    {/* Popular Searches */}
                    {popularSearches.length > 0 && searchParams.q === '' && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Recherches populaires
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {popularSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handlePopularSearch(search)}
                                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
                                    >
                                        {search.query} ({search.count})
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                Filtres avancés
                            </h2>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                            >
                                <X className="w-4 h-4" />
                                Réinitialiser
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Home className="w-4 h-4 inline mr-1" />
                                    Catégorie
                                </label>
                                <select
                                    value={searchParams.category}
                                    onChange={(e) => setSearchParams({ ...searchParams, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Toutes les catégories</option>
                                    {categories.map((cat) => (
                                        <option key={cat.name} value={cat.name}>
                                            {cat.name} ({cat.count})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type
                                </label>
                                <select
                                    value={searchParams.type}
                                    onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Tous les types</option>
                                    <option value="vente">Vente</option>
                                    <option value="location">Location</option>
                                    <option value="recherche">Recherche</option>
                                </select>
                            </div>

                            {/* Country */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    Pays
                                </label>
                                <input
                                    type="text"
                                    placeholder="Pays"
                                    value={searchParams.country}
                                    onChange={(e) => {
                                        setSearchParams({ ...searchParams, country: e.target.value });
                                        loadCities(e.target.value);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            {/* City */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ville
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ville"
                                    value={searchParams.city}
                                    onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            {/* Min Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <DollarSign className="w-4 h-4 inline mr-1" />
                                    Prix min (FCFA)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Prix minimum"
                                    value={searchParams.minPrice}
                                    onChange={(e) => setSearchParams({ ...searchParams, minPrice: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            {/* Max Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Prix max (FCFA)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Prix maximum"
                                    value={searchParams.maxPrice}
                                    onChange={(e) => setSearchParams({ ...searchParams, maxPrice: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            {/* Sort By */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trier par
                                </label>
                                <select
                                    value={searchParams.sortBy}
                                    onChange={(e) => setSearchParams({ ...searchParams, sortBy: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="recent">Plus récent</option>
                                    <option value="price_asc">Prix croissant</option>
                                    <option value="price_desc">Prix décroissant</option>
                                    <option value="popular">Plus populaire</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results */}
                {total > 0 && (
                    <div className="mb-4">
                        <p className="text-gray-600">
                            {total} résultat{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
                        </p>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map((listing) => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                ) : total === 0 && searchParams.q ? (
                    <div className="text-center py-12 bg-white rounded-2xl">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Aucun résultat trouvé</p>
                        <p className="text-sm text-gray-400 mt-2">Essayez de modifier vos critères de recherche</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default AdvancedSearchPage;
