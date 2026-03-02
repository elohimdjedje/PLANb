// Écran de recherche
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, CATEGORIES, TRANSACTION_TYPES } from '../constants/theme';
import { ListingCard, Loading, EmptyState } from '../components/common';
import { listingsAPI, favoritesAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const SearchScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { isAuthenticated } = useAuthStore();
  
  const initialQuery = route.params?.query || '';
  const initialCategory = route.params?.category || null;

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  
  // Filtres
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedType, setSelectedType] = useState(null);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (initialQuery || initialCategory) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim() && !selectedCategory) return;

    setLoading(true);
    try {
      const filters = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedType) filters.transaction_type = selectedType;
      if (priceMin) filters.price_min = priceMin;
      if (priceMax) filters.price_max = priceMax;

      const data = await listingsAPI.searchListings(searchQuery, filters);
      setResults(data.data || data || []);

      if (isAuthenticated) {
        try {
          const favData = await favoritesAPI.getAll();
          setFavorites((favData.data || favData || []).map(f => f.listing_id || f.id));
        } catch (e) {}
      }
    } catch (error) {
      console.error('Erreur recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleListingPress = (listing) => {
    navigation.navigate('ListingDetail', { id: listing.id });
  };

  const handleFavoritePress = async (listingId) => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }

    try {
      const isFav = favorites.includes(listingId);
      if (isFav) {
        await favoritesAPI.remove(listingId);
        setFavorites(favorites.filter(id => id !== listingId));
      } else {
        await favoritesAPI.add(listingId);
        setFavorites([...favorites, listingId]);
      }
    } catch (error) {
      console.error('Erreur favoris:', error);
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedType(null);
    setPriceMin('');
    setPriceMax('');
  };

  const hasActiveFilters = selectedCategory || selectedType || priceMin || priceMax;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header avec recherche */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus={!initialQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons 
            name="options-outline" 
            size={22} 
            color={hasActiveFilters ? COLORS.textInverse : COLORS.text} 
          />
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Catégorie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.filterChip, selectedCategory === cat.id && styles.filterChipActive]}
                  onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                >
                  <Text style={[styles.filterChipText, selectedCategory === cat.id && styles.filterChipTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {TRANSACTION_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.filterChip, selectedType === type.id && styles.filterChipActive]}
                  onPress={() => setSelectedType(selectedType === type.id ? null : type.id)}
                >
                  <Text style={[styles.filterChipText, selectedType === type.id && styles.filterChipTextActive]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Prix (FCFA)</Text>
            <View style={styles.priceInputs}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min"
                placeholderTextColor={COLORS.textLight}
                value={priceMin}
                onChangeText={setPriceMin}
                keyboardType="numeric"
              />
              <Text style={styles.priceSeparator}>-</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max"
                placeholderTextColor={COLORS.textLight}
                value={priceMax}
                onChangeText={setPriceMax}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.filterActions}>
            {hasActiveFilters && (
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Effacer</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.applyButton} onPress={handleSearch}>
              <Text style={styles.applyButtonText}>Appliquer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Résultats */}
      {loading ? (
        <Loading message="Recherche en cours..." />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.listingItem}>
              <ListingCard
                listing={item}
                onPress={() => handleListingPress(item)}
                onFavoritePress={() => handleFavoritePress(item.id)}
                isFavorite={favorites.includes(item.id)}
              />
            </View>
          )}
          ListHeaderComponent={
            results.length > 0 ? (
              <Text style={styles.resultsCount}>{results.length} résultat(s)</Text>
            ) : null
          }
          ListEmptyComponent={
            searchQuery || selectedCategory ? (
              <EmptyState
                icon="search-outline"
                title="Aucun résultat"
                message="Essayez de modifier vos critères de recherche."
              />
            ) : (
              <EmptyState
                icon="search-outline"
                title="Rechercher"
                message="Entrez un terme de recherche ou sélectionnez des filtres."
              />
            )
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  filterButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filtersContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterSection: {
    marginBottom: SPACING.md,
  },
  filterLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.borderLight,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.textInverse,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  priceSeparator: {
    marginHorizontal: SPACING.sm,
    color: COLORS.textSecondary,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  clearButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  clearButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  applyButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textInverse,
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
    flexGrow: 1,
  },
  listingItem: {
    paddingHorizontal: SPACING.lg,
  },
});

export default SearchScreen;
