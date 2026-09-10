import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Task } from '../../types/task';
import { formatDate, SYNC_LABELS } from '../../utils/taskSelectors';
import { sizes, useTheme } from '../../theme/theme';
import { AppText } from '../common/AppText';
import { StatusBadge } from './StatusBadge';

interface TaskCardProps { task: Task; onOpen: (id: string) => void }

export function TaskCard({ task, onOpen }: TaskCardProps) {
  const { styles, colors } = useTheme();
  const handleOpen = () => onOpen(task.id);
  const isOverdue = Date.parse(task.dueAt) < Date.now() && ['new', 'in_progress'].includes(task.status);
  return <Pressable style={styles.card} onPress={handleOpen} accessibilityRole="button"
    accessibilityLabel={`Open task: ${task.title}`}>
    <View style={styles.spread}>
      <StatusBadge status={task.status} />
      <AppText variant="caption" style={task.syncState === 'failed' && styles.error}>{SYNC_LABELS[task.syncState]}</AppText>
    </View>
    <AppText variant="title" numberOfLines={2}>{task.title}</AppText>
    <View style={styles.row}>
      <Feather name="clock" size={sizes.smallIcon} color={isOverdue ? colors.danger : colors.muted} />
      <AppText variant="small" style={[styles.grow, isOverdue && styles.error]}>{formatDate(task.dueAt)}{isOverdue ? ' · Overdue' : ''}</AppText>
    </View>
    <View style={styles.row}>
      <Feather name="map-pin" size={sizes.smallIcon} color={colors.muted} />
      <AppText variant="small" style={styles.grow} numberOfLines={2}>{task.address}</AppText>
      {task.attachments.length > 0 && <Feather name="image" size={sizes.smallIcon} color={colors.muted} />}
    </View>
  </Pressable>;
}
