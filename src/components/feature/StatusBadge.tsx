import { Text, View } from 'react-native';
import type { TaskStatus } from '../../types/task';
import { STATUS_LABELS } from '../../utils/taskSelectors';
import { useTheme } from '../../theme/theme';

interface StatusBadgeProps { status: TaskStatus }

export function StatusBadge({ status }: StatusBadgeProps) {
  const { styles } = useTheme();
  return <View style={[styles.badge, status === 'in_progress' && styles.progressBadge,
    status === 'cancelled' && styles.cancelledBadge]}>
    <Text style={[styles.badgeText, status === 'in_progress' && styles.progressText,
      status === 'cancelled' && styles.error]}>{STATUS_LABELS[status]}</Text>
  </View>;
}
