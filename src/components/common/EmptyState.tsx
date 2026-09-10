import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { sizes, useTheme } from '../../theme/theme';
import { AppText } from './AppText';

interface EmptyStateProps { title: string; description: string }

export function EmptyState({ title, description }: EmptyStateProps) {
  const { styles, colors } = useTheme();
  return <View style={styles.content}>
    <View style={styles.emptyIcon}><Feather name="clipboard" size={sizes.icon * 2} color={colors.primary} /></View>
    <AppText variant="title" style={styles.centeredText}>{title}</AppText>
    <AppText variant="small" style={styles.centeredText}>{description}</AppText>
  </View>;
}
