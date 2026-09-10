import { View } from 'react-native';
import type { HistoryEntry } from '../../types/task';
import { formatDate } from '../../utils/taskSelectors';
import { useTheme } from '../../theme/theme';
import { AppText } from '../common/AppText';

interface HistoryCardProps { entry: HistoryEntry }

export function HistoryCard({ entry }: HistoryCardProps) {
  const { styles } = useTheme();
  return <View style={styles.card}>
    <AppText variant="caption">{entry.action.toUpperCase()} · {formatDate(entry.at)}</AppText>
    <AppText variant="label">{entry.taskTitle}</AppText>
    <AppText variant="small">{entry.description}</AppText>
  </View>;
}
