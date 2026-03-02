// Composant Button réutilisable
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING, FONTS } from '../../constants/theme';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, ghost
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const base = [styles.button, styles[`button_${size}`]];
    
    switch (variant) {
      case 'secondary':
        base.push(styles.buttonSecondary);
        break;
      case 'outline':
        base.push(styles.buttonOutline);
        break;
      case 'ghost':
        base.push(styles.buttonGhost);
        break;
      default:
        base.push(styles.buttonPrimary);
    }
    
    if (disabled || loading) {
      base.push(styles.buttonDisabled);
    }
    
    return base;
  };

  const getTextStyle = () => {
    const base = [styles.text, styles[`text_${size}`]];
    
    switch (variant) {
      case 'outline':
      case 'ghost':
        base.push(styles.textOutline);
        break;
      case 'secondary':
        base.push(styles.textSecondary);
        break;
      default:
        base.push(styles.textPrimary);
    }
    
    return base;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.textInverse} />
      ) : (
        <>
          {icon}
          <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  button_sm: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  button_md: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  button_lg: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  text_sm: {
    fontSize: FONTS.sizes.sm,
  },
  text_md: {
    fontSize: FONTS.sizes.md,
  },
  text_lg: {
    fontSize: FONTS.sizes.lg,
  },
  textPrimary: {
    color: COLORS.textInverse,
  },
  textSecondary: {
    color: COLORS.textInverse,
  },
  textOutline: {
    color: COLORS.primary,
  },
});

export default Button;
