import { TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { useTheme } from '../../theme/theme';
import { AppText } from './AppText';

interface FieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Field({ label, error, multiline, style, ...props }: FieldProps) {
  const { styles, colors } = useTheme();
  return (
    <View style={styles.tight}>
      <AppText variant="label">{label}</AppText>
      <TextInput {...props} accessibilityLabel={label} multiline={multiline}
        placeholderTextColor={colors.muted} selectionColor={colors.primary}
        style={[styles.input, multiline && styles.multiline, Boolean(error) && styles.inputError, style]} />
      {error && <AppText variant="small" style={styles.error} accessibilityLiveRegion="polite">{error}</AppText>}
    </View>
  );
}
