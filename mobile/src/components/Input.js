import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme';

export default function Input({ label, error, style, ...props }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor="#666"
        autoCapitalize="none"
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: spacing.md },
  label: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
    color: colors.textDark,
  },
  inputError: { borderWidth: 2, borderColor: colors.error },
  error: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});