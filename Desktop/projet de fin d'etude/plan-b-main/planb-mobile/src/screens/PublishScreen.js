// Écran de publication d'annonce
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, CATEGORIES, TRANSACTION_TYPES } from '../constants/theme';
import { Button, Input } from '../components/common';
import { listingsAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const PublishScreen = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    price_unit: 'mois',
    category: '',
    subcategory: '',
    transaction_type: 'location',
    city: '',
    neighborhood: '',
    specifications: {},
  });
  const [errors, setErrors] = useState({});

  const priceUnits = [
    { id: 'mois', label: '/mois' },
    { id: 'jour', label: '/jour' },
    { id: 'nuit', label: '/nuit' },
    { id: 'total', label: 'Total' },
  ];

  const subcategories = {
    immobilier: ['appartement', 'villa', 'maison', 'terrain', 'bureau', 'magasin'],
    vehicule: ['voiture', 'moto', 'utilitaire'],
    vacance: ['villa meublée', 'appartement meublé', 'résidence'],
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à vos photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10 - images.length,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map(a => a.uri)]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.category) newErrors.category = 'Sélectionnez une catégorie';
      if (!formData.transaction_type) newErrors.transaction_type = 'Sélectionnez un type';
    } else if (step === 2) {
      if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
      if (!formData.description.trim()) newErrors.description = 'La description est requise';
      if (!formData.price) newErrors.price = 'Le prix est requis';
    } else if (step === 3) {
      if (!formData.city.trim()) newErrors.city = 'La ville est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (images.length === 0) {
      Alert.alert('Photos requises', 'Ajoutez au moins une photo.');
      return;
    }

    setLoading(true);
    try {
      // Préparer les données
      const data = {
        ...formData,
        price: parseInt(formData.price),
        images: images, // Dans une vraie app, on uploaderait les images d'abord
      };

      await listingsAPI.createListing(data);
      Alert.alert('Succès', 'Votre annonce a été publiée !', [
        { text: 'OK', onPress: () => navigation.navigate('Profile') }
      ]);
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible de publier l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authRequired}>
          <Ionicons name="lock-closed-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.authTitle}>Connexion requise</Text>
          <Text style={styles.authMessage}>
            Connectez-vous pour publier une annonce.
          </Text>
          <Button
            title="Se connecter"
            onPress={() => navigation.navigate('Auth')}
            style={styles.authButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Publier une annonce</Text>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>{step}/4</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step 1: Catégorie */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Type d'annonce</Text>
              
              <Text style={styles.label}>Catégorie</Text>
              <View style={styles.optionsGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.optionCard,
                      formData.category === cat.id && styles.optionCardActive,
                    ]}
                    onPress={() => updateField('category', cat.id)}
                  >
                    <Ionicons
                      name={cat.id === 'immobilier' ? 'home' : cat.id === 'vehicule' ? 'car' : 'umbrella'}
                      size={32}
                      color={formData.category === cat.id ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text style={[
                      styles.optionLabel,
                      formData.category === cat.id && styles.optionLabelActive,
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.category && <Text style={styles.error}>{errors.category}</Text>}

              {formData.category && subcategories[formData.category] && (
                <>
                  <Text style={styles.label}>Sous-catégorie</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {subcategories[formData.category].map((sub) => (
                      <TouchableOpacity
                        key={sub}
                        style={[
                          styles.chip,
                          formData.subcategory === sub && styles.chipActive,
                        ]}
                        onPress={() => updateField('subcategory', sub)}
                      >
                        <Text style={[
                          styles.chipText,
                          formData.subcategory === sub && styles.chipTextActive,
                        ]}>
                          {sub.charAt(0).toUpperCase() + sub.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              <Text style={styles.label}>Type de transaction</Text>
              <View style={styles.typeRow}>
                {TRANSACTION_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeButton,
                      formData.transaction_type === type.id && styles.typeButtonActive,
                    ]}
                    onPress={() => updateField('transaction_type', type.id)}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      formData.transaction_type === type.id && styles.typeButtonTextActive,
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 2: Détails */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Détails de l'annonce</Text>

              <Input
                label="Titre de l'annonce"
                value={formData.title}
                onChangeText={(v) => updateField('title', v)}
                placeholder="Ex: Appartement 3 pièces à Cocody"
                error={errors.title}
              />

              <Input
                label="Description"
                value={formData.description}
                onChangeText={(v) => updateField('description', v)}
                placeholder="Décrivez votre bien en détail..."
                multiline
                numberOfLines={5}
                error={errors.description}
              />

              <Text style={styles.label}>Prix</Text>
              <View style={styles.priceRow}>
                <View style={styles.priceInputContainer}>
                  <Input
                    value={formData.price}
                    onChangeText={(v) => updateField('price', v.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    keyboardType="numeric"
                    error={errors.price}
                    style={styles.priceInput}
                  />
                  <Text style={styles.currency}>FCFA</Text>
                </View>
                {formData.transaction_type === 'location' && (
                  <View style={styles.unitSelector}>
                    {priceUnits.slice(0, 3).map((unit) => (
                      <TouchableOpacity
                        key={unit.id}
                        style={[
                          styles.unitButton,
                          formData.price_unit === unit.id && styles.unitButtonActive,
                        ]}
                        onPress={() => updateField('price_unit', unit.id)}
                      >
                        <Text style={[
                          styles.unitButtonText,
                          formData.price_unit === unit.id && styles.unitButtonTextActive,
                        ]}>
                          {unit.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Step 3: Localisation */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Localisation</Text>

              <Input
                label="Ville"
                value={formData.city}
                onChangeText={(v) => updateField('city', v)}
                placeholder="Ex: Abidjan"
                error={errors.city}
                icon={<Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />}
              />

              <Input
                label="Quartier / Commune"
                value={formData.neighborhood}
                onChangeText={(v) => updateField('neighborhood', v)}
                placeholder="Ex: Cocody Angré"
              />
            </View>
          )}

          {/* Step 4: Photos */}
          {step === 4 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Photos</Text>
              <Text style={styles.photoHint}>
                Ajoutez jusqu'à 10 photos. La première sera la photo principale.
              </Text>

              <View style={styles.photosGrid}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.photoItem}>
                    <Image source={{ uri }} style={styles.photoImage} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                    {index === 0 && (
                      <View style={styles.mainPhotoBadge}>
                        <Text style={styles.mainPhotoText}>Principale</Text>
                      </View>
                    )}
                  </View>
                ))}
                {images.length < 10 && (
                  <TouchableOpacity style={styles.addPhotoButton} onPress={pickImages}>
                    <Ionicons name="camera-outline" size={32} color={COLORS.textSecondary} />
                    <Text style={styles.addPhotoText}>Ajouter</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer buttons */}
        <View style={styles.footer}>
          {step > 1 && (
            <Button
              title="Précédent"
              onPress={prevStep}
              variant="outline"
              style={styles.footerButton}
            />
          )}
          {step < 4 ? (
            <Button
              title="Suivant"
              onPress={nextStep}
              style={[styles.footerButton, step === 1 && styles.footerButtonFull]}
            />
          ) : (
            <Button
              title="Publier"
              onPress={handleSubmit}
              loading={loading}
              style={styles.footerButton}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  stepIndicator: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  stepText: {
    color: COLORS.textInverse,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.borderLight,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: SPACING.lg,
  },
  stepTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  optionCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  optionLabel: {
    marginTop: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  optionLabelActive: {
    color: COLORS.primary,
  },
  chip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.textInverse,
  },
  typeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  typeButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: COLORS.textInverse,
  },
  error: {
    color: COLORS.error,
    fontSize: FONTS.sizes.sm,
    marginTop: SPACING.xs,
  },
  priceRow: {
    gap: SPACING.md,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
  },
  currency: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  unitSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  unitButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unitButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  unitButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  unitButtonTextActive: {
    color: COLORS.textInverse,
  },
  photoHint: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  photoItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  mainPhotoBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingVertical: 2,
  },
  mainPhotoText: {
    color: COLORS.textInverse,
    fontSize: FONTS.sizes.xs,
    textAlign: 'center',
  },
  addPhotoButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerButton: {
    flex: 1,
  },
  footerButtonFull: {
    flex: 1,
  },
  authRequired: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  authTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  authMessage: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  authButton: {
    marginTop: SPACING.xl,
    minWidth: 200,
  },
});

export default PublishScreen;
