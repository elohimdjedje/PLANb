// Écran d'accueil - Liste des annonces
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, CATEGORIES } from '../constants/theme';
import { ListingCard, Loading, EmptyState } from '../components/common';
import { listingsAPI, favoritesAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuthStore();
  
  const [listings, setListings] = useState([]);
  const [proListings, setProListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [listingsData, proData] = await Promise.all([
        listingsAPI.getRecentListings({ limit: 20 }),
        listingsAPI.getProListings(5),
      ]);
      
      setListings(listingsData.data || listingsData || []);
      setProListings(proData.data || proData || []);
      
      if (isAuthenticated) {
        try {
          const favData = await favoritesAPI.getAll();
          setFavorites((favData.data || favData || []).map(f => f.listing_id || f.id));
        } catch (e) {
          console.log('Erreur favoris:', e);
        }
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', { query: searchQuery, category: selectedCategory });
    }
  };

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
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

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une annonce..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Catégories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive,
            ]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.categoryChipTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Annonces PRO */}
      {proListings.length > 0 && (
        <View style={styles.proSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Annonces PRO</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search', { isPro: true })}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.proListings}
          >
            {proListings.map((listing) => (
              <TouchableOpacity
                key={listing.id}
                style={styles.proCard}
                onPress={() => handleListingPress(listing)}
              >
                <ListingCard listing={listing} onPress={() => handleListingPress(listing)} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Titre section récentes */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Annonces récentes</Text>
      </View>
    </View>
  );

  if (loading) {
    return <Loading fullScreen message="Chargement des annonces..." />;
  }

  const filteredListings = selectedCategory
    ? listings.filter(l => l.category === selectedCategory)
    : listings;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredListings}
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
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="home-outline"
            title="Aucune annonce"
            message="Il n'y a pas encore d'annonces disponibles."
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  categoriesContainer: {
    marginTop: SPACING.md,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: COLORS.textInverse,
  },
  proSection: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  proListings: {
    paddingHorizontal: SPACING.lg,
  },
  proCard: {
    width: 280,
    marginRight: SPACING.md,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  listingItem: {
    paddingHorizontal: SPACING.lg,
  },
});

export default HomeScreen;
