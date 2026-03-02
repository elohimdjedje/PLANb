// Écran des favoris
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { ListingCard, Loading, EmptyState } from '../components/common';
import { favoritesAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuthStore();
  
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const data = await favoritesAPI.getAll();
      setFavorites(data.data || data || []);
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [fetchFavorites])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  const handleListingPress = (listing) => {
    navigation.navigate('ListingDetail', { id: listing.id || listing.listing_id });
  };

  const handleRemoveFavorite = async (listingId) => {
    try {
      await favoritesAPI.remove(listingId);
      setFavorites(favorites.filter(f => (f.id || f.listing_id) !== listingId));
    } catch (error) {
      console.error('Erreur suppression favoris:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Favoris</Text>
        </View>
        <EmptyState
          icon="heart-outline"
          title="Connectez-vous"
          message="Connectez-vous pour voir vos annonces favorites."
          actionLabel="Se connecter"
          onAction={() => navigation.navigate('Auth')}
        />
      </SafeAreaView>
    );
  }

  if (loading) {
    return <Loading fullScreen message="Chargement des favoris..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Favoris</Text>
        <Text style={styles.count}>{favorites.length} annonce(s)</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => (item.id || item.listing_id).toString()}
        renderItem={({ item }) => {
          const listing = item.listing || item;
          return (
            <View style={styles.listingItem}>
              <ListingCard
                listing={listing}
                onPress={() => handleListingPress(listing)}
                onFavoritePress={() => handleRemoveFavorite(listing.id || item.listing_id)}
                isFavorite={true}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="Aucun favori"
            message="Vous n'avez pas encore d'annonces favorites."
            actionLabel="Parcourir les annonces"
            onAction={() => navigation.navigate('Home')}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  count: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
    flexGrow: 1,
  },
  listingItem: {
    paddingHorizontal: SPACING.lg,
  },
});

export default FavoritesScreen;
