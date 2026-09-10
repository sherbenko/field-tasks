import { FlatList, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../app/navigationTypes';
import { useAppStore } from '../store/useAppStore';
import { useTaskActions } from '../hooks/useTaskActions';
import type { HistoryEntry } from '../types/task';
import { TASK_STATUSES } from '../types/task';
import { formatDate, STATUS_LABELS, SYNC_LABELS } from '../utils/taskSelectors';
import { useTheme } from '../theme/theme';
import { AppText } from '../components/common/AppText';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { AttachmentPreview } from '../components/feature/AttachmentPreview';
import { StatusBadge } from '../components/feature/StatusBadge';
import { HistoryCard } from '../components/feature/HistoryCard';

type TaskDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'TaskDetails'>;
const keyExtractor = (entry: HistoryEntry) => entry.id;
const renderEntry = ({ item }: { item: HistoryEntry }) => <HistoryCard entry={item} />;

export default function TaskDetailsScreen({ route }: TaskDetailsScreenProps) {
  const { styles } = useTheme();
  const task = useAppStore(state => state.tasks.find(item => item.id === route.params.taskId && !item.deletedAt));
  const allHistory = useAppStore(state => state.history);
  const actions = useTaskActions(task);
  if (!task) return <EmptyState title="Task unavailable" description="This task may have been deleted. Its history is still available in the History tab." />;
  const history = allHistory.filter(entry => entry.taskId === task.id);
  const isActive = task.status === 'new' || task.status === 'in_progress';
  return <View style={styles.screen}>
    <FlatList data={history} keyExtractor={keyExtractor} renderItem={renderEntry}
      contentContainerStyle={styles.list} ListHeaderComponent={<View style={styles.listHeader}>
        <View style={styles.spread}><StatusBadge status={task.status} />
          <AppText variant="small">{SYNC_LABELS[task.syncState]}</AppText></View>
        <AppText variant="heading">{task.title}</AppText>
        <AppText>{task.description}</AppText>
        <View style={styles.card}>
          <AppText variant="label">DUE DATE & TIME</AppText>
          <AppText>{formatDate(task.dueAt)}</AppText>
          <View style={styles.divider} />
          <AppText variant="label">WORK LOCATION</AppText>
          <AppText>{task.address}</AppText>
          <AppText variant="small">{task.latitude.toFixed(5)}, {task.longitude.toFixed(5)}</AppText>
        </View>
        <Button label="Edit task" variant="secondary" onPress={actions.edit} disabled={actions.isBusy} />
        <AppText variant="title">Update status</AppText>
        <View style={styles.wrap}>
          {TASK_STATUSES.filter(status => status !== task.status).map(status => <Button key={status}
            label={STATUS_LABELS[status]} variant="secondary" onPress={() => { void actions.updateStatus(status); }}
            disabled={actions.isBusy} />)}
        </View>
        <AppText variant="title">Attachments · {task.attachments.length}</AppText>
        {task.attachments.length ? task.attachments.map(attachment => <AttachmentPreview key={attachment.id} attachment={attachment} />)
          : <AppText variant="small">No images attached. Use Edit task to add one.</AppText>}
        <View style={styles.card}>
          <AppText variant="title">Reminder demo</AppText>
          <AppText variant="small">For a reliable 45-second demo on Android 12+, first allow precise reminders in system settings.</AppText>
          <Button label="Enable precise reminders" variant="secondary" onPress={actions.enablePreciseReminders} disabled={actions.isBusy} />
          <Button label="Notify me in 45 seconds" variant="secondary" onPress={actions.demoReminder}
            disabled={actions.isBusy || !isActive} />
          {!isActive && <AppText variant="small">Reopen this task to enable reminders.</AppText>}
        </View>
        <Button label="Delete task" variant="danger" onPress={actions.confirmDelete} disabled={actions.isBusy} />
        <AppText variant="title">Task history</AppText>
      </View>} />
  </View>;
}
