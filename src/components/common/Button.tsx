import { ActivityIndicator, Pressable, Text } from 'react-native';
import { useTheme } from '../../theme/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
}

export function Button({ label, onPress, variant = 'primary', isLoading = false, disabled = false }: ButtonProps) {
  const { styles, colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || isLoading, busy: isLoading }}
      disabled={disabled || isLoading} onPress={onPress}
      style={({ pressed }) => [styles.button, variant === 'secondary' && styles.secondaryButton,
        variant === 'danger' && styles.dangerButton, pressed && styles.pressed,
        (disabled || isLoading) && styles.disabled]}>
      {isLoading && <ActivityIndicator color={variant === 'primary' ? colors.onPrimary : colors.primary} />}
      <Text style={[styles.buttonText, variant === 'secondary' && styles.secondaryButtonText,
        variant === 'danger' && styles.error]}>{label}</Text>
    </Pressable>
  );
}
