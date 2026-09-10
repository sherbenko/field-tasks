import { Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { AppText } from './AppText';

interface ChoiceChipsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  isScrollable?: boolean;
}

export function ChoiceChips<T extends string>({ options, value, onChange, isScrollable = false }: ChoiceChipsProps<T>) {
  const { styles } = useTheme();
  const chips = options.map(option => (
    <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label}
      accessibilityState={{ checked: option.value === value }} onPress={() => onChange(option.value)}
      style={[styles.chip, option.value === value && styles.selectedChip]}>
      <AppText variant="small" style={option.value === value && styles.success}>{option.label}</AppText>
    </Pressable>
  ));
  return isScrollable ? <ScrollView horizontal showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.row}>{chips}</ScrollView> : <View style={styles.wrap}>{chips}</View>;
}
