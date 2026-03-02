// Écran d'authentification - Connexion et Inscription
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../constants/theme';
import { Button, Input } from '../components/common';
import useAuthStore from '../store/authStore';

const AuthScreen = () => {
  const navigation = useNavigation();
  const { login, register } = useAuthStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!isLogin) {
      if (!formData.name.trim()) {
        newErrors.name = 'Le nom est requis';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Le téléphone est requis';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
      }

      if (result.success) {
        navigation.goBack();
      } else {
        Alert.alert('Erreur', result.error || 'Une erreur est survenue');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {isLogin ? 'Connexion' : 'Inscription'}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? 'Connectez-vous pour accéder à votre compte'
                : 'Créez un compte pour publier vos annonces'}
            </Text>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            {!isLogin && (
              <Input
                label="Nom complet"
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                placeholder="Votre nom"
                error={errors.name}
                icon={<Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />}
              />
            )}

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              icon={<Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />}
            />

            {!isLogin && (
              <Input
                label="Téléphone"
                value={formData.phone}
                onChangeText={(value) => updateField('phone', value)}
                placeholder="+225 XX XX XX XX"
                keyboardType="phone-pad"
                error={errors.phone}
                icon={<Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />}
              />
            )}

            <Input
              label="Mot de passe"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              placeholder="••••••••"
              secureTextEntry
              error={errors.password}
              icon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />}
            />

            {!isLogin && (
              <Input
                label="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                placeholder="••••••••"
                secureTextEntry
                error={errors.confirmPassword}
                icon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />}
              />
            )}

            <Button
              title={isLogin ? 'Se connecter' : 'S\'inscrire'}
              onPress={handleSubmit}
              loading={loading}
              size="lg"
              style={styles.submitButton}
            />

            {isLogin && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Switch Login/Register */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switchLink}>
                {isLogin ? 'S\'inscrire' : 'Se connecter'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  backButton: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  submitButton: {
    marginTop: SPACING.md,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  forgotPasswordText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  switchText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  switchLink: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default AuthScreen;
