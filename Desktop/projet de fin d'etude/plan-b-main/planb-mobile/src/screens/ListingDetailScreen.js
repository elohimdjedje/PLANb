// Écran de détail d'une annonce
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { Button, Loading } from '../components/common';
import { listingsAPI, favoritesAPI, conversationsAPI } from '../services/api';
import { API_URL } from '../config/api';
import useAuthStore from '../store/authStore';

const { width } = Dimensions.get('window');

const ListingDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  const { isAuthenticated, user } = useAuthStore();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const data = await listingsAPI.getListing(id);
      setListing(data.data || data);

      if (isAuthenticated) {
        try {
          const favCheck = await favoritesAPI.check(id);
          setIsFavorite(favCheck.isFavorite || favCheck.is_favorite || false);
        } catch (e) {
          console.log('Erreur check favoris:', e);
        }
      }
    } catch (error) {
      console.error('Erreur chargement annonce:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'annonce');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Prix non défini';
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = API_URL.replace('/api/v1', '');
    return `${baseUrl}/uploads/${imagePath}`;
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }

    try {
      if (isFavorite) {
        await favoritesAPI.remove(id);
      } else {
        await favoritesAPI.add(id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier les favoris');
    }
  };

  const handleCall = () => {
    const phone = listing.user?.phone || listing.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
      listingsAPI.incrementContacts(id).catch(() => {});
    } else {
      Alert.alert('Info', 'Numéro de téléphone non disponible');
    }
  };

  const handleWhatsApp = () => {
    const phone = listing.user?.phone || listing.phone;
    if (phone) {
      const message = `Bonjour, je suis intéressé par votre annonce "${listing.title}" sur Plan B.`;
      const url = `whatsapp://send?phone=${phone.replace(/\s/g, '')}&text=${encodeURIComponent(message)}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Erreur', 'WhatsApp n\'est pas installé');
      });
      listingsAPI.incrementContacts(id).catch(() => {});
    }
  };

  const handleMessage = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }

    try {
      const conversation = await conversationsAPI.start(id);
      navigation.navigate('Chat', { 
        conversationId: conversation.id || conversation.data?.id,
        listing: listing,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de démarrer la conversation');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${listing.title} - ${formatPrice(listing.price)}\nVoir sur Plan B`,
        title: listing.title,
      });
    } catch (error) {
      console.log('Erreur partage:', error);
    }
  };

  const handleSellerProfile = () => {
    if (listing.user?.id) {
      navigation.navigate('SellerProfile', { userId: listing.user.id });
    }
  };

  if (loading) {
    return <Loading fullScreen message="Chargement de l'annonce..." />;
  }

  if (!listing) {
    return null;
  }

  const images = listing.images || (listing.image ? [listing.image] : []);
  const isOwner = user?.id === listing.user?.id;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec image */}
        <View style={styles.imageContainer}>
          {images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / width);
                  setCurrentImageIndex(index);
                }}
              >
                {images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: getImageUrl(image) }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              {images.length > 1 && (
                <View style={styles.pagination}>
                  {images.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        currentImageIndex === index && styles.paginationDotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="image-outline" size={64} color={COLORS.textLight} />
            </View>
          )}

          {/* Boutons overlay */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.topRightButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleFavorite}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? COLORS.error : COLORS.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contenu */}
        <View style={styles.content}>
          {/* Prix et titre */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(listing.price)}</Text>
            {listing.price_unit && (
              <Text style={styles.priceUnit}>/{listing.price_unit}</Text>
            )}
          </View>
          <Text style={styles.title}>{listing.title}</Text>

          {/* Localisation */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.location}>
              {listing.city || listing.location || 'Non spécifié'}
              {listing.neighborhood && `, ${listing.neighborhood}`}
            </Text>
          </View>

          {/* Badges */}
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{listing.category || 'Immobilier'}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{listing.transaction_type || 'Vente'}</Text>
            </View>
            {listing.is_pro && (
              <View style={[styles.badge, styles.badgePro]}>
                <Text style={[styles.badgeText, styles.badgeTextPro]}>PRO</Text>
              </View>
            )}
          </View>

          {/* Spécifications */}
          {listing.specifications && Object.keys(listing.specifications).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Caractéristiques</Text>
              <View style={styles.specsGrid}>
                {listing.specifications.bedrooms && (
                  <View style={styles.specItem}>
                    <Ionicons name="bed-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.specValue}>{listing.specifications.bedrooms}</Text>
                    <Text style={styles.specLabel}>Chambres</Text>
                  </View>
                )}
                {listing.specifications.bathrooms && (
                  <View style={styles.specItem}>
                    <Ionicons name="water-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.specValue}>{listing.specifications.bathrooms}</Text>
                    <Text style={styles.specLabel}>Salles de bain</Text>
                  </View>
                )}
                {listing.specifications.surface && (
                  <View style={styles.specItem}>
                    <Ionicons name="resize-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.specValue}>{listing.specifications.surface}</Text>
                    <Text style={styles.specLabel}>m²</Text>
                  </View>
                )}
                {listing.specifications.rooms && (
                  <View style={styles.specItem}>
                    <Ionicons name="grid-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.specValue}>{listing.specifications.rooms}</Text>
                    <Text style={styles.specLabel}>Pièces</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {listing.description || 'Aucune description disponible.'}
            </Text>
          </View>

          {/* Vendeur */}
          <TouchableOpacity style={styles.sellerCard} onPress={handleSellerProfile}>
            <View style={styles.sellerAvatar}>
              <Ionicons name="person" size={28} color={COLORS.textSecondary} />
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{listing.user?.name || 'Vendeur'}</Text>
              <Text style={styles.sellerLabel}>Voir le profil</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barre d'actions */}
      {!isOwner && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Ionicons name="call" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
          </TouchableOpacity>
          <Button
            title="Envoyer un message"
            onPress={handleMessage}
            style={styles.messageButton}
            icon={<Ionicons name="chatbubble-outline" size={18} color={COLORS.textInverse} />}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: width,
    height: 300,
    backgroundColor: COLORS.borderLight,
  },
  noImage: {
    width: width,
    height: 300,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagination: {
    position: 'absolute',
    bottom: SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: {
    backgroundColor: COLORS.textInverse,
  },
  backButton: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    padding: SPACING.sm,
    ...SHADOWS.md,
  },
  topRightButtons: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    padding: SPACING.sm,
    ...SHADOWS.md,
  },
  content: {
    padding: SPACING.lg,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: 4,
  },
  location: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  badge: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  badgePro: {
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  badgeTextPro: {
    color: COLORS.textInverse,
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.lg,
  },
  specItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  specValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  specLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.xl,
    ...SHADOWS.sm,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  sellerName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  sellerLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageButton: {
    flex: 1,
  },
});

export default ListingDetailScreen;
