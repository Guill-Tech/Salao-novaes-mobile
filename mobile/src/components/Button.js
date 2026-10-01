import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme';

// variant: 'primary' (vinho preenchido) ou 'outline' (só contorno branco)
export default function Button({ title, onPress, variant = 'primary', style }) {
  const isOutline = variant === 'outline';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isOutline ? styles.outline : styles.primary,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.text,
  },
  pressed: { opacity: 0.7 },
  text: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: 18,
  },
});
