// Composant ListingCard pour afficher une annonce
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING, FONTS, SHADOWS } from '../../constants/theme';
import { API_URL } from '../../config/api';

const ListingCard = ({ listing, onPress, onFavoritePress, isFavorite = false, horizontal = false }) => {
  const formatPrice = (price) => {
    if (!price) return 'Prix non défini';
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    // Construire l'URL complète pour les images du backend
    const baseUrl = API_URL.replace('/api/v1', '');
    return `${baseUrl}/uploads/${imagePath}`;
  };

  const mainImage = listing.images?.[0] || listing.image;

  if (horizontal) {
    return (
      <TouchableOpacity style={styles.cardHorizontal} onPress={onPress} activeOpacity={0.7}>
        {mainImage ? (
          <Image
            source={{ uri: getImageUrl(mainImage) }}
            style={styles.imageHorizontal}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imageHorizontal, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={30} color={COLORS.textLight} />
          </View>
        )}
        <View style={styles.contentHorizontal}>
          <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
          <Text style={styles.location} numberOfLines={1}>
            <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
            {' '}{listing.city || listing.location || 'Non spécifié'}
          </Text>
          <Text style={styles.price}>{formatPrice(listing.price)}</Text>
          {listing.price_unit && (
            <Text style={styles.priceUnit}>/{listing.price_unit}</Text>
          )}
        </View>
        {onFavoritePress && (
          <TouchableOpacity style={styles.favoriteButton} onPress={onFavoritePress}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? COLORS.error : COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {mainImage ? (
          <Image
            source={{ uri: getImageUrl(mainImage) }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={40} color={COLORS.textLight} />
          </View>
        )}
        {listing.is_pro && (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        )}
        {onFavoritePress && (
          <TouchableOpacity style={styles.favoriteButtonAbsolute} onPress={onFavoritePress}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? COLORS.error : COLORS.textInverse}
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
        <Text style={styles.location} numberOfLines={1}>
          <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
          {' '}{listing.city || listing.location || 'Non spécifié'}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(listing.price)}</Text>
          {listing.price_unit && (
            <Text style={styles.priceUnit}>/{listing.price_unit}</Text>
          )}
        </View>
        
        {listing.specifications && (
          <View style={styles.specs}>
            {listing.specifications.bedrooms && (
              <View style={styles.spec}>
                <Ionicons name="bed-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.specText}>{listing.specifications.bedrooms}</Text>
              </View>
            )}
            {listing.specifications.bathrooms && (
              <View style={styles.spec}>
                <Ionicons name="water-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.specText}>{listing.specifications.bathrooms}</Text>
              </View>
            )}
            {listing.specifications.surface && (
              <View style={styles.spec}>
                <Ionicons name="resize-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.specText}>{listing.specifications.surface} m²</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  cardHorizontal: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.borderLight,
  },
  imageHorizontal: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.borderLight,
  },
  proBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  proBadgeText: {
    color: COLORS.textInverse,
    fontSize: FONTS.sizes.xs,
    fontWeight: 'bold',
  },
  favoriteButtonAbsolute: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: BORDER_RADIUS.full,
    padding: SPACING.sm,
  },
  favoriteButton: {
    padding: SPACING.md,
    justifyContent: 'center',
  },
  content: {
    padding: SPACING.md,
  },
  contentHorizontal: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  location: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  specs: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.md,
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.borderLight,
  },
});

export default ListingCard;
